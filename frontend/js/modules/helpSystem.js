/**
 * HelpSystem - Contextual help tooltips for carbon accounting terminology
 *
 * Displays educational popups explaining ISO 14064 concepts,
 * emission factors, and GHG terminology.
 */

const HELP_TOPICS = Object.freeze({
  scope: {
    title: 'What is a Scope?',
    content: `
      <p><strong>Scope 1 (Direct):</strong> Emissions from sources you own or control — generators, company vehicles, refrigerant leaks.</p>
      <p><strong>Scope 2 (Energy):</strong> Indirect emissions from purchased electricity, heat, or steam.</p>
      <p><strong>Scope 3 (Value Chain):</strong> All other indirect emissions — waste, employee commuting, business travel, purchased goods.</p>
    `,
    link: 'https://ghgprotocol.org/standards/scope-3-standard',
    linkLabel: 'GHG Protocol Scope 3 Guide',
  },
  emission_factor: {
    title: 'What is an Emission Factor?',
    content: `
      <p>An emission factor converts activity data (e.g., liters of diesel burned) into greenhouse gas emissions (kg CO2e).</p>
      <p><strong>Example:</strong> 1 liter of diesel = 2.68 kg CO2</p>
      <p>Factors come from official sources: IPCC, DEFRA (UK), NGER (Australia), or Sri Lanka CEA.</p>
    `,
    link: null,
  },
  co2e: {
    title: 'What is CO2e?',
    content: `
      <p><strong>CO2e (Carbon Dioxide Equivalent)</strong> standardizes all greenhouse gases into a single unit.</p>
      <p>Each gas has a Global Warming Potential (GWP) relative to CO2:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li>CO2 = 1 (baseline)</li>
        <li>CH4 (Methane) = 28</li>
        <li>N2O (Nitrous Oxide) = 265</li>
      </ul>
      <p class="mt-2">Formula: CO2e = (CO2 x 1) + (CH4 x 28) + (N2O x 265)</p>
    `,
    link: 'https://www.ipcc.ch/report/ar5/wg1/',
    linkLabel: 'IPCC AR5 Report',
  },
  assumed_factor: {
    title: 'What does "Assumed Factor" mean?',
    content: `
      <p>This emission factor is not from your country's official source.</p>
      <p>We are using an international standard (DEFRA, NGER, or IPCC) as a substitute.</p>
      <p>Results may be less accurate than using local factors.</p>
    `,
    link: null,
  },
  data_quality: {
    title: 'What is a Data Quality Score?',
    content: `
      <p>Data quality scores (0-100) assess the reliability of your emission calculations based on:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li><strong>Data Source (30pts):</strong> How authoritative the emission factor is</li>
        <li><strong>Recency (20pts):</strong> How current the factor year is</li>
        <li><strong>Measurement (25pts):</strong> How the data was collected (meter vs estimate)</li>
        <li><strong>Validation (15pts):</strong> Whether a trainer has reviewed it</li>
        <li><strong>Completeness (10pts):</strong> Notes and attachments provided</li>
      </ul>
    `,
    link: 'https://www.iso.org/standard/66453.html',
    linkLabel: 'ISO 14064 Standard',
  },
  measurement_method: {
    title: 'Measurement Methods',
    content: `
      <p>How your activity data was collected affects its reliability:</p>
      <ul class="list-disc pl-5 mt-2 space-y-1">
        <li><strong>Meter Reading:</strong> Direct reading from a calibrated meter (most accurate)</li>
        <li><strong>Invoice:</strong> Data from utility bills or invoices</li>
        <li><strong>Estimate:</strong> Approximated value based on assumptions</li>
      </ul>
    `,
    link: null,
  },
});

class HelpSystem {
  constructor() {
    this._modalElement = null;
    this._boundKeyHandler = this._handleKeyDown.bind(this);
  }

  /**
   * Display a help modal for the given topic.
   * @param {string} topic - Key from HELP_TOPICS
   */
  showHelp(topic) {
    const help = HELP_TOPICS[topic];
    if (!help) {
      console.warn(`Help topic "${topic}" not found`);
      return;
    }

    this._closeExisting();

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'help-title');

    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
        <div class="flex justify-between items-center mb-4">
          <h3 id="help-title" class="text-lg font-bold text-gray-900">${help.title}</h3>
          <button
            class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            aria-label="Close help"
            data-help-close
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="text-gray-700 space-y-2 text-sm leading-relaxed">
          ${help.content}
        </div>
        ${help.link ? `
          <a href="${help.link}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
            ${help.linkLabel || 'Learn more'}
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        ` : ''}
      </div>
    `;

    document.body.appendChild(modal);
    this._modalElement = modal;

    // Event listeners
    modal.querySelector('[data-help-close]').addEventListener('click', () => this._closeExisting());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this._closeExisting();
    });
    document.addEventListener('keydown', this._boundKeyHandler);

    // Focus trap
    const closeBtn = modal.querySelector('[data-help-close]');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Attach help icons to all elements with a data-help attribute.
   */
  attachHelpIcons() {
    document.querySelectorAll('[data-help]').forEach((element) => {
      if (element.querySelector('[data-help-icon]')) return; // Already attached

      const topic = element.dataset.help;
      const icon = document.createElement('button');
      icon.className = 'ml-2 text-gray-400 hover:text-blue-600 cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-5 h-5 inline-flex items-center justify-center text-xs';
      icon.innerHTML = '?';
      icon.setAttribute('data-help-icon', topic);
      icon.setAttribute('aria-label', `Help: ${topic.replace(/_/g, ' ')}`);
      icon.setAttribute('type', 'button');
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showHelp(topic);
      });

      element.appendChild(icon);
    });
  }

  /**
   * Get all available help topics.
   */
  getAvailableTopics() {
    return Object.keys(HELP_TOPICS);
  }

  _closeExisting() {
    if (this._modalElement) {
      this._modalElement.remove();
      this._modalElement = null;
      document.removeEventListener('keydown', this._boundKeyHandler);
    }
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape') {
      this._closeExisting();
    }
  }
}

export default new HelpSystem();
