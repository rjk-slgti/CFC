import { submitActivityData } from '../services/api.js';
import { store } from '../state/store.js';

/**
 * Intelligent Data Entry Form Component
 * Smart form with auto-suggestions, real-time validation, and contextual help
 */
export class DataEntryForm {
  constructor() {
    this.sourceTypes = {
      'scope_1': [
        { value: 'diesel_generator', label: 'Diesel Generator', icon: '⛽', unit: 'liters', description: 'Stationary combustion from diesel fuel' },
        { value: 'diesel_vehicle', label: 'Diesel Vehicle', icon: '🚛', unit: 'liters', description: 'Mobile combustion from diesel vehicles' },
        { value: 'petrol_vehicle', label: 'Petrol Vehicle', icon: '🚗', unit: 'liters', description: 'Mobile combustion from petrol vehicles' },
        { value: 'lpg_combustion', label: 'LPG Combustion', icon: '🔥', unit: 'kg', description: 'Stationary combustion from LPG' },
        { value: 'natural_gas', label: 'Natural Gas', icon: '🌡️', unit: 'cubic_meters', description: 'Stationary combustion from natural gas' },
        { value: 'refrigerant_r134a', label: 'Refrigerant R-134a', icon: '❄️', unit: 'kg', description: 'Fugitive emissions from refrigeration' }
      ],
      'scope_2': [
        { value: 'electricity_grid', label: 'Grid Electricity', icon: '⚡', unit: 'kwh', description: 'Purchased electricity from grid', smartDefault: true },
        { value: 'purchased_heat', label: 'Purchased Heat', icon: '🔥', unit: 'mwh', description: 'Purchased heat/steam energy' }
      ],
      'scope_3': [
        { value: 'office_paper', label: 'Office Paper', icon: '📄', unit: 'ream', description: 'Purchased paper products' },
        { value: 'waste_landfill', label: 'Waste to Landfill', icon: '🗑️', unit: 'kg', description: 'Waste sent to landfill' },
        { value: 'waste_recycled', label: 'Waste Recycled', icon: '♻️', unit: 'kg', description: 'Waste sent for recycling' },
        { value: 'employee_commuting', label: 'Employee Commuting', icon: '🚶', unit: 'km', description: 'Employee transportation' },
        { value: 'business_travel_air', label: 'Business Travel (Air)', icon: '✈️', unit: 'km', description: 'Air travel for business' },
        { value: 'water_supply', label: 'Water Supply', icon: '💧', unit: 'cubic_meters', description: 'Purchased water supply' }
      ]
    };

    this.units = [
      { value: 'liters', label: 'Liters (L)', category: 'volume' },
      { value: 'kg', label: 'Kilograms (kg)', category: 'weight' },
      { value: 'kwh', label: 'Kilowatt-hours (kWh)', category: 'energy' },
      { value: 'mwh', label: 'Megawatt-hours (MWh)', category: 'energy' },
      { value: 'km', label: 'Kilometers (km)', category: 'distance' },
      { value: 'cubic_meters', label: 'Cubic Meters (m³)', category: 'volume' },
      { value: 'ream', label: 'Reams', category: 'quantity' },
      { value: 'usd', label: 'USD ($)', category: 'currency' }
    ];

    this.formData = {
      scope: '',
      sourceType: '',
      quantity: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      notes: ''
    };

    this.validationState = {};
    this.suggestions = [];
    this.isSubmitting = false;
  }

  /**
   * Initialize the intelligent form
   */
  init() {
    this.showWelcomeMessage();
  }

  /**
   * Show welcome message with smart suggestions
   */
  showWelcomeMessage() {
    const state = store.getState();
    const hasData = state.activityData && state.activityData.length > 0;

    if (!hasData) {
      this.showNotification(
        'Welcome! Start by selecting an emission source. We recommend beginning with electricity consumption.',
        'info',
        5000
      );
    }
  }

  /**
   * Render the intelligent form
   */
  render() {
    const selectedScope = this.formData.scope;
    const availableSourceTypes = selectedScope ? this.sourceTypes[selectedScope] : [];

    return `
      <div class="smart-form">
        <div class="smart-form__header">
          <h2 class="smart-form__title">
            <span class="smart-form__icon">✨</span>
            Smart Activity Entry
          </h2>
          <p class="smart-form__subtitle">AI-powered form with intelligent suggestions and validation</p>
        </div>

        <form class="smart-form__form" id="dataEntryForm">
          <!-- Scope Selection -->
          <div class="form-group">
            <label class="form-group__label" for="scope">
              Emission Scope
              <span class="form-group__help" title="GHG Protocol emission scopes">ℹ️</span>
            </label>
            <div class="smart-select" id="scopeSelect">
              <div class="smart-select__trigger form-group__input" tabindex="0">
                <span class="smart-select__value" id="scopeValue">
                  ${selectedScope ? this.getScopeLabel(selectedScope) : 'Select emission scope...'}
                </span>
                <span class="smart-select__icon">▼</span>
              </div>
              <div class="smart-select__dropdown">
                <div class="smart-select__option" data-value="scope_1">
                  <span class="smart-select__icon">🚗</span>
                  <div>
                    <div class="option__title">Scope 1 - Direct Emissions</div>
                    <div class="option__description">Emissions from owned sources</div>
                  </div>
                </div>
                <div class="smart-select__option" data-value="scope_2">
                  <span class="smart-select__icon">⚡</span>
                  <div>
                    <div class="option__title">Scope 2 - Indirect Energy</div>
                    <div class="option__description">Emissions from purchased energy</div>
                  </div>
                </div>
                <div class="smart-select__option" data-value="scope_3">
                  <span class="smart-select__icon">🌍</span>
                  <div>
                    <div class="option__title">Scope 3 - Value Chain</div>
                    <div class="option__description">Other indirect emissions</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="validation-message validation-message--info" id="scopeHelp">
              Choose the appropriate GHG Protocol scope for your activity
            </div>
          </div>

          <!-- Source Type Selection -->
          <div class="form-group" id="sourceTypeGroup" style="display: ${selectedScope ? 'block' : 'none'}">
            <label class="form-group__label" for="sourceType">
              Activity Type
              <span class="form-group__smart" id="smartSuggestion">🤖 Smart suggestions available</span>
            </label>
            <div class="smart-select" id="sourceTypeSelect">
              <div class="smart-select__trigger form-group__input" tabindex="0">
                <span class="smart-select__value" id="sourceTypeValue">
                  ${this.formData.sourceType ?
                    this.getSourceTypeLabel(this.formData.sourceType) :
                    'Select activity type...'}
                </span>
                <span class="smart-select__icon">▼</span>
              </div>
              <div class="smart-select__dropdown">
                ${availableSourceTypes.map(type => `
                  <div class="smart-select__option ${type.smartDefault ? 'smart-select__option--recommended' : ''}" data-value="${type.value}">
                    <span class="smart-select__icon">${type.icon}</span>
                    <div>
                      <div class="option__title">${type.label} ${type.smartDefault ? '<span class="recommended-badge">Recommended</span>' : ''}</div>
                      <div class="option__description">${type.description}</div>
                      <div class="option__meta">Unit: ${this.getUnitLabel(type.unit)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="validation-message validation-message--info" id="sourceTypeHelp">
              ${selectedScope === 'scope_2' ? '💡 Most organizations start with electricity consumption' : 'Select the most relevant activity for accurate emissions calculation'}
            </div>
          </div>

          <!-- Quantity Input -->
          <div class="form-group" id="quantityGroup" style="display: ${this.formData.sourceType ? 'block' : 'none'}">
            <label class="form-group__label" for="quantity">
              Quantity
              <span class="form-group__unit" id="quantityUnit">
                ${this.formData.sourceType ? `(${this.getUnitLabel(this.getDefaultUnit(this.formData.sourceType))})` : ''}
              </span>
            </label>
            <div class="input-group">
              <input
                type="number"
                id="quantity"
                name="quantity"
                class="form-group__input smart-input"
                placeholder="Enter quantity..."
                min="0"
                step="0.01"
                value="${this.formData.quantity}"
                required
              >
              <div class="smart-input__validation" id="quantityValidation"></div>
            </div>
            <div class="validation-message validation-message--info" id="quantityHelp">
              Enter the total quantity for the selected time period
            </div>
          </div>

          <!-- Unit Selection -->
          <div class="form-group" id="unitGroup" style="display: ${this.formData.sourceType ? 'block' : 'none'}">
            <label class="form-group__label" for="unit">Unit of Measurement</label>
            <div class="smart-select" id="unitSelect">
              <div class="smart-select__trigger form-group__input" tabindex="0">
                <span class="smart-select__value" id="unitValue">
                  ${this.formData.unit ? this.getUnitLabel(this.formData.unit) : 'Auto-selected unit'}
                </span>
                <span class="smart-select__icon">▼</span>
              </div>
              <div class="smart-select__dropdown">
                ${this.units.map(unit => `
                  <div class="smart-select__option ${this.isRecommendedUnit(unit.value, this.formData.sourceType) ? 'smart-select__option--recommended' : ''}" data-value="${unit.value}">
                    <span class="smart-select__icon">${this.getUnitIcon(unit.category)}</span>
                    <div>
                      <div class="option__title">${unit.label}</div>
                      <div class="option__description">${unit.category} measurement</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Date Range -->
          <div class="smart-form__grid">
            <div class="form-group">
              <label class="form-group__label" for="dateFrom">From Date</label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                class="form-group__input"
                value="${this.formData.dateFrom}"
                max="${new Date().toISOString().split('T')[0]}"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-group__label" for="dateTo">To Date</label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                class="form-group__input"
                value="${this.formData.dateTo}"
                max="${new Date().toISOString().split('T')[0]}"
                required
              >
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-group__label" for="notes">
              Additional Notes
              <span class="form-group__optional">(Optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              class="form-group__input form-group__textarea"
              placeholder="Add any relevant details, data sources, or assumptions..."
              rows="3"
            >${this.formData.notes}</textarea>
          </div>

          <!-- Smart Preview -->
          <div class="smart-preview" id="smartPreview" style="display: none;">
            <div class="smart-preview__header">
              <span class="smart-preview__icon">👁️</span>
              <span class="smart-preview__title">Emission Preview</span>
            </div>
            <div class="smart-preview__content" id="previewContent">
              <!-- Preview content will be populated by JavaScript -->
            </div>
          </div>

          <!-- Form Actions -->
          <div class="smart-form__actions">
            <button type="button" class="btn btn--secondary" id="clearForm">
              <span>Clear Form</span>
            </button>
            <button type="submit" class="btn btn--primary" id="submitForm" disabled>
              <span id="submitText">Calculate Emissions</span>
              <span class="btn__loading" id="submitLoading" style="display: none;">
                <span class="loading-spinner--small"></span>
                Processing...
              </span>
            </button>
          </div>
        </form>

        <!-- Smart Tips -->
        <div class="smart-tips" id="smartTips">
          <div class="smart-tips__header">
            <span class="smart-tips__icon">💡</span>
            <span class="smart-tips__title">Smart Tips</span>
          </div>
          <ul class="smart-tips__list">
            <li class="smart-tips__item">Use monthly data for better accuracy</li>
            <li class="smart-tips__item">Include all fuel types and energy sources</li>
            <li class="smart-tips__item">Document your data sources for verification</li>
          </ul>
        </div>
      </div>
    `;
  }

  /**
   * Attach intelligent event listeners
   */
  attachEventListeners() {
    // Smart select dropdowns
    this.attachSmartSelectListeners();

    // Form validation
    this.attachValidationListeners();

    // Smart suggestions
    this.attachSuggestionListeners();

    // Form submission
    this.attachSubmitListener();
  }

  /**
   * Attach smart select listeners
   */
  attachSmartSelectListeners() {
    // Scope selection
    const scopeSelect = document.getElementById('scopeSelect');
    if (scopeSelect) {
      const trigger = scopeSelect.querySelector('.smart-select__trigger');
      const dropdown = scopeSelect.querySelector('.smart-select__dropdown');

      trigger.addEventListener('click', () => {
        dropdown.classList.toggle('smart-select--open');
      });

      dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.smart-select__option');
        if (option) {
          const value = option.dataset.value;
          this.updateScope(value);
          dropdown.classList.remove('smart-select--open');
        }
      });
    }

    // Source type selection
    const sourceTypeSelect = document.getElementById('sourceTypeSelect');
    if (sourceTypeSelect) {
      const trigger = sourceTypeSelect.querySelector('.smart-select__trigger');
      const dropdown = sourceTypeSelect.querySelector('.smart-select__dropdown');

      trigger.addEventListener('click', () => {
        if (this.formData.scope) {
          dropdown.classList.toggle('smart-select--open');
        }
      });

      dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.smart-select__option');
        if (option) {
          const value = option.dataset.value;
          this.updateSourceType(value);
          dropdown.classList.remove('smart-select--open');
        }
      });
    }

    // Unit selection
    const unitSelect = document.getElementById('unitSelect');
    if (unitSelect) {
      const trigger = unitSelect.querySelector('.smart-select__trigger');
      const dropdown = unitSelect.querySelector('.smart-select__dropdown');

      trigger.addEventListener('click', () => {
        dropdown.classList.toggle('smart-select--open');
      });

      dropdown.addEventListener('click', (e) => {
        const option = e.target.closest('.smart-select__option');
        if (option) {
          const value = option.dataset.value;
          this.updateUnit(value);
          dropdown.classList.remove('smart-select--open');
        }
      });
    }
  }

  /**
   * Attach validation listeners
   */
  attachValidationListeners() {
    const quantityInput = document.getElementById('quantity');
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');

    if (quantityInput) {
      quantityInput.addEventListener('input', (e) => {
        this.validateQuantity(e.target.value);
        this.updatePreview();
      });
    }

    if (dateFromInput && dateToInput) {
      [dateFromInput, dateToInput].forEach(input => {
        input.addEventListener('change', () => {
          this.validateDateRange();
        });
      });
    }
  }

  /**
   * Attach submit listener
   */
  attachSubmitListener() {
    const form = document.getElementById('dataEntryForm');
    const clearBtn = document.getElementById('clearForm');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearForm();
      });
    }
  }

  /**
   * Update scope selection
   */
  updateScope(scope) {
    this.formData.scope = scope;
    this.formData.sourceType = '';
    this.formData.unit = '';

    this.updateUI();
    this.showSmartSuggestions();
  }

  /**
   * Update source type selection
   */
  updateSourceType(sourceType) {
    this.formData.sourceType = sourceType;
    this.formData.unit = this.getDefaultUnit(sourceType);

    this.updateUI();
    this.updatePreview();
  }

  /**
   * Update unit selection
   */
  updateUnit(unit) {
    this.formData.unit = unit;
    this.updateUI();
  }

  /**
   * Update form UI based on current state
   */
  updateUI() {
    const scopeValue = document.getElementById('scopeValue');
    const sourceTypeGroup = document.getElementById('sourceTypeGroup');
    const quantityGroup = document.getElementById('quantityGroup');
    const unitGroup = document.getElementById('unitGroup');
    const sourceTypeValue = document.getElementById('sourceTypeValue');
    const unitValue = document.getElementById('unitValue');
    const quantityUnit = document.getElementById('quantityUnit');
    const submitBtn = document.getElementById('submitForm');

    if (scopeValue) {
      scopeValue.textContent = this.formData.scope ? this.getScopeLabel(this.formData.scope) : 'Select emission scope...';
    }

    if (sourceTypeGroup) {
      sourceTypeGroup.style.display = this.formData.scope ? 'block' : 'none';
    }

    if (sourceTypeValue) {
      sourceTypeValue.textContent = this.formData.sourceType ?
        this.getSourceTypeLabel(this.formData.sourceType) :
        'Select activity type...';
    }

    if (quantityGroup) {
      quantityGroup.style.display = this.formData.sourceType ? 'block' : 'none';
    }

    if (unitGroup) {
      unitGroup.style.display = this.formData.sourceType ? 'block' : 'none';
    }

    if (unitValue) {
      unitValue.textContent = this.formData.unit ? this.getUnitLabel(this.formData.unit) : 'Auto-selected unit';
    }

    if (quantityUnit) {
      quantityUnit.textContent = this.formData.sourceType ? `(${this.getUnitLabel(this.getDefaultUnit(this.formData.sourceType))})` : '';
    }

    // Enable/disable submit button
    const isValid = this.formData.scope && this.formData.sourceType && this.formData.quantity && this.formData.unit;
    if (submitBtn) {
      submitBtn.disabled = !isValid;
    }
  }

  /**
   * Show smart suggestions
   */
  showSmartSuggestions() {
    const suggestions = [];

    if (this.formData.scope === 'scope_2') {
      suggestions.push('Most organizations start with electricity consumption');
      suggestions.push('Consider both grid electricity and renewable sources');
    } else if (this.formData.scope === 'scope_1') {
      suggestions.push('Include all fuel types used in operations');
      suggestions.push('Don\'t forget fugitive emissions from refrigerants');
    }

    this.suggestions = suggestions;
    this.updateSuggestionsUI();
  }

  /**
   * Update suggestions UI
   */
  updateSuggestionsUI() {
    const tipsList = document.querySelector('.smart-tips__list');
    if (tipsList && this.suggestions.length > 0) {
      tipsList.innerHTML = this.suggestions.map(tip => `<li class="smart-tips__item">${tip}</li>`).join('');
    }
  }

  /**
   * Update emission preview
   */
  updatePreview() {
    const preview = document.getElementById('smartPreview');
    const content = document.getElementById('previewContent');

    if (!this.isFormValidForPreview()) {
      if (preview) preview.style.display = 'none';
      return;
    }

    if (preview && content) {
      const estimatedEmissions = this.calculateEstimatedEmissions();
      content.innerHTML = `
        <div class="preview__metric">
          <span class="preview__label">Estimated CO₂e:</span>
          <span class="preview__value">${estimatedEmissions.toFixed(2)} t</span>
        </div>
        <div class="preview__quality">
          <span class="preview__label">Data Quality:</span>
          <span class="preview__quality-score quality--good">Good</span>
        </div>
      `;
      preview.style.display = 'block';
    }
  }

  /**
   * Calculate estimated emissions for preview
   */
  calculateEstimatedEmissions() {
    const state = store.getState();
    const factor = state.emissionFactors?.find(f =>
      f.source_type === this.formData.sourceType &&
      f.unit === this.formData.unit
    );

    if (!factor || !this.formData.quantity) return 0;

    return (parseFloat(this.formData.quantity) * factor.factor_value) / 1000; // Convert to tonnes
  }

  /**
   * Validate quantity input
   */
  validateQuantity(value) {
    const validation = document.getElementById('quantityValidation');
    const help = document.getElementById('quantityHelp');

    if (!value || value <= 0) {
      this.setValidationState('quantity', false, 'Quantity must be greater than 0');
      return false;
    }

    if (value > 1000000) {
      this.setValidationState('quantity', false, 'Quantity seems unusually high - please verify');
      return false;
    }

    this.setValidationState('quantity', true, 'Valid quantity');
    return true;
  }

  /**
   * Validate date range
   */
  validateDateRange() {
    const dateFrom = document.getElementById('dateFrom')?.value;
    const dateTo = document.getElementById('dateTo')?.value;

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      this.showNotification('End date must be after start date', 'error');
      return false;
    }

    return true;
  }

  /**
   * Set validation state
   */
  setValidationState(field, isValid, message) {
    this.validationState[field] = { isValid, message };

    const validationEl = document.getElementById(`${field}Validation`);
    const helpEl = document.getElementById(`${field}Help`);

    if (validationEl) {
      validationEl.className = `smart-input__validation ${isValid ? 'smart-input--valid' : 'smart-input--invalid'}`;
    }

    if (helpEl) {
      helpEl.className = `validation-message validation-message--${isValid ? 'success' : 'error'}`;
      helpEl.textContent = message;
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    if (!this.validateForm()) {
      this.showNotification('Please correct the errors before submitting', 'error');
      return;
    }

    this.setSubmittingState(true);

    try {
      const formData = {
        ...this.formData,
        quantity: parseFloat(this.formData.quantity),
        dateFrom: new Date(this.formData.dateFrom),
        dateTo: new Date(this.formData.dateTo)
      };

      await submitActivityData(formData);

      this.showNotification('Activity data submitted successfully!', 'success');
      this.clearForm();

    } catch (error) {
      console.error('Submission error:', error);
      this.showNotification('Failed to submit data. Please try again.', 'error');
    } finally {
      this.setSubmittingState(false);
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    return this.validateQuantity(this.formData.quantity) &&
           this.validateDateRange() &&
           this.formData.scope &&
           this.formData.sourceType &&
           this.formData.unit;
  }

  /**
   * Set submitting state
   */
  setSubmittingState(isSubmitting) {
    this.isSubmitting = isSubmitting;

    const submitBtn = document.getElementById('submitForm');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');

    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
    }

    if (submitText && submitLoading) {
      submitText.style.display = isSubmitting ? 'none' : 'inline';
      submitLoading.style.display = isSubmitting ? 'inline-flex' : 'none';
    }
  }

  /**
   * Clear form
   */
  clearForm() {
    this.formData = {
      scope: '',
      sourceType: '',
      quantity: '',
      unit: '',
      dateFrom: '',
      dateTo: '',
      notes: ''
    };

    this.updateUI();
    this.hidePreview();
  }

  /**
   * Hide preview
   */
  hidePreview() {
    const preview = document.getElementById('smartPreview');
    if (preview) {
      preview.style.display = 'none';
    }
  }

  /**
   * Check if form is valid for preview
   */
  isFormValidForPreview() {
    return this.formData.scope && this.formData.sourceType && this.formData.quantity && this.formData.unit;
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info', duration = 3000) {
    // This would integrate with a notification system
    console.log(`Notification: ${message} (${type})`);

    // For now, use browser alert as fallback
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      alert(`Success: ${message}`);
    }
  }

  /**
   * Helper methods for labels and defaults
   */
  getScopeLabel(scope) {
    const labels = {
      'scope_1': 'Scope 1 - Direct Emissions',
      'scope_2': 'Scope 2 - Indirect Energy',
      'scope_3': 'Scope 3 - Value Chain'
    };
    return labels[scope] || scope;
  }

  getSourceTypeLabel(sourceType) {
    const allTypes = Object.values(this.sourceTypes).flat();
    const type = allTypes.find(t => t.value === sourceType);
    return type ? type.label : sourceType;
  }

  getUnitLabel(unit) {
    const unitObj = this.units.find(u => u.value === unit);
    return unitObj ? unitObj.label : unit;
  }

  getUnitIcon(category) {
    const icons = {
      'volume': '🧪',
      'weight': '⚖️',
      'energy': '⚡',
      'distance': '📏',
      'quantity': '🔢',
      'currency': '💰'
    };
    return icons[category] || '📐';
  }

  getDefaultUnit(sourceType) {
    const allTypes = Object.values(this.sourceTypes).flat();
    const type = allTypes.find(t => t.value === sourceType);
    return type ? type.unit : 'kg';
  }

  isRecommendedUnit(unit, sourceType) {
    return this.getDefaultUnit(sourceType) === unit;
  }
}
            <label for="notes" class="data-entry-form__label">Notes (Optional)</label>
            <textarea id="notes" name="notes" class="data-entry-form__textarea"
                      placeholder="Optional notes about this data entry" rows="3"></textarea>
          </div>

          <div class="data-entry-form__actions">
            <button type="submit" class="data-entry-form__submit" id="submitBtn">
              <span class="data-entry-form__submit-text">Submit Data</span>
              <span class="data-entry-form__submit-loading" style="display: none;">Submitting...</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  /**
   * Attach event listeners to the form
   * @param {HTMLElement} container - Container element
   */
  attachEvents(container) {
    const form = container.querySelector('#dataEntryForm');
    const scopeSelect = container.querySelector('#scope');
    const sourceTypeSelect = container.querySelector('#sourceType');
    const submitBtn = container.querySelector('#submitBtn');

    // Handle scope change to update source types
    scopeSelect.addEventListener('change', (e) => {
      const scope = e.target.value;
      this.updateSourceTypes(sourceTypeSelect, scope);
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form, submitBtn);
    });
  }

  /**
   * Update source type options based on selected scope
   * @param {HTMLSelectElement} sourceTypeSelect
   * @param {string} scope
   */
  updateSourceTypes(sourceTypeSelect, scope) {
    sourceTypeSelect.innerHTML = '<option value="">Select Source Type</option>';

    if (this.sourceTypes[scope]) {
      this.sourceTypes[scope].forEach(type => {
        const option = document.createElement('option');
        option.value = type.value;
        option.textContent = type.label;
        sourceTypeSelect.appendChild(option);
      });
      sourceTypeSelect.disabled = false;
    } else {
      sourceTypeSelect.disabled = true;
    }
  }

  /**
   * Handle form submission
   * @param {HTMLFormElement} form
   * @param {HTMLButtonElement} submitBtn
   */
  async handleSubmit(form, submitBtn) {
    // Clear previous errors
    this.clearErrors(form);

    // Validate form
    const errors = this.validateForm(form);
    if (errors.length > 0) {
      this.showErrors(form, errors);
      return;
    }

    // Show loading state
    this.setLoadingState(submitBtn, true);

    try {
      // Collect form data
      const formData = new FormData(form);
      const data = {
        scope: formData.get('scope'),
        sourceType: formData.get('sourceType'),
        quantity: parseFloat(formData.get('quantity')),
        unit: formData.get('unit'),
        dateFrom: formData.get('dateFrom'),
        dateTo: formData.get('dateTo'),
        notes: formData.get('notes') || ''
      };

      // Submit data
      await submitActivityData(data);

      // Reset form
      form.reset();
      this.updateSourceTypes(form.querySelector('#sourceType'), '');

      // Show success (could be enhanced with a toast notification)
      alert('Data submitted successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit data. Please try again.');
    } finally {
      this.setLoadingState(submitBtn, false);
    }
  }

  /**
   * Validate form data
   * @param {HTMLFormElement} form
   * @returns {Array} Array of error objects
   */
  validateForm(form) {
    const errors = [];
    const formData = new FormData(form);

    const scope = formData.get('scope');
    const sourceType = formData.get('sourceType');
    const quantity = parseFloat(formData.get('quantity'));
    const unit = formData.get('unit');
    const dateFrom = formData.get('dateFrom');
    const dateTo = formData.get('dateTo');

    if (!scope) {
      errors.push({ field: 'scope', message: 'Please select a scope.' });
    }

    if (!sourceType) {
      errors.push({ field: 'sourceType', message: 'Please select a source type.' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      errors.push({ field: 'quantity', message: 'Please enter a valid quantity greater than 0.' });
    }

    if (!unit) {
      errors.push({ field: 'unit', message: 'Please select a unit.' });
    }

    if (!dateFrom) {
      errors.push({ field: 'dateFrom', message: 'Please select a from date.' });
    }

    if (!dateTo) {
      errors.push({ field: 'dateTo', message: 'Please select a to date.' });
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      errors.push({ field: 'dateTo', message: 'To date must be after from date.' });
    }

    return errors;
  }

  /**
   * Show validation errors
   * @param {HTMLFormElement} form
   * @param {Array} errors
   */
  showErrors(form, errors) {
    errors.forEach(error => {
      const errorElement = form.querySelector(`#${error.field}Error`);
      if (errorElement) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
      }
    });
  }

  /**
   * Clear all error messages
   * @param {HTMLFormElement} form
   */
  clearErrors(form) {
    const errorElements = form.querySelectorAll('.data-entry-form__error');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  /**
   * Set loading state for submit button
   * @param {HTMLButtonElement} button
   * @param {boolean} isLoading
   */
  setLoadingState(button, isLoading) {
    const textSpan = button.querySelector('.data-entry-form__submit-text');
    const loadingSpan = button.querySelector('.data-entry-form__submit-loading');

    if (isLoading) {
      button.disabled = true;
      textSpan.style.display = 'none';
      loadingSpan.style.display = 'inline';
    } else {
      button.disabled = false;
      textSpan.style.display = 'inline';
      loadingSpan.style.display = 'none';
    }
  }
}