# PHASE 5 — FRONTEND (STRUCTURED INPUT ENGINE)

## Explanation (WHY)

The frontend is what users interact with. For carbon accounting, it must:
- Group inputs by **scope** (ISO 14064 requirement)
- Validate data **before** sending to backend
- Display results clearly with **scope classification**
- Be **modular** so each part can be updated independently

**Why modular JavaScript?**
- Easier to debug (each file has one job)
- Easier to test (test each module separately)
- Easier to maintain (update one module without breaking others)

---

## Project Structure

```
carbon-accounting-app/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Custom styles (if needed)
├── js/
│   ├── app.js              # Main entry point
│   ├── modules/
│   │   ├── formHandler.js  # Form submission logic
│   │   ├── validator.js    # Input validation
│   │   ├── api.js          # API calls to backend
│   │   ├── ui.js           # UI updates and display
│   │   └── scopeConfig.js  # Scope definitions and emission sources
│   └── utils/
│       └── helpers.js      # Utility functions
└── assets/
    └── icons/              # Icons for scopes
```

---

## Step-by-Step Implementation

### Step 1: Main HTML File (`index.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon Accounting Platform</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js for visualizations -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100 min-h-screen">

  <!-- Navigation -->
  <nav class="bg-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🌍</span>
          <span class="text-xl font-bold text-gray-800">Carbon Accounting Platform</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">John Silva</span>
          <button class="text-red-500 hover:text-red-700">Logout</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="max-w-7xl mx-auto px-4 py-8">

    <!-- Tab Navigation -->
    <div class="flex space-x-4 mb-8">
      <button class="tab-btn active px-6 py-3 rounded-lg bg-blue-500 text-white"
              data-tab="dashboard">
        📊 Dashboard
      </button>
      <button class="tab-btn px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              data-tab="input">
        📝 Input Data
      </button>
      <button class="tab-btn px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              data-tab="reports">
        📄 Reports
      </button>
    </div>

    <!-- Dashboard Tab -->
    <div id="dashboard-tab" class="tab-content">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-500 text-sm font-medium">Total CO₂e</h3>
          <p class="text-3xl font-bold text-gray-800" id="total-co2e">0</p>
          <p class="text-gray-400 text-sm">kg CO₂e</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 class="text-gray-500 text-sm font-medium">Scope 1</h3>
          <p class="text-3xl font-bold text-red-500" id="scope1-total">0</p>
          <p class="text-gray-400 text-sm">kg CO₂e</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 class="text-gray-500 text-sm font-medium">Scope 2</h3>
          <p class="text-3xl font-bold text-blue-500" id="scope2-total">0</p>
          <p class="text-gray-400 text-sm">kg CO₂e</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 class="text-gray-500 text-sm font-medium">Scope 3</h3>
          <p class="text-3xl font-bold text-green-500" id="scope3-total">0</p>
          <p class="text-gray-400 text-sm">kg CO₂e</p>
        </div>
      </div>

      <!-- Chart -->
      <div class="bg-white rounded-lg shadow p-6 mb-8">
        <h3 class="text-lg font-semibold mb-4">Emissions by Scope</h3>
        <canvas id="scopeChart" height="100"></canvas>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
        <div id="recent-activity" class="space-y-3">
          <p class="text-gray-500">No activity yet. Start by adding emission data.</p>
        </div>
      </div>
    </div>

    <!-- Input Data Tab -->
    <div id="input-tab" class="tab-content hidden">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">Add Emission Data</h2>

        <form id="emission-form" class="space-y-6">
          <!-- Scope Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Scope Classification *
            </label>
            <select id="scope" name="scope" required
                    class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
              <option value="">Select Scope...</option>
              <option value="scope_1">Scope 1: Direct Emissions</option>
              <option value="scope_2">Scope 2: Purchased Electricity</option>
              <option value="scope_3">Scope 3: Value Chain Emissions</option>
            </select>
            <p class="text-sm text-gray-500 mt-1" id="scope-description"></p>
          </div>

          <!-- Source Type (populated based on scope) -->
          <div id="source-type-container" class="hidden">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Emission Source *
            </label>
            <select id="source-type" name="sourceType" required
                    class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
              <option value="">Select Source...</option>
            </select>
          </div>

          <!-- Quantity and Unit -->
          <div id="input-fields-container" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input type="number" id="quantity" name="quantity"
                     min="0" step="0.01" required
                     class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                     placeholder="Enter quantity">
              <p class="text-sm text-red-500 hidden" id="quantity-error">
                Please enter a valid positive number
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select id="unit" name="unit" required
                      class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
                <option value="">Select Unit...</option>
              </select>
            </div>
          </div>

          <!-- Reporting Period -->
          <div id="period-container" class="hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                From Date *
              </label>
              <input type="date" id="date-from" name="dateFrom" required
                     class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                To Date *
              </label>
              <input type="date" id="date-to" name="dateTo" required
                     class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500">
            </div>
          </div>

          <!-- Notes -->
          <div id="notes-container" class="hidden">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea id="notes" name="notes" rows="3"
                      class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any additional notes..."></textarea>
          </div>

          <!-- Submit Buttons -->
          <div id="buttons-container" class="hidden flex space-x-4">
            <button type="button" id="cancel-btn"
                    class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit"
                    class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Calculate & Save
            </button>
          </div>
        </form>

        <!-- Calculation Result (shown after submission) -->
        <div id="calculation-result" class="hidden mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 class="text-lg font-semibold text-green-800 mb-4">✅ Calculation Complete</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-500">CO₂</p>
              <p class="text-xl font-bold" id="result-co2">0</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">CH₄</p>
              <p class="text-xl font-bold" id="result-ch4">0</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">N₂O</p>
              <p class="text-xl font-bold" id="result-n2o">0</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">CO₂e (Total)</p>
              <p class="text-xl font-bold text-green-600" id="result-co2e">0</p>
            </div>
          </div>
          <button id="add-another-btn"
                  class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Another Entry
          </button>
        </div>
      </div>
    </div>

    <!-- Reports Tab -->
    <div id="reports-tab" class="tab-content hidden">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-6">Reports</h2>
        <p class="text-gray-500">Report generation will be available after data entry.</p>
      </div>
    </div>

  </div>

  <!-- JavaScript Modules -->
  <script type="module" src="js/app.js"></script>

</body>
</html>
```

---

### Step 2: Scope Configuration (`js/modules/scopeConfig.js`)

**WHY:** Centralizes all scope definitions and emission sources. Makes it easy to add new sources without changing multiple files.

```javascript
// Scope definitions and emission source configurations
export const SCOPE_CONFIG = {
  scope_1: {
    name: "Scope 1: Direct Emissions",
    description: "Emissions from sources owned or controlled by your organization",
    color: "red",
    sources: {
      diesel_generator: {
        name: "Diesel Generator",
        units: ["liters"],
        defaultUnit: "liters"
      },
      diesel_vehicle: {
        name: "Diesel Vehicle",
        units: ["liters", "km"],
        defaultUnit: "liters"
      },
      petrol_vehicle: {
        name: "Petrol Vehicle",
        units: ["liters", "km"],
        defaultUnit: "liters"
      },
      lpg_combustion: {
        name: "LPG Combustion",
        units: ["kg"],
        defaultUnit: "kg"
      },
      refrigerant_leak: {
        name: "Refrigerant Leakage",
        units: ["kg"],
        defaultUnit: "kg"
      }
    }
  },
  scope_2: {
    name: "Scope 2: Purchased Electricity",
    description: "Indirect emissions from purchased electricity, heat, or steam",
    color: "blue",
    sources: {
      electricity_grid: {
        name: "Grid Electricity",
        units: ["kWh"],
        defaultUnit: "kWh"
      },
      purchased_heat: {
        name: "Purchased Heat",
        units: ["kWh", "MJ"],
        defaultUnit: "kWh"
      }
    }
  },
  scope_3: {
    name: "Scope 3: Value Chain Emissions",
    description: "All other indirect emissions in the value chain",
    color: "green",
    sources: {
      office_paper: {
        name: "Office Paper",
        units: ["reams", "kg"],
        defaultUnit: "reams"
      },
      waste_landfill: {
        name: "Waste (Landfill)",
        units: ["kg"],
        defaultUnit: "kg"
      },
      waste_recycled: {
        name: "Waste (Recycled)",
        units: ["kg"],
        defaultUnit: "kg"
      },
      employee_commuting: {
        name: "Employee Commuting",
        units: ["km"],
        defaultUnit: "km"
      },
      equipment_purchase: {
        name: "Equipment Purchase",
        units: ["USD", "LKR"],
        defaultUnit: "USD"
      }
    }
  }
};

// Get sources for a specific scope
export function getSourcesForScope(scope) {
  return SCOPE_CONFIG[scope]?.sources || {};
}

// Get scope description
export function getScopeDescription(scope) {
  return SCOPE_CONFIG[scope]?.description || "";
}
```

---

### Step 3: Input Validator (`js/modules/validator.js`)

**WHY:** Validates data BEFORE sending to backend. Prevents bad data from entering the system.

```javascript
// Input validation module
export class Validator {

  // Validate quantity (must be positive number)
  static validateQuantity(value) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return { valid: false, error: "Please enter a valid number" };
    }
    if (num < 0) {
      return { valid: false, error: "Quantity cannot be negative" };
    }
    if (num > 1000000) {
      return { valid: false, error: "Quantity seems too large. Please verify." };
    }
    return { valid: true, error: null };
  }

  // Validate scope selection
  static validateScope(scope) {
    const validScopes = ["scope_1", "scope_2", "scope_3"];
    if (!validScopes.includes(scope)) {
      return { valid: false, error: "Please select a valid scope" };
    }
    return { valid: true, error: null };
  }

  // Validate source type
  static validateSourceType(sourceType) {
    if (!sourceType || sourceType.trim() === "") {
      return { valid: false, error: "Please select an emission source" };
    }
    return { valid: true, error: null };
  }

  // Validate date range
  static validateDateRange(dateFrom, dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (isNaN(from.getTime())) {
      return { valid: false, error: "Please enter a valid start date" };
    }
    if (isNaN(to.getTime())) {
      return { valid: false, error: "Please enter a valid end date" };
    }
    if (from > to) {
      return { valid: false, error: "Start date cannot be after end date" };
    }
    if (to > new Date()) {
      return { valid: false, error: "End date cannot be in the future" };
    }
    return { valid: true, error: null };
  }

  // Validate entire form
  static validateForm(formData) {
    const errors = [];

    const scopeResult = this.validateScope(formData.scope);
    if (!scopeResult.valid) errors.push(scopeResult.error);

    const sourceResult = this.validateSourceType(formData.sourceType);
    if (!sourceResult.valid) errors.push(sourceResult.error);

    const quantityResult = this.validateQuantity(formData.quantity);
    if (!quantityResult.valid) errors.push(quantityResult.error);

    const dateResult = this.validateDateRange(formData.dateFrom, formData.dateTo);
    if (!dateResult.valid) errors.push(dateResult.error);

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}
```

---

### Step 4: API Module (`js/modules/api.js`)

**WHY:** Handles all communication with the backend. Keeps API logic separate from UI logic.

```javascript
// API communication module
const API_BASE_URL = "http://localhost:3000/api";

export class ApiService {

  // Send emission data to backend for calculation
  static async calculateEmissions(data) {
    try {
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Calculation failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all emissions for dashboard
  static async getEmissions() {
    try {
      const response = await fetch(`${API_BASE_URL}/emissions`);
      if (!response.ok) {
        throw new Error("Failed to fetch emissions");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get emission summary by scope
  static async getSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
```

---

### Step 5: Form Handler (`js/modules/formHandler.js`)

**WHY:** Manages form behavior — showing/hiding fields, handling submissions, displaying results.

```javascript
// Form handling module
import { getSourcesForScope, getScopeDescription } from './scopeConfig.js';
import { Validator } from './validator.js';
import { ApiService } from './api.js';

export class FormHandler {

  constructor() {
    this.form = document.getElementById('emission-form');
    this.scopeSelect = document.getElementById('scope');
    this.sourceTypeSelect = document.getElementById('source-type');
    this.unitSelect = document.getElementById('unit');

    this.init();
  }

  init() {
    // Listen for scope changes
    this.scopeSelect.addEventListener('change', (e) => {
      this.onScopeChange(e.target.value);
    });

    // Listen for source type changes
    this.sourceTypeSelect.addEventListener('change', (e) => {
      this.onSourceTypeChange(e.target.value);
    });

    // Listen for form submission
    this.form.addEventListener('submit', (e) => {
      this.onSubmit(e);
    });

    // Cancel button
    document.getElementById('cancel-btn').addEventListener('click', () => {
      this.resetForm();
    });

    // Add another button
    document.getElementById('add-another-btn').addEventListener('click', () => {
      this.resetForm();
    });
  }

  // When scope changes, update source type options
  onScopeChange(scope) {
    // Show scope description
    const description = getScopeDescription(scope);
    document.getElementById('scope-description').textContent = description;

    // Get sources for this scope
    const sources = getSourcesForScope(scope);

    // Clear and populate source type dropdown
    this.sourceTypeSelect.innerHTML = '<option value="">Select Source...</option>';
    Object.entries(sources).forEach(([key, source]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = source.name;
      this.sourceTypeSelect.appendChild(option);
    });

    // Show source type container
    document.getElementById('source-type-container').classList.remove('hidden');

    // Hide other containers
    document.getElementById('input-fields-container').classList.add('hidden');
    document.getElementById('period-container').classList.add('hidden');
    document.getElementById('notes-container').classList.add('hidden');
    document.getElementById('buttons-container').classList.add('hidden');
  }

  // When source type changes, update unit options
  onSourceTypeChange(sourceType) {
    const scope = this.scopeSelect.value;
    const sources = getSourcesForScope(scope);
    const source = sources[sourceType];

    if (!source) return;

    // Clear and populate unit dropdown
    this.unitSelect.innerHTML = '<option value="">Select Unit...</option>';
    source.units.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit;
      option.textContent = unit;
      this.unitSelect.appendChild(option);
    });

    // Set default unit
    this.unitSelect.value = source.defaultUnit;

    // Show remaining containers
    document.getElementById('input-fields-container').classList.remove('hidden');
    document.getElementById('period-container').classList.remove('hidden');
    document.getElementById('notes-container').classList.remove('hidden');
    document.getElementById('buttons-container').classList.remove('hidden');
  }

  // Handle form submission
  async onSubmit(e) {
    e.preventDefault();

    // Get form data
    const formData = {
      scope: this.scopeSelect.value,
      sourceType: this.sourceTypeSelect.value,
      quantity: parseFloat(document.getElementById('quantity').value),
      unit: this.unitSelect.value,
      dateFrom: document.getElementById('date-from').value,
      dateTo: document.getElementById('date-to').value,
      notes: document.getElementById('notes').value
    };

    // Validate
    const validation = Validator.validateForm(formData);
    if (!validation.valid) {
      alert("Validation errors:\n" + validation.errors.join("\n"));
      return;
    }

    try {
      // Send to backend
      const result = await ApiService.calculateEmissions(formData);

      // Display result
      this.displayResult(result.data);

    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  // Display calculation result
  displayResult(data) {
    document.getElementById('result-co2').textContent = data.co2.toFixed(2) + " kg";
    document.getElementById('result-ch4').textContent = data.ch4.toFixed(4) + " kg";
    document.getElementById('result-n2o').textContent = data.n2o.toFixed(4) + " kg";
    document.getElementById('result-co2e').textContent = data.co2e.toFixed(2) + " kg";

    document.getElementById('calculation-result').classList.remove('hidden');
    this.form.classList.add('hidden');
  }

  // Reset form to initial state
  resetForm() {
    this.form.reset();
    this.form.classList.remove('hidden');
    document.getElementById('calculation-result').classList.add('hidden');
    document.getElementById('source-type-container').classList.add('hidden');
    document.getElementById('input-fields-container').classList.add('hidden');
    document.getElementById('period-container').classList.add('hidden');
    document.getElementById('notes-container').classList.add('hidden');
    document.getElementById('buttons-container').classList.add('hidden');
    document.getElementById('scope-description').textContent = "";
  }
}
```

---

### Step 6: UI Module (`js/modules/ui.js`)

**WHY:** Handles all UI updates — dashboard, charts, recent activity.

```javascript
// UI update module
export class UIManager {

  // Update dashboard summary cards
  static updateSummary(summary) {
    document.getElementById('total-co2e').textContent =
      summary.total.toFixed(2);
    document.getElementById('scope1-total').textContent =
      summary.scope1.toFixed(2);
    document.getElementById('scope2-total').textContent =
      summary.scope2.toFixed(2);
    document.getElementById('scope3-total').textContent =
      summary.scope3.toFixed(2);
  }

  // Update scope chart
  static updateScopeChart(summary) {
    const ctx = document.getElementById('scopeChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.scopeChartInstance) {
      window.scopeChartInstance.destroy();
    }

    window.scopeChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Scope 1 (Direct)', 'Scope 2 (Electricity)', 'Scope 3 (Value Chain)'],
        datasets: [{
          data: [summary.scope1, summary.scope2, summary.scope3],
          backgroundColor: ['#EF4444', '#3B82F6', '#22C55E'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw.toFixed(2)} kg CO₂e (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Update recent activity list
  static updateRecentActivity(emissions) {
    const container = document.getElementById('recent-activity');

    if (emissions.length === 0) {
      container.innerHTML = '<p class="text-gray-500">No activity yet. Start by adding emission data.</p>';
      return;
    }

    // Show last 5 entries
    const recent = emissions.slice(-5).reverse();
    container.innerHTML = recent.map(entry => `
      <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
        <div>
          <span class="font-medium">${entry.sourceType}</span>
          <span class="text-gray-500 text-sm ml-2">${entry.quantity} ${entry.unit}</span>
        </div>
        <div class="text-right">
          <span class="font-bold text-green-600">${entry.co2e.toFixed(2)} kg CO₂e</span>
          <span class="text-gray-400 text-sm block">${new Date(entry.date).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');
  }
}
```

---

### Step 7: Main App (`js/app.js`)

**WHY:** Entry point that initializes all modules and handles tab navigation.

```javascript
// Main application entry point
import { FormHandler } from './modules/formHandler.js';
import { UIManager } from './modules/ui.js';
import { ApiService } from './modules/api.js';

class CarbonAccountingApp {

  constructor() {
    this.formHandler = new FormHandler();
    this.initTabs();
    this.loadDashboard();
  }

  // Initialize tab navigation
  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Update button styles
        tabButtons.forEach(btn => {
          btn.classList.remove('bg-blue-500', 'text-white');
          btn.classList.add('bg-gray-200', 'text-gray-700');
        });
        button.classList.remove('bg-gray-200', 'text-gray-700');
        button.classList.add('bg-blue-500', 'text-white');

        // Show/hide tab content
        tabContents.forEach(content => {
          content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
      });
    });
  }

  // Load dashboard data
  async loadDashboard() {
    try {
      const summary = await ApiService.getSummary();
      UIManager.updateSummary(summary.data);
      UIManager.updateScopeChart(summary.data);

      const emissions = await ApiService.getEmissions();
      UIManager.updateRecentActivity(emissions.data);
    } catch (error) {
      console.log("Dashboard will load after first data entry");
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CarbonAccountingApp();
});
```

---

## Common Mistakes

❌ **Mistake 1:** Putting all JavaScript in one giant file
✅ **Solution:** Split into modules (formHandler, validator, api, ui)

❌ **Mistake 2:** No input validation before API calls
✅ **Solution:** Validate in `validator.js` before sending to backend

❌ **Mistake 3:** Hardcoding scope options in HTML
✅ **Solution:** Use `scopeConfig.js` to define scopes dynamically

❌ **Mistake 4:** Not handling API errors
✅ **Solution:** Use try/catch in `api.js` and show user-friendly messages

❌ **Mistake 5:** Not showing calculation details
✅ **Solution:** Display CO₂, CH₄, N₂O separately before converting to CO₂e

---

## Next Action

Now that the frontend is built, proceed to **Phase 6: Backend** to create the Node.js/Express server with the calculation engine.

---

*Phase 5 Complete ✅*
*Next: Phase 6 — Backend (GHG Calculation Engine)*

---

## Phase 5 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D5.1 | Project Structure & File Organization | Git repo structure | Frontend Lead |
| D5.2 | Main HTML File (index.html) | HTML file | Frontend Developer |
| D5.3 | Scope Configuration Module | JavaScript module | Frontend Developer |
| D5.4 | Input Validation Module | JavaScript module | Frontend Developer |
| D5.5 | API Communication Module | JavaScript module | Frontend Developer |
| D5.6 | Form Handler Module | JavaScript module | Frontend Developer |
| D5.7 | UI Manager Module | JavaScript module | Frontend Developer |
| D5.8 | Main App Entry Point | JavaScript module | Frontend Developer |
| D5.9 | Frontend Unit Tests | Test files | QA Engineer |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M5.1 | Project Structure Created | All folders and base files in place | Week 1 Day 2 |
| M5.2 | Dashboard UI Complete | Dashboard renders with mock data | Week 1 Day 5 |
| M5.3 | Input Form Complete | All scope/source selections functional | Week 2 Day 3 |
| M5.4 | Client-Side Validation Working | All validation rules enforced | Week 2 Day 5 |
| M5.5 | Frontend Modules Complete | All modules implemented and tested | Week 3 Day 3 |
| M5.6 | Frontend Ready for Integration | Works with mock API responses | Week 3 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Frontend Lead | Architecture, module structure, code review |
| Frontend Developer | HTML, CSS, JavaScript implementation |
| UI/UX Designer | Design fidelity verification |
| QA Engineer | Frontend unit testing |

### Estimated Timeline: 3 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Project setup, HTML structure, dashboard UI, tab navigation |
| Week 2 | Input forms, scope configuration, validation module, form handler |
| Week 3 | API module, UI manager, main app integration, unit testing |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Browser compatibility issues | Medium | Medium | Test on Chrome/Firefox/Edge throughout development |
| Form validation gaps | High | Medium | Follow validation spec from Phase 4 exactly |
| Module dependency conflicts | Low | Low | Use ES6 modules; clear import/export structure |
| Scope configuration errors | High | Low | Unit test scope mapping exhaustively |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Code coverage (unit tests) | > 80% | Jest/test runner report |
| Form validation accuracy | 100% | All edge cases tested |
| Browser compatibility | Chrome, Firefox, Edge | Manual testing |
| Page load time | < 3 seconds | Lighthouse audit |
| Design fidelity | > 95% | Visual comparison with wireframes |

### Transition Criteria to Phase 6

- [x] All frontend modules implemented
- [x] Dashboard renders correctly with mock data
- [x] Input forms validate all required fields
- [x] Tab navigation works across all views
- [x] Unit tests passing (>80% coverage)
- [x] Code reviewed and approved
