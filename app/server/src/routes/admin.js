const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { query } = require('../db/pool');

const router = express.Router();

/**
 * Simple admin middleware — checks if user is an admin.
 * For V1, we use a hardcoded admin check.
 * TODO: Add admin role to users table.
 */
const requireAdmin = async (req, res, next) => {
  // For now, check an environment variable for admin user IDs
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim());

  if (!adminIds.includes(req.user.id)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * GET /api/admin/stats
 * Dashboard overview stats.
 */
router.get('/stats', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users = await query('SELECT COUNT(*) as count FROM users');
    const rides = await query("SELECT COUNT(*) as count FROM rides WHERE status = 'completed'");
    const places = await query('SELECT COUNT(*) as count FROM places');
    const clubs = await query('SELECT COUNT(*) as count FROM clubs');
    const photos = await query('SELECT COUNT(*) as count FROM photos');

    // Rides today
    const today = await query(
      "SELECT COUNT(*) as count FROM rides WHERE status = 'completed' AND finished_at >= CURRENT_DATE"
    );

    // New users this week
    const weekUsers = await query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'"
    );

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalRides: parseInt(rides.rows[0].count),
      totalPlaces: parseInt(places.rows[0].count),
      totalClubs: parseInt(clubs.rows[0].count),
      totalPhotos: parseInt(photos.rows[0].count),
      ridesToday: parseInt(today.rows[0].count),
      newUsersThisWeek: parseInt(weekUsers.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users
 * List all users with pagination.
 */
router.get('/users', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';

    let queryText = `
      SELECT u.id, u.email, u.display_name, u.avatar_url, u.auth_provider,
             u.is_public, u.created_at,
             (SELECT COUNT(*) FROM rides WHERE user_id = u.id AND status = 'completed') as ride_count
      FROM users u`;

    const params = [];

    if (search) {
      queryText += ` WHERE u.display_name ILIKE $1 OR u.email ILIKE $1`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await query(queryText, params);
    const total = await query('SELECT COUNT(*) as count FROM users');

    res.json({
      users: rows,
      total: parseInt(total.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/rides
 * List all rides with pagination.
 */
router.get('/rides', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const { rows } = await query(
      `SELECT r.id, r.title, r.distance_km, r.duration_seconds,
              r.visibility, r.status, r.tracking_mode,
              r.started_at, r.finished_at,
              u.display_name, u.email
       FROM rides r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const total = await query('SELECT COUNT(*) as count FROM rides');

    res.json({
      rides: rows,
      total: parseInt(total.rows[0].count),
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/users/:id
 * Remove a user (admin action).
 */
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM users WHERE id = $1', [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User removed' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/rides/:id
 * Remove a ride (admin action).
 */
router.delete('/rides/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM rides WHERE id = $1', [req.params.id]);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.json({ message: 'Ride removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
