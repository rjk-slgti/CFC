import { store } from './state/store.js';
import { getEmissionFactors } from './services/api.js';
import { Router } from './router/router.js';

// Local fallback emission factor set (offline-first friendly)
const LOCAL_EMISSION_FACTORS = [
  {
    scope: 'scope_2',
    sourceType: 'electricity_grid',
    gasType: 'CO2',
    factorValue: 0.48,
    unit: 'kwh',
    source: 'IPCC AR5',
    year: 2025,
    region: 'global'
  },
  {
    scope: 'scope_1',
    sourceType: 'diesel_vehicle',
    gasType: 'CO2',
    factorValue: 2.68,
    unit: 'liters',
    source: 'IPCC AR5',
    year: 2025,
    region: 'global'
  },
  {
    scope: 'scope_3',
    sourceType: 'office_paper',
    gasType: 'CO2',
    factorValue: 1.09,
    unit: 'ream',
    source: 'EPA',
    year: 2025,
    region: 'global'
  }
];

/**
 * Main application entry point
 * Initializes the store, fetches initial data, and sets up routing
 */
async function initApp() {
  try {
    console.log('Initializing Carbon Accounting Dashboard...');

    // Fetch initial emission factors
    let emissionFactors;
    try {
      emissionFactors = await getEmissionFactors();
      console.log('Loaded emission factors from API:', emissionFactors.length);
    } catch (apiError) {
      console.warn('Emission factors API failed, falling back to local defaults:', apiError.message);
      emissionFactors = LOCAL_EMISSION_FACTORS;
    }

    // Initialize store with emission factors
    store.setState({
      emissionFactors: emissionFactors,
      // activityData can be empty initially or loaded separately
      activityData: []
    });

    // Initialize router
    const router = new Router();
    router.init();

    console.log('Application initialized successfully');

  } catch (error) {
    console.error('Failed to initialize application:', error);
    // In a production app, you might show an error message to the user
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h2>Application Error</h2>
          <p>Failed to load the application. Please refresh the page.</p>
          <p style="color: red;">${error.message}</p>
        </div>
      `;
    }
  }
}

// Initialize the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}