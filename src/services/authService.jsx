import axiosInstance from '../utils/axios';

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user with username and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise} API response with token
   */
  login: async (credentials) => {
    const response = await axiosInstance.post('/claims/api/token/', credentials);
    return response.data;
  },

  /**
   * Logout user
   * @returns {Promise} API response
   */
  logout: async () => {
    // If you have a logout endpoint, call it here
    // const response = await axiosInstance.post('/auth/logout/');
    // return response.data;
    return Promise.resolve({ success: true });
  },

  /**
   * Refresh authentication token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} API response with new token
   */
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/claims/api/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  /**
   * Verify token validity
   * @param {string} token - Access token to verify
   * @returns {Promise} API response
   */
  verifyToken: async (token) => {
    const response = await axiosInstance.post('/claims/api/token/verify/', {
      token,
    });
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} API response with user data
   */
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/claims/api/user/profile/');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise} API response
   */
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/claims/api/user/profile/', userData);
    return response.data;
  },

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.oldPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise} API response
   */
  changePassword: async (passwordData) => {
    const response = await axiosInstance.post('/claims/api/user/change-password/', passwordData);
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} API response
   */
  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/claims/api/user/forgot-password/', { email });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @returns {Promise} API response
   */
  resetPassword: async (resetData) => {
    const response = await axiosInstance.post('/claims/api/user/reset-password/', resetData);
    return response.data;
  },
};

export default authService;
