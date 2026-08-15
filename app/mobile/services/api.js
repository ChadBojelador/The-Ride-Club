// ========================================
// THE RIDES CLUB — API Client
// Base fetch wrapper with JWT auth & refresh
// ========================================

import * as SecureStore from 'expo-secure-store';

// Change this to your actual server URL
// For Expo Go on physical device, use your machine's local IP
// For emulator: Android = 10.0.2.2, iOS = localhost
const API_BASE = __DEV__
  ? 'http://192.168.1.100:3000/api'  // TODO: Update with your local IP
  : 'https://api.theridesclub.com/api';

const TOKEN_KEY = 'trc_access_token';
const REFRESH_KEY = 'trc_refresh_token';

let isRefreshing = false;
let refreshPromise = null;

/**
 * Make an authenticated API request.
 * Automatically attaches JWT token and handles refresh.
 */
export async function apiRequest(endpoint, options = {}) {
  const { body, method = 'GET', headers = {}, auth = true } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Attach auth token if needed
  if (auth) {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${endpoint}`;

  try {
    let response = await fetch(url, config);

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && auth) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        config.headers = requestHeaders;
        response = await fetch(url, config);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error — check your connection', 0, null);
  }
}

/**
 * Refresh the access token using the stored refresh token.
 */
async function refreshAccessToken() {
  // Prevent multiple simultaneous refresh calls
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refreshToken) return null;

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Custom API error class.
 */
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ── Convenience methods ────────────────────────

export const api = {
  get: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options) =>
    apiRequest(endpoint, { ...options, method: 'PUT', body }),

  delete: (endpoint, options) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export { API_BASE, ApiError };
export default api;
