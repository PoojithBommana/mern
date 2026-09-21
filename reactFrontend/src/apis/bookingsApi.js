import api from './api';

/**
 * Bookings API Service
 * Handles all booking-related operations
 */

/**
 * Get all bookings for the authenticated user
 * Query params: status, date
 */
export const getAllBookings = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams();
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.date) params.append('date', queryParams.date);
    
    const response = await api.get(`/api/bookings?${params.toString()}`);
    return response.data.bookings || response.data;
  } catch (error) {
    console.error('Get all bookings error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

/**
 * Update booking status (pending, confirmed, cancelled, payment_failed)
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await api.put(`/api/bookings/${bookingId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update booking status error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to update booking status');
  }
};

/**
 * Reschedule a booking
 */
export const rescheduleBooking = async (bookingId, { date, startTime, endTime }) => {
  try {
    const response = await api.put(`/api/bookings/${bookingId}/reschedule`, {
      date,
      startTime,
      endTime,
    });
    return response.data;
  } catch (error) {
    console.error('Reschedule booking error:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Failed to reschedule booking');
  }
};

/**
 * Utility Functions
 */

export const formatBookingDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatBookingTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    pending_payment: 'bg-orange-100 text-orange-700 border-orange-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    payment_failed: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getPaymentStatusBadgeClass = (status) => {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    refunded: 'bg-gray-100 text-gray-700',
    failed: 'bg-red-100 text-red-700',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (booking) => {
  if (booking.isRescheduled) return 'Rescheduled';
  return booking.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default {
  getAllBookings,
  updateBookingStatus,
  rescheduleBooking,
  formatBookingDate,
  formatBookingTime,
  getStatusBadgeClass,
  getPaymentStatusBadgeClass,
  getStatusLabel,
};
