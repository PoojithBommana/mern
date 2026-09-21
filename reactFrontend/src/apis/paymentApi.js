import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

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
// PAYMENT APIs
// ==========================================

/**
 * Get payment overview including wallet balance and transactions
 */
export const getPaymentOverview = async () => {
  try {
    const response = await api.get('/api/payment');
    return response.data;
  } catch (error) {
    console.error('Get payment overview error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update payout details (bank account or UPI)
 * @param {Object} payoutDetails - Payout information
 * @param {string} payoutDetails.accountHolderName - Account holder name
 * @param {string} payoutDetails.bankName - Bank name (optional)
 * @param {string} payoutDetails.accountNumber - Bank account number (optional)
 * @param {string} payoutDetails.ifsc - IFSC code (optional)
 * @param {string} payoutDetails.upiId - UPI ID (optional)
 */
export const updatePayoutDetails = async (payoutDetails) => {
  try {
    const response = await api.put('/api/payment/payout-details', payoutDetails);
    return response.data;
  } catch (error) {
    console.error('Update payout details error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Request withdrawal from wallet
 * @param {number} amount - Amount to withdraw (in paise, minimum 100)
 */
export const requestWithdrawal = async (amount) => {
  try {
    const response = await api.post('/api/payment/withdrawal', { amount });
    return response.data;
  } catch (error) {
    console.error('Request withdrawal error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Helper: Format amount for display
export const formatAmount = (amountInPaise) => {
  return `₹${(amountInPaise / 100).toFixed(2)}`;
};

// Helper: Convert rupees to paise
export const rupeesToPaise = (rupees) => {
  return Math.round(rupees * 100);
};

// Helper: Convert paise to rupees
export const paiseToRupees = (paise) => {
  return paise / 100;
};
