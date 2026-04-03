/**
 * API Service Module
 * Handles all API communications with the backend
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Get all emission factors
 * @returns {Promise<Array>} Emission factors
 */
export async function getEmissionFactors() {
  return apiRequest('/emission-factors');
}

/**
 * Get emission factor by ID
 * @param {string} id - Emission factor ID
 * @returns {Promise<Object>} Emission factor
 */
export async function getEmissionFactor(id) {
  return apiRequest(`/emission-factors/${id}`);
}

/**
 * Submit activity data
 * @param {Object} activityData - Activity data to submit
 * @returns {Promise<Object>} Created activity data
 */
export async function submitActivityData(activityData) {
  return apiRequest('/activity-data', {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
}

/**
 * Get all activity data
 * @returns {Promise<Array>} Activity data
 */
export async function getActivityData() {
  return apiRequest('/activity-data');
}

/**
 * Get activity data by ID
 * @param {string} id - Activity data ID
 * @returns {Promise<Object>} Activity data
 */
export async function getActivityDataById(id) {
  return apiRequest(`/activity-data/${id}`);
}

/**
 * Update activity data
 * @param {string} id - Activity data ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated activity data
 */
export async function updateActivityData(id, updates) {
  return apiRequest(`/activity-data/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete activity data
 * @param {string} id - Activity data ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteActivityData(id) {
  return apiRequest(`/activity-data/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get calculation results
 * @param {Object} params - Calculation parameters
 * @returns {Promise<Object>} Calculation results
 */
export async function getCalculationResults(params) {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/calculations?${queryString}`);
}

/**
 * Get audit logs
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} Audit logs
 */
export async function getAuditLogs(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  return apiRequest(`/audit-logs?${queryString}`);
}

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  return apiRequest('/health');
}