const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db/pool');

/**
 * Auth middleware — verifies JWT access token.
 * Sets req.user with { id, email, display_name } if valid.
 * Returns 401 if no token or invalid token.
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Verify user still exists
    const { rows } = await query('SELECT id, email, display_name FROM users WHERE id = $1', [decoded.userId]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional auth — sets req.user if token is valid, but doesn't block if not.
 * Used for endpoints that work for both guests and logged-in users.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { rows } = await query('SELECT id, email, display_name FROM users WHERE id = $1', [decoded.userId]);
    req.user = rows.length > 0 ? rows[0] : null;
  } catch {
    req.user = null;
  }

  next();
};

module.exports = { requireAuth, optionalAuth };
