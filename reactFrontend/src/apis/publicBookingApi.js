import axios from 'axios';
import { BASE_URL } from './api.js';

// ==========================================
// PUBLIC BOOKING APIs (No authentication required)
// ==========================================

/**
 * Get public booking page details including business and services
 * @param {string} businessSlug - Business slug from URL
 */
export const getPublicBookingPage = async (businessSlug) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/public/${businessSlug}`);
    return response.data;
  } catch (error) {
    console.error('Get booking page error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get public services for a business
 * @param {string} businessSlug - Business slug from URL
 */
export const getPublicServices = async (businessSlug) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/public/${businessSlug}/services`);
    return response.data;
  } catch (error) {
    console.error('Get public services error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get available time slots for a specific date and service
 * @param {string} businessSlug - Business slug
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} serviceId - Service ID
 */
export const getAvailableSlots = async (businessSlug, date, serviceId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/public/${businessSlug}/slots`,
      {
        params: { date, serviceId }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Get available slots error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Request OTP for booking verification
 * @param {string} businessSlug - Business slug
 * @param {string} customerEmail - Customer's email
 */
export const requestBookingOTP = async (businessSlug, customerEmail) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/${businessSlug}/request-otp`,
      { customerEmail }
    );
    return response.data;
  } catch (error) {
    console.error('Request booking OTP error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Verify booking OTP
 * @param {string} businessSlug - Business slug
 * @param {string} customerEmail - Customer's email
 * @param {string} emailOtp - OTP code
 */
export const verifyBookingOTP = async (businessSlug, customerEmail, emailOtp) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/${businessSlug}/verify-otp`,
      { customerEmail, emailOtp }
    );
    return response.data;
  } catch (error) {
    console.error('Verify booking OTP error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Create a new booking
 * @param {string} businessSlug - Business slug
 * @param {Object} bookingData - Booking information
 * @param {string} bookingData.serviceId - Service ID
 * @param {string} bookingData.customerName - Customer name
 * @param {string} bookingData.customerEmail - Customer email
 * @param {string} bookingData.customerAvatar - Avatar filename (optional)
 * @param {string} bookingData.date - Booking date (YYYY-MM-DD)
 * @param {string} bookingData.startTime - Start time (HH:MM)
 * @param {string} bookingData.endTime - End time (HH:MM)
 * @param {string} bookingData.notes - Additional notes (optional)
 * @param {string} bookingData.emailOtp - Verified OTP code
 */
export const createBooking = async (businessSlug, bookingData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/${businessSlug}/book`,
      bookingData
    );
    return response.data;
  } catch (error) {
    console.error('Create booking error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get booking status
 * @param {string} sessionId - Stripe session ID (optional)
 * @param {string} bookingId - Booking ID (optional)
 */
export const getBookingStatus = async (sessionId = null, bookingId = null) => {
  try {
    const params = {};
    if (sessionId) params.session_id = sessionId;
    if (bookingId) params.booking_id = bookingId;
    
    const response = await axios.get(`${BASE_URL}/api/public/booking/status`, { params });
    return response.data;
  } catch (error) {
    console.error('Get booking status error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Cancel booking payment
 * @param {string} bookingId - Booking ID
 */
export const cancelBookingPayment = async (bookingId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/public/booking/cancel-payment`,
      { booking_id: bookingId }
    );
    return response.data;
  } catch (error) {
    console.error('Cancel booking payment error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Helper: Format date for display
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper: Format time for display
export const formatTime = (timeString) => {
  return timeString;
};

// Helper: Get booking status color
export const getStatusColor = (status) => {
  const colors = {
    'confirmed': 'green',
    'pending_payment': 'yellow',
    'payment_failed': 'red',
    'cancelled': 'gray',
  };
  return colors[status] || 'gray';
};
