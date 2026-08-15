const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query } = require('../db/pool');
const { RIDE_VISIBILITY, RIDE_STATUS, TRACKING_MODE } = require('../../../shared/enums');

const router = express.Router();

/**
 * POST /api/rides
 * Start a new ride (creates it in "recording" status).
 */
router.post('/', requireAuth, validate({
  trackingMode: { type: 'string', enum: Object.values(TRACKING_MODE) },
  latitude: { type: 'number', required: true },
  longitude: { type: 'number', required: true },
}), async (req, res, next) => {
  try {
    const { trackingMode, latitude, longitude, startName } = req.body;

    const { rows } = await query(
      `INSERT INTO rides (user_id, tracking_mode, start_point, start_name, status, started_at)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, 'recording', NOW())
       RETURNING id, tracking_mode, status, started_at,
                 ST_AsGeoJSON(start_point) as start_point, start_name`,
      [req.user.id, trackingMode || 'gps', longitude, latitude, startName]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/rides/:id/points
 * Batch add GPS points during active tracking.
 */
router.post('/:id/points', requireAuth, async (req, res, next) => {
  try {
    const { points } = req.body;

    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).json({ error: 'points array is required' });
    }

    // Verify ride belongs to user and is recording
    const ride = await query(
      "SELECT id FROM rides WHERE id = $1 AND user_id = $2 AND status = 'recording'",
      [req.params.id, req.user.id]
    );

    if (ride.rows.length === 0) {
      return res.status(404).json({ error: 'Active ride not found' });
    }

    // Batch insert points
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const point of points) {
      values.push(
        `($${paramIndex++}, ST_SetSRID(ST_MakePoint($${paramIndex++}, $${paramIndex++}), 4326), $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      params.push(
        req.params.id,
        point.longitude,
        point.latitude,
        point.elevation || null,
        point.speed || null,
        point.recordedAt || new Date().toISOString()
      );
    }

    await query(
      `INSERT INTO ride_points (ride_id, location, elevation, speed_kmh, recorded_at)
       VALUES ${values.join(', ')}`,
      params
    );

    res.json({ added: points.length });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/rides/:id/finish
 * Finish a ride — calculates final stats and builds the route geometry.
 */
router.post('/:id/finish', requireAuth, validate({
  title: { type: 'string', maxLength: 200 },
  description: { type: 'string', maxLength: 2000 },
  visibility: { type: 'string', enum: Object.values(RIDE_VISIBILITY) },
  endName: { type: 'string', maxLength: 200 },
}), async (req, res, next) => {
  try {
    const { title, description, visibility, endName } = req.body;

    // Verify ride belongs to user and is recording
    const ride = await query(
      "SELECT id FROM rides WHERE id = $1 AND user_id = $2 AND status = 'recording'",
      [req.params.id, req.user.id]
    );

    if (ride.rows.length === 0) {
      return res.status(404).json({ error: 'Active ride not found' });
    }

    // Build the route LineString from ride points
    // Calculate distance, duration, elevation, speed
    const { rows } = await query(
      `WITH points AS (
        SELECT location, elevation, speed_kmh, recorded_at
        FROM ride_points
        WHERE ride_id = $1
        ORDER BY recorded_at ASC
      ),
      route AS (
        SELECT ST_MakeLine(location ORDER BY recorded_at) as line
        FROM points
      ),
      stats AS (
        SELECT
          ST_Length(r.line::geography) / 1000 as distance_km,
          EXTRACT(EPOCH FROM (MAX(p.recorded_at) - MIN(p.recorded_at))) as duration_seconds,
          COALESCE(MAX(p.elevation) - MIN(p.elevation), 0) as elevation_gain,
          COALESCE(MAX(p.speed_kmh), 0) as max_speed,
          COALESCE(AVG(p.speed_kmh), 0) as avg_speed
        FROM points p, route r
      )
      UPDATE rides SET
        title = COALESCE($2, title),
        description = $3,
        route = (SELECT line FROM route),
        end_point = (SELECT location FROM points ORDER BY recorded_at DESC LIMIT 1),
        end_name = $4,
        distance_km = (SELECT distance_km FROM stats),
        duration_seconds = (SELECT duration_seconds FROM stats),
        elevation_gain = (SELECT elevation_gain FROM stats),
        max_speed_kmh = (SELECT max_speed FROM stats),
        avg_speed_kmh = (SELECT avg_speed FROM stats),
        visibility = COALESCE($5, 'private'),
        status = 'completed',
        finished_at = NOW()
      WHERE id = $1
      RETURNING id, title, description, distance_km, duration_seconds,
                elevation_gain, max_speed_kmh, avg_speed_kmh,
                visibility, tracking_mode, status,
                ST_AsGeoJSON(start_point) as start_point,
                ST_AsGeoJSON(end_point) as end_point,
                start_name, end_name,
                started_at, finished_at`,
      [req.params.id, title, description, endName, visibility]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rides
 * Get ride feed — public rides + user's own rides.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    let queryText;
    let params;

    if (req.user) {
      // Logged in: show public rides + own rides
      queryText = `
        SELECT r.id, r.title, r.description, r.distance_km, r.duration_seconds,
               r.elevation_gain, r.avg_speed_kmh, r.visibility, r.tracking_mode,
               r.started_at, r.finished_at, r.created_at,
               ST_AsGeoJSON(r.start_point) as start_point,
               ST_AsGeoJSON(r.end_point) as end_point,
               r.start_name, r.end_name,
               u.id as user_id, u.display_name, u.avatar_url
        FROM rides r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'completed'
          AND (r.visibility = 'public' OR r.user_id = $1)
        ORDER BY r.finished_at DESC
        LIMIT $2 OFFSET $3`;
      params = [req.user.id, limit, offset];
    } else {
      // Guest: show public rides only
      queryText = `
        SELECT r.id, r.title, r.description, r.distance_km, r.duration_seconds,
               r.elevation_gain, r.avg_speed_kmh, r.visibility, r.tracking_mode,
               r.started_at, r.finished_at, r.created_at,
               ST_AsGeoJSON(r.start_point) as start_point,
               ST_AsGeoJSON(r.end_point) as end_point,
               r.start_name, r.end_name,
               u.id as user_id, u.display_name, u.avatar_url
        FROM rides r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'completed' AND r.visibility = 'public'
        ORDER BY r.finished_at DESC
        LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const { rows } = await query(queryText, params);
    res.json({ rides: rows, limit, offset });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rides/:id
 * Get a single ride detail with route geometry.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.*, ST_AsGeoJSON(r.route) as route_geojson,
              ST_AsGeoJSON(r.start_point) as start_point,
              ST_AsGeoJSON(r.end_point) as end_point,
              u.id as user_id, u.display_name, u.avatar_url
       FROM rides r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const ride = rows[0];

    // Check access
    if (ride.visibility === 'private' && (!req.user || req.user.id !== ride.user_id)) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    // Get photos for this ride
    const photos = await query(
      `SELECT id, url, thumbnail_url, caption, is_proof,
              ST_AsGeoJSON(location) as location, taken_at
       FROM photos WHERE ride_id = $1
       ORDER BY taken_at ASC`,
      [req.params.id]
    );

    res.json({ ...ride, photos: photos.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/rides/:id
 * Update ride metadata (title, description, visibility).
 */
router.put('/:id', requireAuth, validate({
  title: { type: 'string', maxLength: 200 },
  description: { type: 'string', maxLength: 2000 },
  visibility: { type: 'string', enum: Object.values(RIDE_VISIBILITY) },
}), async (req, res, next) => {
  try {
    const { title, description, visibility } = req.body;

    const { rows } = await query(
      `UPDATE rides SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        visibility = COALESCE($3, visibility)
       WHERE id = $4 AND user_id = $5
       RETURNING id, title, description, visibility`,
      [title, description, visibility, req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/rides/:id
 * Delete a ride.
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      'DELETE FROM rides WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json({ message: 'Ride deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/rides/:id/share
 * Get data needed to render the shareable ride card.
 */
router.get('/:id/share', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT r.id, r.title, r.distance_km, r.duration_seconds,
              r.elevation_gain, r.avg_speed_kmh,
              ST_AsGeoJSON(r.route) as route_geojson,
              r.start_name, r.end_name,
              r.started_at, r.finished_at,
              u.display_name, u.avatar_url
       FROM rides r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1 AND r.visibility = 'public'`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found or not public' });
    }

    // Get cover photo (first photo of the ride)
    const photo = await query(
      'SELECT url FROM photos WHERE ride_id = $1 ORDER BY taken_at ASC LIMIT 1',
      [req.params.id]
    );

    res.json({
      ...rows[0],
      coverPhotoUrl: photo.rows[0]?.url || null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
