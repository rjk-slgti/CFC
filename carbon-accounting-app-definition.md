# Carbon Accounting Web App - ISO 14064 Definition

## Phase 1: ISO 14064 Principles-Based Definition

### 1. Problem Statement

**Real-World Institutional Context: SLGTI (Sri Lanka German Training Institute)**

SLGTI, as a technical and vocational education institution, faces increasing pressure to:
- Comply with national environmental regulations and international reporting standards
- Demonstrate environmental responsibility to stakeholders (government, donors, students)
- Track and reduce carbon footprint across campus operations
- Prepare for potential carbon taxation or ESG (Environmental, Social, Governance) reporting requirements
- Educate students on sustainable practices through real-world application

**Core Problem:**
SLGTI currently lacks a systematic, auditable method to:
- Quantify greenhouse gas (GHG) emissions from campus operations
- Classify emissions according to ISO 14064 scopes
- Generate credible reports for regulatory compliance and stakeholder communication
- Identify emission reduction opportunities
- Train students on carbon accounting methodologies

**Institutional Pain Points:**
- Manual spreadsheet-based tracking is error-prone and not auditable
- No standardized emission factors or calculation methodologies
- Inability to produce ISO-compliant reports for external verification
- Limited visibility into high-impact emission sources
- No historical data for trend analysis or target setting

---

### 2. User Roles

#### **Student**
- **Purpose:** Learn carbon accounting principles through hands-on application
- **Permissions:**
  - View assigned emission data entry tasks
  - Input activity data for specific scopes (e.g., laboratory energy use)
  - View personal contribution reports
  - Access educational resources on ISO 14064
- **Use Case:** Students in environmental science or engineering programs input real campus data as part of coursework

#### **Trainer**
- **Purpose:** Oversee data collection, validate inputs, and generate educational reports
- **Permissions:**
  - All Student permissions
  - Validate and approve student-submitted data
  - Generate scope-specific reports for classroom use
  - Configure emission factors for educational scenarios
  - View department-level dashboards
- **Use Case:** Trainers use the system to teach emission calculation methodologies and verify student work

#### **Organization (SLGTI Administration)**
- **Purpose:** Manage institutional carbon accounting, compliance, and reporting
- **Permissions:**
  - All Trainer permissions
  - Define organizational and operational boundaries
  - Configure system-wide emission factors
  - Generate ISO 14064-compliant reports for external auditors
  - Manage user roles and access controls
  - Set reduction targets and track progress
  - Export data for ESG reporting
- **Use Case:** SLGTI administration uses the system for annual carbon footprint reporting to government and donors

---

### 3. System Boundary

#### **Organizational Boundary**
*Defines which entities and operations are included in the carbon inventory*

**Included Entities:**
- SLGTI Main Campus (Colombo)
- All satellite training centers
- Administrative offices
- Student hostels (if managed by SLGTI)
- Transportation services (buses, vehicles owned/operated by SLGTI)

**Excluded Entities:**
- Student-owned vehicles (unless SLGTI-operated)
- Contractor operations (unless SLGTI has operational control)
- Alumni activities
- Private businesses on campus

**Consolidation Approach:** Operational Control
- SLGTI has full authority to introduce and implement operational policies for all included entities

#### **Operational Boundary**
*Defines which emission sources and activities are tracked*

**Included Activities:**
- Energy consumption (electricity, diesel, LPG)
- Transportation (institutional vehicles, employee commuting)
- Waste generation and disposal
- Water consumption
- Refrigerant leakage
- Purchased goods and services (where data is available)
- Capital goods (major equipment purchases)

**Excluded Activities (due to data limitations):**
- Employee business travel (personal vehicles)
- Supply chain emissions (upstream/downstream)
- Student commuting (unless institutional transport)
- Land use changes

**Temporal Boundary:**
- Reporting Period: January 1 - December 31 (annual)
- Historical Data: Minimum 3 years for trend analysis
- Real-time Data Entry: Current year with monthly granularity

---

### 4. Emission Categories (ISO 14064 Scopes)

#### **Scope 1: Direct Emissions**
*Emissions from sources owned or controlled by SLGTI*

| Source Category | Examples | Data Collection Method |
|----------------|----------|----------------------|
| **Stationary Combustion** | Diesel generators, LPG for cooking | Fuel purchase records, meter readings |
| **Mobile Combustion** | SLGTI buses, maintenance vehicles | Fuel purchase logs, odometer readings |
| **Fugitive Emissions** | Refrigerant leakage from AC units | Maintenance logs, equipment inventory |
| **Process Emissions** | Laboratory chemicals (if applicable) | Chemical inventory, usage logs |

**Calculation Method:**
```
Scope 1 Emissions = Σ(Activity Data × Emission Factor × GWP)
```

#### **Scope 2: Indirect Emissions from Purchased Energy**
*Emissions from electricity, heat, or steam purchased by SLGTI*

| Source Category | Examples | Data Collection Method |
|----------------|----------|----------------------|
| **Purchased Electricity** | Grid electricity for buildings | Electricity bills, sub-meter readings |
| **Purchased Heat** | District heating (if applicable) | Utility bills |
| **Purchased Steam** | Industrial steam (if applicable) | Utility bills |

**Calculation Method:**
```
Scope 2 Emissions = Σ(Electricity Consumption (kWh) × Grid Emission Factor)
```

**Location-Based vs. Market-Based:**
- **Location-Based:** Uses average grid emission factor (default)
- **Market-Based:** Uses contractual instruments (RECs, green tariffs) if available

#### **Scope 3: Other Indirect Emissions**
*All other indirect emissions in the value chain*

| Source Category | Examples | Data Collection Method |
|----------------|----------|----------------------|
| **Purchased Goods & Services** | Office supplies, lab equipment | Procurement records, spend-based estimation |
| **Capital Goods** | Buildings, machinery | Capital expenditure records |
| **Fuel & Energy Related** | Upstream emissions from fuel extraction | Supplier data, industry averages |
| **Waste Generated** | Solid waste, wastewater | Waste disposal records, waste audits |
| **Business Travel** | Employee travel (if tracked) | Travel expense reports |
| **Employee Commuting** | Staff transportation | Survey data, transport allowances |
| **Transportation & Distribution** | Inbound/outbound logistics | Shipping records (if available) |

**Calculation Method:**
```
Scope 3 Emissions = Σ(Activity Data × Emission Factor × GWP)
```

**Data Quality Hierarchy:**
1. Supplier-specific data (highest quality)
2. Industry-average data
3. Spend-based estimation (lowest quality)

---

### 5. Inputs Mapped to Each Scope

#### **Scope 1 Inputs**

| Input Field | Data Type | Unit | Source | Frequency |
|-------------|-----------|------|--------|-----------|
| Diesel consumption (generators) | Numeric | Liters | Fuel purchase records | Monthly |
| Diesel consumption (vehicles) | Numeric | Liters | Fuel logs | Monthly |
| LPG consumption | Numeric | kg | Purchase records | Monthly |
| Refrigerant type | Dropdown | - | Equipment inventory | Annual |
| Refrigerant quantity leaked | Numeric | kg | Maintenance logs | Annual |
| Vehicle type | Dropdown | - | Fleet inventory | Annual |
| Vehicle distance traveled | Numeric | km | Odometer logs | Monthly |

#### **Scope 2 Inputs**

| Input Field | Data Type | Unit | Source | Frequency |
|-------------|-----------|------|--------|-----------|
| Electricity consumption | Numeric | kWh | Electricity bills | Monthly |
| Electricity provider | Dropdown | - | Utility contract | Annual |
| Grid emission factor | Numeric | kgCO2e/kWh | National grid data | Annual |
| Renewable energy certificates | Numeric | kWh | REC purchases | Annual |

#### **Scope 3 Inputs**

| Input Field | Data Type | Unit | Source | Frequency |
|-------------|-----------|------|--------|-----------|
| Office paper consumption | Numeric | reams | Procurement records | Quarterly |
| Laboratory chemicals | Numeric | kg | Chemical inventory | Quarterly |
| Equipment purchases | Numeric | USD/LKR | Capital expenditure | Annual |
| Waste generated (landfill) | Numeric | kg | Waste audits | Quarterly |
| Waste generated (recycled) | Numeric | kg | Waste audits | Quarterly |
| Wastewater generated | Numeric | m³ | Water bills | Monthly |
| Employee count | Numeric | - | HR records | Annual |
| Average commute distance | Numeric | km | Employee survey | Annual |

---

### 6. Outputs

#### **Gas-Specific Emissions**

| Gas | Formula | Global Warming Potential (GWP) | Unit |
|-----|---------|-------------------------------|------|
| Carbon Dioxide | CO₂ | 1 | kg CO₂ |
| Methane | CH₄ | 28 (AR5) | kg CH₄ |
| Nitrous Oxide | N₂O | 265 (AR5) | kg N₂O |

#### **CO₂ Equivalent (CO₂e) Calculation**

```
CO₂e = (CO₂ × 1) + (CH₄ × 28) + (N₂O × 265)
```

**Reporting Outputs:**

1. **Emission Summary by Scope**
   - Scope 1 Total: X kg CO₂e
   - Scope 2 Total: Y kg CO₂e
   - Scope 3 Total: Z kg CO₂e
   - Grand Total: (X + Y + Z) kg CO₂e

2. **Emission by Gas Type**
   - CO₂ emissions by scope
   - CH₄ emissions by scope
   - N₂O emissions by scope

3. **Emission by Source Category**
   - Energy: X kg CO₂e
   - Transportation: Y kg CO₂e
   - Waste: Z kg CO₂e
   - Purchased Goods: W kg CO₂e

4. **Trend Analysis**
   - Year-over-year comparison
   - Monthly/quarterly breakdowns
   - Emission intensity metrics (per student, per m²)

5. **Scope Classification Matrix**

| Source | Scope 1 | Scope 2 | Scope 3 | Total CO₂e |
|--------|---------|---------|---------|------------|
| Diesel Generator | ✓ | | | 1,200 kg |
| Electricity | | ✓ | | 8,500 kg |
| Waste | | | ✓ | 450 kg |
| **Total** | **1,200** | **8,500** | **450** | **10,150 kg** |

---

### 7. Real Reporting Use Case: Annual Audit & ESG Reporting

#### **Use Case: SLGTI Annual Carbon Footprint Report for Government Compliance**

**Scenario:**
SLGTI must submit an annual environmental report to the Ministry of Environment, including verified carbon emissions data. The report must comply with ISO 14064-1:2018 and be auditable by a third-party verification body.

**Workflow:**

1. **Data Collection Phase (January - February)**
   - Trainers assign data entry tasks to students
   - Students input monthly activity data for their assigned areas
   - System validates data completeness and flags missing entries

2. **Validation Phase (March)**
   - Trainers review and approve student-submitted data
   - System performs automated validation checks:
     - Range checks (e.g., electricity consumption within expected bounds)
     - Completeness checks (all required fields populated)
     - Consistency checks (e.g., fuel consumption vs. vehicle distance)

3. **Calculation Phase (March)**
   - System applies ISO 14064-compliant emission factors
   - Calculates CO₂e for each source and scope
   - Generates preliminary emission inventory

4. **Review & Approval Phase (April)**
   - Organization administrators review calculated emissions
   - Compare with previous years for anomalies
   - Approve final emission inventory

5. **Reporting Phase (April - May)**
   - Generate ISO 14064-compliant report including:
     - Organizational boundary description
     - Operational boundary description
     - Emission inventory by scope
     - Methodology and emission factors used
     - Data quality assessment
     - Year-over-year comparison
     - Reduction initiatives and targets

6. **External Verification (June)**
   - Third-party auditor accesses system
   - Reviews audit trail for all data entries
   - Verifies calculation methodology
   - Validates emission factors against recognized sources
   - Issues verification statement

**Report Contents:**

```
SLGTI CARBON FOOTPRINT REPORT 2025
ISO 14064-1:2018 Compliant

1. Executive Summary
   - Total Emissions: 10,150 kg CO₂e
   - Scope 1: 1,200 kg CO₂e (11.8%)
   - Scope 2: 8,500 kg CO₂e (83.7%)
   - Scope 3: 450 kg CO₂e (4.4%)

2. Organizational Boundary
   - Operational control approach
   - All SLGTI campuses included

3. Emission Inventory
   [Detailed tables by scope and source]

4. Methodology
   - Emission factors: IPCC AR5, Sri Lanka CEA
   - GWP values: IPCC Fifth Assessment Report
   - Calculation: GHG Protocol Corporate Standard

5. Data Quality
   - 95% primary data coverage
   - 5% estimated data (clearly marked)

6. Verification Statement
   [Third-party auditor statement]
```

**Audit Trail Requirements:**
- Who entered the data (user ID, role)
- When data was entered (timestamp)
- What data was entered (original values)
- Who validated/approved the data
- Any modifications with justification
- Calculation methodology applied
- Emission factors used (with version/source)

---

## ISO 14064 Compliance Checklist

- [x] Organizational boundary defined (operational control)
- [x] Operational boundary defined (all material sources)
- [x] Scope 1, 2, 3 classification implemented
- [x] GHG-specific emissions (CO₂, CH₄, N₂O) tracked
- [x] CO₂e calculation using recognized GWP values
- [x] Emission factors from recognized sources
- [x] Data quality assessment mechanism
- [x] Audit trail for all data entries
- [x] Reporting capability for external verification
- [x] Temporal boundary defined (annual reporting period)
- [x] Completeness requirements addressed
- [x] Consistency and transparency maintained

---

*Document Version: 1.0*
*Last Updated: 2026-03-28*
*ISO Standard: 14064-1:2018*

---

## Phase 1 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D1.1 | Problem Statement Document | Markdown | Business Analyst |
| D1.2 | User Role Definitions | Markdown | Business Analyst |
| D1.3 | System Boundary Definition | Markdown | Compliance Lead |
| D1.4 | Emission Categories (ISO 14064 Scopes) | Markdown/Table | Compliance Lead |
| D1.5 | Input-Output Mapping | Markdown/Table | Business Analyst |
| D1.6 | ISO 14064 Compliance Checklist | Markdown | Compliance Lead |
| D1.7 | Reporting Use Case Specification | Markdown | Business Analyst |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M1.1 | Stakeholder Interviews Complete | All user roles identified | Week 1 Day 3 |
| M1.2 | System Boundary Approved | Organizational + operational boundary defined | Week 1 Day 5 |
| M1.3 | Requirements Document Finalized | All sections complete, stakeholder sign-off | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Business Analyst | Requirements gathering, user stories, use cases |
| Compliance Lead | ISO 14064 alignment, scope definitions, boundary |
| Project Manager | Stakeholder coordination, timeline management |
| Subject Matter Expert (SLGTI) | Domain knowledge, institutional context |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Stakeholder interviews, problem statement, boundary definition |
| Week 2 | Emission categories, input mapping, output specifications, compliance checklist |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Stakeholder unavailability | High | Medium | Schedule interviews early; have backup contacts |
| Unclear organizational boundary | High | Medium | Reference ISO 14064 guidance documents |
| Scope too broad | Medium | High | Prioritize material emission sources first |
| Regulatory requirements change | Medium | Low | Design for flexibility; modular emission factors |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Stakeholder coverage | 100% | All user roles represented |
| ISO 14064 alignment | 100% | Compliance checklist complete |
| Requirements completeness | 100% | All sections filled with specifics |
| Stakeholder approval | Signed off | Review meeting with sign-off |

### Transition Criteria to Phase 2

- [x] Problem statement documented and approved
- [x] All user roles defined with permissions
- [x] System boundary (organizational + operational) defined
- [x] ISO 14064 emission categories mapped
- [x] Input/output specifications complete
- [x] Compliance checklist passes all items
- [x] Stakeholder sign-off obtained
