# PHASE 7 — DATABASE (TRACEABLE + AUDITABLE)

## Explanation (WHY)

The database is where all carbon accounting data lives. For ISO 14064 compliance, the database must be:
- **Traceable** — Every number can be traced back to its source
- **Auditable** — Complete history of all changes
- **Structured** — Data organized for easy reporting
- **Secure** — Only authorized users can access/modify data

**Why MongoDB for Carbon Accounting?**
- Flexible document structure (different emission sources have different fields)
- JSON-like documents (natural for JavaScript developers)
- Built-in timestamps for audit trails
- Easy to store complex nested data (calculation details, factor sources)

---

## Database Collections Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE COLLECTIONS                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐
│    USERS     │       │ACTIVITY_DATA │
├──────────────┤       ├──────────────┤
│ Who can      │       │ What was     │
│ access the   │       │ entered      │
│ system       │       │              │
└──────────────┘       └──────────────┘
       │                      │
       │                      ▼
       │              ┌──────────────┐
       │              │ CALCULATIONS │
       │              ├──────────────┤
       │              │ What was     │
       │              │ calculated   │
       │              └──────────────┘
       │                      │
       │                      ▼
       │              ┌──────────────┐
       │              │EMISSION_     │
       │              │FACTORS       │
       │              ├──────────────┤
       │              │ What factors │
       │              │ were used    │
       │              └──────────────┘
       │                      │
       └──────────────────────┼──────────────────────┐
                              │                      │
                              ▼                      ▼
                       ┌──────────────┐      ┌──────────────┐
                       │  AUDIT_LOGS  │      │   REPORTS    │
                       ├──────────────┤      ├──────────────┤
                       │ Who did what │      │ What was     │
                       │ and when     │      │ generated    │
                       └──────────────┘      └──────────────┘
```

---

## Collection Details

### 1. Users Collection

**Purpose:** Store user accounts and permissions

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d0"),
  email: "student@slgti.lk",
  name: "John Silva",
  password: "$2b$10$hashedPasswordHere",  // bcrypt hashed
  role: "student",  // "student", "trainer", "admin"
  organization: "SLGTI",
  isActive: true,
  lastLogin: ISODate("2025-03-28T10:30:00Z"),
  createdAt: ISODate("2025-01-15T08:00:00Z"),
  updatedAt: ISODate("2025-03-28T10:30:00Z")
}
```

**Schema Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | Unique email address |
| name | String | Yes | Full name |
| password | String | Yes | Hashed password |
| role | String | Yes | User role (student/trainer/admin) |
| organization | String | Yes | Organization name |
| isActive | Boolean | No | Account status (default: true) |
| lastLogin | Date | No | Last login timestamp |

**Indexes:**
```javascript
// Unique index on email
db.users.createIndex({ "email": 1 }, { unique: true });

// Index on role for filtering
db.users.createIndex({ "role": 1 });

// Index on organization
db.users.createIndex({ "organization": 1 });
```

---

### 2. ActivityData Collection

**Purpose:** Store raw emission activity data entered by users

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d1"),
  userId: ObjectId("6629a1b2c3d4e5f6a7b8c9d0"),
  scope: "scope_1",
  sourceType: "diesel_generator",
  quantity: 500,
  unit: "liters",
  dateFrom: ISODate("2025-01-01T00:00:00Z"),
  dateTo: ISODate("2025-01-31T23:59:59Z"),
  notes: "Main campus generator - monthly consumption",
  status: "approved",  // "pending", "approved", "rejected"
  validatedBy: ObjectId("6629a1b2c3d4e5f6a7b8c9d2"),
  validatedAt: ISODate("2025-02-02T14:15:00Z"),
  rejectionReason: null,
  createdAt: ISODate("2025-02-01T10:30:00Z"),
  updatedAt: ISODate("2025-02-02T14:15:00Z")
}
```

**Schema Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | ObjectId | Yes | Reference to Users collection |
| scope | String | Yes | ISO 14064 scope (scope_1/scope_2/scope_3) |
| sourceType | String | Yes | Type of emission source |
| quantity | Number | Yes | Amount of activity |
| unit | String | Yes | Unit of measurement |
| dateFrom | Date | Yes | Start of reporting period |
| dateTo | Date | Yes | End of reporting period |
| notes | String | No | Additional notes |
| status | String | No | Validation status (default: "pending") |
| validatedBy | ObjectId | No | Reference to trainer who validated |
| validatedAt | Date | No | When validation occurred |
| rejectionReason | String | No | Reason if rejected |

**Indexes:**
```javascript
// Index on scope for filtering
db.activitydata.createIndex({ "scope": 1 });

// Index on userId for user queries
db.activitydata.createIndex({ "userId": 1 });

// Index on date range for period queries
db.activitydata.createIndex({ "dateFrom": 1, "dateTo": 1 });

// Index on status for validation workflow
db.activitydata.createIndex({ "status": 1 });

// Compound index for common queries
db.activitydata.createIndex({ "scope": 1, "dateFrom": 1, "status": 1 });
```

**Why this structure?**
- `userId` links to who entered the data (traceability)
- `scope` enables ISO 14064 classification
- `status` supports validation workflow (pending → approved/rejected)
- `validatedBy` and `validatedAt` provide audit trail for validation

---

### 3. EmissionFactors Collection

**Purpose:** Store emission factors used for calculations

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d3"),
  scope: "scope_1",
  sourceType: "diesel_generator",
  gasType: "CO2",
  factorValue: 2.68,
  unit: "kgCO2/liter",
  source: "IPCC AR5",
  year: 2025,
  region: "global",
  isActive: true,
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T00:00:00Z")
}
```

**Schema Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| scope | String | Yes | ISO 14064 scope |
| sourceType | String | Yes | Type of emission source |
| gasType | String | Yes | Gas type (CO2/CH4/N2O) |
| factorValue | Number | Yes | Emission factor value |
| unit | String | Yes | Unit of the factor |
| source | String | Yes | Source of the factor (IPCC, EPA, etc.) |
| year | Number | Yes | Year of the factor |
| region | String | No | Geographic region (default: "global") |
| isActive | Boolean | No | Whether factor is active (default: true) |

**Indexes:**
```javascript
// Unique compound index for factor lookup
db.emissionfactors.createIndex(
  { "scope": 1, "sourceType": 1, "gasType": 1, "year": 1, "region": 1 },
  { unique: true }
);

// Index on source for queries
db.emissionfactors.createIndex({ "source": 1 });

// Index on year for versioning
db.emissionfactors.createIndex({ "year": -1 });
```

**Why store factors in database?**
- Factors can be updated without changing code
- Different regions have different factors
- Factors change over time (new IPCC reports)
- Audit trail shows which factor version was used

---

### 4. Calculations Collection

**Purpose:** Store calculated emission results

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d4"),
  activityId: ObjectId("6629a1b2c3d4e5f6a7b8c9d1"),
  scope: "scope_1",
  sourceType: "diesel_generator",
  co2: 1340.00,
  ch4: 0.10,
  n2o: 0.005,
  co2e: 1344.125,
  factorUsed: {
    co2Factor: 2.68,
    ch4Factor: 0.0002,
    n2oFactor: 0.00001,
    source: "IPCC AR5",
    year: 2025
  },
  gwpValues: {
    co2: 1,
    ch4: 28,
    n2o: 265
  },
  calculatedAt: ISODate("2025-02-01T10:30:00Z"),
  createdAt: ISODate("2025-02-01T10:30:00Z"),
  updatedAt: ISODate("2025-02-01T10:30:00Z")
}
```

**Schema Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| activityId | ObjectId | Yes | Reference to ActivityData |
| scope | String | Yes | ISO 14064 scope |
| sourceType | String | Yes | Type of emission source |
| co2 | Number | Yes | CO₂ emissions (kg) |
| ch4 | Number | Yes | CH₄ emissions (kg) |
| n2o | Number | Yes | N₂O emissions (kg) |
| co2e | Number | Yes | CO₂ equivalent (kg) |
| factorUsed | Object | Yes | Emission factors used |
| gwpValues | Object | Yes | GWP values used |
| calculatedAt | Date | Yes | When calculation occurred |

**Indexes:**
```javascript
// Index on activityId for lookups
db.calculations.createIndex({ "activityId": 1 });

// Index on scope for aggregation
db.calculations.createIndex({ "scope": 1 });

// Index on calculatedAt for time-based queries
db.calculations.createIndex({ "calculatedAt": -1 });
```

**Why store calculation details?**
- **Traceability:** Shows exactly how each number was calculated
- **Audit:** Auditors can verify calculations
- **Debugging:** If there's an error, you can trace it
- **Reproducibility:** Same inputs always produce same outputs

---

### 5. AuditLogs Collection

**Purpose:** Track every action for ISO 14064 compliance

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d5"),
  userId: ObjectId("6629a1b2c3d4e5f6a7b8c9d0"),
  action: "CREATE",
  collection: "ActivityData",
  recordId: ObjectId("6629a1b2c3d4e5f6a7b8c9d1"),
  oldValue: null,
  newValue: {
    scope: "scope_1",
    sourceType: "diesel_generator",
    quantity: 500,
    unit: "liters"
  },
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  timestamp: ISODate("2025-02-01T10:30:00Z"),
  createdAt: ISODate("2025-02-01T10:30:00Z")
}
```

**Schema Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | ObjectId | Yes | Who performed the action |
| action | String | Yes | Action type (CREATE/UPDATE/DELETE/VALIDATE/CALCULATE) |
| collection | String | Yes | Which collection was affected |
| recordId | ObjectId | Yes | Which record was affected |
| oldValue | Mixed | No | Previous value (for updates) |
| newValue | Mixed | No | New value |
| ipAddress | String | No | IP address of the user |
| userAgent | String | No | Browser/device information |
| timestamp | Date | Yes | When the action occurred |

**Indexes:**
```javascript
// Index on userId for user activity queries
db.auditlogs.createIndex({ "userId": 1, "timestamp": -1 });

// Index on collection and recordId for record history
db.auditlogs.createIndex({ "collection": 1, "recordId": 1 });

// Index on timestamp for time-based queries
db.auditlogs.createIndex({ "timestamp": -1 });

// Index on action for filtering
db.auditlogs.createIndex({ "action": 1 });
```

**Why audit logs are critical for ISO compliance:**
- **Traceability:** Every change is recorded with who, when, what
- **Accountability:** Users know their actions are logged
- **Verification:** Auditors can verify data integrity
- **Debugging:** If something goes wrong, you can trace it
- **Compliance:** ISO 14064 requires complete audit trails

---

### 6. Reports Collection (Optional)

**Purpose:** Store generated reports for quick access

```javascript
// Example Document
{
  _id: ObjectId("6629a1b2c3d4e5f6a7b8c9d6"),
  organization: "SLGTI",
  reportType: "annual",
  periodStart: ISODate("2025-01-01T00:00:00Z"),
  periodEnd: ISODate("2025-12-31T23:59:59Z"),
  totalScope1: 1200.00,
  totalScope2: 8500.00,
  totalScope3: 450.00,
  totalCo2e: 10150.00,
  reportData: {
    // Detailed breakdown stored as JSON
    scope1: { ... },
    scope2: { ... },
    scope3: { ... }
  },
  generatedBy: ObjectId("6629a1b2c3d4e5f6a7b8c9d2"),
  generatedAt: ISODate("2025-04-01T10:00:00Z"),
  status: "approved",  // "draft", "approved", "submitted"
  filePath: "/reports/2025-annual-report.pdf",
  createdAt: ISODate("2025-04-01T10:00:00Z"),
  updatedAt: ISODate("2025-04-01T10:00:00Z")
}
```

---

## Relationships Between Collections

```
┌─────────────────────────────────────────────────────────────┐
│                COLLECTION RELATIONSHIPS                      │
└─────────────────────────────────────────────────────────────┘

┌──────────┐
│  USERS   │
└────┬─────┘
     │
     │ 1:N (one user can enter many activity records)
     │
     ▼
┌──────────────┐
│ACTIVITY_DATA │
└────┬─────────┘
     │
     │ 1:1 (one activity has one calculation)
     │
     ▼
┌──────────────┐
│ CALCULATIONS │
└────┬─────────┘
     │
     │ N:1 (many calculations use same emission factor)
     │
     ▼
┌──────────────┐
│EMISSION_     │
│FACTORS       │
└──────────────┘

┌──────────┐
│  USERS   │
└────┬─────┘
     │
     │ 1:N (one user can have many audit logs)
     │
     ▼
┌──────────────┐
│  AUDIT_LOGS  │
└──────────────┘
```

**How relationships work in MongoDB:**
- MongoDB doesn't have foreign keys like SQL
- We use `ObjectId` references to link documents
- We use `populate()` to fetch related data when needed

**Example: Get activity with calculation**
```javascript
const activity = await ActivityData.findById(activityId)
  .populate('userId', 'name email')  // Get user details
  .populate('validatedBy', 'name email');  // Get validator details

const calculation = await Calculation.findOne({ activityId: activity._id });
```

---

## Data Integrity & Validation

### Database-Level Validation

```javascript
// Mongoose schema validation (already in models)
const activityDataSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 0,  // Cannot be negative
    max: 1000000  // Reasonable upper limit
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],  // Only allowed values
    required: true
  }
  // ... other fields
});
```

### Application-Level Validation

```javascript
// In middleware/validation.js
// Validates data before it reaches the database
```

### Why Both?
- **Database validation:** Last line of defense, prevents bad data
- **Application validation:** Better error messages, faster feedback

---

## Query Examples

### Get all emissions for a specific scope
```javascript
const scope1Emissions = await ActivityData.find({
  scope: 'scope_1',
  status: 'approved'
}).populate('userId', 'name');
```

### Get total CO₂e by scope
```javascript
const summary = await Calculation.aggregate([
  {
    $group: {
      _id: '$scope',
      totalCo2e: { $sum: '$co2e' },
      count: { $sum: 1 }
    }
  }
]);
```

### Get audit trail for a specific record
```javascript
const auditTrail = await AuditLog.find({
  collection: 'ActivityData',
  recordId: activityId
}).sort({ timestamp: -1 });
```

### Get emissions for a date range
```javascript
const emissions = await ActivityData.find({
  dateFrom: { $gte: new Date('2025-01-01') },
  dateTo: { $lte: new Date('2025-12-31') },
  status: 'approved'
});
```

---

## Common Mistakes

❌ **Mistake 1:** Not storing calculation details
✅ **Solution:** Store factors used, GWP values, and individual gas emissions

❌ **Mistake 2:** No audit trail
✅ **Solution:** Create AuditLog collection and log every action

❌ **Mistake 3:** Hardcoding emission factors in code
✅ **Solution:** Store factors in EmissionFactors collection

❌ **Mistake 4:** No indexes on frequently queried fields
✅ **Solution:** Create indexes on scope, userId, dateFrom, status

❌ **Mistake 5:** Not using timestamps
✅ **Solution:** Enable `timestamps: true` in all Mongoose schemas

---

## Next Action

Now that the database is designed, proceed to **Phase 8: Integration** to connect the frontend and backend.

---

*Phase 7 Complete ✅*
*Next: Phase 8 — Integration (Full Data Flow)*

---

## Phase 7 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D7.1 | Complete Database Schema Document | Markdown + ERD | Database Lead |
| D7.2 | MongoDB Atlas Cluster Configured | Cloud instance | DevOps Lead |
| D7.3 | Mongoose Models (All Collections) | JavaScript files | Backend Developer |
| D7.4 | Index Definitions | JavaScript/MongoDB shell | Database Lead |
| D7.5 | Seed Data Scripts | JavaScript files | Backend Developer |
| D7.6 | Data Migration Strategy | Markdown | Database Lead |
| D7.7 | Backup & Recovery Procedures | Markdown | DevOps Lead |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M7.1 | Schema Design Approved | All collections defined with relationships | Week 1 Day 3 |
| M7.2 | Atlas Cluster Live | Database accessible from dev environment | Week 1 Day 5 |
| M7.3 | Indexes Created | All indexes defined and verified | Week 2 Day 2 |
| M7.4 | Seed Data Loaded | Default emission factors in database | Week 2 Day 4 |
| M7.5 | Backup Procedures Tested | Recovery procedure verified | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Database Lead | Schema design, indexing strategy, relationships |
| Backend Developer | Mongoose model implementation, seed scripts |
| DevOps Lead | Atlas setup, backup configuration |
| Compliance Lead | Audit trail schema validation |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Schema design, Atlas setup, Mongoose model implementation |
| Week 2 | Indexes, seed data, backup procedures, validation |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Schema doesn't support audit requirements | High | Medium | Validate against Phase 1 audit checklist |
| Atlas free tier limitations | Medium | Medium | Monitor storage; plan upgrade path |
| Index performance issues | Medium | Low | Profile queries; add indexes incrementally |
| Data integrity gaps | High | Low | Enforce validation at both Mongoose and middleware level |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Schema completeness | 100% | All Phase 1 data requirements mapped |
| Index coverage | 100% | All frequently queried fields indexed |
| Query performance | < 100ms | Benchmark on emission factor lookup |
| Seed data accuracy | 100% | Emission factors match IPCC AR5 values |
| Backup success rate | 100% | Recovery test passes |

### Transition Criteria to Phase 8

- [x] All Mongoose models implemented and tested
- [x] MongoDB Atlas cluster accessible
- [x] All indexes created and verified
- [x] Seed data loaded with correct emission factors
- [x] Backup procedures documented and tested
- [x] Schema supports all Phase 1 requirements
