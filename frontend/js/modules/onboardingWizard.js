/**
 * OnboardingWizard - Multi-step guided setup for new users
 *
 * Walks users through:
 *   1. Welcome and scope overview
 *   2. Organization profile setup
 *   3. First data entry selection
 *   4. Guided data entry form
 *   5. Completion confirmation
 */

class OnboardingWizard {
  constructor() {
    this._currentStep = 1;
    this._totalSteps = 5;
    this._modal = null;
    this._data = {
      organization: '',
      country: 'Sri Lanka',
      employeeCount: '',
      firstEntryType: null,
    };
    this._onComplete = null;
  }

  /**
   * Launch the onboarding wizard.
   * @param {Function} onComplete - Callback when wizard finishes
   */
  start(onComplete) {
    this._currentStep = 1;
    this._onComplete = onComplete;
    this._render();
  }

  _render() {
    this._removeExisting();

    const modal = document.createElement('div');
    modal.id = 'onboarding-wizard';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        ${this._renderProgressBar()}
        <div class="p-8 min-h-[320px]">
          ${this._renderStepContent()}
        </div>
        ${this._renderNavigation()}
      </div>
    `;

    document.body.appendChild(modal);
    this._modal = modal;

    this._attachEventListeners();
    this._checkOnboardingState();
  }

  _renderProgressBar() {
    const percent = (this._currentStep / this._totalSteps) * 100;
    const titles = ['Welcome', 'Organization', 'First Entry', 'Guided Entry', 'Complete'];

    return `
      <div class="bg-gray-100 p-4">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step ${this._currentStep} of ${this._totalSteps}</span>
          <span>${titles[this._currentStep - 1]}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }

  _renderStepContent() {
    switch (this._currentStep) {
      case 1: return this._renderWelcome();
      case 2: return this._renderOrgSetup();
      case 3: return this._renderFirstEntry();
      case 4: return this._renderGuidedEntry();
      case 5: return this._renderComplete();
      default: return '';
    }
  }

  _renderWelcome() {
    return `
      <div class="text-center">
        <div class="text-5xl mb-4">\u{1F30D}</div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Welcome to Carbon Accounting Platform</h2>
        <p class="text-gray-600 mb-6">
          Track your organization's carbon footprint following ISO 14064 standards.
        </p>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="p-4 bg-red-50 rounded-lg border border-red-100">
            <div class="text-2xl mb-2">\u{1F534}</div>
            <div class="font-medium text-gray-900">Scope 1</div>
            <div class="text-sm text-gray-500">Direct Emissions</div>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="text-2xl mb-2">\u{1F535}</div>
            <div class="font-medium text-gray-900">Scope 2</div>
            <div class="text-sm text-gray-500">Electricity</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-100">
            <div class="text-2xl mb-2">\u{1F7E2}</div>
            <div class="font-medium text-gray-900">Scope 3</div>
            <div class="text-sm text-gray-500">Value Chain</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderOrgSetup() {
    return `
      <div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Organization Setup</h2>
        <p class="text-gray-600 mb-6">Tell us about your organization to customize your experience.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-org-name">Organization Name</label>
            <input type="text" id="wizard-org-name" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="e.g., Sri Lanka German Training Institute"
                   value="${this._data.organization}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-country">Country</label>
            <select id="wizard-country" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Sri Lanka" ${this._data.country === 'Sri Lanka' ? 'selected' : ''}>Sri Lanka</option>
              <option value="UK" ${this._data.country === 'UK' ? 'selected' : ''}>United Kingdom</option>
              <option value="Australia" ${this._data.country === 'Australia' ? 'selected' : ''}>Australia</option>
              <option value="global" ${this._data.country === 'global' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-employees">Number of Employees</label>
            <select id="wizard-employees" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select range</option>
              <option value="1-50" ${this._data.employeeCount === '1-50' ? 'selected' : ''}>1-50</option>
              <option value="51-200" ${this._data.employeeCount === '51-200' ? 'selected' : ''}>51-200</option>
              <option value="201-1000" ${this._data.employeeCount === '201-1000' ? 'selected' : ''}>201-1000</option>
              <option value="1000+" ${this._data.employeeCount === '1000+' ? 'selected' : ''}>1000+</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  _renderFirstEntry() {
    const selected = this._data.firstEntryType;
    return `
      <div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Your First Entry</h2>
        <p class="text-gray-600 mb-4">Start with something simple. Electricity bills are the easiest starting point.</p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p class="text-blue-800 text-sm">
            <strong>Tip:</strong> Just enter your monthly kWh consumption from your latest electricity bill.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3" id="entry-type-selector">
          ${this._renderEntryTypeButton('electricity_grid', '\u26A1', 'Electricity', 'From your utility bill', selected === 'electricity_grid')}
          ${this._renderEntryTypeButton('diesel_generator', '\u26FD', 'Fuel', 'Diesel, Petrol, LPG', selected === 'diesel_generator')}
          ${this._renderEntryTypeButton('employee_commuting', '\u1F697', 'Transport', 'Vehicle travel', selected === 'employee_commuting')}
          ${this._renderEntryTypeButton('waste_landfill', '\u1F5D1', 'Waste', 'Waste disposal', selected === 'waste_landfill')}
        </div>
      </div>
    `;
  }

  _renderEntryTypeButton(type, icon, label, desc, isSelected) {
    const classes = isSelected
      ? 'p-4 border-2 border-blue-500 bg-blue-50 rounded-lg text-left cursor-pointer'
      : 'p-4 border-2 border-gray-200 rounded-lg text-left cursor-pointer hover:border-blue-300';
    return `
      <div class="${classes}" data-entry-type="${type}" role="button" tabindex="0">
        <div class="font-medium text-gray-900">${icon} ${label}</div>
        <div class="text-sm text-gray-500">${desc}</div>
      </div>
    `;
  }

  _renderGuidedEntry() {
    const type = this._data.firstEntryType || 'electricity_grid';
    const isElectricity = type === 'electricity_grid';

    return `
      <div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">Guided Entry</h2>
        <p class="text-gray-600 mb-4">${isElectricity ? 'Enter your electricity consumption details.' : 'Enter your activity data.'}</p>
        <div class="space-y-4" id="guided-form">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-quantity">
              ${isElectricity ? 'Electricity Consumption (kWh)' : 'Quantity'}
            </label>
            <input type="number" id="wizard-quantity" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                   placeholder="${isElectricity ? 'e.g., 5000' : 'Enter quantity'}" min="0">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-date-from">From</label>
              <input type="date" id="wizard-date-from" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-date-to">To</label>
              <input type="date" id="wizard-date-to" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="wizard-notes">Notes (optional)</label>
            <textarea id="wizard-notes" class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" rows="2"
                      placeholder="e.g., Main building monthly bill"></textarea>
          </div>
        </div>
      </div>
    `;
  }

  _renderComplete() {
    return `
      <div class="text-center">
        <div class="text-5xl mb-4">\u{1F389}</div>
        <h2 class="text-2xl font-bold mb-3 text-gray-900">You're All Set!</h2>
        <p class="text-gray-600 mb-6">
          Your onboarding is complete. You can now start tracking your carbon footprint.
        </p>
        <div class="grid grid-cols-1 gap-3 text-left max-w-md mx-auto">
          <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-xl mr-3">\u{1F4DD}</span>
            <span class="text-gray-700">Add more emission data</span>
          </div>
          <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-xl mr-3">\u{1F4CA}</span>
            <span class="text-gray-700">View your dashboard</span>
          </div>
          <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <span class="text-xl mr-3">\u{1F4C4}</span>
            <span class="text-gray-700">Generate reports</span>
          </div>
        </div>
      </div>
    `;
  }

  _renderNavigation() {
    const isFirst = this._currentStep === 1;
    const isLast = this._currentStep === this._totalSteps;
    const isEntryStep = this._currentStep === 3;

    return `
      <div class="bg-gray-50 px-8 py-4 flex justify-between items-center">
        <button
          class="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium ${isFirst ? 'invisible' : ''}"
          data-wizard-prev
          ${isFirst ? 'disabled' : ''}
        >
          \u2190 Previous
        </button>
        <button
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors ${isEntryStep && !this._data.firstEntryType ? 'opacity-50 cursor-not-allowed' : ''}"
          data-wizard-next
          ${isEntryStep && !this._data.firstEntryType ? 'disabled' : ''}
        >
          ${isLast ? 'Get Started \u2192' : 'Next \u2192'}
        </button>
      </div>
    `;
  }

  _attachEventListeners() {
    if (!this._modal) return;

    this._modal.querySelector('[data-wizard-prev]')?.addEventListener('click', () => this._prev());
    this._modal.querySelector('[data-wizard-next]')?.addEventListener('click', () => this._next());

    // Entry type selection
    this._modal.querySelectorAll('[data-entry-type]').forEach((el) => {
      const handler = () => {
        this._data.firstEntryType = el.dataset.entryType;
        this._render();
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    });
  }

  _next() {
    this._captureStepData();

    if (this._currentStep < this._totalSteps) {
      this._currentStep++;
      this._render();
    } else {
      this._complete();
    }
  }

  _prev() {
    if (this._currentStep > 1) {
      this._currentStep--;
      this._render();
    }
  }

  _captureStepData() {
    if (this._currentStep === 2) {
      this._data.organization = this._modal.querySelector('#wizard-org-name')?.value || '';
      this._data.country = this._modal.querySelector('#wizard-country')?.value || 'Sri Lanka';
      this._data.employeeCount = this._modal.querySelector('#wizard-employees')?.value || '';
    }
  }

  _checkOnboardingState() {
    const completed = localStorage.getItem('onboarding_completed');
    if (completed === 'true') {
      this._currentStep = this._totalSteps;
      this._render();
    }
  }

  _complete() {
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(this._data));

    if (this._onComplete) {
      this._onComplete(this._data);
    }

    this._removeExisting();
  }

  _removeExisting() {
    const existing = document.getElementById('onboarding-wizard');
    if (existing) existing.remove();
    this._modal = null;
  }

  /**
   * Reset onboarding state (for testing or re-onboarding).
   */
  reset() {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_data');
    this._data = { organization: '', country: 'Sri Lanka', employeeCount: '', firstEntryType: null };
    this._currentStep = 1;
  }
}

export default new OnboardingWizard();
