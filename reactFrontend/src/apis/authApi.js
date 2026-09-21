import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// AUTHENTICATION APIs
// ==========================================

/**
 * Request OTP for user registration
 * @param {string} email - User's email address
 */
export const requestOTP = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/request-otp`, { email });
    return response.data;
  } catch (error) {
    console.error('Request OTP error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Verify OTP code
 * @param {string} email - User's email
 * @param {string} otp - OTP code received via email
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { 
      email, 
      otp 
    });
    return response.data;
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    
    // Save token to localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Login existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    
    // Save token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get current user's profile
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/api/auth/profile', profileData);
    
    // Update user in localStorage
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
