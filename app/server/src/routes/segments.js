// ========================================
// THE RIDES CLUB — Segments & Leaderboards API
// Route segment detection, ranking, personal bests
// ========================================

const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { query } = require('../db/pool');

const router = express.Router();

/**
 * Formats duration seconds into "H:MM:SS" or "M:SS".
 */
function formatDuration(secs) {
  const s = Math.round(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

/**
 * GET /api/segments
 * List all route segments with top-3 podium preview.
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.q || '';

    const { rows: segments } = await query(
      `SELECT
         s.id,
         s.name,
         s.start_name,
         s.end_name,
         s.distance_km,
         s.total_attempts,
         s.created_at,
         u.display_name AS created_by_name
       FROM route_segments s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE ($1 = '' OR s.name ILIKE '%' || $1 || '%')
       ORDER BY s.total_attempts DESC, s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [search, limit, offset]
    );

    // Attach top-3 podium for each segment
    const enriched = await Promise.all(
      segments.map(async (seg) => {
        const { rows: podium } = await query(
          `SELECT
             lb.duration_seconds,
             lb.avg_speed_kmh,
             u.display_name,
             u.avatar_url,
             v.make  AS vehicle_make,
             v.model AS vehicle_model
           FROM segment_leaderboard lb
           JOIN users u ON lb.user_id = u.id
           LEFT JOIN vehicles v ON lb.vehicle_id = v.id
           WHERE lb.segment_id = $1
           ORDER BY lb.duration_seconds ASC
           LIMIT 3`,
          [seg.id]
        );
        return {
          ...seg,
          podium: podium.map((p, i) => ({
            rank: i + 1,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            time: formatDuration(p.duration_seconds),
            duration_seconds: p.duration_seconds,
            avg_speed_kmh: p.avg_speed_kmh,
            vehicle: p.vehicle_make ? `${p.vehicle_make} ${p.vehicle_model}` : null,
          })),
        };
      })
    );

    res.json({ segments: enriched, limit, offset, total: enriched.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/segments/:id
 * Full leaderboard for a single segment.
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    // Segment info
    const { rows: segRows } = await query(
      `SELECT s.*, u.display_name AS created_by_name
       FROM route_segments s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (segRows.length === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    const segment = segRows[0];

    // Full ranked leaderboard
    const { rows: lb } = await query(
      `SELECT
         ROW_NUMBER() OVER (ORDER BY lb.duration_seconds ASC) AS rank,
         lb.id,
         lb.duration_seconds,
         lb.distance_km,
         lb.avg_speed_kmh,
         lb.max_speed_kmh,
         lb.created_at AS set_at,
         u.id AS user_id,
         u.display_name,
         u.avatar_url,
         v.make  AS vehicle_make,
         v.model AS vehicle_model,
         v.year  AS vehicle_year,
         v.nickname AS vehicle_nickname,
         v.xp AS vehicle_xp,
         v.level AS vehicle_level
       FROM segment_leaderboard lb
       JOIN users u ON lb.user_id = u.id
       LEFT JOIN vehicles v ON lb.vehicle_id = v.id
       WHERE lb.segment_id = $1
       ORDER BY lb.duration_seconds ASC`,
      [req.params.id]
    );

    // Leader's time for gap calculation
    const leaderTime = lb[0]?.duration_seconds || 0;

    const formatted = lb.map((row) => ({
      rank: parseInt(row.rank),
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      durationSeconds: row.duration_seconds,
      time: formatDuration(row.duration_seconds),
      gapToLeader: row.rank === '1' ? null : `+${formatDuration(row.duration_seconds - leaderTime)}`,
      avgSpeedKmh: parseFloat(row.avg_speed_kmh) || 0,
      maxSpeedKmh: parseFloat(row.max_speed_kmh) || 0,
      distanceKm: parseFloat(row.distance_km) || 0,
      setAt: row.set_at,
      vehicle: row.vehicle_make
        ? {
            make: row.vehicle_make,
            model: row.vehicle_model,
            year: row.vehicle_year,
            nickname: row.vehicle_nickname,
            xp: row.vehicle_xp,
            level: row.vehicle_level,
          }
        : null,
    }));

    // Current user's rank (if authenticated)
    let myEntry = null;
    if (req.user) {
      myEntry = formatted.find((r) => r.userId === req.user.id) || null;
    }

    res.json({ segment, leaderboard: formatted, myEntry });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.formatDuration = formatDuration;
