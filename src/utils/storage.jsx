/**
 * Storage utility for managing authentication tokens and user data
 * Provides abstraction layer for localStorage operations
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  REFRESH_TOKEN: 'refreshToken',
};

class StorageService {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be stringified if object)
   */
  setItem(key, value) {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {boolean} parse - Whether to parse JSON (default: true)
   * @returns {any} Retrieved value
   */
  getItem(key, parse = true) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      if (parse) {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      return item;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  // Auth-specific methods
  setAuthToken(token) {
    this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  getAuthToken() {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN, false);
  }

  removeAuthToken() {
    this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  setUserData(userData) {
    this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  getUserData() {
    return this.getItem(STORAGE_KEYS.USER_DATA);
  }

  removeUserData() {
    this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  setRefreshToken(token) {
    this.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken() {
    return this.getItem(STORAGE_KEYS.REFRESH_TOKEN, false);
  }

  removeRefreshToken() {
    this.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Clear all auth-related data
   */
  clearAuthData() {
    this.removeAuthToken();
    this.removeUserData();
    this.removeRefreshToken();
  }
}

// Export singleton instance
export default new StorageService();
export { STORAGE_KEYS };
