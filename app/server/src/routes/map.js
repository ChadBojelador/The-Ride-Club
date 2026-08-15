const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const { query } = require('../db/pool');

const router = express.Router();

/**
 * GET /api/map/rides
 * Get ride routes within a bounding box for the discover map.
 * Returns simplified route geometries for performance.
 */
router.get('/rides', optionalAuth, async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng } = req.query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ error: 'Bounding box parameters required' });
    }

    const { rows } = await query(
      `SELECT r.id, r.title, r.distance_km, r.duration_seconds,
              ST_AsGeoJSON(ST_Simplify(r.route, 0.001)) as route_geojson,
              ST_AsGeoJSON(r.start_point) as start_point,
              ST_AsGeoJSON(r.end_point) as end_point,
              r.start_name, r.end_name,
              u.display_name, u.avatar_url
       FROM rides r
       JOIN users u ON r.user_id = u.id
       WHERE r.status = 'completed'
         AND r.visibility = 'public'
         AND r.route && ST_MakeEnvelope($1, $2, $3, $4, 4326)
       ORDER BY r.finished_at DESC
       LIMIT 100`,
      [parseFloat(swLng), parseFloat(swLat), parseFloat(neLng), parseFloat(neLat)]
    );

    res.json({ rides: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/map/places
 * Get place pins within a bounding box.
 */
router.get('/places', optionalAuth, async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng, category } = req.query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ error: 'Bounding box parameters required' });
    }

    let queryText = `
      SELECT p.id, p.name, p.category, p.custom_category,
             ST_AsGeoJSON(p.location) as location,
             p.rating
      FROM places p
      WHERE ST_Within(p.location, ST_MakeEnvelope($1, $2, $3, $4, 4326))`;

    const params = [
      parseFloat(swLng), parseFloat(swLat),
      parseFloat(neLng), parseFloat(neLat),
    ];

    if (category) {
      queryText += ` AND p.category = $5`;
      params.push(category);
    }

    queryText += ' LIMIT 200';

    const { rows } = await query(queryText, params);
    res.json({ places: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/map/heatmap
 * Get ride density data for heatmap visualization.
 */
router.get('/heatmap', async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng } = req.query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({ error: 'Bounding box parameters required' });
    }

    // Get point density using ride points
    const { rows } = await query(
      `SELECT ST_AsGeoJSON(
          ST_SnapToGrid(rp.location, 0.01)
        ) as location,
        COUNT(*) as intensity
       FROM ride_points rp
       JOIN rides r ON rp.ride_id = r.id
       WHERE r.visibility = 'public'
         AND rp.location && ST_MakeEnvelope($1, $2, $3, $4, 4326)
       GROUP BY ST_SnapToGrid(rp.location, 0.01)
       ORDER BY intensity DESC
       LIMIT 500`,
      [parseFloat(swLng), parseFloat(swLat), parseFloat(neLng), parseFloat(neLat)]
    );

    res.json({ heatmap: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
