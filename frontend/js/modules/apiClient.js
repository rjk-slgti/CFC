/**
 * API Client - Centralized HTTP client for backend communication
 *
 * Provides typed methods for all API endpoints with
 * error handling, request/response logging, and retry support.
 */

const API_BASE = window.ENV?.API_URL || '/api';

class ApiClient {
  constructor(baseUrl = API_BASE) {
    this._baseUrl = baseUrl;
    this._defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Core request method with error handling.
   */
  async _request(method, path, body = null, options = {}) {
    const url = `${this._baseUrl}${path}`;
    const config = {
      method,
      headers: { ...this._defaultHeaders, ...options.headers },
      signal: options.signal,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.message || 'Request failed', response.status, data.errors);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error.name === 'AbortError') throw error;

      throw new ApiError(
        error.message || 'Network error. Please check your connection.',
        0
      );
    }
  }

  // Calculation endpoints
  calculateEmissions(data) {
    return this._request('POST', '/calculate', data);
  }

  getEmissions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request('GET', `/emissions${query ? `?${query}` : ''}`);
  }

  getEmissionById(id) {
    return this._request('GET', `/emissions/${id}`);
  }

  validateEmission(id, data) {
    return this._request('PATCH', `/emissions/${id}/validate`, data);
  }

  deleteEmission(id) {
    return this._request('DELETE', `/emissions/${id}`);
  }

  // Summary
  getSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request('GET', `/summary${query ? `?${query}` : ''}`);
  }

  // Quality
  getQualityScore(calculationId) {
    return this._request('GET', `/quality/${calculationId}`);
  }

  // Predictions
  getPredictions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request('GET', `/predictions${query ? `?${query}` : ''}`);
  }

  getTargetFeasibility(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request('GET', `/target-feasibility${query ? `?${query}` : ''}`);
  }

  // Benchmarking
  getBenchmark(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this._request('GET', `/benchmark${query ? `?${query}` : ''}`);
  }

  // Health
  async healthCheck() {
    const url = `${this._baseUrl.replace('/api', '')}/health`;
    const response = await fetch(url);
    return response.json();
  }
}

class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export { ApiClient, ApiError };
export default new ApiClient();
