import { submitActivityData } from '../services/api.js';

/**
 * Data Entry Form Component
 * Handles user input for carbon activity data
 */
export class DataEntryForm {
  constructor() {
    this.sourceTypes = {
      'scope_1': [
        { value: 'diesel_generator', label: 'Diesel Generator' },
        { value: 'diesel_vehicle', label: 'Diesel Vehicle' },
        { value: 'petrol_vehicle', label: 'Petrol Vehicle' },
        { value: 'lpg_combustion', label: 'LPG Combustion' },
        { value: 'natural_gas', label: 'Natural Gas' },
        { value: 'refrigerant_r134a', label: 'Refrigerant R-134a' }
      ],
      'scope_2': [
        { value: 'electricity_grid', label: 'Grid Electricity' },
        { value: 'purchased_heat', label: 'Purchased Heat' }
      ],
      'scope_3': [
        { value: 'office_paper', label: 'Office Paper' },
        { value: 'waste_landfill', label: 'Waste to Landfill' },
        { value: 'waste_recycled', label: 'Waste Recycled' },
        { value: 'employee_commuting', label: 'Employee Commuting' },
        { value: 'business_travel_air', label: 'Business Travel (Air)' },
        { value: 'water_supply', label: 'Water Supply' }
      ]
    };

    this.units = [
      { value: 'liters', label: 'Liters' },
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'kwh', label: 'Kilowatt-hours (kWh)' },
      { value: 'mwh', label: 'Megawatt-hours (MWh)' },
      { value: 'km', label: 'Kilometers (km)' },
      { value: 'cubic_meters', label: 'Cubic Meters' },
      { value: 'ream', label: 'Reams (Paper)' },
      { value: 'usd', label: 'USD' }
    ];
  }

  /**
   * Render the form HTML
   * @returns {string} HTML template
   */
  render() {
    return `
      <div class="data-entry-form">
        <h2 class="data-entry-form__title">Add Carbon Activity Data</h2>
        <form class="data-entry-form__form" id="dataEntryForm">
          <div class="data-entry-form__field">
            <label for="scope" class="data-entry-form__label">Scope</label>
            <select id="scope" name="scope" class="data-entry-form__select" required>
              <option value="">Select Scope</option>
              <option value="scope_1">Scope 1 - Direct Emissions</option>
              <option value="scope_2">Scope 2 - Indirect Energy</option>
              <option value="scope_3">Scope 3 - Value Chain</option>
            </select>
            <span class="data-entry-form__error" id="scopeError"></span>
          </div>

          <div class="data-entry-form__field">
            <label for="sourceType" class="data-entry-form__label">Source Type</label>
            <select id="sourceType" name="sourceType" class="data-entry-form__select" required disabled>
              <option value="">Select Source Type</option>
            </select>
            <span class="data-entry-form__error" id="sourceTypeError"></span>
          </div>

          <div class="data-entry-form__field">
            <label for="quantity" class="data-entry-form__label">Quantity</label>
            <input type="number" id="quantity" name="quantity" class="data-entry-form__input"
                   placeholder="e.g., 500" min="0" step="0.01" required>
            <span class="data-entry-form__error" id="quantityError"></span>
          </div>

          <div class="data-entry-form__field">
            <label for="unit" class="data-entry-form__label">Unit</label>
            <select id="unit" name="unit" class="data-entry-form__select" required>
              <option value="">Select Unit</option>
              ${this.units.map(unit => `<option value="${unit.value}">${unit.label}</option>`).join('')}
            </select>
            <span class="data-entry-form__error" id="unitError"></span>
          </div>

          <div class="data-entry-form__field">
            <label for="dateFrom" class="data-entry-form__label">From Date</label>
            <input type="date" id="dateFrom" name="dateFrom" class="data-entry-form__input" required>
            <span class="data-entry-form__error" id="dateFromError"></span>
          </div>

          <div class="data-entry-form__field">
            <label for="dateTo" class="data-entry-form__label">To Date</label>
            <input type="date" id="dateTo" name="dateTo" class="data-entry-form__input" required>
            <span class="data-entry-form__error" id="dateToError"></span>
          </div>

          <div class="data-entry-form__field">
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