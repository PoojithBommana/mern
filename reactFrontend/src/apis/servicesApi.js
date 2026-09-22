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
// SERVICES APIs
// ==========================================

/**
 * Get all services for the current user
 */
export const getAllServices = async () => {
  try {
    const response = await api.get('/api/services');
    return response.data;
  } catch (error) {
    console.error('Get services error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new service
 * @param {Object} serviceData - Service details
 * @param {string} serviceData.name - Service name
 * @param {string} serviceData.description - Service description
 * @param {number} serviceData.price - Service price (in paise)
 * @param {number} serviceData.duration - Duration in minutes
 * @param {string} serviceData.icon - Icon name
 */
export const createService = async (serviceData) => {
  try {
    const response = await api.post('/api/services', serviceData);
    return response.data;
  } catch (error) {
    console.error('Create service error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update an existing service
 * @param {string} serviceId - Service ID
 * @param {Object} updates - Fields to update
 */
export const updateService = async (serviceId, updates) => {
  try {
    const response = await api.put(`/api/services/${serviceId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Update service error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete a service (soft delete)
 * @param {string} serviceId - Service ID
 */
export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/api/services/${serviceId}`);
    return response.data;
  } catch (error) {
    console.error('Delete service error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Toggle service active status
 * @param {string} serviceId - Service ID
 * @param {boolean} isActive - New active status
 */
export const toggleServiceStatus = async (serviceId, isActive) => {
  try {
    const response = await api.put(`/api/services/${serviceId}`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Toggle service status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
