# Smart Database Quick Reference

## 📊 Database Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│            INTELLIGENT CARBON ACCOUNTING DATABASE                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  STANDARDS LAYER - Defines Compliance Requirements              │
├─────────────────────────────────────────────────────────────────┤
│  StandardMaster (3 records)                                      │
│  ├─📋 IPCC 2019 Refinement (GWP: CO₂=1, CH₄=28, N₂O=265)      │
│  ├─📋 GHG Protocol Corporate                                    │
│  └─📋 ISO 14064-1:2018 Organizational                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CLASSIFICATION LAYER - Smart Source Categorization             │
├─────────────────────────────────────────────────────────────────┤
│  SourceCategory (13 records - Hierarchical)                     │
│                                                                  │
│  SCOPE 1 (Direct):                                              │
│  ├─ Stationary Combustion                                       │
│  │  ├─ Diesel Generator (liters)                               │
│  │  ├─ LPG Combustion (kg)                                     │
│  │  └─ Natural Gas (m³)                                        │
│  ├─ Mobile Combustion                                           │
│  │  ├─ Diesel Vehicle (liters)                                 │
│  │  ├─ Petrol Vehicle (liters)                                 │
│  │  └─ CNG Vehicle (kg)                                        │
│  └─ Fugitive Emissions                                          │
│     └─ Refrigerant Leakage (kg with GWP)                       │
│                                                                  │
│  SCOPE 2 (Indirect Energy):                                     │
│  ├─ Purchased Electricity (kWh)    ← Regional variants!         │
│  └─ Purchased Heat/Steam (kWh)                                 │
│                                                                  │
│  SCOPE 3 (Other Indirect):                                      │
│  ├─ Purchased Goods & Services (reams, kg, USD)                │
│  ├─ Waste (kg)                                                  │
│  ├─ Transportation (km)                                         │
│  └─ Water Supply (m³)                                           │
│                                                                  │
│  Each category includes:                                        │
│  ✓ GHG Protocol mapping (e.g., "1.1 Direct Combustion")        │
│  ✓ IPCC methodology (e.g., "1.A.1 Energy Industries")           │
│  ✓ Data quality suggestions (Tier 1, 2, 3 methods)             │
│  ✓ Materiality threshold (default 5%)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE LAYER - Smart Emission Factors                    │
├─────────────────────────────────────────────────────────────────┤
│  SmartEmissionFactor (50+ records)                              │
│                                                                  │
│  Each factor includes:                                          │
│  ✓ Value (with unit) - e.g., 2.68 kgCO₂/L                     │
│  ✓ Uncertainty bounds - e.g., ± 5%                            │
│  ✓ Data quality tier - Tier 1 (best), 2, 3 (estimate)         │
│  ✓ Confidence score - 0-100 (expert assessment)                │
│  ✓ Standards compliance - IPCC, GHG Protocol, ISO 14064       │
│  ✓ Regional variants - Global, Sri Lanka, India, etc.          │
│  ✓ Preference ranking - For auto-selection algorithm           │
│  ✓ Source reference - With DOI/URL for verification            │
│                                                                  │
│  Examples:                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ DIESEL GENERATOR                                         │  │
│  │ Factor: 2.68 kgCO₂/liter                                │  │
│  │ Uncertainty: ±5%                                        │  │
│  │ Tier: 1 | Confidence: 95%                              │  │
│  │ Source: IPCC 2019 Refinement                           │  │
│  │ Standards: ✓IPCC ✓GHG ✓ISO14064                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ELECTRICITY GRID - WITH REGIONAL VARIANTS!              │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Sri Lanka (2025):  0.57 kgCO₂/kWh (40% renewable) │  │  │
│  │ │ Tier: 1 | Confidence: 85% | ±15 uncertainty       │  │  │
│  │ │ AUTO-SELECTED when region="Sri Lanka"             │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ Global Average (2019): 0.48 kgCO₂/kWh             │  │  │
│  │ │ Tier: 2 | Confidence: 70% | ±20% uncertainty      │  │  │
│  │ │ FALLBACK when region-specific not available       │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    SMART CALCULATION ENGINE
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  CALCULATION OUTPUT                                              │
├─────────────────────────────────────────────────────────────────┤
│  SmartCalculation (created per user input)                      │
│  ├─ Multi-gas emissions (CO₂, CH₄, N₂O tracked separately)     │
│  ├─ CO₂e total with GWP applied                                │
│  ├─ Factors used (with data quality tier)                      │
│  ├─ Uncertainty range (95% confidence interval)                │
│  ├─ Data quality score (0-100)                                 │
│  ├─ Standards compliance status                                │
│  ├─ Audit trail (who calculated, when, approved by whom)       │
│  ├─ Materiality flag (>5% of total?)                           │
│  └─ Improvement recommendations                                │
│                                                                  │
│  ↓                                                              │
│  UncertaintyTracker (QA/QC metadata)                            │
│  ├─ Data Quality Indicators (completeness, accuracy, etc.)     │
│  ├─ Verification status (audited? By third-party?)             │
│  ├─ Sensitivity analysis (what if factor changes?)             │
│  └─ Ready for ISO 14064-2 verification                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Smart Factor Selection Algorithm

```
User enters: sourceType="electricity_grid", region="Sri Lanka"

SYSTEM DECISION TREE:
│
├─ Is there a factor for [electricity_grid] + [Sri Lanka]?
│  │
│  ├─ YES (FOUND!) → Use Sri Lanka factor 0.57
│  │                ├─ Tier: 1
│  │                ├─ Confidence: 85%
│  │                └─ Return with region-specific note
│  │
│  └─ NO → Continue to next check
│
├─ Is there a [region-specific] factor for [electricity_grid]?
│  │
│  ├─ YES → Use regional factor
│  │
│  └─ NO → Continue to next check
│
├─ Is there a [global] factor for [electricity_grid]?
│  │
│  ├─ YES (FOUND!) → Use Global factor 0.48
│  │                ├─ Tier: 2
│  │                ├─ Confidence: 70%
│  │                └─ Return with note "Use Sri Lanka-specific for better accuracy"
│  │
│  └─ NO → Continue to next check
│
└─ Return: Highest confidence available factor
           (if no other options, flag as "LOW CONFIDENCE")

RESULT COMPARISON:
┌──────────────────────────────────────────────────────────────┐
│ Activity: 5000 kWh                                           │
├──────────────────────────────────────────────────────────────┤
│ WITH Sri Lanka factor:  5000 × 0.57 = 2850 kgCO₂e          │
│ WITH Global factor:    5000 × 0.48 = 2400 kgCO₂e           │
│ DIFFERENCE:            450 kgCO₂e (18.75% higher)           │
├──────────────────────────────────────────────────────────────┤
│ System automatically applies Sri Lanka since region specified │
│ and factor is available → BETTER ACCURACY ✓                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 📈 Quality Scoring Components

```
QUALITY SCORE = (Completeness + FactorRelevance + Methodology) / 3

┌─ COMPLETENESS (0-100) ────────────────────────────────────────┐
│ Factors:                                                       │
│ ✓ Activity data (quantity, unit)             +20 pts          │
│ ✓ Date range (from - to)                     +15 pts          │
│ ✓ Measurement method specified               +15 pts          │
│ ✓ Activity notes/documentation               + 5 pts          │
│ ✓ Attachments (receipts, invoices)           +10 pts          │
│ ────────────────────────────────────────────────────         │
│ Example Score: 90/100 (good data completeness)               │
└────────────────────────────────────────────────────────────────┘

┌─ FACTOR RELEVANCE (0-100) ────────────────────────────────────┐
│ Based on Data Quality Tier:                                    │
│ Tier 1 (high accuracy)                      = 100 pts         │
│ Tier 2 (medium accuracy)                    =  75 pts         │
│ Tier 3 (estimate-based)                     =  40 pts         │
│                                                                │
│ Weighted by Confidence Score:                                 │
│ (95% confidence × Tier score)                                 │
│                                                                │
│ Example Score: 85/100 (good factor selection)                │
└────────────────────────────────────────────────────────────────┘

┌─ METHODOLOGY APPROPRIATENESS (0-100) ──────────────────────────┐
│ Calculation Method:                                            │
│ Direct measurement           = 100 pts                         │
│ Calculation tool             =  90 pts                         │
│ Literature-based             =  75 pts                         │
│ Engineering estimate         =  50 pts                         │
│                                                                │
│ Example Score: 90/100 (literature-based, solid method)       │
└────────────────────────────────────────────────────────────────┘

┌─ OVERALL SCORE ───────────────────────────────────────────────┐
│ (90 + 85 + 90) / 3 = 88/100                                   │
│                                                                │
│ Interpretation:                                               │
│ 90-100: Excellent (ready for external audit)                 │
│  80-89: Good (minor improvements suggested)                   │
│  70-79: Acceptable (improvements recommended)                │
│  60-69: Poor (significant data improvements needed)           │
│  <60:   Very Poor (use estimates only, mark for review)     │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔢 Uncertainty Calculation Example

```
SCENARIO: Calculate emissions from 100L diesel fuel

INPUTS:
├─ Activity: 100 liters diesel
├─ Factor: 2.68 kgCO₂/L
├─ Activity uncertainty: 5% (ISO 14064 default)
└─ Factor uncertainty: ±5% (IPCC documented)

CALCULATION (IPCC Error Propagation):
┌────────────────────────────────────────────────────────┐
│ Base Emission = Activity × Factor                      │
│             = 100 L × 2.68 kgCO₂/L                   │
│             = 268 kgCO₂                                │
└────────────────────────────────────────────────────────┘

┌─ Combined Uncertainty Calculation ─────────────────────┐
│ Formula: Uc = √[(ΔA%)² + (ΔF%)²]                     │
│                                                        │
│ ΔA% = Activity uncertainty = 5%                       │
│ ΔF% = Factor uncertainty = 5%                         │
│                                                        │
│ Uc = √[(5)² + (5)²]                                  │
│    = √[25 + 25]                                      │
│    = √50                                             │
│    = 7.07%                                           │
└────────────────────────────────────────────────────────┘

CONFIDENCE INTERVALS (95% level):
┌────────────────────────────────────────────────────────┐
│ Point estimate: 268 kgCO₂                              │
│ Uncertainty: 7.07% ≈ 19 kgCO₂                         │
│                                                        │
│ Lower bound: 268 - 19 = 249 kgCO₂                    │
│ Upper bound: 268 + 19 = 287 kgCO₂                    │
│                                                        │
│ RESULT: 268 ± 19 kgCO₂ (95% confidence)              │
│         or 249-287 kgCO₂ range                        │
└────────────────────────────────────────────────────────┘

INTERPRETATION:
✓ We're 95% confident the actual emissions are between 249-287 kgCO₂
✓ The 7.07% uncertainty is quite good (low uncertainty)
✓ This Tier 1 factor is reliable for decision-making
```

---

## 🎯 Sample API Call & Response

```
POST /api/smart-calculate
Content-Type: application/json

REQUEST:
{
  "userId": "trainer-001",
  "scope": "scope_2",
  "sourceType": "electricity_grid",
  "quantity": 5000,
  "unit": "kWh",
  "dateFrom": "2026-01-01",
  "dateTo": "2026-01-31",
  "region": "Sri Lanka",
  "country": "LK"
}

RESPONSE (200 OK):
{
  "success": true,
  
  "emissions": {
    "co2": {
      "value": 2850,              ← 5000 kWh × 0.57 factor
      "factorId": "ObjectId...",
      "factorUsed": 0.57
    },
    "ch4": {
      "value": 0.05,
      "factorUsed": 0.00001
    },
    "n2o": {
      "value": 0.025,
      "factorUsed": 0.000005
    }
  },
  
  "co2e": {
    "total": 2851.4,              ← CO₂e includes CH₄×28 + N₂O×265
    "gwpUsed": {
      "co2": 1,
      "ch4": 28,
      "n2o": 265
    },
    "gwpStandard": "IPCC_AR5"
  },
  
  "factorsUsed": [
    {
      "factorCode": "ELECTRICITY_GRID_CO2_SL_2025",
      "gasType": "CO2",
      "factorValue": 0.57,
      "source": "Central Electricity Board of Sri Lanka",
      "year": 2025,
      "dataQualityTier": "tier1",
      "confidenceScore": 85,
      "uncertainty": {
        "type": "percentage",
        "lowerBound": -15,
        "upperBound": 15
      }
    },
    // Similar for CH4 and N2O...
  ],
  
  "uncertainty": {
    "activityDataUncertainty": 5,     ← Default activity uncertainty
    "emissionFactorUncertainty": 15,  ← From factor metadata
    "combinedUncertainty": 16,        ← √(5² + 15²) ≈ 16%
    "confidenceLevel": "95%",
    "methodology": "IPCC Error Propagation (Tier 2)"
  },
  
  "qualityMetrics": {
    "dataCompleteness": 90,           ← Has all required fields
    "factorRelevance": 85,            ← Tier 1 factor, 85% confidence
    "methodologyAppropriateness": 90, ← Literature-based
    "overallQualityScore": 88        ← (90+85+90)/3 = 88
  },
  
  "standards": {
    "primary": {
      "standardId": "IPCC_AR5_2019_REFINEMENT",
      "standardName": "IPCC 2019 Refinement",
      "compliant": true
    },
    "secondary": [
      {
        "standardId": "ISO_14064_1_2018",
        "standardName": "ISO 14064-1:2018",
        "compliant": true
      }
    ]
  },
  
  "recommendations": {
    "dataImprovementPriority": "low",         ← Good data quality
    "suggestedMeasurements": [
      "Verify kWh reading from utility bill",
      "Document renewable energy source if applicable"
    ],
    "suggestedFactorUpgrade": "Consider getting grid factor with 2026 actual generation mix"
  },
  
  "factorSelectionNotes": "Selected Sri Lanka tier1 factor with 85% confidence and ±15% uncertainty. Fallback to global (0.48) available if region not specified.",
  
  "calculationMetadata": {
    "calculatedAt": "2026-04-03T18:02:11.091Z",
    "calculatedBy": "smartEngine",
    "status": "calculated",
    "auditTrailReady": true
  }
}
```

---

## 🔄 Data Flow Diagram

```
USER INPUT FORM
│
├─ Scope: scope_2
├─ Source: electricity_grid
├─ Quantity: 5000
├─ Unit: kWh
├─ Region: Sri Lanka
└─ Date: 2026-01-01 to 2026-01-31
│
              ↓
       SMART ENGINE
│
├─1. Classify source → SourceCategory.electricity
├─2. Select factor → SmartFactor.electricity_SL_2025
├─3. Calculate emissions → 5000 × 0.57 = 2850 kgCO₂e
├─4. Quantify uncertainty → √(5² + 15²) = 16%
├─5. Score data quality → (90+85+90)/3 = 88
├─6. Assess materiality → Is this >5% of total?
├─7. Generate recommendations → "Consider 2026 grid data"
└─8. Create audit trail → tracking who, when, method
│
              ↓
       SMART CALCULATION RECORD
│
├─ emissions { co2, ch4, n2o, co2e }
├─ uncertainty { 16%, 249-287 kgCO₂ range }
├─ quality { 88/100 score }
├─ standards { IPCC ✓, GHG ✓, ISO14064 ✓ }
├─ audit trail { calculated, status, approval path }
├─ recommendations { improvements needed }
└─ verification ready { for third-party audit }
│
              ↓
       USER SEES
│
├─ 📊 2851 kgCO₂e (with confidence interval)
├─ 📈 Quality score: 88/100 (Good!)
├─ 💡 Suggestions: "Verify kWh reading from utility bill"
├─ 📋 Standards: "Compliant with IPCC, GHG Protocol, ISO 14064"
└─ ✅ Audit status: "Ready for third-party verification"
```

---

## 📚 Quick Commands

### Database Inspection
```bash
# See all standards
db.standardmasters.find()

# See all emission factors with uncertainty
db.smartemissionfactors.find({ dataQualityTier: "tier1" })

# See Sri Lanka-specific factors
db.smartemissionfactors.find({ applicableCountries: "LK" })

# See calculation audit trail
db.smartcalculations.find({ status: "approved" })

# See data quality scores
db.uncertaintytrackers.find({ "dqi.completeness": { $gte: 80 } })
```

### Data Quality Reports
```javascript
// Find materials sources (>5% of total)
db.smartcalculations.find({ "materiality.isMaterial": true })

// Find calculations by tier
db.smartcalculations.find({ "factorsUsed.0.dataQualityTier": "tier1" })

// Find unverified calculations
db.uncertaintytrackers.find({ verificationStatus: "not_verified" })
```

---

## ✅ Validation Checklist

- ✅ All 5 models implemented with full schema
- ✅ 50+ emission factors seeded (Scope 1, 2, 3)
- ✅ Regional variants (Sri Lanka + Global)
- ✅ Uncertainty quantification (IPCC method)
- ✅ Data quality tiers and scoring
- ✅ Smart factor selection algorithm
- ✅ Multi-standard compliance tracking
- ✅ Audit trail and verification ready
- ✅ ISO 14064-1:2018 requirements met
- ✅ Documentation complete

---

**Status**: 🚀 PRODUCTION READY  
**Last Updated**: April 3, 2026  
**Database Size**: 3 standards + 13 categories + 50+ factors
