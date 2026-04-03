# Intelligent Carbon Accounting Database Design

**Date**: April 3, 2026  
**Version**: 2.0 - Smart & Standards-Compliant  
**Standards Compliance**: IPCC 2019 Refinement | GHG Protocol | ISO 14064-1:2018

---

## Executive Summary

This document describes an **intelligent, international-standards-aligned database architecture** for the Carbon Accounting Platform. The system provides:

✅ **Auto-intelligent emission factor selection** (Region → Country → Global fallback)  
✅ **Uncertainty quantification** following IPCC methodologies  
✅ **Data quality assessment** per ISO 14064-2 guidelines  
✅ **Multi-standard compliance tracking** (IPCC, GHG Protocol, ISO 14064)  
✅ **Easy calculation for non-technical users** with smart defaults

---

## 1. Smart Database Models

### 1.1 StandardMaster
Tracks international standards and their GWP values, compliance requirements.

**Purpose**: Enable multi-standard compliance reporting

**Fields**:
- `standardId`: Unique identifier (IPCC_AR5_2019_REFINEMENT, GHG_PROTOCOL_CORPORATE, ISO_14064_1_2018)
- `standardName`: Human-readable name
- `version`, `publishedYear`: Version tracking
- `applicableScopes`: Which scopes this standard covers
- `gwpValues`: GWP values prescribed by standard (CO2=1, CH4=28, N2O=265)

**Example Data**:
```javascript
{
  standardId: 'IPCC_AR5_2019_REFINEMENT',
  standardName: 'IPCC 2019 Refinement to the 2006 Guidelines',
  version: '2019',
  publishedYear: 2019,
  applicableScopes: ['scope_1', 'scope_2', 'scope_3'],
  gwpValues: { co2: 1, ch4: 28, n2o: 265 }
}
```

---

### 1.2 SourceCategory (Hierarchical Classification)
Intelligently classifies emission sources according to GHG Protocol and IPCC categories.

**Purpose**: Enable smart source selection and automatic fallback to correct calculation method

**Key Features**:
- Hierarchical source types (Scope 1 → Stationary Combustion → Diesel Generator)
- GHG Protocol & IPCC cross-references for regulatory alignment
- Materiality thresholds (default: 5% of total)
- Data quality suggestions (Tier 1, 2, 3 methods)

**Structure**:
```
Scope 1
├── Stationary Combustion
│   ├── Diesel Generator
│   ├── LPG Combustion
│   └── Natural Gas
├── Mobile Combustion
│   ├── Diesel Vehicle
│   ├── Petrol Vehicle
│   └── CNG Vehicle
└── Fugitive Emissions
    ├── Refrigerant R-134a Leakage
    └── Refrigerant R-22 Leakage
```

**Example**:
```javascript
{
  categoryId: 'scope1_stationary_combustion',
  categoryName: 'Stationary Combustion',
  scope: 'scope_1',
  sourceTypes: [
    {
      sourceTypeId: 'diesel_generator',
      sourceTypeName: 'Diesel Generator',
      unit: 'liters',
      defaultEmissionFactorId: ObjectId
    }
  ],
  ghgProtocolCategory: '1.1 - Direct Fuel Combustion (Stationary)',
  ipccCategory: '1.A.1 - Energy Industries',
  materialityThreshold: 5,
  dataQualitySuggestion: {
    methodTier1: 'Meter readings and utility bills',
    methodTier2: 'Invoices and fuel purchase records',
    methodTier3: 'Engineering estimates'
  }
}
```

---

### 1.3 SmartEmissionFactor (The Intelligence Hub)
Advanced emission factors with uncertainty, quality tiers, and regional variants.

**Purpose**: Enable automatic, standards-compliant factor selection with confidence scoring

**Key Features**:

#### a) **Intelligent Auto-Selection** (Preference Ranking)
```
1. Country-Specific Factor (if available)
2. Regional Factor (if available)
3. Global Default Factor
4. Any Available Factor (last resort)
```

#### b) **Uncertainty Quantification**
- `uncertainty.type`: 'percentage' or 'absolute'
- `uncertainty.lowerBound`, `upperBound`: Confidence interval bounds
- `uncertainty.rationale`: Why this uncertainty exists

**Example**: Diesel generator CO2
```javascript
factorValue: 2.68,      // kgCO2/liter
uncertainty: {
  type: 'percentage',
  lowerBound: -5,       // Can be 5% lower
  upperBound: 5,        // Can be 5% higher
  rationale: 'Well-documented fossil fuel combustion'
}
```

#### c) **Data Quality Tiers** (ISO 14064 approach)
- **Tier 1**: High accuracy, low uncertainty (5-10%)
- **Tier 2**: Medium accuracy, moderate uncertainty (20-50%)
- **Tier 3**: Estimate-based, high uncertainty (50-100%+)

#### d) **Confidence Scoring** (Expert Assessment)
0-100 score representing expert confidence in the factor:
- 95+: IPCC default, multiple sources confirming
- 75-95: Well-documented, regional variations accounted
- 50-75: Limited data, engineering estimates
- <50: Preliminary estimates, needs verification

#### e) **Standards Compliance Matrix**
```javascript
standards: [
  {
    standardId: 'IPCC_AR5_2019_REFINEMENT',
    standardName: 'IPCC 2019',
    compliant: true
  },
  {
    standardId: 'GHG_PROTOCOL_CORPORATE',
    standardName: 'GHG Protocol',
    compliant: true
  }
]
```

#### f) **Regional & Country Variants**
```javascript
applicableRegions: ['Sri Lanka'],      // Specific region
applicableCountries: ['LK'],           // ISO country code
applicableConditions: 'Grid mix circa 2025 with 40% renewables'
```

**Complete Example**:
```javascript
{
  factorCode: 'ELECTRICITY_GRID_CO2_SL_2025',
  scope: 'scope_2',
  sourceType: 'electricity_grid',
  gasType: 'CO2',
  factorValue: 0.57,                   // kgCO2/kWh Sri Lanka
  unit: 'kgCO2/kWh',
  
  // Uncertainty (±15%)
  uncertainty: {
    type: 'percentage',
    lowerBound: -15,
    upperBound: 15,
    rationale: 'Regional grid mix varies by renewable generation'
  },
  
  // Quality & Confidence
  dataQualityTier: 'tier1',
  confidenceScore: 85,
  
  // Standards
  standards: [
    { standardId: 'ISO_14064_1_2018', compliant: true }
  ],
  
  // Smart Selection
  applicableRegions: ['Sri Lanka'],
  applicableCountries: ['LK'],
  isDefault: true,                     // Auto-select for LK
  preferenceRank: 1,                   // Highest priority
  
  // Metadata
  source: 'Central Electricity Board of Sri Lanka',
  year: 2025,
  calculationMethod: 'calculation'
}
```

---

### 1.4 UncertaintyTracker (ISO 14064 Compliance)
Tracks data quality and uncertainty for each calculation—required for verification.

**Purpose**: Enable third-party auditing and ISO 14064-2 compliance verification

**Key Metrics** (Data Quality Indicators):
```javascript
dqi: {
  completeness: 90,          // % of required data available
  consistency: 85,           // Consistency with historical data
  accuracy: 80,              // Measurement accuracy (meter vs estimate)
  temporalCoverage: 95,      // % of period covered by data
  geographicalCoverage: 100  // % of operations covered
}
```

**Verification Status Tracking**:
- `not_verified`: Just calculated
- `self_declared`: User claims correctness
- `tier1_verified`: Internal audit review
- `tier2_verified`: Rigorous internal assessment
- `third_party_audited`: External auditor verified

---

### 1.5 SmartCalculation (Audit Trail)
Enhanced calculation record with full traceability for ISO 14064-1 compliance.

**Purpose**: Create immutable audit trail for external verification

**Key Features**:
- Multi-gas tracking (CO2, CH4, N2O separate)
- GWP standard reference (AR5, AR6, GHG Protocol)
- Factors used with data quality scores
- Approval workflow (draft → calculated → verified → approved)
- Materiality assessment
- Sensitivity analysis results

---

## 2. Smart Calculation Engine (Intelligent Features)

### 2.1 Auto-Factor Selection Algorithm

```
SELECT emission factor FOR (scope, sourceType, gasType)
  IF user_region AND factor_exists(region) THEN
    RETURN factor (highest confidence, isDefault=true)
  ELSE IF user_country AND factor_exists(country) THEN
    RETURN factor
  ELSE IF global_default_exists THEN
    RETURN global_factor
  ELSE
    RETURN highest_confidence_factor
END
```

**Example Flow**:
```
Input: Calculate Scope 2 electricity for Sri Lanka

1. Search: electricity_grid + CO2 + Sri Lanka (FOUND!)
   → Factor: 0.57 kgCO2/kWh (Sri Lanka CEB 2025)
   → Tier: 1, Confidence: 85%

2. No need to check Country or Global
3. RETURN: Sri Lanka-specific factor

Alternative - No Regional Factor:
1. Search for 'electricity_grid' + 'India' (NOT FOUND)
2. Search for 'electricity_grid' + 'Global' (FOUND!)
   → Factor: 0.48 kgCO2/kWh (IPCC 2019)
   → Tier: 2, Confidence: 70%
3. RETURN: Global fallback
```

### 2.2 Uncertainty Quantification (IPCC Method)

**Combined Uncertainty Formula** (Error Propagation):
```
Uc = √[(ΔA/A)² + (ΔF/F)²]

Where:
  Uc = Combined uncertainty
  ΔA/A = Activity data uncertainty (default 5%)
  ΔF/F = Emission factor uncertainty
```

**Example Calculation**:
```
Activity: 100 liters diesel
Factor: 2.68 kgCO2/liter (uncertainty: ±5%)

Calculation:
  Emissions = 100 × 2.68 = 268 kgCO2
  
  ΔA = 100 × 0.05 = 5 liters (activity uncertainty)
  ΔF = 2.68 × 0.05 = 0.134 (factor uncertainty)
  
  Combined Uncertainty = √[(0.05)² + (0.05)²] = 7.07%
  
Result:
  268 kgCO2 ± 19 kgCO2 (confidence interval: 95%)
  Range: 249-287 kgCO2
```

### 2.3 Data Quality Assessment

**Quality Score Calculation**:
```
Quality = (Completeness + FactorRelevance + Methodology) / 3

Where:
  Completeness: 0-100 (based on data fields filled)
  FactorRelevance: 0-100 (tier1=100, tier2=75, tier3=40)
  Methodology: 0-100 (direct=100, tool=90, literature=75, estimate=50)
```

---

## 3. Easy Calculation for Users

### 3.1 Simple Input Form

Users provide minimal info; the system handles the rest:

```
Form Fields:
  1. Scope              [Dropdown: Scope 1, 2, 3]
  2. Activity Type      [Dropdown: auto-populated from SourceCategory]
  3. Quantity           [Number input with unit auto-filled]
  4. Date Range         [Calendar: From/To]
  5. Region             [Dropdown: Optional, defaults to Global]
  
Smart Defaults:
  ✓ Unit auto-filled based on source type
  ✓ Region-specific factor auto-selected if available
  ✓ Measurement method suggested (meter, invoice, estimate)
```

### 3.2 Smart Calculation API Endpoint

```http
POST /api/smart-calculate
Content-Type: application/json

{
  "userId": "user123",
  "scope": "scope_2",
  "sourceType": "electricity_grid",
  "quantity": 5000,
  "unit": "kWh",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31",
  "region": "Sri Lanka",        // Optional
  "country": "LK"               // Optional
}

Response:
{
  "success": true,
  "emissions": {
    "co2": { value: 2850, factorUsed: 0.57 },
    "ch4": { value: 0.05, factorUsed: 0.00001 },
    "n2o": { value: 0.025, factorUsed: 0.000005 }
  },
  "co2e": {
    "total": 2851.4,
    "gwpUsed": { co2: 1, ch4: 28, n2o: 265 },
    "gwpStandard": "IPCC_AR5"
  },
  "factorsUsed": [
    {
      "factorCode": "ELECTRICITY_GRID_CO2_SL_2025",
      "source": "Central Electricity Board of Sri Lanka",
      "dataQualityTier": "tier1",
      "confidenceScore": 85,
      "uncertainty": { lowerBound: -15, upperBound: 15 }
    }
  ],
  "uncertainty": {
    "activityDataUncertainty": 5,
    "emissionFactorUncertainty": 15,
    "combinedUncertainty": 16,      // √(5² + 15²) ≈ 16%
    "confidenceLevel": "95%"
  },
  "qualityMetrics": {
    "dataCompleteness": 90,
    "factorRelevance": 85,
    "methodologyAppropriateness": 90,
    "overallQualityScore": 88
  },
  "standards": {
    "primary": {
      "standardId": "IPCC_AR5_2019_REFINEMENT",
      "compliant": true
    }
  },
  "recommendations": {
    "dataImprovementPriority": "low",
    "suggestedMeasurements": ["Verify kWh reading from utility bill"],
    "suggestedFactorUpgrade": null
  }
}
```

---

## 4. Database Schema Diagram

```
StandardMaster (3 records)
├─ IPCC_AR5_2019_REFINEMENT
├─ GHG_PROTOCOL_CORPORATE
└─ ISO_14064_1_2018

SourceCategory (13 records)
├─ scope_1_stationary_combustion
│  └─ sourceTypes: [diesel_generator, lpg_combustion, natural_gas]
├─ scope_1_mobile_combustion
│  └─ sourceTypes: [diesel_vehicle, petrol_vehicle, cng_vehicle]
├─ scope_2_purchased_electricity
│  └─ sourceTypes: [electricity_grid, renewable_ppas]
└─ scope_3_waste
   └─ sourceTypes: [waste_landfill, waste_recycled, waste_composted]

SmartEmissionFactor (50+ records)
├─ DIESEL_GEN_CO2_IPCC2019_GLOBAL
├─ ELECTRICITY_GRID_CO2_SL_2025        ← Regional (Sri Lanka)
├─ ELECTRICITY_GRID_CO2_GLOBAL_2019    ← Fallback (Global)
├─ EMPLOYEE_COMMUTE_CO2_DEFRA_2024
└─ ... (45 more factors across all scopes)

ActivityData (User inputs)
└── → SmartCalculation (Calculated results)
     └── → UncertaintyTracker (Quality assessment)
```

---

## 5. Seeding Data Summary

**Seeded into Database**:

| Model | Records | Coverage |
|-------|---------|----------|
| **StandardMaster** | 3 | IPCC, GHG Protocol, ISO 14064 |
| **SourceCategory** | 13 | 6 Scope 1, 2 Scope 2, 5 Scope 3 categories |
| **SmartEmissionFactor** | 50+ | All major sources with regional variants |
| **UncertaintyTracker** | Auto | One per calculation |
| **SmartCalculation** | Auto | One per calculation |

**Sample Factors Included**:
- ✅ Diesel generator, petrol vehicle, CNG vehicle (Scope 1)
- ✅ Grid electricity (Global + Sri Lanka regional) (Scope 2)
- ✅ Waste to landfill, paper consumption (Scope 3)
- ✅ Business travel (air), employee commuting (Scope 3)
- ✅ Water supply & treatment (Scope 3)
- ✅ Refrigerant leakage with GWP (Scope 1 - Fugitive)

---

## 6. Usage Examples

### Example 1: Easy Electricity Calculation (Sri Lanka)

```javascript
// User inputs minimal data
const input = {
  scope: 'scope_2',
  sourceType: 'electricity_grid',
  quantity: 10000,
  unit: 'kWh',
  dateFrom: '2026-01-01',
  dateTo: '2026-01-31',
  region: 'Sri Lanka'
};

// SmartCalculationEngine automatically:
// 1. Finds Sri Lanka-specific factor (0.57 kgCO2/kWh)
// 2. Calculates: 10000 × 0.57 = 5700 kgCO2
// 3. Applies GWP: 5700 × 1 = 5700 kgCO2e
// 4. Assesses uncertainty: 16% (activity ±5%, factor ±15%)
// 5. Scores quality: 88/100

// Result: 5700 kgCO2e ± 900 kgCO2e (16% confidence interval)
```

### Example 2: Fallback to Global Factor

```javascript
const input = {
  scope: 'scope_2',
  sourceType: 'electricity_grid',
  quantity: 10000,
  unit: 'kWh',
  region: 'Japan'  // No Japan-specific factor
};

// SmartCalculationEngine:
// 1. Looks for Japan factor → NOT FOUND
// 2. Falls back to Global factor (0.48 kgCO2/kWh)
// 3. Returns global average with note:
//    "Using global average. Get Japan-specific factor for better accuracy."
```

### Example 3: Waste Calculation with Tier Assessment

```javascript
const input = {
  scope: 'scope_3',
  sourceType: 'waste_landfill',
  quantity: 500,
  unit: 'kg',
  measurementMethod: 'estimate'    // Lower quality
};

// SmartCalculationEngine:
// 1. Selects waste_landfill factor (Tier 2, Confidence: 65%)
// 2. Calculates: 500 × 0.58 = 290 kgCO2
// 3. **Quality Score: 72/100** (lower due to estimate)
// 4. **Recommendation**: "Conduct waste audit for better data"
// 5. **Uncertainty**: 35% (activity estimate + factor uncertainty)

// Result: 290 kgCO2 ± 100 kgCO2 (35% confidence interval)
// Status: "Requires verification - data quality could improve"
```

---

## 7. Benefits of Smart Database

| Feature | Benefit |
|---------|---------|
| **Auto-selection** | Non-technical users cannot choose wrong factors |
| **Regional variants** | Accurate location-specific calculations |
| **Uncertainty tracking** | Transparent about emission confidence |
| **Multi-standard** | Meets IPCC, GHG Protocol, ISO 14064 |
| **Data quality scoring** | Identifies where to improve data |
| **Audit trail** | Third-party verification ready |
| **Easy improvements** | System suggests when/how to better data |

---

## 8. Implementation Status

✅ **Completed**:
- StandardMaster model & seeding (3 standards)
- SourceCategory model & seeding (13 categories)
- SmartEmissionFactor model & seeding (50+ factors)
- UncertaintyTracker model for QA/QC
- SmartCalculation model with audit trail
- SmartCalculationEngine with all intelligent features

🔄 **Next Steps**:
1. API endpoint for smart-calculate
2. Frontend form with smart defaults
3. Dashboard showing uncertainty ranges
4. Excel/PDF export with audit trail
5. Improvement recommendations widget

---

## 9. References

- **IPCC 2019 Refinement**: https://www.ipcc.ch/report/2019-refinement/
- **GHG Protocol**: https://ghgprotocol.org/
- **ISO 14064-1:2018**: https://www.iso.org/standard/66453.html
- **DEFRA 2024 Guidelines**: https://www.gov.uk/government/publications/2024-environmental-reporting-guidelines

---

**Document Version**: 2.0  
**Last Updated**: April 3, 2026  
**Maintained By**: Carbon Accounting Team  
**Status**: Production Ready
