const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query } = require('../db/pool');

const router = express.Router();

/**
 * GET /api/users/me
 * Get the current authenticated user's profile.
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, email, display_name, avatar_url, bio,
              bike_name, bike_model, bike_year, bike_photo_url,
              is_public, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Get ride count
    const rideCount = await query(
      'SELECT COUNT(*) as count FROM rides WHERE user_id = $1 AND status = $2',
      [req.user.id, 'completed']
    );

    // Get total distance
    const totalDistance = await query(
      'SELECT COALESCE(SUM(distance_km), 0) as total FROM rides WHERE user_id = $1 AND status = $2',
      [req.user.id, 'completed']
    );

    // Get club count
    const clubCount = await query(
      'SELECT COUNT(*) as count FROM club_members WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      ...user,
      stats: {
        totalRides: parseInt(rideCount.rows[0].count),
        totalDistanceKm: parseFloat(totalDistance.rows[0].total),
        totalClubs: parseInt(clubCount.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/me
 * Update the current user's profile.
 */
router.put('/me', requireAuth, validate({
  displayName: { type: 'string', maxLength: 100 },
  bio: { type: 'string', maxLength: 500 },
  bikeName: { type: 'string', maxLength: 100 },
  bikeModel: { type: 'string', maxLength: 100 },
  bikeYear: { type: 'number', min: 1900, max: 2100 },
  isPublic: { type: 'boolean' },
}), async (req, res, next) => {
  try {
    const { displayName, bio, bikeName, bikeModel, bikeYear, bikePhotoUrl, avatarUrl, isPublic } = req.body;

    const { rows } = await query(
      `UPDATE users SET
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        bike_name = COALESCE($3, bike_name),
        bike_model = COALESCE($4, bike_model),
        bike_year = COALESCE($5, bike_year),
        bike_photo_url = COALESCE($6, bike_photo_url),
        avatar_url = COALESCE($7, avatar_url),
        is_public = COALESCE($8, is_public),
        updated_at = NOW()
       WHERE id = $9
       RETURNING id, email, display_name, avatar_url, bio,
                 bike_name, bike_model, bike_year, bike_photo_url,
                 is_public, created_at, updated_at`,
      [displayName, bio, bikeName, bikeModel, bikeYear, bikePhotoUrl, avatarUrl, isPublic, req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id
 * Get another user's public profile.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, display_name, avatar_url, bio,
              bike_name, bike_model, bike_year, bike_photo_url,
              is_public, created_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // If profile is private, return limited info
    if (!user.is_public) {
      return res.json({
        id: user.id,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isPublic: false,
      });
    }

    // Get public stats
    const rideCount = await query(
      "SELECT COUNT(*) as count FROM rides WHERE user_id = $1 AND status = 'completed' AND visibility = 'public'",
      [req.params.id]
    );

    const totalDistance = await query(
      "SELECT COALESCE(SUM(distance_km), 0) as total FROM rides WHERE user_id = $1 AND status = 'completed' AND visibility = 'public'",
      [req.params.id]
    );

    res.json({
      ...user,
      stats: {
        totalRides: parseInt(rideCount.rows[0].count),
        totalDistanceKm: parseFloat(totalDistance.rows[0].total),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id/rides
 * Get a user's public rides.
 */
router.get('/:id/rides', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    const { rows } = await query(
      `SELECT id, title, description, distance_km, duration_seconds,
              elevation_gain, avg_speed_kmh, visibility, tracking_mode,
              started_at, finished_at, created_at,
              ST_AsGeoJSON(start_point) as start_point,
              ST_AsGeoJSON(end_point) as end_point,
              start_name, end_name
       FROM rides
       WHERE user_id = $1 AND status = 'completed' AND visibility = 'public'
       ORDER BY finished_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    );

    res.json({ rides: rows, limit, offset });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
