const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query } = require('../db/pool');
const { PLACE_CATEGORIES } = require('../../../shared/categories');

const router = express.Router();

const validCategories = Object.keys(PLACE_CATEGORIES);

/**
 * GET /api/places
 * Get places within a bounding box.
 * Query params: swLat, swLng, neLat, neLng, category (optional)
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng, category } = req.query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ error: 'Bounding box parameters required (swLat, swLng, neLat, neLng)' });
    }

    let queryText = `
      SELECT p.id, p.name, p.description, p.category, p.custom_category,
             ST_AsGeoJSON(p.location) as location, p.address, p.rating,
             p.created_at, u.display_name as creator_name,
             (SELECT COUNT(*) FROM photos WHERE place_id = p.id) as photo_count
      FROM places p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE ST_Within(
        p.location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )`;

    const params = [
      parseFloat(swLng), parseFloat(swLat),
      parseFloat(neLng), parseFloat(neLat),
    ];

    if (category && validCategories.includes(category)) {
      queryText += ` AND p.category = $5`;
      params.push(category);
    }

    queryText += ' ORDER BY p.created_at DESC LIMIT 200';

    const { rows } = await query(queryText, params);
    res.json({ places: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/places/:id
 * Get a single place with its photos.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.*, ST_AsGeoJSON(p.location) as location,
              u.display_name as creator_name, u.avatar_url as creator_avatar
       FROM places p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    // Get photos for this place
    const photos = await query(
      `SELECT id, url, thumbnail_url, caption, taken_at
       FROM photos WHERE place_id = $1
       ORDER BY created_at DESC`,
      [req.params.id]
    );

    res.json({ ...rows[0], photos: photos.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/places
 * Create a new place/pin on the map.
 */
router.post('/', requireAuth, validate({
  name: { type: 'string', required: true, maxLength: 200 },
  description: { type: 'string', maxLength: 1000 },
  category: { type: 'string', required: true, enum: validCategories },
  latitude: { type: 'number', required: true },
  longitude: { type: 'number', required: true },
  address: { type: 'string', maxLength: 500 },
}), async (req, res, next) => {
  try {
    const { name, description, category, customCategory, latitude, longitude, address } = req.body;

    const { rows } = await query(
      `INSERT INTO places (user_id, name, description, category, custom_category, location, address)
       VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8)
       RETURNING id, name, description, category, custom_category,
                 ST_AsGeoJSON(location) as location, address, created_at`,
      [req.user.id, name, description, category, customCategory, longitude, latitude, address]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/places/:id
 * Update a place (only the creator can edit).
 */
router.put('/:id', requireAuth, validate({
  name: { type: 'string', maxLength: 200 },
  description: { type: 'string', maxLength: 1000 },
  category: { type: 'string', enum: validCategories },
}), async (req, res, next) => {
  try {
    const { name, description, category, customCategory, address } = req.body;

    const { rows } = await query(
      `UPDATE places SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        custom_category = COALESCE($4, custom_category),
        address = COALESCE($5, address)
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, description, category, custom_category,
                 ST_AsGeoJSON(location) as location, address`,
      [name, description, category, customCategory, address, req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Place not found or not owned by you' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/places/:id
 * Delete a place (only the creator can delete).
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM places WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Place not found or not owned by you' });
    }

    res.json({ message: 'Place deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
