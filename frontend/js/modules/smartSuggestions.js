/**
 * SmartSuggestions - Analyzes existing data and recommends next actions
 *
 * Generates prioritized suggestions for users to improve
 * their carbon accounting data coverage and quality.
 */

const SUGGESTION_TEMPLATES = Object.freeze({
  missing_data: {
    icon: '\u{1F4DD}',
    actionLabel: 'Add Data',
  },
  update_needed: {
    icon: '\u{1F504}',
    actionLabel: 'Update',
  },
  report_ready: {
    icon: '\u{1F4CA}',
    actionLabel: 'Generate',
  },
  quality_improvement: {
    icon: '\u{2B50}',
    actionLabel: 'Improve',
  },
  validation_pending: {
    icon: '\u{23F3}',
    actionLabel: 'Submit',
  },
});

const COMMON_SOURCES = Object.freeze([
  { category: 'Electricity', sourceType: 'electricity_grid', scope: 'scope_2', priority: 'high', label: 'Grid Electricity' },
  { category: 'Fuel', sourceType: 'diesel_generator', scope: 'scope_1', priority: 'high', label: 'Diesel Generator' },
  { category: 'Fuel', sourceType: 'petrol_vehicle', scope: 'scope_1', priority: 'medium', label: 'Petrol Vehicle' },
  { category: 'Waste', sourceType: 'waste_landfill', scope: 'scope_3', priority: 'medium', label: 'Waste to Landfill' },
  { category: 'Transport', sourceType: 'employee_commuting', scope: 'scope_3', priority: 'low', label: 'Employee Commuting' },
  { category: 'Materials', sourceType: 'office_paper', scope: 'scope_3', priority: 'low', label: 'Office Paper' },
]);

class SmartSuggestions {
  constructor() {
    this._apiBase = '/api';
  }

  /**
   * Generate suggestions based on current data state.
   *
   * @param {Array} existingData - Array of activity data entries
   * @returns {Array} Sorted list of suggestions by priority
   */
  generateSuggestions(existingData = []) {
    const suggestions = [];

    // Check for missing common data sources
    for (const source of COMMON_SOURCES) {
      const exists = existingData.some(
        (d) => d.sourceType === source.sourceType && d.scope === source.scope
      );
      if (!exists) {
        suggestions.push({
          type: 'missing_data',
          title: `Add ${source.label} data`,
          description: `No ${source.label.toLowerCase()} emissions recorded yet (${source.scope.replace('_', ' ')})`,
          priority: source.priority,
          scope: source.scope,
          sourceType: source.sourceType,
          ...SUGGESTION_TEMPLATES.missing_data,
        });
      }
    }

    // Check for outdated entries (>2 months old)
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const oldEntries = existingData.filter((d) => {
      const entryDate = new Date(d.dateTo);
      return entryDate < twoMonthsAgo;
    });

    if (oldEntries.length > 0) {
      suggestions.push({
        type: 'update_needed',
        title: 'Update outdated data',
        description: `${oldEntries.length} entries are more than 2 months old`,
        priority: 'medium',
        count: oldEntries.length,
        ...SUGGESTION_TEMPLATES.update_needed,
      });
    }

    // Check for pending validations
    const pendingEntries = existingData.filter((d) => d.status === 'pending');
    if (pendingEntries.length > 0) {
      suggestions.push({
        type: 'validation_pending',
        title: 'Submit for validation',
        description: `${pendingEntries.length} entries are pending trainer review`,
        priority: 'medium',
        count: pendingEntries.length,
        ...SUGGESTION_TEMPLATES.validation_pending,
      });
    }

    // Suggest report generation if enough data exists
    if (existingData.length >= 5) {
      const approvedCount = existingData.filter((d) => d.status === 'approved').length;
      if (approvedCount >= 3) {
        suggestions.push({
          type: 'report_ready',
          title: 'Generate carbon report',
          description: `You have ${approvedCount} approved entries — enough for an initial report`,
          priority: 'low',
          ...SUGGESTION_TEMPLATES.report_ready,
        });
      }
    }

    // Quality improvement suggestions
    const lowQualityEntries = existingData.filter((d) => {
      return !d.notes || d.notes.length === 0;
    });

    if (lowQualityEntries.length > 2) {
      suggestions.push({
        type: 'quality_improvement',
        title: 'Add notes to entries',
        description: `${lowQualityEntries.length} entries have no notes — adding documentation improves data quality`,
        priority: 'low',
        count: lowQualityEntries.length,
        ...SUGGESTION_TEMPLATES.quality_improvement,
      });
    }

    return this._sortByPriority(suggestions);
  }

  /**
   * Render suggestions into a container element.
   *
   * @param {HTMLElement} container - DOM element to render into
   * @param {Array} suggestions - Suggestions array from generateSuggestions
   * @param {Function} onAction - Callback when a suggestion action is clicked
   */
  renderSuggestions(container, suggestions, onAction) {
    if (!container || !suggestions.length) return;

    container.innerHTML = `
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900">Suggestions</h3>
        <div class="space-y-3">
          ${suggestions.map((s, index) => `
            <div
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              data-suggestion-index="${index}"
              role="button"
              tabindex="0"
              aria-label="${s.title}: ${s.description}"
            >
              <div class="flex items-center min-w-0">
                <span class="text-xl mr-3 flex-shrink-0">${s.icon}</span>
                <div class="min-w-0">
                  <div class="font-medium text-gray-900 truncate">${s.title}</div>
                  <div class="text-sm text-gray-500 truncate">${s.description}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                <span class="px-2 py-1 text-xs rounded-full font-medium ${this._getPriorityClass(s.priority)}">
                  ${s.priority}
                </span>
                <span class="text-xs text-blue-600 font-medium">${s.actionLabel} \u2192</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach click handlers
    container.querySelectorAll('[data-suggestion-index]').forEach((el) => {
      const handler = () => {
        const idx = parseInt(el.dataset.suggestionIndex, 10);
        if (onAction && suggestions[idx]) {
          onAction(suggestions[idx]);
        }
      };
      el.addEventListener('click', handler);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });
  }

  _getPriorityClass(priority) {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  _sortByPriority(suggestions) {
    const order = { high: 0, medium: 1, low: 2 };
    return [...suggestions].sort((a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2));
  }
}

export default new SmartSuggestions();
