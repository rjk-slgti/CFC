import { store } from '../state/store.js';
import { calculateScope1MobileCombustion, calculateScope2PurchasedElectricity, convertToCO2e } from '../utils/calculators.js';

/**
 * Dashboard Component
 * Displays emission summaries and metrics
 */
export class Dashboard {
  constructor() {
    this.totals = {
      scope1: 0,
      scope2: 0,
      total: 0
    };
    this.unsubscribe = null;
  }

  /**
   * Initialize the dashboard
   */
  init() {
    this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    this.calculateTotals();
  }

  /**
   * Destroy the dashboard and unsubscribe
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Handle store updates
   * @param {Object} prevState
   * @param {Object} newState
   */
  handleStoreUpdate(prevState, newState) {
    // Check if activity data or emission factors changed
    const activityChanged = JSON.stringify(prevState.activityData) !== JSON.stringify(newState.activityData);
    const factorsChanged = JSON.stringify(prevState.emissionFactors) !== JSON.stringify(newState.emissionFactors);

    if (activityChanged || factorsChanged) {
      this.calculateTotals();
    }
  }

  /**
   * Calculate emission totals from activity data
   */
  calculateTotals() {
    const state = store.getState();
    const { activityData, emissionFactors } = state;

    let scope1Total = 0;
    let scope2Total = 0;

    activityData.forEach(activity => {
      const factor = this.findEmissionFactor(emissionFactors, activity.sourceType, activity.unit);

      if (factor && activity.quantity > 0) {
        let co2e = 0;

        if (activity.scope === 'scope_1') {
          // For Scope 1, assume mobile combustion for now
          const result = calculateScope1MobileCombustion(activity.quantity, activity.unit, factor.factor_value);
          co2e = result.co2e;
          scope1Total += co2e;
        } else if (activity.scope === 'scope_2') {
          // For Scope 2, electricity
          const result = calculateScope2PurchasedElectricity(activity.quantity, activity.unit, factor.factor_value);
          co2e = result.co2e;
          scope2Total += co2e;
        }
      }
    });

    this.totals = {
      scope1: Math.round(scope1Total * 100) / 100,
      scope2: Math.round(scope2Total * 100) / 100,
      total: Math.round((scope1Total + scope2Total) * 100) / 100
    };
  }

  /**
   * Find emission factor for a source type and unit
   * @param {Array} emissionFactors
   * @param {string} sourceType
   * @param {string} unit
   * @returns {Object|null} Emission factor object
   */
  findEmissionFactor(emissionFactors, sourceType, unit) {
    // Find factors that match source type and are currently valid
    const now = new Date();
    return emissionFactors.find(factor => {
      const validFrom = new Date(factor.valid_from);
      const validTo = factor.valid_to ? new Date(factor.valid_to) : null;

      return factor.source_type === sourceType &&
             factor.unit === unit &&
             validFrom <= now &&
             (!validTo || validTo >= now);
    }) || null;
  }

  /**
   * Render the dashboard HTML
   * @returns {string} HTML template
   */
  render() {
    return `
      <div class="dashboard">
        <div class="dashboard__header">
          <h1 class="dashboard__title">Carbon Emissions Dashboard</h1>
          <p class="dashboard__subtitle">Real-time emission tracking and analysis</p>
        </div>

        <div class="dashboard__metrics">
          <div class="dashboard__grid">
            <div class="metric-card metric-card--scope1">
              <div class="metric-card__icon">
                <span class="metric-card__icon-text">🚗</span>
              </div>
              <div class="metric-card__content">
                <h3 class="metric-card__title">Scope 1 Emissions</h3>
                <p class="metric-card__value">${this.totals.scope1.toLocaleString()}</p>
                <p class="metric-card__unit">t CO₂e</p>
                <p class="metric-card__description">Direct emissions from owned sources</p>
              </div>
            </div>

            <div class="metric-card metric-card--scope2">
              <div class="metric-card__icon">
                <span class="metric-card__icon-text">⚡</span>
              </div>
              <div class="metric-card__content">
                <h3 class="metric-card__title">Scope 2 Emissions</h3>
                <p class="metric-card__value">${this.totals.scope2.toLocaleString()}</p>
                <p class="metric-card__unit">t CO₂e</p>
                <p class="metric-card__description">Indirect emissions from purchased energy</p>
              </div>
            </div>

            <div class="metric-card metric-card--total">
              <div class="metric-card__icon">
                <span class="metric-card__icon-text">🌍</span>
              </div>
              <div class="metric-card__content">
                <h3 class="metric-card__title">Total Emissions</h3>
                <p class="metric-card__value">${this.totals.total.toLocaleString()}</p>
                <p class="metric-card__unit">t CO₂e</p>
                <p class="metric-card__description">Combined Scope 1 & 2 emissions</p>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard__summary">
          <div class="summary-card">
            <h3 class="summary-card__title">Emission Breakdown</h3>
            <div class="summary-card__chart">
              <div class="chart-placeholder">
                <p>Chart visualization would go here</p>
                <p>Scope 1: ${((this.totals.scope1 / this.totals.total) * 100 || 0).toFixed(1)}%</p>
                <p>Scope 2: ${((this.totals.scope2 / this.totals.total) * 100 || 0).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update the dashboard display
   * @param {HTMLElement} container - Container element
   */
  update(container) {
    if (container) {
      container.innerHTML = this.render();
    }
  }
}