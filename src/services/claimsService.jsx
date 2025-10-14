import axiosInstance from '../utils/axios'

/**
 * Claims API service
 * Handles all claims-related API calls
 */

const claimsService = {
  /**
   * Search diagnoses with query
   * @param {string} query - Search keyword
   * @param {number} page - Page number (default 1)
   * @param {number} pageSize - Number of results per page (default 10)
   * @returns {Promise} API response with diagnoses list
   */
  searchDiagnoses: async (query, page = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/claims/api/diagnoses/', {
      params: {
        query,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },

  /**
   * Search symptoms with query
   * @param {string} query - Search keyword
   * @param {number} page - Page number (default 1)
   * @param {number} pageSize - Number of results per page (default 10)
   * @returns {Promise} API response with symptoms list
   */
  searchSymptoms: async (query, page = 1, pageSize = 10) => {
    const response = await axiosInstance.get('/claims/api/symptoms/', {
      params: {
        query,
        page,
        page_size: pageSize,
      },
    })
    return response.data
  },

  /**
   * Get claim details by ID
   * @param {string} claimId - Claim ID
   * @returns {Promise} API response with claim data
   */
  getClaimById: async (claimId) => {
    const response = await axiosInstance.get(`/claims/api/claims/${claimId}/`)
    return response.data
  },

  /**
   * Get list of claims
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with claims list
   */
  getClaims: async (params = {}) => {
    const response = await axiosInstance.get('/claims/api/claims/', { params })
    return response.data
  },

  /**
   * Update claim
   * @param {string} claimId - Claim ID
   * @param {Object} data - Claim data to update
   * @returns {Promise} API response
   */
  updateClaim: async (claimId, data) => {
    const response = await axiosInstance.put(`/claims/api/claims/${claimId}/`, data)
    return response.data
  },

  /**
   * Submit query message
   * @param {FormData} formData - Form data with message, attachments, etc.
   * @returns {Promise} API response
   */
  submitQuery: async (formData) => {
    const response = await axiosInstance.post('/claims/api/queries/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * Get claim extraction data by claim ID
   * @param {string} claimId - Claim ID
   * @returns {Promise} API response with extraction data
   */
  getClaimExtractionData: async (claimId) => {
    const response = await axiosInstance.get(`/claims/api/claims/${claimId}/extraction-data/`)
    return response.data
  },

  /**
   * Get dropdown options for filters
   * @returns {Promise} API response with providers, benefit_types, and decisions
   */
  getDropdownOptions: async () => {
    const response = await axiosInstance.get('/claims/api/dropdown-options/')
    return response.data
  },

  /**
   * Update manual adjudication for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @param {Object} data - Adjudication data with output_data and manual edits
   * @returns {Promise} API response
   */
  updateManualAdjudication: async (claimUniqueId, data) => {
    const response = await axiosInstance.put(`/claims/api/claims/${claimUniqueId}/adjudication/manual/`, data)
    return response.data
  },

  /**
   * Get manual adjudication data for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response with manual adjudication data
   */
  getManualAdjudication: async (claimUniqueId) => {
    const response = await axiosInstance.get(`/claims/api/claims/${claimUniqueId}/adjudication/manual/`)
    return response.data
  },

  /**
   * Get AI adjudication data for a claim
   * @param {string} claimUniqueId - Claim unique ID
   * @returns {Promise} API response with AI adjudication data
   */
  getAIAdjudication: async (claimUniqueId) => {
    const response = await axiosInstance.get(`/claims/api/claims/${claimUniqueId}/adjudication/ai/`)
    return response.data
  },
}

export default claimsService
