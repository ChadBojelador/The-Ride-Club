// ========================================
// THE RIDES CLUB — Vehicle & Maintenance API
// Manage garage, bikes, service logs & intervals
// ========================================

const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query, getClient } = require('../db/pool');
const { MAINTENANCE_CATEGORIES } = require('../../../shared/maintenance');
const { getLevelInfo, BADGES } = require('../../../shared/gamification');

const router = express.Router();

/**
 * Helper: Calculate wear / due percentage for a maintenance schedule
 */
function calculateScheduleStatus(schedule, currentOdoKm) {
  const kmSince = Math.max(0, currentOdoKm - (parseFloat(schedule.last_service_km) || 0));
  let kmPercent = 0;
  let kmRemaining = null;

  if (schedule.interval_km && schedule.interval_km > 0) {
    kmPercent = Math.min(100, Math.round((kmSince / schedule.interval_km) * 100));
    kmRemaining = Math.max(0, schedule.interval_km - kmSince);
  }

  // Check days since last service
  const lastDate = schedule.last_service_date ? new Date(schedule.last_service_date) : new Date();
  const now = new Date();
  const diffMonths = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());
  let monthPercent = 0;

  if (schedule.interval_months && schedule.interval_months > 0) {
    monthPercent = Math.min(100, Math.round((diffMonths / schedule.interval_months) * 100));
  }

  const wearPercent = Math.max(kmPercent, monthPercent);
  let status = 'good'; // 'good' | 'due_soon' | 'overdue'

  if (wearPercent >= 100) {
    status = 'overdue';
  } else if (wearPercent >= 80) {
    status = 'due_soon';
  }

  return {
    ...schedule,
    kmSince,
    kmRemaining,
    wearPercent,
    status,
  };
}

/**
 * GET /api/vehicles
 * Get all vehicles in the user's garage with maintenance overview.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows: vehicles } = await query(
      `SELECT v.*,
              (SELECT COUNT(*) FROM maintenance_logs WHERE vehicle_id = v.id) as log_count,
              (SELECT COALESCE(SUM(cost), 0) FROM maintenance_logs WHERE vehicle_id = v.id) as total_maintenance_cost
       FROM vehicles v
       WHERE v.user_id = $1
       ORDER BY v.is_primary DESC, v.created_at DESC`,
      [req.user.id]
    );

    // Fetch schedules for each vehicle
    const enrichedVehicles = await Promise.all(
      vehicles.map(async (veh) => {
        const { rows: schedules } = await query(
          `SELECT * FROM maintenance_schedules WHERE vehicle_id = $1 AND is_active = true ORDER BY created_at ASC`,
          [veh.id]
        );

        const calculatedSchedules = schedules.map((s) =>
          calculateScheduleStatus(s, parseFloat(veh.odometer_km) || 0)
        );

        const overdueCount = calculatedSchedules.filter((s) => s.status === 'overdue').length;
        const dueSoonCount = calculatedSchedules.filter((s) => s.status === 'due_soon').length;

        return {
          ...veh,
          schedules: calculatedSchedules,
          overdueCount,
          dueSoonCount,
        };
      })
    );

    res.json({ vehicles: enrichedVehicles });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/vehicles
 * Add a new vehicle to the user's garage.
 */
router.post(
  '/',
  requireAuth,
  validate(['name', 'make', 'model']),
  async (req, res, next) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const {
        name,
        make,
        model,
        year,
        type = 'motorcycle',
        displacement_cc,
        license_plate,
        odometer_km = 0,
        photo_url,
        is_primary = false,
      } = req.body;

      // If set as primary, unmark other vehicles
      if (is_primary) {
        await client.query(
          `UPDATE vehicles SET is_primary = false WHERE user_id = $1`,
          [req.user.id]
        );
      } else {
        // If this is the user's first vehicle, make it primary automatically
        const { rows: existing } = await client.query(
          `SELECT id FROM vehicles WHERE user_id = $1 LIMIT 1`,
          [req.user.id]
        );
        if (existing.length === 0) {
          req.body.is_primary = true;
        }
      }

      const { rows: [vehicle] } = await client.query(
        `INSERT INTO vehicles (
          user_id, name, make, model, year, type,
          displacement_cc, license_plate, odometer_km, photo_url, is_primary
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          req.user.id,
          name,
          make,
          model,
          year || null,
          type,
          displacement_cc || null,
          license_plate || null,
          parseFloat(odometer_km) || 0,
          photo_url || null,
          req.body.is_primary ?? false,
        ]
      );

      // Create default maintenance schedules (oil_change, chain, tires, brakes, spark_plugs, coolant)
      const defaultTypes = ['oil_change', 'chain', 'tires', 'brakes', 'spark_plugs', 'coolant'];
      for (const st of defaultTypes) {
        const cat = MAINTENANCE_CATEGORIES[st];
        if (cat) {
          await client.query(
            `INSERT INTO maintenance_schedules (
              vehicle_id, service_type, interval_km, interval_months, last_service_km, last_service_date
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
            ON CONFLICT DO NOTHING`,
            [
              vehicle.id,
              st,
              cat.defaultIntervalKm,
              cat.defaultIntervalMonths,
              parseFloat(odometer_km) || 0,
            ]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ vehicle });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

/**
 * GET /api/vehicles/:id
 * Get single vehicle details, schedules, and recent maintenance logs.
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows: [vehicle] } = await query(
      `SELECT * FROM vehicles WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { rows: schedules } = await query(
      `SELECT * FROM maintenance_schedules WHERE vehicle_id = $1 ORDER BY created_at ASC`,
      [vehicle.id]
    );

    const calculatedSchedules = schedules.map((s) =>
      calculateScheduleStatus(s, parseFloat(vehicle.odometer_km) || 0)
    );

    const { rows: recentLogs } = await query(
      `SELECT * FROM maintenance_logs WHERE vehicle_id = $1 ORDER BY service_date DESC, created_at DESC LIMIT 10`,
      [vehicle.id]
    );

    res.json({
      vehicle: {
        ...vehicle,
        schedules: calculatedSchedules,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/vehicles/:id
 * Update vehicle info or update odometer.
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const {
      name,
      make,
      model,
      year,
      type,
      displacement_cc,
      license_plate,
      odometer_km,
      photo_url,
      is_primary,
    } = req.body;

    if (is_primary) {
      await query(`UPDATE vehicles SET is_primary = false WHERE user_id = $1`, [
        req.user.id,
      ]);
    }

    const { rows: [updated] } = await query(
      `UPDATE vehicles SET
        name = COALESCE($1, name),
        make = COALESCE($2, make),
        model = COALESCE($3, model),
        year = COALESCE($4, year),
        type = COALESCE($5, type),
        displacement_cc = COALESCE($6, displacement_cc),
        license_plate = COALESCE($7, license_plate),
        odometer_km = COALESCE($8, odometer_km),
        photo_url = COALESCE($9, photo_url),
        is_primary = COALESCE($10, is_primary),
        updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        name,
        make,
        model,
        year,
        type,
        displacement_cc,
        license_plate,
        odometer_km !== undefined ? parseFloat(odometer_km) : null,
        photo_url,
        is_primary,
        req.params.id,
        req.user.id,
      ]
    );

    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ vehicle: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle from garage.
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM vehicles WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/vehicles/:id/maintenance
 * Get maintenance history log for a vehicle with statistics.
 */
router.get('/:id/maintenance', requireAuth, async (req, res, next) => {
  try {
    const { rows: logs } = await query(
      `SELECT * FROM maintenance_logs
       WHERE vehicle_id = $1 AND user_id = $2
       ORDER BY service_date DESC, created_at DESC`,
      [req.params.id, req.user.id]
    );

    const totalCost = logs.reduce((sum, l) => sum + (parseFloat(l.cost) || 0), 0);

    res.json({
      logs,
      totalCost,
      totalCount: logs.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/vehicles/:id/maintenance
 * Record a new maintenance service.
 */
router.post(
  '/:id/maintenance',
  requireAuth,
  validate(['service_type', 'title', 'odometer_km']),
  async (req, res, next) => {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const {
        service_type,
        title,
        notes,
        cost = 0,
        odometer_km,
        service_date = new Date(),
        performed_by = 'DIY',
        receipt_url,
      } = req.body;

      const odo = parseFloat(odometer_km);

      // Verify vehicle belongs to user
      const { rows: [vehicle] } = await client.query(
        `SELECT * FROM vehicles WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );

      if (!vehicle) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Insert maintenance record
      const { rows: [log] } = await client.query(
        `INSERT INTO maintenance_logs (
          vehicle_id, user_id, service_type, title, notes,
          cost, odometer_km, service_date, performed_by, receipt_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          req.params.id,
          req.user.id,
          service_type,
          title,
          notes || null,
          parseFloat(cost) || 0,
          odo,
          service_date,
          performed_by,
          receipt_url || null,
        ]
      );

      // If recorded odometer is higher than vehicle's current odometer, update vehicle odometer
      if (odo > (parseFloat(vehicle.odometer_km) || 0)) {
        await client.query(
          `UPDATE vehicles SET odometer_km = $1, updated_at = NOW() WHERE id = $2`,
          [odo, req.params.id]
        );
      }

      // Reset / update corresponding maintenance schedule
      await client.query(
        `UPDATE maintenance_schedules SET
          last_service_km = $1,
          last_service_date = $2
         WHERE vehicle_id = $3 AND service_type = $4`,
        [odo, service_date, req.params.id, service_type]
      );

      await client.query('COMMIT');
      res.status(201).json({ log });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

/**
 * DELETE /api/vehicles/:id/maintenance/:logId
 * Delete a single maintenance log.
 */
router.delete('/:id/maintenance/:logId', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query(
      `DELETE FROM maintenance_logs WHERE id = $1 AND vehicle_id = $2 AND user_id = $3`,
      [req.params.logId, req.params.id, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Maintenance log not found' });
    }

    res.json({ message: 'Log deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/vehicles/:id/passport
 * Returns vehicle leveling data: XP, level, rank, badges, and place stamps.
 */
router.get('/:id/passport', requireAuth, async (req, res, next) => {
  try {
    // Get vehicle with XP / level
    const { rows: vehRows } = await query(
      `SELECT id, nickname, make, model, year, xp, level, places_visited_count, odometer_km
       FROM vehicles
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (vehRows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const vehicle = vehRows[0];
    const xp = parseInt(vehicle.xp) || 0;
    const levelInfo = getLevelInfo(xp);

    // Get unlocked badges
    const { rows: badgeRows } = await query(
      `SELECT badge_id, badge_name, badge_category, badge_icon, xp_awarded, unlocked_at
       FROM vehicle_badges
       WHERE vehicle_id = $1
       ORDER BY unlocked_at ASC`,
      [req.params.id]
    );

    // Get place stamps (places visited during rides)
    const { rows: placeRows } = await query(
      `SELECT vpv.place_id, p.name, p.category, p.description,
              ST_AsGeoJSON(p.location) as location,
              vpv.xp_earned, vpv.visited_at
       FROM vehicle_place_visits vpv
       JOIN places p ON vpv.place_id = p.id
       WHERE vpv.vehicle_id = $1
       ORDER BY vpv.visited_at DESC`,
      [req.params.id]
    );

    // Count total rides
    const { rows: rideCount } = await query(
      `SELECT COUNT(*) as total_rides,
              COALESCE(SUM(distance_km), 0) as total_distance
       FROM rides
       WHERE vehicle_id = $1 AND status = 'completed'`,
      [req.params.id]
    );

    // Available badges (all defined badges, marking which are unlocked)
    const unlockedIds = new Set(badgeRows.map(b => b.badge_id));
    const allBadges = BADGES.map(b => ({
      ...b,
      unlocked: unlockedIds.has(b.id),
      unlockedAt: badgeRows.find(u => u.badge_id === b.id)?.unlocked_at || null,
    }));

    res.json({
      vehicle: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        odometer_km: vehicle.odometer_km,
      },
      xp,
      level: levelInfo.level,
      title: levelInfo.title,
      emoji: levelInfo.emoji,
      progress: levelInfo.progress,
      nextMinXp: levelInfo.nextMinXp,
      totalRides: parseInt(rideCount[0]?.total_rides) || 0,
      totalDistance: parseFloat(rideCount[0]?.total_distance) || 0,
      placesVisited: placeRows.length,
      badges: allBadges,
      placeStamps: placeRows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
