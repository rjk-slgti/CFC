/**
 * API Service Module
 * Handles all API communications with the backend
 */

const API_BASE_URL = (() => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api';
  }

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Local development with separate frontend server on :8080 and backend on :3000
    return 'http://localhost:3000/api';
  }

  // Production fallback: same origin
  return '/api';
})();

const LOCAL_EMISSION_FACTORS = [
  { scope: 'scope_1', sourceType: 'diesel_generator', source_type: 'diesel_generator', factor_value: 2.68, unit: 'kgCO2/liter', gasType: 'CO2', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_2', sourceType: 'electricity_grid', source_type: 'electricity_grid', factor_value: 0.48, unit: 'kwh', gasType: 'CO2', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'office_paper', source_type: 'office_paper', factor_value: 1.09, unit: 'ream', gasType: 'CO2', source: 'EPA', year: 2025, region: 'global' }
];

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
 * Fallback to local preset values if backend is unreachable.
 * @returns {Promise<Array>} Emission factors
 */
export async function getEmissionFactors() {
  try {
    const result = await apiRequest('/emission-factors');
    if (Array.isArray(result)) {
      return result;
    }

    if (result && Array.isArray(result.data)) {
      return result.data;
    }

    console.warn('Emission factor API returned unexpected data, using local fallback.');
    return LOCAL_EMISSION_FACTORS;
  } catch (error) {
    console.warn('Emission factor API request failed, using local fallback:', error.message);
    return LOCAL_EMISSION_FACTORS;
  }
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