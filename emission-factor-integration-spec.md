# Emission Factor Database Integration Specification

## International Standards: DEFRA + NGER + IPCC

---

## SYSTEM OBJECTIVE

Create a dynamic, standardized emission calculation engine that automatically links activity data with validated international emission factors from DEFRA (UK), NGER (Australia), and IPCC, with Sri Lanka localization.

---

## 1. EMISSION FACTOR DATABASE MODULE

### Database Schema

```javascript
// MongoDB Schema for Emission Factors
const emissionFactorSchema = new mongoose.Schema({
  // Identification
  factorId: {
    type: String,
    unique: true,
    required: true
  },

  // Classification
  category: {
    type: String,
    enum: ['Fuel', 'Electricity', 'Transport', 'Waste', 'Refrigerants', 'Materials', 'Water'],
    required: true
  },

  activityType: {
    type: String,
    required: true
  },

  // Measurement
  unit: {
    type: String,
    required: true
  },

  // Emission Factor Values
  emissionFactor: {
    co2e: { type: Number, required: true },      // Total CO2e
    co2: { type: Number, default: 0 },           // CO2 component
    ch4: { type: Number, default: 0 },           // CH4 component
    n2o: { type: Number, default: 0 },           // N2O component
    unit: { type: String, required: true }       // kgCO2e/unit
  },

  // Source Information
  source: {
    type: String,
    enum: ['DEFRA', 'NGER', 'IPCC', 'Sri_Lanka_CEA', 'EPA', 'Custom'],
    required: true
  },

  sourceDocument: {
    type: String,
    description: "Full reference to source document"
  },

  // Version Control
  year: {
    type: Number,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // Geographic
  country: {
    type: String,
    default: 'Global'
  },

  region: {
    type: String,
    default: 'Global'
  },

  // Scope Classification
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true
  },

  // Upstream/Downstream tagging for Scope 3
  valueChainPosition: {
    type: String,
    enum: ['upstream', 'downstream', 'both', 'na'],
    default: 'na'
  },

  // Data Quality
  dataQuality: {
    type: String,
    enum: ['primary', 'secondary', 'tertiary'],
    default: 'secondary'
  },

  // Metadata
  notes: String,
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Indexes for fast lookup
emissionFactorSchema.index({ category: 1, activityType: 1, year: 1, source: 1 });
emissionFactorSchema.index({ scope: 1 });
emissionFactorSchema.index({ country: 1, isActive: 1 });
```

### Sample Emission Factor Data

```javascript
// DEFRA 2024 Examples
{
  factorId: "DEFRA_2024_FUEL_DIESEL",
  category: "Fuel",
  activityType: "Diesel",
  unit: "liter",
  emissionFactor: {
    co2e: 2.515,
    co2: 2.515,
    ch4: 0.0002,
    n2o: 0.00006,
    unit: "kgCO2e/liter"
  },
  source: "DEFRA",
  sourceDocument: "DEFRA GHG Conversion Factors 2024",
  year: 2024,
  country: "UK",
  scope: "scope_1",
  valueChainPosition: "na",
  dataQuality: "secondary"
}

// NGER 2024 Examples
{
  factorId: "NGER_2024_ELEC_GRID_NSW",
  category: "Electricity",
  activityType: "Grid Electricity - NSW",
  unit: "kWh",
  emissionFactor: {
    co2e: 0.79,
    co2: 0.79,
    ch4: 0.00001,
    n2o: 0.000005,
    unit: "kgCO2e/kWh"
  },
  source: "NGER",
  sourceDocument: "NGER Measurement Determination 2024",
  year: 2024,
  country: "Australia",
  region: "NSW",
  scope: "scope_2",
  valueChainPosition: "na",
  dataQuality: "secondary"
}

// Sri Lanka CEA Examples
{
  factorId: "SL_CEA_2024_ELEC_GRID",
  category: "Electricity",
  activityType: "Grid Electricity",
  unit: "kWh",
  emissionFactor: {
    co2e: 0.57,
    co2: 0.57,
    ch4: 0.00001,
    n2o: 0.000005,
    unit: "kgCO2e/kWh"
  },
  source: "Sri_Lanka_CEA",
  sourceDocument: "Sri Lanka CEA Grid Emission Factor 2024",
  year: 2024,
  country: "Sri Lanka",
  scope: "scope_2",
  valueChainPosition: "na",
  dataQuality: "primary"
}
```

---

## 2. AUTO-FACTOR MAPPING ENGINE

### Logic Flow

```
┌─────────────────────────────────────────────────────────────┐
│                AUTO-FACTOR MAPPING ENGINE                    │
└─────────────────────────────────────────────────────────────┘

User Input: "Diesel – 200 liters"
       │
       ▼
┌─────────────────┐
│  PARSE INPUT    │
│                 │
│  Category: Fuel │
│  Type: Diesel   │
│  Qty: 200       │
│  Unit: liters   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LOOKUP FACTOR  │
│                 │
│  Priority:      │
│  1. Sri Lanka   │
│  2. DEFRA       │
│  3. NGER        │
│  4. IPCC        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RETURN FACTOR  │
│                 │
│  Factor: 2.515  │
│  Source: DEFRA  │
│  Year: 2024     │
│  Label: "Assumed│
│   Factor" if    │
│   not Sri Lanka │
└─────────────────┘
```

### Implementation

```javascript
// backend/services/factorMappingService.js

class FactorMappingService {

  /**
   * Auto-map emission factor with fallback logic
   * Priority: Sri Lanka → DEFRA → NGER → IPCC
   */
  async getEmissionFactor(category, activityType, unit, country = 'Sri Lanka') {
    const currentYear = new Date().getFullYear();

    // Priority 1: Country-specific factor (Sri Lanka)
    let factor = await this.findFactor({
      category,
      activityType,
      unit,
      country,
      isActive: true,
      year: { $gte: currentYear - 2 } // Last 2 years
    });

    if (factor) {
      factor.isAssumed = false;
      return factor;
    }

    // Priority 2: DEFRA (UK) - Most comprehensive
    factor = await this.findFactor({
      category,
      activityType,
      unit,
      source: 'DEFRA',
      isActive: true,
      year: { $gte: currentYear - 2 }
    });

    if (factor) {
      factor.isAssumed = true;
      factor.assumedSource = 'DEFRA (UK)';
      return factor;
    }

    // Priority 3: NGER (Australia)
    factor = await this.findFactor({
      category,
      activityType,
      unit,
      source: 'NGER',
      isActive: true,
      year: { $gte: currentYear - 2 }
    });

    if (factor) {
      factor.isAssumed = true;
      factor.assumedSource = 'NGER (Australia)';
      return factor;
    }

    // Priority 4: IPCC (Global default)
    factor = await this.findFactor({
      category,
      activityType,
      unit,
      source: 'IPCC',
      isActive: true
    });

    if (factor) {
      factor.isAssumed = true;
      factor.assumedSource = 'IPCC (Global)';
      return factor;
    }

    // No factor found
    throw new Error(
      `No emission factor found for: ${category} - ${activityType} - ${unit}`
    );
  }

  /**
   * Find factor in database
   */
  async findFactor(query) {
    return await EmissionFactor.findOne(query)
      .sort({ year: -1 }); // Get most recent
  }

  /**
   * Get all available factors for dropdown
   */
  async getFactorsForDropdown(category = null) {
    const query = { isActive: true };
    if (category) query.category = category;

    const factors = await EmissionFactor.find(query)
      .select('category activityType unit emissionFactor.co2e source year country')
      .sort({ category: 1, activityType: 1 });

    // Group by category
    const grouped = {};
    factors.forEach(f => {
      if (!grouped[f.category]) grouped[f.category] = [];
      grouped[f.category].push({
        id: f._id,
        activityType: f.activityType,
        unit: f.unit,
        factor: f.emissionFactor.co2e,
        source: f.source,
        year: f.year,
        country: f.country
      });
    });

    return grouped;
  }
}

module.exports = new FactorMappingService();
```

---

## 3. SCOPE CLASSIFICATION ENGINE

### Classification Rules

```javascript
// backend/services/scopeClassificationService.js

class ScopeClassificationService {

  /**
   * Auto-assign scope based on category and activity type
   */
  classifyScope(category, activityType) {
    const rules = {
      // SCOPE 1: Direct Emissions
      'Fuel': {
        'Diesel': 'scope_1',
        'Petrol': 'scope_1',
        'LPG': 'scope_1',
        'Natural Gas': 'scope_1',
        'Coal': 'scope_1',
        'Fuel Oil': 'scope_1'
      },
      'Refrigerants': {
        '*': 'scope_1'  // All refrigerants are Scope 1
      },

      // SCOPE 2: Indirect from Purchased Energy
      'Electricity': {
        '*': 'scope_2'  // All electricity is Scope 2
      },

      // SCOPE 3: Value Chain
      'Transport': {
        '*': 'scope_3'  // All transport is Scope 3
      },
      'Waste': {
        '*': 'scope_3'  // All waste is Scope 3
      },
      'Materials': {
        '*': 'scope_3'  // All materials are Scope 3
      },
      'Water': {
        '*': 'scope_3'  // All water is Scope 3
      }
    };

    // Check category rules
    const categoryRules = rules[category];
    if (!categoryRules) {
      return { scope: 'unknown', confidence: 'low' };
    }

    // Check specific activity type
    if (categoryRules[activityType]) {
      return {
        scope: categoryRules[activityType],
        confidence: 'high'
      };
    }

    // Check wildcard
    if (categoryRules['*']) {
      return {
        scope: categoryRules['*'],
        confidence: 'medium'
      };
    }

    return { scope: 'unknown', confidence: 'low' };
  }

  /**
   * Get value chain position for Scope 3
   */
  getValueChainPosition(category, activityType) {
    const upstreamCategories = ['Materials', 'Fuel', 'Electricity'];
    const downstreamCategories = ['Waste', 'Transport'];

    if (upstreamCategories.includes(category)) {
      return 'upstream';
    }
    if (downstreamCategories.includes(category)) {
      return 'downstream';
    }
    return 'na';
  }

  /**
   * Get all scope classifications for reporting
   */
  async getScopeSummary(organizationId, startDate, endDate) {
    const calculations = await Calculation.find({
      organizationId,
      calculatedAt: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      scope1: { total: 0, sources: {} },
      scope2: { total: 0, sources: {} },
      scope3: { total: 0, sources: {} }
    };

    calculations.forEach(calc => {
      const scopeKey = `scope${calc.scope.replace('scope_', '')}`;
      summary[scopeKey].total += calc.co2e;

      if (!summary[scopeKey].sources[calc.sourceType]) {
        summary[scopeKey].sources[calc.sourceType] = 0;
      }
      summary[scopeKey].sources[calc.sourceType] += calc.co2e;
    });

    return summary;
  }
}

module.exports = new ScopeClassificationService();
```

---

## 4. ENHANCED CALCULATION ENGINE

### Implementation

```javascript
// backend/services/calculationEngine.js

const factorMappingService = require('./factorMappingService');
const scopeClassificationService = require('./scopeClassificationService');

class CalculationEngine {

  /**
   * Calculate emissions from activity data
   */
  async calculateEmissions(activityData) {
    const {
      category,
      activityType,
      quantity,
      unit,
      dateFrom,
      dateTo,
      organizationId,
      userId
    } = activityData;

    // Step 1: Get emission factor (auto-mapped)
    const factor = await factorMappingService.getEmissionFactor(
      category,
      activityType,
      unit
    );

    // Step 2: Classify scope
    const scopeClassification = scopeClassificationService.classifyScope(
      category,
      activityType
    );

    // Step 3: Calculate emissions
    // Formula: Emission = Activity Data × Emission Factor
    const co2e = quantity * factor.emissionFactor.co2e;
    const co2 = quantity * factor.emissionFactor.co2;
    const ch4 = quantity * factor.emissionFactor.ch4;
    const n2o = quantity * factor.emissionFactor.n2o;

    // Step 4: Get value chain position (for Scope 3)
    const valueChainPosition = scopeClassificationService.getValueChainPosition(
      category,
      activityType
    );

    // Step 5: Create calculation record
    const calculation = await Calculation.create({
      organizationId,
      userId,
      activityData: {
        category,
        activityType,
        quantity,
        unit,
        dateFrom,
        dateTo
      },
      scope: scopeClassification.scope,
      valueChainPosition,
      emissions: {
        co2e: Math.round(co2e * 1000) / 1000,
        co2: Math.round(co2 * 1000) / 1000,
        ch4: Math.round(ch4 * 10000) / 10000,
        n2o: Math.round(n2o * 100000) / 100000
      },
      factorUsed: {
        factorId: factor.factorId,
        source: factor.source,
        year: factor.year,
        country: factor.country,
        isAssumed: factor.isAssumed || false,
        assumedSource: factor.assumedSource || null
      },
      calculatedAt: new Date()
    });

    // Step 6: Create audit log
    await AuditLog.create({
      userId,
      action: 'CALCULATE',
      collection: 'Calculation',
      recordId: calculation._id,
      newValue: {
        category,
        activityType,
        quantity,
        co2e: calculation.emissions.co2e,
        scope: scopeClassification.scope,
        factorSource: factor.source
      }
    });

    return calculation;
  }

  /**
   * Calculate monthly summary
   */
  async getMonthlySummary(organizationId, year) {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0);

      const calculations = await Calculation.find({
        organizationId,
        'activityData.dateFrom': { $gte: startDate },
        'activityData.dateTo': { $lte: endDate }
      });

      const monthSummary = {
        month: m,
        scope1: 0,
        scope2: 0,
        scope3: 0,
        total: 0
      };

      calculations.forEach(calc => {
        const scopeKey = `scope${calc.scope.replace('scope_', '')}`;
        monthSummary[scopeKey] += calc.emissions.co2e;
        monthSummary.total += calc.emissions.co2e;
      });

      months.push(monthSummary);
    }

    return months;
  }

  /**
   * Get top emission sources
   */
  async getTopSources(organizationId, startDate, endDate, limit = 10) {
    const calculations = await Calculation.find({
      organizationId,
      calculatedAt: { $gte: startDate, $lte: endDate }
    });

    // Group by activity type
    const sourceTotals = {};
    calculations.forEach(calc => {
      const key = calc.activityData.activityType;
      if (!sourceTotals[key]) {
        sourceTotals[key] = {
          activityType: key,
          category: calc.activityData.category,
          scope: calc.scope,
          totalCo2e: 0,
          count: 0
        };
      }
      sourceTotals[key].totalCo2e += calc.emissions.co2e;
      sourceTotals[key].count += 1;
    });

    // Sort and return top sources
    return Object.values(sourceTotals)
      .sort((a, b) => b.totalCo2e - a.totalCo2e)
      .slice(0, limit);
  }
}

module.exports = new CalculationEngine();
```

---

## 5. USER INTERFACE (UI)

### Input Form with Auto-Fill

```html
<!-- Emission Input Form -->
<div class="bg-white rounded-lg shadow p-6">
  <h2 class="text-2xl font-bold mb-6">Add Emission Data</h2>

  <form id="emission-form" class="space-y-6">

    <!-- Category Selection -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Category *
      </label>
      <select id="category" name="category" required
              class="w-full border border-gray-300 rounded-lg p-3">
        <option value="">Select Category...</option>
        <option value="Fuel">Fuel</option>
        <option value="Electricity">Electricity</option>
        <option value="Transport">Transport</option>
        <option value="Waste">Waste</option>
        <option value="Refrigerants">Refrigerants</option>
        <option value="Materials">Materials</option>
        <option value="Water">Water</option>
      </select>
    </div>

    <!-- Activity Type (Auto-populated based on category) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Activity Type *
      </label>
      <select id="activity-type" name="activityType" required
              class="w-full border border-gray-300 rounded-lg p-3">
        <option value="">Select Activity...</option>
      </select>
    </div>

    <!-- Quantity and Unit -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Quantity *
        </label>
        <input type="number" id="quantity" name="quantity"
               min="0" step="0.01" required
               class="w-full border border-gray-300 rounded-lg p-3">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Unit *
        </label>
        <input type="text" id="unit" name="unit" readonly
               class="w-full border border-gray-300 rounded-lg p-3 bg-gray-100">
      </div>
    </div>

    <!-- Emission Factor (Auto-filled, locked) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Emission Factor (kgCO₂e/unit)
      </label>
      <div class="flex items-center space-x-4">
        <input type="text" id="emission-factor" readonly
               class="w-full border border-gray-300 rounded-lg p-3 bg-gray-100">
        <span id="factor-source" class="text-sm text-gray-500"></span>
        <span id="assumed-label" class="hidden text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Assumed Factor
        </span>
      </div>
    </div>

    <!-- Scope (Auto-assigned) -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Scope Classification
      </label>
      <div id="scope-display" class="p-3 bg-gray-100 rounded-lg">
        <span id="scope-text" class="font-medium"></span>
        <span id="scope-confidence" class="text-sm text-gray-500 ml-2"></span>
      </div>
    </div>

    <!-- Date Range -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          From Date *
        </label>
        <input type="date" id="date-from" name="dateFrom" required
               class="w-full border border-gray-300 rounded-lg p-3">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          To Date *
        </label>
        <input type="date" id="date-to" name="dateTo" required
               class="w-full border border-gray-300 rounded-lg p-3">
      </div>
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Notes (optional)
      </label>
      <textarea id="notes" name="notes" rows="3"
                class="w-full border border-gray-300 rounded-lg p-3"></textarea>
    </div>

    <!-- Submit -->
    <div class="flex space-x-4">
      <button type="submit"
              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Calculate & Save
      </button>
      <button type="reset"
              class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
        Reset
      </button>
    </div>
  </form>
</div>
```

### JavaScript for Auto-Fill

```javascript
// js/modules/emissionForm.js

class EmissionForm {

  constructor() {
    this.categorySelect = document.getElementById('category');
    this.activitySelect = document.getElementById('activity-type');
    this.unitInput = document.getElementById('unit');
    this.factorInput = document.getElementById('emission-factor');
    this.scopeText = document.getElementById('scope-text');
    this.assumedLabel = document.getElementById('assumed-label');

    this.factorsData = {};
    this.init();
  }

  async init() {
    // Load all factors on page load
    await this.loadFactors();

    // Listen for category changes
    this.categorySelect.addEventListener('change', () => {
      this.onCategoryChange();
    });

    // Listen for activity changes
    this.activitySelect.addEventListener('change', () => {
      this.onActivityChange();
    });
  }

  async loadFactors() {
    try {
      const response = await fetch('/api/factors/dropdown');
      this.factorsData = await response.json();
    } catch (error) {
      console.error('Failed to load factors:', error);
    }
  }

  onCategoryChange() {
    const category = this.categorySelect.value;

    // Clear activity dropdown
    this.activitySelect.innerHTML = '<option value="">Select Activity...</option>';

    if (!category || !this.factorsData[category]) return;

    // Populate activity dropdown
    this.factorsData[category].forEach(item => {
      const option = document.createElement('option');
      option.value = item.activityType;
      option.textContent = `${item.activityType} (${item.source} ${item.year})`;
      option.dataset.unit = item.unit;
      option.dataset.factor = item.factor;
      option.dataset.source = item.source;
      this.activitySelect.appendChild(option);
    });
  }

  onActivityChange() {
    const selected = this.activitySelect.options[this.activitySelect.selectedIndex];

    if (!selected.value) {
      this.unitInput.value = '';
      this.factorInput.value = '';
      this.scopeText.textContent = '';
      return;
    }

    // Auto-fill unit
    this.unitInput.value = selected.dataset.unit;

    // Auto-fill emission factor
    this.factorInput.value = selected.dataset.factor;

    // Show source
    document.getElementById('factor-source').textContent =
      `Source: ${selected.dataset.source}`;

    // Auto-classify scope
    const category = this.categorySelect.value;
    const scope = this.classifyScope(category);
    this.scopeText.textContent = scope.text;
    this.scopeText.className = scope.color;

    // Show "Assumed Factor" label if not Sri Lanka
    if (selected.dataset.source !== 'Sri_Lanka_CEA') {
      this.assumedLabel.classList.remove('hidden');
    } else {
      this.assumedLabel.classList.add('hidden');
    }
  }

  classifyScope(category) {
    const scopeMap = {
      'Fuel': { text: 'Scope 1: Direct Emissions', color: 'text-red-600' },
      'Refrigerants': { text: 'Scope 1: Direct Emissions', color: 'text-red-600' },
      'Electricity': { text: 'Scope 2: Purchased Electricity', color: 'text-blue-600' },
      'Transport': { text: 'Scope 3: Value Chain', color: 'text-green-600' },
      'Waste': { text: 'Scope 3: Value Chain', color: 'text-green-600' },
      'Materials': { text: 'Scope 3: Value Chain', color: 'text-green-600' },
      'Water': { text: 'Scope 3: Value Chain', color: 'text-green-600' }
    };
    return scopeMap[category] || { text: 'Unknown', color: 'text-gray-600' };
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new EmissionForm();
});
```

---

## 6. DATA VALIDATION & STANDARDIZATION

### Validation Rules

```javascript
// backend/middleware/emissionValidation.js

const validateEmissionInput = (req, res, next) => {
  const { category, activityType, quantity, unit, dateFrom, dateTo } = req.body;
  const errors = [];

  // Required fields
  if (!category) errors.push('Category is required');
  if (!activityType) errors.push('Activity type is required');
  if (!quantity && quantity !== 0) errors.push('Quantity is required');
  if (!unit) errors.push('Unit is required');
  if (!dateFrom) errors.push('Start date is required');
  if (!dateTo) errors.push('End date is required');

  // Quantity validation
  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      errors.push('Quantity must be a number');
    }
    if (quantity < 0) {
      errors.push('Quantity cannot be negative');
    }
    if (quantity > 10000000) {
      errors.push('Quantity exceeds maximum allowed value');
    }
  }

  // Unit consistency check
  const validUnits = {
    'Fuel': ['liter', 'kg', 'm3', 'gallon'],
    'Electricity': ['kWh', 'MWh'],
    'Transport': ['km', 'mile', 'passenger-km'],
    'Waste': ['kg', 'tonne'],
    'Refrigerants': ['kg'],
    'Materials': ['kg', 'tonne', 'unit'],
    'Water': ['m3', 'liter']
  };

  if (category && unit && validUnits[category]) {
    if (!validUnits[category].includes(unit)) {
      errors.push(`Invalid unit "${unit}" for category "${category}". Valid units: ${validUnits[category].join(', ')}`);
    }
  }

  // Date validation
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    if (from > to) {
      errors.push('Start date cannot be after end date');
    }
    if (to > new Date()) {
      errors.push('End date cannot be in the future');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Prevent manual factor override (except admin)
const protectFactorOverride = (req, res, next) => {
  if (req.body.emissionFactor && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can modify emission factors'
    });
  }
  next();
};

module.exports = { validateEmissionInput, protectFactorOverride };
```

---

## 7. REPORTING DASHBOARD

### Dashboard API Endpoints

```javascript
// backend/routes/dashboard.js

const express = require('express');
const router = express.Router();
const calculationEngine = require('../services/calculationEngine');
const { auth } = require('../middleware/auth');

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { year } = req.query;
    const organizationId = req.user.organizationId;

    // Get monthly data
    const monthlyData = await calculationEngine.getMonthlySummary(
      organizationId,
      parseInt(year) || new Date().getFullYear()
    );

    // Get scope totals
    const scopeSummary = await calculationEngine.getScopeSummary(
      organizationId,
      new Date(year, 0, 1),
      new Date(year, 11, 31)
    );

    // Get top sources
    const topSources = await calculationEngine.getTopSources(
      organizationId,
      new Date(year, 0, 1),
      new Date(year, 11, 31),
      10
    );

    res.json({
      success: true,
      data: {
        monthly: monthlyData,
        scopes: scopeSummary,
        topSources,
        totalCo2e: scopeSummary.scope1.total +
                   scopeSummary.scope2.total +
                   scopeSummary.scope3.total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export report (Excel/PDF)
router.get('/export', auth, async (req, res) => {
  try {
    const { format, year } = req.query;
    const organizationId = req.user.organizationId;

    const reportData = await calculationEngine.generateReport(
      organizationId,
      parseInt(year),
      format
    );

    if (format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=carbon-report-${year}.xlsx`);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=carbon-report-${year}.pdf`);
    }

    res.send(reportData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

---

## 8. UPDATE MECHANISM

### Admin Factor Upload

```javascript
// backend/routes/admin/factors.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { auth, authorize } = require('../../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Upload new DEFRA/NGER dataset
router.post('/upload',
  auth,
  authorize('admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      const { source, year } = req.body;
      const results = [];

      // Parse CSV file
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          results.push({
            factorId: `${source}_${year}_${row.category}_${row.activityType}`.replace(/\s+/g, '_'),
            category: row.category,
            activityType: row.activityType,
            unit: row.unit,
            emissionFactor: {
              co2e: parseFloat(row.co2e),
              co2: parseFloat(row.co2 || 0),
              ch4: parseFloat(row.ch4 || 0),
              n2o: parseFloat(row.n2o || 0),
              unit: `kgCO2e/${row.unit}`
            },
            source,
            year: parseInt(year),
            country: source === 'DEFRA' ? 'UK' : 'Australia',
            scope: row.scope || 'unknown',
            isActive: false, // Inactive until approved
            uploadedBy: req.user.id
          });
        })
        .on('end', async () => {
          // Save to database
          await EmissionFactor.insertMany(results);

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: `Uploaded ${results.length} factors from ${source} ${year}`,
            count: results.length
          });
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Activate a dataset version
router.post('/activate',
  auth,
  authorize('admin'),
  async (req, res) => {
    try {
      const { source, year } = req.body;

      // Deactivate all factors for this source
      await EmissionFactor.updateMany(
        { source },
        { isActive: false }
      );

      // Activate the selected year
      await EmissionFactor.updateMany(
        { source, year: parseInt(year) },
        { isActive: true }
      );

      // Audit log
      await AuditLog.create({
        userId: req.user.id,
        action: 'UPDATE',
        collection: 'EmissionFactor',
        recordId: null,
        newValue: { source, year, action: 'ACTIVATED' }
      });

      res.json({
        success: true,
        message: `Activated ${source} ${year} dataset`
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
```

---

## 9. LOCALIZATION (SRI LANKA)

### Sri Lanka Default Factors

```javascript
// data/sriLankaFactors.js

const sriLankaFactors = [
  {
    factorId: "SL_CEA_2024_ELEC_GRID",
    category: "Electricity",
    activityType: "Grid Electricity",
    unit: "kWh",
    emissionFactor: {
      co2e: 0.57,
      co2: 0.57,
      ch4: 0.00001,
      n2o: 0.000005,
      unit: "kgCO2e/kWh"
    },
    source: "Sri_Lanka_CEA",
    sourceDocument: "Sri Lanka CEA Grid Emission Factor 2024",
    year: 2024,
    country: "Sri Lanka",
    scope: "scope_2",
    dataQuality: "primary"
  },
  {
    factorId: "SL_CEA_2024_DIESEL",
    category: "Fuel",
    activityType: "Diesel",
    unit: "liter",
    emissionFactor: {
      co2e: 2.68,
      co2: 2.68,
      ch4: 0.0002,
      n2o: 0.00001,
      unit: "kgCO2e/liter"
    },
    source: "Sri_Lanka_CEA",
    sourceDocument: "Sri Lanka CEA Fuel Emission Factors 2024",
    year: 2024,
    country: "Sri Lanka",
    scope: "scope_1",
    dataQuality: "primary"
  },
  {
    factorId: "SL_CEA_2024_PETROL",
    category: "Fuel",
    activityType: "Petrol",
    unit: "liter",
    emissionFactor: {
      co2e: 2.31,
      co2: 2.31,
      ch4: 0.0003,
      n2o: 0.00002,
      unit: "kgCO2e/liter"
    },
    source: "Sri_Lanka_CEA",
    sourceDocument: "Sri Lanka CEA Fuel Emission Factors 2024",
    year: 2024,
    country: "Sri Lanka",
    scope: "scope_1",
    dataQuality: "primary"
  },
  {
    factorId: "SL_CEA_2024_LPG",
    category: "Fuel",
    activityType: "LPG",
    unit: "kg",
    emissionFactor: {
      co2e: 1.51,
      co2: 1.51,
      ch4: 0.0001,
      n2o: 0.00001,
      unit: "kgCO2e/kg"
    },
    source: "Sri_Lanka_CEA",
    sourceDocument: "Sri Lanka CEA Fuel Emission Factors 2024",
    year: 2024,
    country: "Sri Lanka",
    scope: "scope_1",
    dataQuality: "primary"
  }
];

module.exports = sriLankaFactors;
```

### Fallback Logic Display

```javascript
// When displaying factors to users
function formatFactorDisplay(factor) {
  let display = `${factor.emissionFactor.co2e} kgCO2e/${factor.unit}`;

  if (factor.isAssumed) {
    display += ` [Assumed: ${factor.assumedSource}]`;
  }

  if (factor.source === 'Sri_Lanka_CEA') {
    display += ` [Sri Lanka]`;
  }

  return display;
}
```

---

## 10. EXTENSIBILITY

### API-Based Database Integration (Future)

```javascript
// backend/services/externalFactorService.js

class ExternalFactorService {

  /**
   * Fetch factors from external API (future integration)
   */
  async fetchFromAPI(apiUrl, apiKey) {
    try {
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      return await response.json();
    } catch (error) {
      console.error('External API error:', error);
      return null;
    }
  }

  /**
   * Sync with external database
   */
  async syncExternalFactors(source, factors) {
    for (const factor of factors) {
      await EmissionFactor.findOneAndUpdate(
        { factorId: factor.factorId },
        factor,
        { upsert: true, new: true }
      );
    }
  }

  /**
   * Real-time energy monitoring integration (future)
   */
  async connectEnergyMonitor(meterId, apiKey) {
    // WebSocket connection to energy monitoring system
    // Returns real-time kWh consumption
  }

  /**
   * Carbon pricing API integration (future)
   */
  async getCarbonPrice(region) {
    // Fetch current carbon price from external API
    // EU ETS, UK ETS, voluntary markets
  }
}

module.exports = new ExternalFactorService();
```

---

## COMPLETE SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│          ENHANCED CARBON ACCOUNTING PLATFORM                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                   │
│  • Category → Activity → Unit dropdowns                    │
│  • Auto-fill emission factor (locked)                      │
│  • Auto-scope classification display                       │
│  • "Assumed Factor" label for non-local factors            │
│  • Dashboard with charts                                   │
│  • PDF/Excel export                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND SERVICES                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Factor Mapping Service                             │   │
│  │  • Auto-match activity to factor                    │   │
│  │  • Fallback: Sri Lanka → DEFRA → NGER → IPCC       │   │
│  │  • "Assumed Factor" flagging                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Scope Classification Engine                        │   │
│  │  • Auto-assign Scope 1/2/3                          │   │
│  │  • Upstream/Downstream tagging                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Calculation Engine                                 │   │
│  │  • Emission = Activity × Factor                     │   │
│  │  • Monthly/annual summaries                         │   │
│  │  • Top sources analysis                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Validation Layer                                   │   │
│  │  • Unit consistency                                 │   │
│  │  • Prevent factor override (except admin)           │   │
│  │  • Audit logging                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (MongoDB)                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  EmissionFactors Collection                         │   │
│  │  • DEFRA 2022, 2023, 2024                           │   │
│  │  • NGER 2022, 2023, 2024                            │   │
│  │  • IPCC (Global defaults)                           │   │
│  │  • Sri Lanka CEA (Local)                            │   │
│  │  • Version control (year, isActive)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Calculations Collection                            │   │
│  │  • Activity data                                    │   │
│  │  • Emissions (CO2e, CO2, CH4, N2O)                 │   │
│  │  • Factor used (source, year, isAssumed)            │   │
│  │  • Scope classification                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AuditLogs Collection                               │   │
│  │  • Every calculation logged                         │   │
│  │  • Factor updates tracked                           │   │
│  │  • User actions recorded                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION CHECKLIST

- [ ] Create EmissionFactor schema with all fields
- [ ] Import DEFRA 2024 dataset
- [ ] Import NGER 2024 dataset
- [ ] Import Sri Lanka CEA factors
- [ ] Implement FactorMappingService with fallback logic
- [ ] Implement ScopeClassificationService
- [ ] Update CalculationEngine to use new services
- [ ] Update UI with category → activity → unit dropdowns
- [ ] Add auto-fill for emission factors
- [ ] Add "Assumed Factor" label display
- [ ] Implement admin factor upload (CSV)
- [ ] Implement dataset activation/versioning
- [ ] Add unit consistency validation
- [ ] Add factor override protection
- [ ] Create dashboard API endpoints
- [ ] Implement PDF/Excel export
- [ ] Add audit logging for all operations
- [ ] Test with real data
- [ ] Deploy to production

---

*Document Version: 2.0*
*Standards: DEFRA 2024, NGER 2024, IPCC AR5, Sri Lanka CEA*
*Status: Ready for Implementation*
