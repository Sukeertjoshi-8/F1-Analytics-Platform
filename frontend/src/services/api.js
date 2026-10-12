import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Methods
export const f1Api = {
  // Calendar
  getCalendar: async (year) => {
    const url = year ? `/calendar?year=${year}` : '/calendar';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Telemetry
  getTelemetryComparison: async ({ year = 2024, round_number = 1, session_type = 'Q', driver_1 = 'VER', driver_2 = 'NOR' } = {}) => {
    const response = await apiClient.get('/telemetry/compare', {
      params: { year, round_number, session_type, driver_1, driver_2 }
    });
    return response.data;
  },

  getLiveTiming: async () => {
    try {
      const response = await apiClient.get('/live-timing');
      return response.data;
    } catch {
      const response = await apiClient.get('/telemetry/live');
      return response.data;
    }
  },

  // Strategy Engine
  predictTireDegradation: async ({ compound = 'SOFT', stint_length = 25, track_temp = 35.0, fuel_load = 100.0 }) => {
    const response = await apiClient.post('/strategy/tire-degradation', {
      compound,
      stint_length,
      track_temp,
      fuel_load
    });
    return response.data;
  },

  predictPitProbability: async (payload) => {
    const response = await apiClient.post('/strategy/pit-probability', payload);
    return response.data;
  },

  getModelStatus: async () => {
    const response = await apiClient.get('/strategy/model-status');
    return response.data;
  },

  // Advanced Race Stats
  getRaceStats: async (year, circuitId) => {
    const response = await apiClient.get(`/stats/${year}/${circuitId}`);
    return response.data;
  }
};

export default f1Api;
