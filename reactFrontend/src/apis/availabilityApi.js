import axios from 'axios';
import { BASE_URL } from './api.js';

// Create axios instance with auth token
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// AVAILABILITY APIs
// ==========================================

/**
 * Get all availability schedules for the current user
 */
export const getAllAvailability = async () => {
  try {
    const response = await api.get('/api/availability');
    return response.data;
  } catch (error) {
    console.error('Get availability error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Save availability for a specific day
 * @param {Object} availabilityData - Availability data
 * @param {number} availabilityData.dayOfWeek - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 * @param {Array} availabilityData.slots - Array of time slots
 * @param {string} availabilityData.slots[].startTime - Start time (HH:MM format)
 * @param {string} availabilityData.slots[].endTime - End time (HH:MM format)
 */
export const saveAvailability = async (availabilityData) => {
  try {
    const response = await api.post('/api/availability', availabilityData);
    return response.data;
  } catch (error) {
    console.error('Save availability error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Save availability for multiple days at once
 * @param {Array} weekSchedule - Array of availability data for each day
 */
export const saveWeeklyAvailability = async (weekSchedule) => {
  try {
    const promises = weekSchedule.map(daySchedule => 
      saveAvailability(daySchedule)
    );
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Save weekly availability error:', error);
    throw error;
  }
};

// Helper: Get day name from day number
export const getDayName = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

// Helper: Format time slot for display
export const formatTimeSlot = (slot) => {
  return `${slot.startTime} - ${slot.endTime}`;
};
