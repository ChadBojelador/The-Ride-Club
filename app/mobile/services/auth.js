// ========================================
// THE RIDES CLUB — Auth Service
// Google & Apple sign-in handlers
// ========================================

import api from './api';

/**
 * Sign in with Google.
 * Takes the Google ID token from the OAuth flow
 * and exchanges it for TRC auth tokens.
 */
export async function signInWithGoogle(idToken) {
  const data = await api.post('/auth/google', { idToken }, { auth: false });
  return data; // { user, accessToken, refreshToken }
}

/**
 * Sign in with Apple.
 * Takes the Apple identity token and optional user info
 * and exchanges it for TRC auth tokens.
 */
export async function signInWithApple(identityToken, user) {
  const data = await api.post('/auth/apple', { identityToken, user }, { auth: false });
  return data; // { user, accessToken, refreshToken }
}

/**
 * Logout — invalidates the refresh token on the server.
 */
export async function logout(refreshToken) {
  try {
    await api.delete('/auth/logout', {
      body: { refreshToken },
    });
  } catch {
    // Silently fail — we clear local state regardless
  }
}

/**
 * Get the current user's profile from the server.
 */
export async function getCurrentUser() {
  return api.get('/users/me');
}

/**
 * Update the current user's profile.
 */
export async function updateProfile(profileData) {
  return api.put('/users/me', profileData);
}
