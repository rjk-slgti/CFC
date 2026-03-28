# PHASE 4 — UI/UX (DATA + REPORTING FOCUSED)

## Explanation (WHY)

Good UI/UX is not about making things "pretty" — it's about making the app **usable** and **error-proof**.

**Why is UI/UX critical for Carbon Accounting?**
- Users enter **numerical data** — mistakes are costly
- Data must be **grouped by scope** — ISO 14064 requirement
- Reports must be **auditor-friendly** — clear, readable, traceable
- Users have different skill levels — students, trainers, administrators

**Design Principles:**
1. **Clarity** — Users should never wonder "what does this field mean?"
2. **Minimal cognitive load** — Don't overwhelm with too many options
3. **Audit readability** — Reports must be clear for external auditors
4. **Error prevention** — Validate before submission, not after

---

## User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER FLOW                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  LOGIN  │───▶│  INPUT  │───▶│CALCULATE│───▶│ REVIEW  │
│         │    │  DATA   │    │         │    │ RESULTS │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                    │              │
                                    │              │
                                    ▼              ▼
                              ┌─────────┐    ┌─────────┐
                              │  STORE  │    │ REPORT  │
                              │  IN DB  │    │ EXPORT  │
                              └─────────┘    └─────────┘
```

**Detailed Steps:**
1. **Login** → User authenticates (student/trainer/admin)
2. **Input Data** → User fills forms grouped by scope
3. **Calculate** → System calculates CO₂e automatically
4. **Review Results** → User sees calculated emissions
5. **Store in DB** → Data saved with audit trail
6. **Report Export** → Generate PDF/Excel reports

---

## Wireframe: Main Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Carbon Accounting Platform          [John Silva] [Logout]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Dashboard│  │  Input  │  │ Reports │  │ Settings│       │
│  │   📊    │  │   📝    │  │   📄    │  │   ⚙️    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TOTAL EMISSIONS - 2025                             │   │
│  │                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  SCOPE 1    │  │  SCOPE 2    │  │  SCOPE 3    │ │   │
│  │  │  1,200 kg   │  │  8,500 kg   │  │   450 kg    │ │   │
│  │  │   CO₂e      │  │   CO₂e      │  │   CO₂e      │ │   │
│  │  │  (11.8%)    │  │  (83.7%)    │  │  (4.4%)     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  │                                                     │   │
│  │  GRAND TOTAL: 10,150 kg CO₂e                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MONTHLY TREND                                      │   │
│  │                                                     │   │
│  │  1200│                                              │   │
│  │  1000│    ╭──╮                                      │   │
│  │   800│╭──╮│  │╭──╮                                  │   │
│  │   600││  ││  ││  │╭──╮                              │   │
│  │   400││  ││  ││  ││  │╭──╮                          │   │
│  │   200││  ││  ││  ││  ││  │╭──╮                      │   │
│  │     0└──┴┴──┴┴──┴┴──┴┴──┴┴──┴──                     │   │
│  │       Jan Feb Mar Apr May Jun                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RECENT ACTIVITY                    [View All →]    │   │
│  │                                                     │   │
│  │  • 2025-01-31  Diesel Generator    500L   1,344 kg  │   │
│  │  • 2025-01-31  Electricity         5000kWh 2,850 kg │   │
│  │  • 2025-01-15  Office Paper        10 reams  120 kg │   │
│  │  • 2025-01-10  Waste (Landfill)    200 kg    45 kg  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Wireframe: Input Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Carbon Accounting Platform          [John Silva] [Logout]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Dashboard│  │  Input  │  │ Reports │  │ Settings│       │
│  │   📊    │  │   📝    │  │   📄    │  │   ⚙️    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ADD NEW EMISSION DATA                              │   │
│  │                                                     │   │
│  │  Scope: [Scope 1: Direct Emissions ▼]              │   │
│  │                                                     │   │
│  │  Source Type: [Diesel Generator ▼]                 │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Quantity:                                  │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │ 500                                 │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  │  Unit: [Liters ▼]                          │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Reporting Period:                          │   │   │
│  │  │  From: [2025-01-01]  To: [2025-01-31]      │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Notes (optional):                          │   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │ Main campus generator - monthly...  │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  [Cancel]  [Save Draft]  [Submit for Approval]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  QUICK ADD BY SCOPE                                 │   │
│  │                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐          │   │
│  │  │ SCOPE 1         │  │ SCOPE 2         │          │   │
│  │  │                 │  │                 │          │   │
│  │  │ [+] Diesel      │  │ [+] Electricity │          │   │
│  │  │ [+] Petrol      │  │ [+] Heat        │          │   │
│  │  │ [+] LPG         │  │                 │          │   │
│  │  │ [+] Refrigerant │  │                 │          │   │
│  │  └─────────────────┘  └─────────────────┘          │   │
│  │                                                     │   │
│  │  ┌─────────────────┐                               │   │
│  │  │ SCOPE 3         │                               │   │
│  │  │                 │                               │   │
│  │  │ [+] Paper       │                               │   │
│  │  │ [+] Waste       │                               │   │
│  │  │ [+] Travel      │                               │   │
│  │  │ [+] Equipment   │                               │   │
│  │  └─────────────────┘                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Wireframe: Report View

```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Carbon Accounting Platform          [John Silva] [Logout]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Dashboard│  │  Input  │  │ Reports │  │ Settings│       │
│  │   📊    │  │   📝    │  │   📄    │  │   ⚙️    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CARBON FOOTPRINT REPORT - 2025                     │   │
│  │  Generated: 2025-03-28 10:30 UTC                    │   │
│  │  Period: January 1 - December 31, 2025              │   │
│  │                                                     │   │
│  │  [Export PDF] [Export Excel] [Print]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  EXECUTIVE SUMMARY                                  │   │
│  │                                                     │   │
│  │  Total Emissions: 10,150 kg CO₂e                   │   │
│  │                                                     │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  Scope 1 (Direct):     1,200 kg CO₂e (11.8%)│   │   │
│  │  │  Scope 2 (Electricity): 8,500 kg CO₂e (83.7%)│   │   │
│  │  │  Scope 3 (Value Chain):  450 kg CO₂e (4.4%) │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  Year-over-Year Change: -5.2% (vs 2024)            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DETAILED BREAKDOWN BY SOURCE                       │   │
│  │                                                     │   │
│  │  Scope 1: Direct Emissions                          │   │
│  │  ┌──────────────┬──────────┬──────────┬──────────┐ │   │
│  │  │ Source       │ Quantity │ Unit     │ CO₂e (kg)│ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ Diesel Gen   │ 500      │ liters   │ 1,344    │ │   │
│  │  │ LPG          │ 100      │ kg       │ 150      │ │   │
│  │  │ Refrigerant  │ 2        │ kg       │ 4,000    │ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ TOTAL        │          │          │ 1,200    │ │   │
│  │  └──────────────┴──────────┴──────────┴──────────┘ │   │
│  │                                                     │   │
│  │  Scope 2: Electricity                               │   │
│  │  ┌──────────────┬──────────┬──────────┬──────────┐ │   │
│  │  │ Source       │ Quantity │ Unit     │ CO₂e (kg)│ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ Grid Elect.  │ 50,000   │ kWh      │ 8,500    │ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ TOTAL        │          │          │ 8,500    │ │   │
│  │  └──────────────┴──────────┴──────────┴──────────┘ │   │
│  │                                                     │   │
│  │  Scope 3: Value Chain                               │   │
│  │  ┌──────────────┬──────────┬──────────┬──────────┐ │   │
│  │  │ Source       │ Quantity │ Unit     │ CO₂e (kg)│ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ Office Paper │ 50       │ reams    │ 120      │ │   │
│  │  │ Waste        │ 500      │ kg       │ 180      │ │   │
│  │  │ Travel       │ 200      │ km       │ 150      │ │   │
│  │  ├──────────────┼──────────┼──────────┼──────────┤ │   │
│  │  │ TOTAL        │          │          │ 450      │ │   │
│  │  └──────────────┴──────────┴──────────┴──────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  METHODOLOGY                                        │   │
│  │                                                     │   │
│  │  • Emission Factors: IPCC AR5, Sri Lanka CEA       │   │
│  │  • GWP Values: IPCC Fifth Assessment Report        │   │
│  │  • Calculation: GHG Protocol Corporate Standard    │   │
│  │  • Organizational Boundary: Operational Control    │   │
│  │  • Reporting Period: January 1 - December 31, 2025 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DATA QUALITY ASSESSMENT                            │   │
│  │                                                     │   │
│  │  Primary Data:    95% (direct measurements)        │   │
│  │  Secondary Data:   5% (industry averages)          │   │
│  │  Estimated Data:   0%                              │   │
│  │                                                     │   │
│  │  Confidence Level: HIGH                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Principles Applied

### 1. Clarity

**Problem:** Users don't know what "Scope 1" means
**Solution:** Add tooltips and descriptions

```html
<!-- Example: Tooltip for Scope -->
<div class="scope-header">
  <h3>Scope 1: Direct Emissions</h3>
  <span class="tooltip" title="Emissions from sources owned or controlled by your organization,
    such as diesel generators, company vehicles, and refrigerant leaks.">
    ℹ️
  </span>
</div>
```

### 2. Minimal Cognitive Load

**Problem:** Too many fields overwhelm users
**Solution:** Progressive disclosure — show fields only when needed

```html
<!-- Step 1: Select scope -->
<select id="scope">
  <option value="">Select Scope...</option>
  <option value="scope_1">Scope 1: Direct Emissions</option>
  <option value="scope_2">Scope 2: Electricity</option>
  <option value="scope_3">Scope 3: Value Chain</option>
</select>

<!-- Step 2: Show relevant source types (only after scope selected) -->
<div id="source-type-container" class="hidden">
  <select id="source-type">
    <!-- Options populated based on scope selection -->
  </select>
</div>

<!-- Step 3: Show input fields (only after source type selected) -->
<div id="input-fields-container" class="hidden">
  <!-- Fields populated based on source type -->
</div>
```

### 3. Audit Readiness

**Problem:** Auditors need to trace any number to its source
**Solution:** Every number is clickable and shows its calculation

```
┌─────────────────────────────────────────────────────────────┐
│  CO₂e: 1,344.125 kg  [ℹ️ View Calculation]                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CALCULATION DETAILS                                │   │
│  │                                                     │   │
│  │  Activity: 500 liters diesel                        │   │
│  │  Emission Factor: 2.68 kgCO₂/liter (IPCC AR5)     │   │
│  │                                                     │   │
│  │  CO₂ = 500 × 2.68 = 1,340.00 kg                   │   │
│  │  CH₄ = 500 × 0.0002 = 0.10 kg                     │   │
│  │  N₂O = 500 × 0.00001 = 0.005 kg                   │   │
│  │                                                     │   │
│  │  CO₂e = (1,340 × 1) + (0.1 × 28) + (0.005 × 265) │   │
│  │  CO₂e = 1,340 + 2.8 + 1.325                       │   │
│  │  CO₂e = 1,344.125 kg                              │   │
│  │                                                     │   │
│  │  Entered by: student@slgti.lk                      │   │
│  │  Date: 2025-02-01 10:30 UTC                        │   │
│  │  Validated by: trainer@slgti.lk                    │   │
│  │  Validation Date: 2025-02-02 14:15 UTC             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 4. Error Prevention

**Problem:** Users enter wrong data (negative numbers, wrong units)
**Solution:** Validate in real-time, show helpful messages

```html
<!-- Example: Real-time validation -->
<div class="input-group">
  <label for="quantity">Quantity (liters)</label>
  <input
    type="number"
    id="quantity"
    min="0"
    max="100000"
    step="0.01"
    required
    class="border rounded p-2"
  >
  <span class="error-message hidden" id="quantity-error">
    Please enter a positive number between 0 and 100,000
  </span>
  <span class="help-text">
    Enter the total liters of diesel consumed in this period
  </span>
</div>
```

---

## Color Coding for Scopes

```
┌─────────────────────────────────────────────────────────────┐
│                    COLOR SYSTEM                              │
└─────────────────────────────────────────────────────────────┘

Scope 1 (Direct):     🔴 Red/Orange (#EF4444)
                      Represents: Fire, combustion, direct emissions

Scope 2 (Electricity): 🔵 Blue (#3B82F6)
                      Represents: Electricity, power, grid

Scope 3 (Value Chain): 🟢 Green (#22C55E)
                      Represents: Indirect, supply chain, broader impact

Total/Accent:         ⚫ Dark Gray (#1F2937)
                      Represents: Summary, totals, important numbers
```

---

## Common Mistakes

❌ **Mistake 1:** Showing all input fields at once
✅ **Solution:** Use progressive disclosure (show fields step by step)

❌ **Mistake 2:** No validation feedback until form submission
✅ **Solution:** Validate in real-time as user types

❌ **Mistake 3:** Technical jargon in labels ("Enter GWP-adjusted CO₂e")
✅ **Solution:** Use plain language ("Enter diesel consumption in liters")

❌ **Mistake 4:** No way to see how a number was calculated
✅ **Solution:** Make every calculated number clickable to show details

❌ **Mistake 5:** Reports that only make sense to the person who created them
✅ **Solution:** Include methodology section, data sources, and timestamps

---

## Next Action

Now that you have the UI/UX design, proceed to **Phase 5: Frontend Implementation** to build the actual HTML, CSS, and JavaScript code.

---

*Phase 4 Complete ✅*
*Next: Phase 5 — Frontend (Structured Input Engine)*
