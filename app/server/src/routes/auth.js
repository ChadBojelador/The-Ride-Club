const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const config = require('../config');
const { query } = require('../db/pool');

const router = express.Router();
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * Generate access + refresh tokens for a user.
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );

  const refreshToken = crypto.randomBytes(64).toString('hex');

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/google
 * Sign in with Google ID token.
 * Creates the user if they don't exist.
 */
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let { rows } = await query(
      'SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
      ['google', googleId]
    );

    let user;

    if (rows.length === 0) {
      // Create new user
      const result = await query(
        `INSERT INTO users (email, display_name, avatar_url, auth_provider, auth_provider_id)
         VALUES ($1, $2, $3, 'google', $4)
         RETURNING *`,
        [email, name || 'Rider', picture, googleId]
      );
      user = result.rows[0];
    } else {
      user = rows[0];
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        bikeName: user.bike_name,
        bikeModel: user.bike_model,
        isPublic: user.is_public,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/apple
 * Sign in with Apple identity token.
 * Creates the user if they don't exist.
 */
router.post('/apple', async (req, res, next) => {
  try {
    const { identityToken, user: appleUser } = req.body;

    if (!identityToken) {
      return res.status(400).json({ error: 'identityToken is required' });
    }

    // Decode Apple identity token (in production, verify with Apple's public keys)
    // For now, decode the JWT payload
    const parts = identityToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    const { sub: appleId, email } = payload;

    // Check if user exists
    let { rows } = await query(
      'SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
      ['apple', appleId]
    );

    let user;

    if (rows.length === 0) {
      // Apple only sends name on first sign-in
      const displayName = appleUser?.fullName
        ? `${appleUser.fullName.givenName || ''} ${appleUser.fullName.familyName || ''}`.trim()
        : 'Rider';

      const result = await query(
        `INSERT INTO users (email, display_name, auth_provider, auth_provider_id)
         VALUES ($1, $2, 'apple', $3)
         RETURNING *`,
        [email, displayName, appleId]
      );
      user = result.rows[0];
    } else {
      user = rows[0];
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        bikeName: user.bike_name,
        bikeModel: user.bike_model,
        isPublic: user.is_public,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }

    // Find the refresh token
    const { rows } = await query(
      `SELECT rt.*, u.id as user_id, u.email, u.display_name
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token = $1 AND rt.expires_at > NOW()`,
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const row = rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: row.user_id },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/auth/logout
 * Invalidate the refresh token.
 */
router.delete('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }

    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
