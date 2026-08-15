const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { query } = require('../db/pool');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

const router = express.Router();

// Cloudflare R2 client (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * POST /api/photos/upload
 * Get a presigned URL for uploading a photo to R2.
 * The client uploads directly to R2 using the presigned URL.
 */
router.post('/upload', requireAuth, async (req, res, next) => {
  try {
    const { rideId, placeId, latitude, longitude, caption, isProof, contentType } = req.body;

    const fileExtension = contentType === 'image/png' ? 'png' : 'jpg';
    const key = `photos/${req.user.id}/${uuidv4()}.${fileExtension}`;

    // Generate presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'image/jpeg',
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    // Create photo record in database
    const photoUrl = `${config.R2_PUBLIC_URL}/${key}`;

    let locationQuery = 'NULL';
    const params = [req.user.id, rideId || null, placeId || null, photoUrl, caption || null, isProof || false, new Date().toISOString()];

    if (latitude && longitude) {
      locationQuery = `ST_SetSRID(ST_MakePoint($${params.length + 1}, $${params.length + 2}), 4326)`;
      params.push(longitude, latitude);
    }

    const { rows } = await query(
      `INSERT INTO photos (user_id, ride_id, place_id, url, location, caption, is_proof, taken_at)
       VALUES ($1, $2, $3, $4, ${locationQuery}, $5, $6, $7)
       RETURNING id, url, caption, is_proof, created_at`,
      params
    );

    res.status(201).json({
      photo: rows[0],
      uploadUrl: presignedUrl,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/photos/ride/:rideId
 * Get all photos for a ride.
 */
router.get('/ride/:rideId', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, url, thumbnail_url, caption, is_proof,
              ST_AsGeoJSON(location) as location, taken_at, created_at
       FROM photos
       WHERE ride_id = $1
       ORDER BY taken_at ASC`,
      [req.params.rideId]
    );

    res.json({ photos: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/photos/:id
 * Delete a photo (owner only).
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM photos WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ message: 'Photo deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
