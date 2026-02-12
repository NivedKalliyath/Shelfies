import axios from 'axios';

// Get API URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for image processing
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API methods
 */
export const api = {
  /**
   * Detect product from image
   * @param {string} imageData - Base64 encoded image data
   * @returns {Promise} Detection result
   */
  detectProduct: async (imageData) => {
    try {
      const response = await apiClient.post('/detect', {
        image: imageData
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to detect product');
    }
  },

  /**
   * Get all products
   * @param {Object} params - Query parameters (category, search)
   * @returns {Promise} List of products
   */
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  },

  /**
   * Get a specific product by ID
   * @param {number} productId - Product ID
   * @returns {Promise} Product details
   */
  getProduct: async (productId) => {
    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  },

  /**
   * Update product details
   * @param {number} productId - Product ID
   * @param {Object} data - Update data (count, name, etc.)
   * @returns {Promise} Updated product
   */
  updateProduct: async (productId, data) => {
    try {
      const response = await apiClient.put(`/products/${productId}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update product');
    }
  },

  /**
   * Get inventory statistics
   * @returns {Promise} Statistics object
   */
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch statistics');
    }
  },

  /**
   * Get scan history
   * @param {Object} params - Query parameters (limit, product_id)
   * @returns {Promise} Scan history
   */
  getScanHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/history', { params });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch scan history');
    }
  },

  /**
   * Health check
   * @returns {Promise} Health status
   */
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend is not responding');
    }
  }
};

export default api;