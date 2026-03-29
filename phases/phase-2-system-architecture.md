# PHASE 2 — SYSTEM ARCHITECTURE (ENTERPRISE LOGIC)

## Explanation (WHY)

Before writing any code, we need a **blueprint**. Just like a building needs an architect's plan before construction, a web application needs a system architecture.

**Why is this important for Carbon Accounting?**
- ISO 14064 requires **traceability** — every emission calculation must be auditable
- Data must flow in a **predictable path** — input → validate → calculate → store → report
- The system must be **scalable** — handle more users and data over time
- **Modularity** — each part can be updated independently without breaking the whole system

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CARBON ACCOUNTING PLATFORM                │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   STUDENT   │  │   TRAINER   │  │ ORGANIZATION│
│   PORTAL    │  │   PORTAL    │  │   PORTAL    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   API GATEWAY   │
              │                 │
              │ • Authentication│
              │ • Rate Limiting │
              │ • Routing       │
              └────────┬────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    AUTH     │ │    DATA     │ │ CALCULATION │
│   SERVICE   │ │   SERVICE   │ │   ENGINE    │
└─────────────┘ └─────────────┘ └─────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   AUDIT SERVICE │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    DATABASE     │
              │                 │
              │ • MongoDB       │
              │ • Redis Cache   │
              └─────────────────┘
```

---

## Step-by-Step Implementation (HOW)

### 1. Frontend Responsibilities

**What does the frontend do?**

The frontend is what users **see and interact with**. Think of it as the "face" of your application.

#### A. Data Input
```
┌─────────────────────────────────────────┐
│           DATA INPUT FORMS              │
├─────────────────────────────────────────┤
│                                         │
│  Scope 1: Direct Emissions              │
│  ┌─────────────────────────────────┐   │
│  │ Fuel Type: [Diesel ▼]           │   │
│  │ Quantity:  [500    ] liters     │   │
│  │ Date:      [2025-01]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Scope 2: Electricity                   │
│  ┌─────────────────────────────────┐   │
│  │ Electricity: [5000  ] kWh       │   │
│  │ Month:       [January ▼]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Scope 3: Travel                        │
│  ┌─────────────────────────────────┐   │
│  │ Distance: [100  ] km            │   │
│  │ Vehicle:  [Car ▼]               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Submit] [Reset]                       │
└─────────────────────────────────────────┘
```

**Frontend Jobs:**
- Show forms for users to enter data
- Validate input BEFORE sending to backend (e.g., "Quantity must be a positive number")
- Display results (CO₂e calculations, charts)
- Show dashboards with emission breakdowns

#### B. Visualization
```
┌─────────────────────────────────────────┐
│         EMISSION DASHBOARD              │
├─────────────────────────────────────────┤
│                                         │
│  Total CO₂e: 10,150 kg                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Scope 1: 1,200 kg (11.8%)     │   │
│  │  ████████░░░░░░░░░░░░░░░░░░░░  │   │
│  ├─────────────────────────────────┤   │
│  │  Scope 2: 8,500 kg (83.7%)     │   │
│  │  ████████████████████████████░  │   │
│  ├─────────────────────────────────┤   │
│  │  Scope 3: 450 kg (4.4%)        │   │
│  │  ███░░░░░░░░░░░░░░░░░░░░░░░░░  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Export PDF] [Export Excel]            │
└─────────────────────────────────────────┘
```

---

### 2. Backend Components

**What does the backend do?**

The backend is the "brain" of your application. It processes data, performs calculations, and stores everything securely.

#### A. Calculation Engine

**WHY:** This is the CORE of carbon accounting. It converts activity data (like "500 liters of diesel") into CO₂e emissions.

```
┌─────────────────────────────────────────┐
│        CALCULATION ENGINE               │
├─────────────────────────────────────────┤
│                                         │
│  Input: 500 liters diesel               │
│         ↓                               │
│  Step 1: Look up emission factor        │
│          2.68 kgCO₂/liter               │
│         ↓                               │
│  Step 2: Calculate CO₂                  │
│          500 × 2.68 = 1,340 kg CO₂     │
│         ↓                               │
│  Step 3: Calculate CH₄                  │
│          500 × 0.0002 = 0.1 kg CH₄     │
│         ↓                               │
│  Step 4: Calculate N₂O                  │
│          500 × 0.00001 = 0.005 kg N₂O  │
│         ↓                               │
│  Step 5: Convert to CO₂e                │
│          (1340×1) + (0.1×28) + (0.005×265)
│          = 1,344.125 kg CO₂e            │
│         ↓                               │
│  Output: 1,344.125 kg CO₂e              │
│                                         │
└─────────────────────────────────────────┘
```

**Calculation Formula:**
```
CO₂e = (CO₂ × 1) + (CH₄ × 28) + (N₂O × 265)
```

**Why these numbers?**
- CO₂ has a Global Warming Potential (GWP) of 1 (baseline)
- CH₄ (Methane) has a GWP of 28 (28 times more warming than CO₂)
- N₂O (Nitrous Oxide) has a GWP of 265 (265 times more warming than CO₂)

These values come from the **IPCC Fifth Assessment Report (AR5)** — the international scientific standard.

#### B. Scope Classification

**WHY:** ISO 14064 requires emissions to be classified into three scopes. This must happen automatically to prevent errors.

```
┌─────────────────────────────────────────┐
│       SCOPE CLASSIFICATION              │
├─────────────────────────────────────────┤
│                                         │
│  Input: "diesel_generator"              │
│         ↓                               │
│  Lookup: SCOPE_RULES["diesel_generator"]│
│         ↓                               │
│  Result: "scope_1"                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ SCOPE 1 (Direct):              │   │
│  │ • diesel_generator             │   │
│  │ • diesel_vehicle               │   │
│  │ • lpg_combustion               │   │
│  │ • refrigerant_leak             │   │
│  ├─────────────────────────────────┤   │
│  │ SCOPE 2 (Electricity):         │   │
│  │ • electricity_grid             │   │
│  │ • purchased_heat               │   │
│  ├─────────────────────────────────┤   │
│  │ SCOPE 3 (Value Chain):         │   │
│  │ • office_paper                 │   │
│  │ • waste_landfill               │   │
│  │ • employee_commuting           │   │
│  │ • equipment_purchase           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### C. Validation Layer

**WHY:** Bad data in = bad calculations out. Validation ensures data quality BEFORE calculation.

```
┌─────────────────────────────────────────┐
│         VALIDATION LAYER                │
├─────────────────────────────────────────┤
│                                         │
│  Input Data                             │
│       ↓                                 │
│  ┌─────────────────────────────────┐   │
│  │ Rule 1: Format Check            │   │
│  │ Is quantity a number?           │   │
│  │ ✓ Pass                          │   │
│  └─────────────────────────────────┘   │
│       ↓                                 │
│  ┌─────────────────────────────────┐   │
│  │ Rule 2: Range Check             │   │
│  │ Is 500 liters reasonable?       │   │
│  │ (0 < x < 100,000)              │   │
│  │ ✓ Pass                          │   │
│  └─────────────────────────────────┘   │
│       ↓                                 │
│  ┌─────────────────────────────────┐   │
│  │ Rule 3: Required Fields         │   │
│  │ Are all mandatory fields filled?│   │
│  │ ✓ Pass                          │   │
│  └─────────────────────────────────┘   │
│       ↓                                 │
│  ┌─────────────────────────────────┐   │
│  │ Rule 4: Business Logic          │   │
│  │ Is date within reporting period?│   │
│  │ ✓ Pass                          │   │
│  └─────────────────────────────────┘   │
│       ↓                                 │
│  Result: VALID → Send to Calculation    │
│                                         │
└─────────────────────────────────────────┘
```

---

### 3. Database Design (High-Level)

**WHY:** We need to store data in a structured way that supports:
- **Traceability** — who entered what, when
- **Auditability** — complete history of all changes
- **Reporting** — easy retrieval for reports

#### Database Collections (Tables)

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐
│    USERS     │       │ACTIVITY_DATA │
├──────────────┤       ├──────────────┤
│ _id          │       │ _id          │
│ email        │       │ userId       │──┐
│ name         │◄──────│ scope        │  │
│ role         │       │ sourceType   │  │
│ orgId        │       │ quantity     │  │
│ createdAt    │       │ unit         │  │
└──────────────┘       │ date         │  │
                       │ status       │  │
                       └──────────────┘  │
                              │          │
                              ▼          │
                       ┌──────────────┐  │
                       │ CALCULATIONS │  │
                       ├──────────────┤  │
                       │ _id          │  │
                       │ activityId   │◄─┘
                       │ scope        │
                       │ co2          │
                       │ ch4          │
                       │ n2o          │
                       │ co2e         │
                       │ factorUsed   │
                       │ calculatedAt │
                       └──────────────┘
                              │
                              ▼
┌──────────────┐       ┌──────────────┐
│EMISSION_     │       │  AUDIT_LOGS  │
│FACTORS       │       ├──────────────┤
├──────────────┤       │ _id          │
│ _id          │       │ userId       │
│ sourceType   │       │ action       │
│ gasType      │       │ collection   │
│ factorValue  │       │ recordId     │
│ unit         │       │ oldValue     │
│ source       │       │ newValue     │
│ year         │       │ timestamp    │
│ region       │       │ ipAddress    │
└──────────────┘       └──────────────┘
```

#### Collection Details

**1. Users Collection**
```javascript
{
  _id: ObjectId("..."),
  email: "student@slgti.lk",
  name: "John Silva",
  role: "student",           // "student", "trainer", "admin"
  orgId: ObjectId("..."),    // Links to organization
  createdAt: ISODate("2025-01-15"),
  lastLogin: ISODate("2025-03-28")
}
```

**2. ActivityData Collection**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),       // Who entered this data
  scope: "scope_1",              // ISO 14064 scope classification
  sourceType: "diesel_generator", // What type of emission source
  quantity: 500,                  // How much
  unit: "liters",                 // Unit of measurement
  date: ISODate("2025-01-31"),   // When this activity occurred
  status: "approved",            // "pending", "approved", "rejected"
  validatedBy: ObjectId("..."),  // Trainer who approved
  notes: "Main campus generator",
  createdAt: ISODate("2025-02-01")
}
```

**3. EmissionFactors Collection**
```javascript
{
  _id: ObjectId("..."),
  sourceType: "diesel_generator",
  gasType: "CO2",              // "CO2", "CH4", "N2O"
  factorValue: 2.68,           // kg per unit
  unit: "kgCO2/liter",
  source: "IPCC AR5",          // Where this factor comes from
  year: 2025,
  region: "global",
  isActive: true
}
```

**4. Calculations Collection**
```javascript
{
  _id: ObjectId("..."),
  activityId: ObjectId("..."),  // Links to ActivityData
  scope: "scope_1",
  co2: 1340.00,                 // kg CO₂
  ch4: 0.10,                    // kg CH₄
  n2o: 0.005,                   // kg N₂O
  co2e: 1344.125,               // kg CO₂e (final result)
  factorUsed: {
    source: "IPCC AR5",
    co2Factor: 2.68,
    ch4Factor: 0.0002,
    n2oFactor: 0.00001
  },
  calculatedAt: ISODate("2025-02-01T10:30:00Z")
}
```

**5. AuditLogs Collection**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  action: "CREATE",            // "CREATE", "UPDATE", "DELETE", "VALIDATE"
  collection: "ActivityData",  // Which collection was affected
  recordId: ObjectId("..."),   // Which record was affected
  oldValue: null,              // Previous value (for updates)
  newValue: {                  // New value
    scope: "scope_1",
    sourceType: "diesel_generator",
    quantity: 500
  },
  timestamp: ISODate("2025-02-01T10:30:00Z"),
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0..."
}
```

---

### 4. Data Flow

**WHY:** Understanding data flow helps you debug issues and ensures data integrity at every step.

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                               │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   INPUT     │
    │  (User      │
    │   fills     │
    │   form)     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  VALIDATION │
    │             │
    │ • Is it a   │
    │   number?   │
    │ • Is it     │
    │   positive? │
    │ • Is date   │
    │   valid?    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  SCOPE      │
    │ CLASSIFI-   │
    │  CATION    │
    │             │
    │ • Lookup    │
    │   scope     │
    │   rules     │
    │ • Assign    │
    │   scope     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ CALCULATION │
    │             │
    │ • Get       │
    │   emission  │
    │   factor    │
    │ • Multiply  │
    │ • Convert   │
    │   to CO₂e   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   STORAGE   │
    │             │
    │ • Save      │
    │   activity  │
    │ • Save      │
    │   calculation│
    │ • Log to    │
    │   audit     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  REPORTING  │
    │             │
    │ • Show on   │
    │   dashboard │
    │ • Generate  │
    │   reports   │
    │ • Export    │
    │   PDF/Excel │
    └─────────────┘
```

**Real Example:**

1. **Input:** User enters "500 liters diesel for generator in January 2025"
2. **Validation:** System checks — is 500 a number? Is it positive? Is January 2025 a valid date?
3. **Classification:** System looks up "diesel_generator" → assigns to "Scope 1"
4. **Calculation:** System finds emission factor (2.68 kgCO₂/liter) → calculates 500 × 2.68 = 1,340 kg CO₂
5. **Storage:** Saves activity data, calculation result, and audit log
6. **Reporting:** Shows "1,344.125 kg CO₂e from Scope 1" on dashboard

---

### 5. Audit Trail Mechanism

**WHY:** ISO 14064 requires **complete traceability**. An auditor must be able to trace any number back to its source.

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL                               │
└─────────────────────────────────────────────────────────────┘

Every action is logged:

┌─────────────────────────────────────────────────────────────┐
│ AUDIT LOG ENTRY                                             │
├─────────────────────────────────────────────────────────────┤
│ WHO:    student@slgti.lk (User ID: 507f1f77bcf86cd799439011)│
│ WHAT:   Created new activity data                           │
│ WHEN:   2025-02-01 10:30:00 UTC                            │
│ WHERE:  IP: 192.168.1.100                                   │
│                                                             │
│ DETAILS:                                                    │
│   Collection: ActivityData                                  │
│   Record ID:  507f1f77bcf86cd799439012                      │
│   Action:     CREATE                                        │
│   Old Value:  null                                          │
│   New Value:  {                                             │
│     "scope": "scope_1",                                     │
│     "sourceType": "diesel_generator",                       │
│     "quantity": 500,                                        │
│     "unit": "liters"                                        │
│   }                                                         │
└─────────────────────────────────────────────────────────────┘
```

**What gets audited?**
- ✅ Every data entry (who, when, what)
- ✅ Every validation decision (approved/rejected by whom)
- ✅ Every calculation (what factors were used)
- ✅ Every report generation (who accessed what data)
- ✅ Every data modification (old value → new value)

**Why is this critical?**
- External auditors need to verify your calculations
- If there's an error, you can trace it to the source
- It prevents fraud and data manipulation
- It's required for ISO 14064 certification

---

### 6. Scalability and Modularity

**WHY:** Your app will grow. More users, more data, more features. The architecture must handle this.

#### Scalability (Handling Growth)

```
┌─────────────────────────────────────────────────────────────┐
│                  SCALABILITY                                 │
└─────────────────────────────────────────────────────────────┘

START (Small):                  GROWTH (Medium):
┌─────────────┐                ┌─────────────┐
│   Server    │                │ Load        │
│   + DB      │                │ Balancer    │
│             │                └──────┬──────┘
└─────────────┘                       │
                               ┌──────┴──────┐
                               │             │
                          ┌────┴────┐  ┌────┴────┐
                          │Server 1 │  │Server 2 │
                          └────┬────┘  └────┬────┘
                               │             │
                               └──────┬──────┘
                                      │
                                 ┌────┴────┐
                                 │Database │
                                 │ Cluster │
                                 └─────────┘
```

**How to scale:**
1. **Horizontal Scaling:** Add more servers behind a load balancer
2. **Database Replication:** Copy database to multiple servers
3. **Caching:** Store frequently used data (like emission factors) in fast memory (Redis)
4. **Async Processing:** Use message queues for heavy calculations

#### Modularity (Independent Components)

```
┌─────────────────────────────────────────────────────────────┐
│                  MODULARITY                                  │
└─────────────────────────────────────────────────────────────┘

Each module can be updated independently:

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   AUTH      │  │   DATA      │  │ CALCULATION │
│   MODULE    │  │   MODULE    │  │   MODULE    │
│             │  │             │  │             │
│ Can update  │  │ Can update  │  │ Can update  │
│ without     │  │ without     │  │ without     │
│ affecting   │  │ affecting   │  │ affecting   │
│ others      │  │ others      │  │ others      │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Benefits:**
- Update calculation logic without touching the UI
- Add new emission sources without changing the database
- Fix authentication bugs without affecting calculations

---

## Common Mistakes

❌ **Mistake 1:** Putting all logic in one big file
✅ **Solution:** Separate into modules (auth, data, calculation, reporting)

❌ **Mistake 2:** No validation before calculation
✅ **Solution:** Always validate input data first

❌ **Mistake 3:** Not logging audit trails
✅ **Solution:** Log every action automatically

❌ **Mistake 4:** Hardcoding emission factors in code
✅ **Solution:** Store factors in database so they can be updated

❌ **Mistake 5:** No error handling
✅ **Solution:** Handle errors gracefully and log them

---

## Next Action

Now that you understand the architecture, proceed to **Phase 3: Tech Stack Selection** to choose the specific technologies you'll use to build this system.

---

*Phase 2 Complete ✅*
*Next: Phase 3 — Tech Stack (Justified Selection)*

---

## Phase 2 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D2.1 | System Architecture Document | Markdown/Visio | Lead Architect |
| D2.2 | Component Diagram (Frontend/Backend/DB) | Diagram | Lead Architect |
| D2.3 | Data Flow Diagram (End-to-End) | Diagram | Lead Architect |
| D2.4 | Database Schema (High-Level) | ERD Document | Database Lead |
| D2.5 | API Contract Definition | OpenAPI/Swagger Spec | Backend Lead |
| D2.6 | Audit Trail Design Document | Markdown | Compliance Lead |
| D2.7 | Scalability Plan | Markdown | Lead Architect |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M2.1 | Architecture Draft Complete | All components defined | Week 1 |
| M2.2 | Architecture Review Passed | Stakeholder sign-off | Week 2 |
| M2.3 | API Contract Finalized | OpenAPI spec published | Week 2 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Lead Architect | Overall system design, component diagrams |
| Backend Lead | API design, calculation engine architecture |
| Database Lead | Schema design, indexing strategy |
| Compliance Lead | Audit trail design, ISO 14064 alignment |
| Project Manager | Review facilitation, milestone tracking |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Define components, data flow, database schema |
| Week 2 | API contracts, audit trail design, architecture review |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Over-engineering architecture | High | Medium | Follow "start simple" principle; defer microservices |
| Misaligned ISO 14064 requirements | High | Low | Cross-reference with Phase 1 compliance checklist |
| Stakeholder disagreement on approach | Medium | Medium | Facilitate decision matrix workshop |
| Underestimating audit complexity | Medium | High | Study ISO 14064 audit requirements early |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Architecture completeness | 100% | All components documented with responsibilities |
| ISO alignment | 100% | All Phase 1 requirements addressed in architecture |
| Stakeholder approval | Signed off | Architecture review meeting with sign-off |
| API coverage | 100% | All required endpoints defined in contract |

### Transition Criteria to Phase 3

- [x] Architecture document complete and reviewed
- [x] All components have defined responsibilities
- [x] Data flow validated against ISO 14064 requirements
- [x] Database schema supports traceability and auditability
- [x] API contract covers all required endpoints
- [x] Scalability approach documented
- [x] Stakeholder sign-off obtained
