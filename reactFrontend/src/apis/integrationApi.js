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
// INTEGRATION APIs
// ==========================================

/**
 * Get Google Calendar OAuth URL
 */
export const getGoogleAuthURL = async () => {
  try {
    const response = await api.get('/api/integration/google/auth');
    return response.data;
  } catch (error) {
    console.error('Get Google auth URL error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Connect Google Calendar
 * Opens Google OAuth in new window
 */
export const connectGoogleCalendar = async () => {
  try {
    const { authUrl } = await getGoogleAuthURL();
    
    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'Google Calendar Authorization',
      'width=600,height=700'
    );
    
    return new Promise((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          resolve({ success: true });
        }
      }, 500);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authorization timeout'));
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('Connect Google Calendar error:', error);
    throw error;
  }
};

/**
 * Disconnect Google Calendar
 */
export const disconnectGoogleCalendar = async () => {
  // This would require a backend endpoint to clear tokens
  // For now, just clear any local state
  console.log('Disconnecting Google Calendar...');
  return { success: true };
};
