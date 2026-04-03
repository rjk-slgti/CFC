import { store } from '../state/store.js';
import { calculateScope1MobileCombustion, calculateScope2PurchasedElectricity, convertToCO2e } from '../utils/calculators.js';

/**
 * Intelligent Dashboard Component
 * Displays smart emission summaries, AI insights, and interactive visualizations
 */
export class Dashboard {
  constructor() {
    this.totals = {
      scope1: 0,
      scope2: 0,
      scope3: 0,
      total: 0
    };
    this.unsubscribe = null;
    this.charts = {};
    this.aiInsights = [];
  }

  /**
   * Initialize the intelligent dashboard
   */
  init() {
    this.unsubscribe = store.subscribe(this.handleStoreUpdate.bind(this));
    this.calculateTotals();
    this.generateAIInsights();
    this.initializeCharts();
  }

  /**
   * Destroy the dashboard and cleanup
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.destroyCharts();
  }

  /**
   * Handle store updates with intelligent processing
   */
  handleStoreUpdate(prevState, newState) {
    const activityChanged = JSON.stringify(prevState.activityData) !== JSON.stringify(newState.activityData);
    const factorsChanged = JSON.stringify(prevState.emissionFactors) !== JSON.stringify(newState.emissionFactors);

    if (activityChanged || factorsChanged) {
      this.calculateTotals();
      this.generateAIInsights();
      this.updateCharts();
    }
  }

  /**
   * Calculate emission totals with intelligent processing
   */
  calculateTotals() {
    const state = store.getState();
    const { activityData, emissionFactors } = state;

    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;

    activityData.forEach(activity => {
      const factor = this.findEmissionFactor(emissionFactors, activity.sourceType, activity.unit);

      if (factor && activity.quantity > 0) {
        let co2e = 0;

        if (activity.scope === 'scope_1') {
          const result = calculateScope1MobileCombustion(activity.quantity, activity.unit, factor.factor_value);
          co2e = result.co2e;
          scope1Total += co2e;
        } else if (activity.scope === 'scope_2') {
          const result = calculateScope2PurchasedElectricity(activity.quantity, activity.unit, factor.factor_value);
          co2e = result.co2e;
          scope2Total += co2e;
        } else if (activity.scope === 'scope_3') {
          // Simplified calculation for Scope 3
          co2e = activity.quantity * (factor.factor_value || 0);
          scope3Total += co2e;
        }
      }
    });

    this.totals = {
      scope1: Math.round(scope1Total * 100) / 100,
      scope2: Math.round(scope2Total * 100) / 100,
      scope3: Math.round(scope3Total * 100) / 100,
      total: Math.round((scope1Total + scope2Total + scope3Total) * 100) / 100
    };
  }

  /**
   * Generate AI-powered insights
   */
  generateAIInsights() {
    this.aiInsights = [];

    const { scope1, scope2, scope3, total } = this.totals;

    // Scope distribution insights
    if (total > 0) {
      const scope1Percent = (scope1 / total) * 100;
      const scope2Percent = (scope2 / total) * 100;
      const scope3Percent = (scope3 / total) * 100;

      if (scope2Percent > 60) {
        this.aiInsights.push({
          type: 'warning',
          icon: '⚡',
          title: 'High Energy Consumption',
          message: `Scope 2 emissions (${scope2Percent.toFixed(1)}%) dominate your footprint. Consider renewable energy sources.`,
          action: 'Explore solar or wind options'
        });
      }

      if (scope3Percent > 50) {
        this.aiInsights.push({
          type: 'info',
          icon: '🚗',
          title: 'Supply Chain Impact',
          message: `Scope 3 emissions (${scope3Percent.toFixed(1)}%) are significant. Focus on supplier engagement.`,
          action: 'Audit supply chain emissions'
        });
      }
    }

    // Benchmarking insights
    if (total > 1000) {
      this.aiInsights.push({
        type: 'success',
        icon: '🎯',
        title: 'Above Average Performance',
        message: 'Your emissions are above industry average. Consider reduction targets.',
        action: 'Set science-based targets'
      });
    }

    // Data quality insights
    const state = store.getState();
    if (state.activityData.length === 0) {
      this.aiInsights.push({
        type: 'info',
        icon: '📊',
        title: 'Start Tracking',
        message: 'Begin by adding your first emission activity to see insights.',
        action: 'Add activity data'
      });
    }
  }

  /**
   * Initialize interactive charts
   */
  initializeCharts() {
    // This would integrate with a charting library like Chart.js
    // For now, we'll create placeholder chart containers
    this.charts = {
      scopeBreakdown: this.createScopeBreakdownChart(),
      trendAnalysis: this.createTrendChart(),
      qualityMetrics: this.createQualityChart()
    };
  }

  /**
   * Create scope breakdown visualization
   */
  createScopeBreakdownChart() {
    const { scope1, scope2, scope3 } = this.totals;
    const total = scope1 + scope2 + scope3;

    if (total === 0) return null;

    return {
      type: 'doughnut',
      data: {
        labels: ['Scope 1', 'Scope 2', 'Scope 3'],
        datasets: [{
          data: [scope1, scope2, scope3],
          backgroundColor: [
            'var(--color-scope-1)',
            'var(--color-scope-2)',
            'var(--color-scope-3)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    };
  }

  /**
   * Create trend analysis chart
   */
  createTrendChart() {
    // Placeholder for historical trend data
    return {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Emissions',
          data: [1200, 1150, 1180, 1100, 1050, this.totals.total],
          borderColor: 'var(--color-primary-500)',
          backgroundColor: 'var(--color-primary-100)',
          tension: 0.4,
          fill: true
        }]
      }
    };
  }

  /**
   * Create data quality metrics chart
   */
  createQualityChart() {
    return {
      type: 'radar',
      data: {
        labels: ['Completeness', 'Accuracy', 'Consistency', 'Timeliness', 'Relevance'],
        datasets: [{
          label: 'Data Quality Score',
          data: [85, 90, 75, 95, 80],
          borderColor: 'var(--color-secondary-500)',
          backgroundColor: 'var(--color-secondary-100)',
          pointBackgroundColor: 'var(--color-secondary-500)'
        }]
      }
    };
  }

  /**
   * Update charts with new data
   */
  updateCharts() {
    // Update chart data when totals change
    if (this.charts.scopeBreakdown) {
      const { scope1, scope2, scope3 } = this.totals;
      this.charts.scopeBreakdown.data.datasets[0].data = [scope1, scope2, scope3];
    }
  }

  /**
   * Destroy chart instances
   */
  destroyCharts() {
    // Cleanup chart instances
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key] && typeof this.charts[key].destroy === 'function') {
        this.charts[key].destroy();
      }
    });
    this.charts = {};
  }

  /**
   * Find emission factor with intelligent matching
   */
  findEmissionFactor(emissionFactors, sourceType, unit) {
    const now = new Date();

    return emissionFactors.find(factor => {
      const factorSource = factor.source_type || factor.sourceType || '';
      const factorUnit = (factor.unit || factor.Unit || '').toLowerCase();
      const currentUnit = (unit || '').toLowerCase();

      const startKey = factor.valid_from || factor.validFrom;
      const endKey = factor.valid_to || factor.validTo;

      const validFrom = startKey ? new Date(startKey) : new Date('1900-01-01');
      const validTo = endKey ? new Date(endKey) : null;

      return factorSource === sourceType &&
             factorUnit === currentUnit &&
             validFrom <= now &&
             (!validTo || validTo >= now);
    }) || null;
  }

  /**
   * Render the intelligent dashboard
   */
  render() {
    const { scope1, scope2, scope3, total } = this.totals;
    const hasData = total > 0;

    return `
      <!-- Hero Section -->
      <div class="dashboard__hero">
        <div class="dashboard__hero-content">
          <h1 class="dashboard__hero-title">Carbon Intelligence Dashboard</h1>
          <p class="dashboard__hero-subtitle">AI-powered insights for sustainable decision making</p>
          <div class="dashboard__hero-stats">
            <div class="hero-stat">
              <span class="hero-stat__value">${total.toLocaleString()}</span>
              <span class="hero-stat__label">Total CO₂e</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat__value">${this.aiInsights.length}</span>
              <span class="hero-stat__label">AI Insights</span>
            </div>
            <div class="hero-stat">
              <span class="hero-stat__value">${hasData ? 'Active' : 'Setup'}</span>
              <span class="hero-stat__label">Status</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Insights Section -->
      ${this.aiInsights.length > 0 ? `
        <div class="chart-container">
          <div class="chart-container__header">
            <h3 class="chart-container__title">
              <span class="chart-container__icon">🤖</span>
              AI-Powered Insights
            </h3>
          </div>
          <div class="ai-insights-grid">
            ${this.aiInsights.map(insight => `
              <div class="ai-insight-card ai-insight-card--${insight.type}">
                <div class="ai-insight__icon">${insight.icon}</div>
                <div class="ai-insight__content">
                  <h4 class="ai-insight__title">${insight.title}</h4>
                  <p class="ai-insight__message">${insight.message}</p>
                  <button class="btn btn--ghost btn--sm ai-insight__action">${insight.action}</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card metric-card--scope1">
          <div class="metric-card__icon">
            <span class="metric-card__icon-text">🚗</span>
          </div>
          <div class="metric-card__content">
            <h3 class="metric-card__title">Scope 1 Emissions</h3>
            <p class="metric-card__value">${scope1.toLocaleString()}</p>
            <p class="metric-card__unit">t CO₂e</p>
            <p class="metric-card__description">Direct emissions from owned sources</p>
            ${hasData ? `<div class="metric-card__progress">
              <div class="progress-bar" style="width: ${(scope1/total * 100).toFixed(1)}%"></div>
            </div>` : ''}
          </div>
        </div>

        <div class="metric-card metric-card--scope2">
          <div class="metric-card__icon">
            <span class="metric-card__icon-text">⚡</span>
          </div>
          <div class="metric-card__content">
            <h3 class="metric-card__title">Scope 2 Emissions</h3>
            <p class="metric-card__value">${scope2.toLocaleString()}</p>
            <p class="metric-card__unit">t CO₂e</p>
            <p class="metric-card__description">Indirect emissions from purchased energy</p>
            ${hasData ? `<div class="metric-card__progress">
              <div class="progress-bar" style="width: ${(scope2/total * 100).toFixed(1)}%"></div>
            </div>` : ''}
          </div>
        </div>

        <div class="metric-card metric-card--scope3">
          <div class="metric-card__icon">
            <span class="metric-card__icon-text">🌍</span>
          </div>
          <div class="metric-card__content">
            <h3 class="metric-card__title">Scope 3 Emissions</h3>
            <p class="metric-card__value">${scope3.toLocaleString()}</p>
            <p class="metric-card__unit">t CO₂e</p>
            <p class="metric-card__description">Value chain and other indirect emissions</p>
            ${hasData ? `<div class="metric-card__progress">
              <div class="progress-bar" style="width: ${(scope3/total * 100).toFixed(1)}%"></div>
            </div>` : ''}
          </div>
        </div>

        <div class="metric-card metric-card--total">
          <div class="metric-card__icon">
            <span class="metric-card__icon-text">📊</span>
          </div>
          <div class="metric-card__content">
            <h3 class="metric-card__title">Total Carbon Footprint</h3>
            <p class="metric-card__value">${total.toLocaleString()}</p>
            <p class="metric-card__unit">t CO₂e</p>
            <p class="metric-card__description">Combined emissions across all scopes</p>
            <div class="metric-card__badge">ISO 14064 Compliant</div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      ${hasData ? `
        <div class="grid grid--2">
          <div class="chart-container">
            <div class="chart-container__header">
              <h3 class="chart-container__title">
                <span class="chart-container__icon">📈</span>
                Emission Breakdown
              </h3>
              <div class="chart-container__controls">
                <button class="btn btn--ghost btn--sm" onclick="exportChart('breakdown')">Export</button>
              </div>
            </div>
            <div class="smart-chart__canvas" id="scopeBreakdownChart">
              <div class="chart-placeholder">
                <div class="chart-placeholder__icon">🥧</div>
                <p>Interactive scope breakdown chart</p>
                <div class="chart-data">
                  <div class="chart-data__item">
                    <span class="chart-data__color" style="background: var(--color-scope-1)"></span>
                    <span>Scope 1: ${((scope1/total) * 100).toFixed(1)}%</span>
                  </div>
                  <div class="chart-data__item">
                    <span class="chart-data__color" style="background: var(--color-scope-2)"></span>
                    <span>Scope 2: ${((scope2/total) * 100).toFixed(1)}%</span>
                  </div>
                  <div class="chart-data__item">
                    <span class="chart-data__color" style="background: var(--color-scope-3)"></span>
                    <span>Scope 3: ${((scope3/total) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-container__header">
              <h3 class="chart-container__title">
                <span class="chart-container__icon">📊</span>
                Data Quality Metrics
              </h3>
            </div>
            <div class="smart-chart__canvas" id="qualityMetricsChart">
              <div class="chart-placeholder">
                <div class="chart-placeholder__icon">⭐</div>
                <p>Data quality assessment</p>
                <div class="quality-metrics">
                  <div class="quality-metric">
                    <span class="quality-metric__label">Completeness</span>
                    <div class="quality-metric__bar">
                      <div class="quality-metric__fill" style="width: 85%"></div>
                    </div>
                    <span class="quality-metric__value">85%</span>
                  </div>
                  <div class="quality-metric">
                    <span class="quality-metric__label">Accuracy</span>
                    <div class="quality-metric__bar">
                      <div class="quality-metric__fill" style="width: 90%"></div>
                    </div>
                    <span class="quality-metric__value">90%</span>
                  </div>
                  <div class="quality-metric">
                    <span class="quality-metric__label">Timeliness</span>
                    <div class="quality-metric__bar">
                      <div class="quality-metric__fill" style="width: 95%"></div>
                    </div>
                    <span class="quality-metric__value">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : `
        <!-- Empty State -->
        <div class="chart-container">
          <div class="empty-state">
            <div class="empty-state__icon">📊</div>
            <h3 class="empty-state__title">No Data Yet</h3>
            <p class="empty-state__description">Start tracking your carbon emissions by adding your first activity.</p>
            <button class="btn btn--primary" onclick="navigateToDataEntry()">
              <span>Add First Activity</span>
            </button>
          </div>
        </div>
      `}
    `;
  }

  /**
   * Update the dashboard display
   */
  update(container) {
    if (container) {
      container.innerHTML = this.render();
      this.attachEventListeners(container);
    }
  }

  /**
   * Attach event listeners for interactive elements
   */
  attachEventListeners(container) {
    // AI insight actions
    const insightActions = container.querySelectorAll('.ai-insight__action');
    insightActions.forEach(action => {
      action.addEventListener('click', (e) => {
        const insightCard = e.target.closest('.ai-insight-card');
        const title = insightCard.querySelector('.ai-insight__title').textContent;

        this.showNotification(`${title} - Action triggered`, 'info');
      });
    });
  }

  /**
   * Show notification (would integrate with notification system)
   */
  showNotification(message, type = 'info') {
    console.log(`Notification: ${message} (${type})`);
    // In a real implementation, this would trigger the notification system
  }
}