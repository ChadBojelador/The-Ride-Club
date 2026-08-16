// ========================================
// THE RIDES CLUB — Segments Service
// Fetch route segments & leaderboards
// ========================================

import api from './api';

/**
 * Fetch all route segments (with podium preview).
 * @param {object} opts - { limit, offset, q }
 */
export async function getSegments({ limit = 30, offset = 0, q = '' } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (q) params.set('q', q);
  return api.get(`/segments?${params.toString()}`);
}

/**
 * Fetch a segment's full leaderboard.
 * @param {string} segmentId
 */
export async function getSegmentLeaderboard(segmentId) {
  return api.get(`/segments/${segmentId}`);
}

/**
 * Format seconds as "H:MM:SS" or "M:SS".
 */
export function formatDuration(secs) {
  if (!secs && secs !== 0) return '—';
  const s = Math.round(secs);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
