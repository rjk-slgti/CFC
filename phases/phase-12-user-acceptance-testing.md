# PHASE 12 — USER ACCEPTANCE TESTING (UAT)

## Explanation (WHY)

UAT validates that the system meets real-world requirements from the people who will actually use it. Unlike Phase 9 testing (which verifies technical correctness), UAT validates business value and usability.

**Why UAT is separate from QA testing:**
- QA testing is done by developers/testers; UAT is done by actual users
- QA testing checks "does it work?"; UAT checks "does it solve our problem?"
- QA testing follows test scripts; UAT follows real workflows
- UAT catches usability issues that automated tests miss

---

## UAT Process

### 1. UAT Planning

**A. UAT Scope**

| Area | Included | Excluded |
|------|----------|----------|
| Data entry (all scopes) | ✅ | |
| Calculation accuracy | ✅ | |
| Dashboard visualization | ✅ | |
| Report generation | ✅ | |
| User authentication | ✅ | |
| Role-based access | ✅ | |
| Audit trail access | ✅ | |
| Performance/load testing | | ✅ (Phase 9) |
| Security testing | | ✅ (Phase 10) |

**B. UAT Participants**

| Role | Count | Selection Criteria |
|------|-------|-------------------|
| Students | 3-5 | Different skill levels |
| Trainers | 2-3 | Active in data validation |
| Admins | 1-2 | Responsible for reporting |

**C. UAT Environment**

- Staging environment (identical to production)
- Test data pre-loaded (realistic dataset)
- All user accounts created

### 2. UAT Test Scenarios

#### Scenario 1: Student Data Entry Workflow

```
GIVEN: Student logs in
WHEN: Student navigates to Input Data tab
AND: Selects Scope 1 → Diesel Generator
AND: Enters 500 liters for January 2025
AND: Clicks "Calculate & Save"
THEN: System displays CO₂e calculation
AND: Dashboard updates with new data
AND: Data appears in recent activity

PASS CRITERIA:
[ ] Login successful
[ ] Navigation intuitive
[ ] Form fields clear
[ ] Calculation displayed correctly
[ ] Dashboard updated
[ ] Recent activity shows entry
```

#### Scenario 2: Trainer Validation Workflow

```
GIVEN: Trainer logs in
WHEN: Trainer views pending approvals
AND: Reviews student-submitted data
AND: Approves valid entries
AND: Rejects invalid entries with reason
THEN: Approved entries appear in reports
AND: Rejected entries notify students

PASS CRITERIA:
[ ] Pending list displays correctly
[ ] Approval process straightforward
[ ] Rejection reason captured
[ ] Status updates reflected
```

#### Scenario 3: Admin Reporting Workflow

```
GIVEN: Admin logs in
WHEN: Admin navigates to Reports
AND: Selects reporting period
AND: Generates annual report
THEN: Report shows all three scopes
AND: Report includes methodology
AND: Report can be exported to PDF

PASS CRITERIA:
[ ] Report generation completes
[ ] All scopes included
[ ] Calculations match expected values
[ ] PDF export works
[ ] Methodology section present
```

#### Scenario 4: Error Handling (User Experience)

```
GIVEN: User is entering data
WHEN: User enters invalid data (negative number)
THEN: Clear error message appears immediately
AND: Form does not submit
AND: Error message explains how to fix

PASS CRITERIA:
[ ] Error message is clear
[ ] Error appears in real-time
[ ] User understands what to fix
```

### 3. UAT Feedback Collection

**A. Feedback Form**

```
UAT FEEDBACK FORM

Tester Name: _______________
Role: [ ] Student [ ] Trainer [ ] Admin
Date: _______________

SCENARIO RATING (1-5):
Ease of use: ___
Clarity of instructions: ___
Calculation accuracy: ___
Error messages: ___
Overall satisfaction: ___

ISSUES FOUND:
1. _______________
2. _______________
3. _______________

SUGGESTIONS:
1. _______________
2. _______________

WOULD YOU USE THIS SYSTEM IN PRODUCTION?
[ ] Yes [ ] Yes with changes [ ] No
```

### 4. UAT Issue Triage

| Priority | Description | Response Time |
|----------|-------------|---------------|
| Critical | System unusable, data loss | Fix before deployment |
| High | Major workflow blocked | Fix before deployment |
| Medium | Workflow workaround exists | Fix in Phase 14 |
| Low | Cosmetic/minor issue | Backlog |

---

## Phase 12 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D12.1 | UAT Plan Document | Markdown | QA Lead |
| D12.2 | UAT Test Scenarios | Markdown | QA Lead |
| D12.3 | UAT Environment (Staging) | Deployed instance | DevOps Lead |
| D12.4 | UAT Feedback Collection | Forms/Spreadsheets | QA Lead |
| D12.5 | UAT Issue Log | Issue tracker | QA Lead |
| D12.6 | UAT Sign-Off Report | Markdown with signatures | Project Manager |

### Key Milestones

| # | Milestone | Criteria | Target Day |
|---|-----------|----------|------------|
| M12.1 | UAT Environment Ready | Staging deployed, test data loaded | Day 1 |
| M12.2 | UAT Sessions Complete | All scenarios tested by all roles | Day 4 |
| M12.3 | Critical Issues Fixed | Zero critical/high issues | Day 6 |
| M12.4 | UAT Sign-Off | Stakeholders approve for production | Day 7 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| QA Lead | UAT coordination, feedback collection |
| Project Manager | Stakeholder management, sign-off |
| End Users (Students, Trainers, Admins) | Testing, feedback |
| Developers | Bug fixes during UAT |

### Estimated Timeline: 1 week

| Day | Activities |
|-----|-----------|
| Day 1 | Deploy staging, prepare test data, brief participants |
| Day 2-3 | UAT sessions (all roles test all scenarios) |
| Day 4 | Collect feedback, triage issues |
| Day 5-6 | Fix critical/high issues |
| Day 7 | Retest fixes, obtain sign-off |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users unavailable for testing | High | Medium | Schedule well in advance; offer multiple sessions |
| Critical issues found | High | Medium | Buffer time for fixes; have developers on standby |
| Users test wrong scenarios | Medium | Medium | Provide clear test scripts with expected outcomes |
| Scope creep from UAT feedback | Medium | High | Strict issue triage; defer non-critical items |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Scenario completion rate | 100% | All scenarios tested |
| Critical issues found | 0 | Issue tracker |
| High issues remaining | 0 | Issue tracker |
| User satisfaction | > 4/5 | Feedback form |
| Sign-off obtained | Yes | Signed document |

### Transition Criteria to Phase 13

- [x] All UAT scenarios executed
- [x] Zero critical/high issues remaining
- [x] User satisfaction > 4/5
- [x] All user roles approve system
- [x] UAT sign-off document signed by stakeholders
- [x] All medium issues documented for Phase 14 backlog
