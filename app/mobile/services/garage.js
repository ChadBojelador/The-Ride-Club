// ========================================
// THE RIDES CLUB — Garage & Maintenance API Service
// ========================================

import { apiRequest } from './api';

export const garageService = {
  /**
   * Get all vehicles in user's garage with schedules & health
   */
  async getVehicles() {
    return apiRequest('/vehicles');
  },

  /**
   * Get single vehicle details, schedules, and recent logs
   */
  async getVehicle(id) {
    return apiRequest(`/vehicles/${id}`);
  },

  /**
   * Add a new vehicle to garage
   */
  async createVehicle(vehicleData) {
    return apiRequest('/vehicles', {
      method: 'POST',
      body: vehicleData,
    });
  },

  /**
   * Update vehicle info or mileage
   */
  async updateVehicle(id, vehicleData) {
    return apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: vehicleData,
    });
  },

  /**
   * Delete vehicle
   */
  async deleteVehicle(id) {
    return apiRequest(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get full maintenance history for a vehicle
   */
  async getMaintenanceLogs(vehicleId) {
    return apiRequest(`/vehicles/${vehicleId}/maintenance`);
  },

  /**
   * Record a new maintenance service
   */
  async logMaintenance(vehicleId, logData) {
    return apiRequest(`/vehicles/${vehicleId}/maintenance`, {
      method: 'POST',
      body: logData,
    });
  },

  /**
   * Delete a maintenance log
   */
  async deleteMaintenanceLog(vehicleId, logId) {
    return apiRequest(`/vehicles/${vehicleId}/maintenance/${logId}`, {
      method: 'DELETE',
    });
  },
};

export default garageService;
