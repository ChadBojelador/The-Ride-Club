const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query } = require('../db/pool');
const { RIDE_VISIBILITY, RIDE_STATUS, TRACKING_MODE } = require('../../../shared/enums');
const { getLevelInfo, calculateRideXP, BADGES } = require('../../../shared/gamification');

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

    // If vehicleId is provided or user has a primary vehicle, link ride and update odometer
    if (rows[0] && rows[0].distance_km) {
      const dist = parseFloat(rows[0].distance_km) || 0;
      const targetVehicleId = req.body.vehicleId || req.body.vehicle_id;
      if (targetVehicleId) {
        await query(
          `UPDATE rides SET vehicle_id = $1 WHERE id = $2;
           UPDATE vehicles SET odometer_km = COALESCE(odometer_km, 0) + $3, updated_at = NOW() WHERE id = $1 AND user_id = $4;`,
          [targetVehicleId, req.params.id, dist, req.user.id]
        );
      } else {
        const { rows: primaryVeh } = await query(
          `SELECT id FROM vehicles WHERE user_id = $1 AND is_primary = true LIMIT 1`,
          [req.user.id]
        );
        if (primaryVeh.length > 0) {
          await query(
            `UPDATE rides SET vehicle_id = $1 WHERE id = $2;
             UPDATE vehicles SET odometer_km = COALESCE(odometer_km, 0) + $3, updated_at = NOW() WHERE id = $1 AND user_id = $4;`,
            [primaryVeh[0].id, req.params.id, dist, req.user.id]
          );
        }
      }
    }

    // ── XP & Leveling ─────────────────────────────────────────────────────────
    const finishedRide = rows[0];
    let xpResult = null;

    if (finishedRide) {
      const vehicleId = req.body.vehicleId || req.body.vehicle_id || null;

      // Resolve actual vehicle linked to this ride (may have just been set above)
      const { rows: linkedVeh } = await query(
        `SELECT vehicle_id FROM rides WHERE id = $1`,
        [req.params.id]
      );
      const activeVehicleId = linkedVeh[0]?.vehicle_id || vehicleId;

      if (activeVehicleId) {
        // 1. Find all distinct places within 250m of the route
        const distKm = parseFloat(finishedRide.distance_km) || 0;
        let nearbyPlaces = [];

        try {
          const { rows: places } = await query(
            `SELECT p.id, p.name, p.category
             FROM places p, rides r
             WHERE r.id = $1
               AND r.route IS NOT NULL
               AND ST_DWithin(r.route::geography, p.location::geography, 250)
               AND NOT EXISTS (
                 SELECT 1 FROM vehicle_place_visits vpv
                 WHERE vpv.vehicle_id = $2 AND vpv.place_id = p.id
               )`,
            [req.params.id, activeVehicleId]
          );
          nearbyPlaces = places;
        } catch (e) {
          // Route may not have geometry yet (manual rides) — skip place detection
        }

        // 2. Calculate XP earned
        const { total: xpEarned, breakdown } = calculateRideXP(distKm, nearbyPlaces);

        // 3. Check badge criteria before updating
        const { rows: vehBefore } = await query(
          `SELECT xp, level, odometer_km, places_visited_count FROM vehicles WHERE id = $1`,
          [activeVehicleId]
        );
        const prevXp = parseInt(vehBefore[0]?.xp || 0);
        const newXp = prevXp + xpEarned;
        const newLevelInfo = getLevelInfo(newXp);

        // 4. Stamp place visits
        const newStamps = [];
        for (const place of nearbyPlaces) {
          const placeXp = require('../../../shared/gamification').XP_RULES.PLACE_XP[
            (place.category || '').toLowerCase()
          ] ?? require('../../../shared/gamification').XP_RULES.PLACE_XP.default;
          try {
            await query(
              `INSERT INTO vehicle_place_visits (vehicle_id, place_id, ride_id, xp_earned)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (vehicle_id, place_id) DO NOTHING`,
              [activeVehicleId, place.id, req.params.id, placeXp]
            );
            newStamps.push({ ...place, xp_earned: placeXp });
          } catch (_) {}
        }

        // 5. Update vehicle XP, level, place count
        await query(
          `UPDATE vehicles SET
             xp = COALESCE(xp, 0) + $1,
             level = $2,
             places_visited_count = COALESCE(places_visited_count, 0) + $3,
             updated_at = NOW()
           WHERE id = $4`,
          [xpEarned, newLevelInfo.level, nearbyPlaces.length, activeVehicleId]
        );

        // 6. Check & unlock badges
        const { rows: placeCounts } = await query(
          `SELECT p.category, COUNT(*) as cnt
           FROM vehicle_place_visits vpv
           JOIN places p ON vpv.place_id = p.id
           WHERE vpv.vehicle_id = $1
           GROUP BY p.category`,
          [activeVehicleId]
        );
        const { rows: totalPlacesRow } = await query(
          `SELECT COUNT(*) as cnt FROM vehicle_place_visits WHERE vehicle_id = $1`,
          [activeVehicleId]
        );
        const { rows: rideStats } = await query(
          `SELECT COUNT(*) as total_rides, COALESCE(SUM(distance_km), 0) as total_distance,
                  COALESCE(MAX(distance_km), 0) as max_ride
           FROM rides WHERE vehicle_id = $1 AND status = 'completed'`,
          [activeVehicleId]
        );
        const { rows: maintLogs } = await query(
          `SELECT COUNT(*) as cnt FROM maintenance_logs WHERE vehicle_id = $1`,
          [activeVehicleId]
        );

        const categoryMap = {};
        for (const r of placeCounts) categoryMap[r.category] = parseInt(r.cnt);
        const totalPlaces = parseInt(totalPlacesRow[0]?.cnt || 0);
        const totalRides = parseInt(rideStats[0]?.total_rides || 0);
        const totalDist = parseFloat(rideStats[0]?.total_distance || 0);
        const maxRide = parseFloat(rideStats[0]?.max_ride || 0);
        const maintCount = parseInt(maintLogs[0]?.cnt || 0);

        const newlyUnlocked = [];
        const badgeChecks = [
          { id: 'first_track',    pass: totalRides >= 1 },
          { id: 'cafe_crawler',   pass: (categoryMap['cafe'] || 0) >= 3 },
          { id: 'ridge_runner',   pass: (categoryMap['viewpoint'] || 0) >= 3 },
          { id: 'beach_bum',      pass: (categoryMap['beach'] || 0) >= 3 },
          { id: 'century_club',   pass: maxRide >= 100 },
          { id: 'five_hundred',   pass: totalDist >= 500 },
          { id: 'clean_machine',  pass: maintCount >= 3 },
          { id: 'globe_trotter',  pass: totalPlaces >= 10 },
          { id: 'apex_collector', pass: newLevelInfo.level >= 10 },
        ];

        for (const check of badgeChecks) {
          if (!check.pass) continue;
          const def = BADGES.find(b => b.id === check.id);
          if (!def) continue;
          try {
            const { rowCount } = await query(
              `INSERT INTO vehicle_badges (vehicle_id, badge_id, badge_name, badge_category, badge_icon, xp_awarded)
               VALUES ($1, $2, $3, $4, $5, $6)
               ON CONFLICT (vehicle_id, badge_id) DO NOTHING`,
              [activeVehicleId, def.id, def.name, def.category, def.icon, def.xpAwarded]
            );
            if (rowCount > 0) {
              // Award badge XP
              await query(
                `UPDATE vehicles SET xp = COALESCE(xp, 0) + $1 WHERE id = $2`,
                [def.xpAwarded, activeVehicleId]
              );
              newlyUnlocked.push({ id: def.id, name: def.name, icon: def.icon, xpAwarded: def.xpAwarded });
            }
          } catch (_) {}
        }

        xpResult = {
          xpEarned,
          breakdown,
          newLevel: newLevelInfo.level,
          leveledUp: newLevelInfo.level > (getLevelInfo(prevXp).level),
          newTitle: newLevelInfo.title,
          newStamps,
          newBadges: newlyUnlocked,
        };
      }
    }

    res.json({ ...(rows[0] || {}), gamification: xpResult });
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
