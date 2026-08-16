/**
 * The Rides Club — Gamification API Service
 * Fetches vehicle passport, XP, badges, and place stamps.
 */
import api from './api';

export const gamificationService = {
  /**
   * Get a vehicle's full leveling passport.
   * @param {string} vehicleId
   */
  async getPassport(vehicleId) {
    const res = await api.get(`/vehicles/${vehicleId}/passport`);
    return res.data;
  },
};
