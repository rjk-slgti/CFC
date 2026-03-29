# PHASE 11 — DOCUMENTATION & TRAINING

## Explanation (WHY)

Documentation ensures the system can be maintained, operated, and understood long after development ends. Training ensures users can effectively use the platform for its intended purpose — ISO 14064-compliant carbon accounting.

**Why a dedicated phase?**
- Code without documentation is unmaintainable
- Users without training make data entry errors
- Auditors need documentation to verify the system
- Future developers need onboarding materials

---

## Step-by-Step Implementation

### 1. Technical Documentation

**A. README.md (Project Overview)**

```markdown
# Carbon Accounting Platform

## Quick Start
1. Clone repository
2. Copy .env.example to .env
3. Configure MongoDB URI
4. npm install (backend)
5. npm run dev (backend)
6. Open index.html (frontend)

## Architecture
[Link to architecture document]

## API Reference
[Link to API documentation]

## Deployment
[Link to deployment guide]
```

**B. API Documentation (Swagger/Postman)**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| /api/calculate | POST | Calculate emissions | Yes |
| /api/emissions | GET | Get all emissions | Yes |
| /api/summary | GET | Get scope summary | Yes |
| /api/auth/register | POST | Register user | No |
| /api/auth/login | POST | Login user | No |
| /api/health | GET | Health check | No |

**C. Database Documentation**

- Collection schemas with field descriptions
- Relationship diagrams
- Index documentation
- Query examples

**D. Deployment Runbook**

- Step-by-step deployment instructions
- Environment variable configuration
- Rollback procedures
- Troubleshooting guide

### 2. User Documentation

**A. Student User Guide**

```
TABLE OF CONTENTS:
1. Getting Started
   - How to log in
   - Dashboard overview
   - Navigation

2. Entering Emission Data
   - Understanding scopes (1, 2, 3)
   - Selecting emission source
   - Entering quantities
   - Date ranges and notes

3. Viewing Results
   - Dashboard interpretation
   - Understanding CO₂e calculations
   - Viewing your contributions

4. Common Questions
   - What is Scope 1/2/3?
   - What is CO₂e?
   - How are calculations done?
```

**B. Trainer User Guide**

```
TABLE OF CONTENTS:
1. All Student Guide Sections

2. Validating Student Data
   - Reviewing pending entries
   - Approving/rejecting data
   - Providing feedback

3. Generating Reports
   - Scope-specific reports
   - Department reports
   - Export options

4. Managing Emission Factors
   - Viewing current factors
   - Updating factors
   - Source documentation
```

**C. Admin User Guide**

```
TABLE OF CONTENTS:
1. All Trainer Guide Sections

2. System Configuration
   - Organization settings
   - Reporting periods
   - Carbon pricing

3. User Management
   - Creating users
   - Assigning roles
   - Deactivating accounts

4. ISO 14064 Reporting
   - Generating compliance reports
   - Audit trail access
   - Data export for verification

5. System Administration
   - Monitoring system health
   - Backup verification
   - Performance monitoring
```

### 3. Training Materials

**A. Training Schedule**

| Session | Audience | Duration | Format |
|---------|----------|----------|--------|
| System Overview | All users | 1 hour | Presentation |
| Data Entry Training | Students | 2 hours | Hands-on |
| Validation Training | Trainers | 1.5 hours | Hands-on |
| Admin Training | Admins | 2 hours | Hands-on |
| ISO 14064 Overview | All users | 1 hour | Presentation |

**B. Training Checklist**

```
STUDENT TRAINING:
[ ] Can log in successfully
[ ] Can navigate all tabs
[ ] Can enter Scope 1 data
[ ] Can enter Scope 2 data
[ ] Can enter Scope 3 data
[ ] Can view dashboard
[ ] Can understand CO₂e results

TRAINER TRAINING:
[ ] All student items
[ ] Can validate student data
[ ] Can approve/reject entries
[ ] Can generate reports
[ ] Can export data

ADMIN TRAINING:
[ ] All trainer items
[ ] Can manage users
[ ] Can configure organization
[ ] Can access audit logs
[ ] Can generate ISO reports
```

### 4. ISO 14064 Educational Content

**A. Scope Explanation (In-App Tooltips)**

```
SCOPE 1 TOOLTIP:
"Direct emissions from sources you own or control.
Examples: diesel generators, company vehicles, refrigerant leaks."

SCOPE 2 TOOLTIP:
"Indirect emissions from purchased electricity, heat, or steam.
Example: grid electricity for your buildings."

SCOPE 3 TOOLTIP:
"All other indirect emissions in your value chain.
Examples: office paper, waste disposal, employee commuting."
```

**B. Calculation Explanation**

```
HOW CO₂e IS CALCULATED:

1. Your activity data (e.g., 500 liters diesel)
   is multiplied by an emission factor (e.g., 2.68 kgCO₂/liter)

2. This gives emissions for each greenhouse gas:
   - CO₂: 500 × 2.68 = 1,340 kg
   - CH₄: 500 × 0.0002 = 0.10 kg
   - N₂O: 500 × 0.00001 = 0.005 kg

3. Each gas is converted to CO₂ equivalent using
   Global Warming Potential (GWP):
   - CO₂ × 1 = 1,340
   - CH₄ × 28 = 2.8
   - N₂O × 265 = 1.325

4. Total CO₂e = 1,344.125 kg

These GWP values come from the IPCC Fifth Assessment Report.
```

---

## Phase 11 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D11.1 | Technical Documentation Package | Markdown files | Lead Developer |
| D11.2 | API Documentation (Swagger/Postman) | OpenAPI spec / Postman Collection | Backend Lead |
| D11.3 | Student User Guide | PDF/Markdown | Documentation Lead |
| D11.4 | Trainer User Guide | PDF/Markdown | Documentation Lead |
| D11.5 | Admin User Guide | PDF/Markdown | Documentation Lead |
| D11.6 | Training Presentation Materials | PowerPoint/Slides | Training Lead |
| D11.7 | In-App Help Content | JavaScript/HTML | Frontend Developer |
| D11.8 | Training Completion Records | Spreadsheet | Training Lead |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M11.1 | Technical Docs Complete | All docs reviewed | Week 1 Day 3 |
| M11.2 | User Guides Complete | All three role guides done | Week 1 Day 5 |
| M11.3 | Training Materials Ready | Presentations and exercises prepared | Week 2 Day 2 |
| M11.4 | Training Sessions Delivered | All user groups trained | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Documentation Lead | User guides, technical documentation |
| Training Lead | Training sessions, materials, records |
| Lead Developer | README, architecture docs, deployment runbook |
| Backend Lead | API documentation |
| Frontend Developer | In-app help content, tooltips |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Technical documentation, API docs, user guides |
| Week 2 | Training materials, training delivery, in-app help |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Documentation becomes outdated | Medium | High | Version control; update with each release |
| Training sessions poorly attended | Medium | Medium | Schedule multiple sessions; record for later |
| Users don't read documentation | Medium | High | Focus on in-app help and tooltips |
| ISO concepts too complex for students | Medium | Medium | Use analogies and visual aids |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Documentation completeness | 100% | All sections filled |
| Training attendance | > 90% | Sign-in sheets |
| Training comprehension | > 80% | Post-training quiz |
| User guide usability | Positive | User feedback survey |
| In-app help coverage | 100% | All complex features have tooltips |

### Transition Criteria to Phase 12

- [x] All documentation complete and reviewed
- [x] API documentation published
- [x] User guides distributed to all roles
- [x] Training sessions completed for all user groups
- [x] In-app help content implemented
- [x] Training feedback collected and addressed
