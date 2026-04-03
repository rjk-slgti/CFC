/**
 * Centralized state management using the Observer pattern
 * Manages application state for the Carbon Accounting Dashboard
 */
class Store {
  constructor() {
    this.state = {
      currentUser: null,
      emissionFactors: [],
      activityData: []
    };
    this.subscribers = [];
  }

  /**
   * Get a copy of the current state
   * @returns {Object} Copy of the state object
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Update the state and notify subscribers
   * @param {Object} updates - Partial state updates
   */
  setState(updates) {
    const prevState = this.getState();
    this.state = { ...this.state, ...updates };
    this.notify(prevState, this.getState());
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers of state changes
   * @param {Object} prevState - Previous state
   * @param {Object} newState - New state
   */
  notify(prevState, newState) {
    this.subscribers.forEach(callback => {
      try {
        callback(prevState, newState);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  /**
   * Reset state to initial values
   */
  reset() {
    const initialState = {
      currentUser: null,
      emissionFactors: [],
      activityData: []
    };
    this.setState(initialState);
  }
}

// Export singleton instance
export const store = new Store();