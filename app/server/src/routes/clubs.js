const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { query, getClient } = require('../db/pool');
const { CLUB_ROLE, INVITE_STATUS } = require('../../../shared/enums');

const router = express.Router();

/**
 * GET /api/clubs
 * List clubs — user's clubs + discover public clubs.
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';

    let queryText = `
      SELECT c.id, c.name, c.description, c.avatar_url, c.cover_url,
             c.is_public, c.created_at,
             (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
      FROM clubs c
      WHERE c.is_public = true`;

    const params = [];

    if (search) {
      queryText += ` AND c.name ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    queryText += ` ORDER BY member_count DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await query(queryText, params);
    res.json({ clubs: rows, limit, offset });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/clubs/my
 * Get clubs the current user belongs to.
 */
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.id, c.name, c.description, c.avatar_url, c.cover_url,
              c.is_public, c.created_at, cm.role,
              (SELECT COUNT(*) FROM club_members WHERE club_id = c.id) as member_count
       FROM clubs c
       JOIN club_members cm ON c.id = cm.club_id
       WHERE cm.user_id = $1
       ORDER BY cm.joined_at DESC`,
      [req.user.id]
    );

    res.json({ clubs: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/clubs/:id
 * Get club detail with members and recent rides.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT c.*, u.display_name as creator_name
       FROM clubs c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Get members
    const members = await query(
      `SELECT u.id, u.display_name, u.avatar_url, cm.role, cm.joined_at
       FROM club_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.club_id = $1
       ORDER BY cm.role ASC, cm.joined_at ASC`,
      [req.params.id]
    );

    res.json({
      ...rows[0],
      members: members.rows,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/clubs
 * Create a new club. Creator becomes the owner.
 */
router.post('/', requireAuth, validate({
  name: { type: 'string', required: true, maxLength: 100 },
  description: { type: 'string', maxLength: 1000 },
  isPublic: { type: 'boolean' },
}), async (req, res, next) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { name, description, isPublic } = req.body;

    const { rows } = await client.query(
      `INSERT INTO clubs (name, description, created_by, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, req.user.id, isPublic !== false]
    );

    const club = rows[0];

    // Add creator as owner
    await client.query(
      `INSERT INTO club_members (club_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [club.id, req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json(club);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

/**
 * PUT /api/clubs/:id
 * Update club (owner/admin only).
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    // Check if user is owner or admin
    const member = await query(
      "SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')",
      [req.params.id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, description, isPublic } = req.body;

    const { rows } = await query(
      `UPDATE clubs SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        is_public = COALESCE($3, is_public)
       WHERE id = $4
       RETURNING *`,
      [name, description, isPublic, req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/clubs/:id
 * Delete club (owner only).
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const member = await query(
      "SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2 AND role = 'owner'",
      [req.params.id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'Only the owner can delete a club' });
    }

    await query('DELETE FROM clubs WHERE id = $1', [req.params.id]);
    res.json({ message: 'Club deleted' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/clubs/:id/invite
 * Invite a user to the club.
 */
router.post('/:id/invite', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if inviter is a member
    const member = await query(
      'SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a club member to invite others' });
    }

    // Check if user is already a member
    const existing = await query(
      'SELECT 1 FROM club_members WHERE club_id = $1 AND user_id = $2',
      [req.params.id, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    // Check for existing pending invite
    const pendingInvite = await query(
      "SELECT 1 FROM club_invites WHERE club_id = $1 AND invited_user = $2 AND status = 'pending'",
      [req.params.id, userId]
    );

    if (pendingInvite.rows.length > 0) {
      return res.status(409).json({ error: 'Invite already pending' });
    }

    const { rows } = await query(
      `INSERT INTO club_invites (club_id, invited_by, invited_user)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, userId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/clubs/:id/join
 * Accept an invite or join a public club.
 */
router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    // Check if club is public or user has a pending invite
    const club = await query('SELECT is_public FROM clubs WHERE id = $1', [req.params.id]);

    if (club.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    if (!club.rows[0].is_public) {
      // Check for pending invite
      const invite = await query(
        "SELECT id FROM club_invites WHERE club_id = $1 AND invited_user = $2 AND status = 'pending'",
        [req.params.id, req.user.id]
      );

      if (invite.rows.length === 0) {
        return res.status(403).json({ error: 'This club requires an invitation' });
      }

      // Accept the invite
      await query(
        "UPDATE club_invites SET status = 'accepted' WHERE id = $1",
        [invite.rows[0].id]
      );
    }

    // Add as member
    await query(
      `INSERT INTO club_members (club_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (club_id, user_id) DO NOTHING`,
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Joined club' });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/clubs/:id/leave
 * Leave a club.
 */
router.delete('/:id/leave', requireAuth, async (req, res, next) => {
  try {
    // Can't leave if you're the owner
    const member = await query(
      'SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(404).json({ error: 'Not a member' });
    }

    if (member.rows[0].role === 'owner') {
      return res.status(400).json({ error: 'Owners cannot leave. Transfer ownership or delete the club.' });
    }

    await query(
      'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Left club' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
