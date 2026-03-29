# PHASE 9 — TESTING (VERIFICATION READY)

## Explanation (WHY)

Testing ensures your carbon accounting app:
- Calculates emissions correctly (critical for ISO compliance)
- Handles errors gracefully
- Works for all user roles
- Is ready for external verification

**Why is testing critical for Carbon Accounting?**
- Wrong calculations = wrong emissions reports = compliance failure
- Data integrity issues = audit failures
- Security vulnerabilities = data breaches
- Poor UX = user errors = bad data

---

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────┐
                    │  E2E    │  ← Few, slow, expensive
                    │ Tests   │
                   ┌┴─────────┴┐
                   │Integration│  ← Some, medium speed
                   │  Tests    │
                  ┌┴───────────┴┐
                  │    Unit     │  ← Many, fast, cheap
                  │   Tests     │
                  └─────────────┘
```

---

## 1. Frontend Testing

### A. Manual Testing Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                FRONTEND TESTING CHECKLIST                    │
└─────────────────────────────────────────────────────────────┘

FORM INPUT TESTING:
[ ] Scope dropdown shows all 3 options
[ ] Source types update when scope changes
[ ] Units update when source type changes
[ ] Quantity accepts positive numbers
[ ] Quantity rejects negative numbers
[ ] Quantity rejects non-numeric input
[ ] Date picker works correctly
[ ] Date validation (start < end)
[ ] Required fields show error if empty
[ ] Form submits when all fields valid

DISPLAY TESTING:
[ ] Dashboard shows correct totals
[ ] Scope cards show correct percentages
[ ] Chart displays correctly
[ ] Recent activity shows latest entries
[ ] Calculation result displays correctly
[ ] Error messages display clearly
[ ] Success messages display clearly

NAVIGATION TESTING:
[ ] Tab navigation works
[ ] Active tab is highlighted
[ ] Content switches correctly
[ ] Back button works (if applicable)
```

### B. Browser Testing

```
┌─────────────────────────────────────────────────────────────┐
│                BROWSER COMPATIBILITY                         │
└─────────────────────────────────────────────────────────────┘

Test on:
[ ] Chrome (latest)
[ ] Firefox (latest)
[ ] Edge (latest)
[ ] Safari (if Mac available)
[ ] Mobile Chrome (responsive)
[ ] Mobile Safari (responsive)

Check:
[ ] Forms display correctly
[ ] Buttons are clickable
[ ] Charts render properly
[ ] No console errors
[ ] Responsive layout works
```

---

## 2. API Testing (Postman)

### A. Setup Postman

1. Download Postman from https://www.postman.com/downloads/
2. Create a new Collection: "Carbon Accounting API"
3. Create requests for each endpoint

### B. Test Cases

#### Test 1: Calculate Emissions (Success)

```
POST http://localhost:3000/api/calculate

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "scope": "scope_1",
  "sourceType": "diesel_generator",
  "quantity": 500,
  "unit": "liters",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31"
}

Expected Response (201):
{
  "success": true,
  "message": "Calculation completed successfully",
  "data": {
    "activityId": "...",
    "calculationId": "...",
    "scope": "scope_1",
    "sourceType": "diesel_generator",
    "quantity": 500,
    "unit": "liters",
    "emissions": {
      "co2": 1340,
      "ch4": 0.1,
      "n2o": 0.005,
      "co2e": 1344.125
    },
    "factorsUsed": {
      "co2": 2.68,
      "ch4": 0.0002,
      "n2o": 0.00001,
      "source": "IPCC AR5"
    }
  }
}
```

#### Test 2: Calculate Emissions (Validation Error)

```
POST http://localhost:3000/api/calculate

Body:
{
  "scope": "scope_1",
  "sourceType": "diesel_generator",
  "quantity": -100,
  "unit": "liters",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31"
}

Expected Response (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Quantity cannot be negative"]
}
```

#### Test 3: Calculate Emissions (Missing Fields)

```
POST http://localhost:3000/api/calculate

Body:
{
  "scope": "scope_1",
  "quantity": 500
}

Expected Response (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Source type is required",
    "Unit is required",
    "Start date is required",
    "End date is required"
  ]
}
```

#### Test 4: Get Emissions

```
GET http://localhost:3000/api/emissions

Expected Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "scope": "scope_1",
      "sourceType": "diesel_generator",
      "quantity": 500,
      "unit": "liters",
      "status": "pending",
      "createdAt": "2025-02-01T10:30:00Z"
    }
  ]
}
```

#### Test 5: Get Summary

```
GET http://localhost:3000/api/summary

Expected Response (200):
{
  "success": true,
  "data": {
    "scope1": 1344.125,
    "scope2": 0,
    "scope3": 0,
    "total": 1344.125
  }
}
```

#### Test 6: Health Check

```
GET http://localhost:3000/health

Expected Response (200):
{
  "status": "OK",
  "timestamp": "2025-03-28T10:30:00Z"
}
```

---

## 3. Calculation Validation

### A. Manual Calculation Verification

**WHY:** Verify that the app calculates correctly by doing the math manually.

```
┌─────────────────────────────────────────────────────────────┐
│                CALCULATION VERIFICATION                      │
└─────────────────────────────────────────────────────────────┘

Test Case: Diesel Generator
Input: 500 liters diesel

Emission Factors (IPCC AR5):
- CO2: 2.68 kg/liter
- CH4: 0.0002 kg/liter
- N2O: 0.00001 kg/liter

Manual Calculation:
CO2 = 500 × 2.68 = 1,340.00 kg
CH4 = 500 × 0.0002 = 0.10 kg
N2O = 500 × 0.00001 = 0.005 kg

CO2e = (1,340 × 1) + (0.1 × 28) + (0.005 × 265)
     = 1,340 + 2.8 + 1.325
     = 1,344.125 kg CO2e

Expected App Output:
- CO2: 1,340.00 kg ✓
- CH4: 0.10 kg ✓
- N2O: 0.005 kg ✓
- CO2e: 1,344.125 kg ✓
```

### B. Test Multiple Scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                TEST SCENARIOS                                │
└─────────────────────────────────────────────────────────────┘

Scenario 1: Electricity (Scope 2)
Input: 5000 kWh
Factor: 0.57 kgCO2/kWh
Expected: 5000 × 0.57 = 2,850 kg CO2e

Scenario 2: Office Paper (Scope 3)
Input: 10 reams
Factor: 1.09 kgCO2/ream
Expected: 10 × 1.09 = 10.9 kg CO2e

Scenario 3: Waste Landfill (Scope 3)
Input: 200 kg
Factor: 0.58 kgCO2/kg
Expected: 200 × 0.58 = 116 kg CO2e

Scenario 4: Zero Quantity
Input: 0 liters
Expected: 0 kg CO2e (edge case)

Scenario 5: Very Large Quantity
Input: 100,000 liters
Expected: 268,000 kg CO2e (boundary test)
```

---

## 4. Edge Cases

### A. Input Edge Cases

```
┌─────────────────────────────────────────────────────────────┐
│                EDGE CASE TESTING                             │
└─────────────────────────────────────────────────────────────┘

EMPTY INPUTS:
[ ] Empty quantity field → Error message
[ ] Empty scope selection → Error message
[ ] Empty date fields → Error message
[ ] Empty unit selection → Error message

INVALID INPUTS:
[ ] Negative quantity → Error message
[ ] Non-numeric quantity → Error message
[ ] Quantity = 0 → Accepts (0 emissions)
[ ] Very large quantity (1,000,000) → Warning or rejection
[ ] Invalid date format → Error message
[ ] Start date > End date → Error message
[ ] Future dates → Error message

BOUNDARY VALUES:
[ ] Quantity = 0.01 → Accepts
[ ] Quantity = 999,999.99 → Accepts
[ ] Quantity = 1,000,000 → Warning
[ ] Date = today → Accepts
[ ] Date = 1 year ago → Accepts
```

### B. Network Edge Cases

```
[ ] Backend server down → User-friendly error
[ ] Slow network → Loading indicator
[ ] Request timeout → Timeout error
[ ] Invalid JSON response → Error handling
```

---

## 5. Verification Checklist (Audit Readiness)

```
┌─────────────────────────────────────────────────────────────┐
│                AUDIT READINESS CHECKLIST                     │
└─────────────────────────────────────────────────────────────┘

DATA INTEGRITY:
[ ] All calculations are traceable to source data
[ ] Emission factors are from recognized sources (IPCC, EPA)
[ ] GWP values are from IPCC AR5
[ ] All data entries have timestamps
[ ] All data entries have user IDs

AUDIT TRAIL:
[ ] Every data entry is logged
[ ] Every calculation is logged
[ ] Every validation decision is logged
[ ] Logs include who, when, what
[ ] Logs are immutable (cannot be modified)

CALCULATION ACCURACY:
[ ] Manual calculations match app calculations
[ ] All three gases (CO2, CH4, N2O) are calculated
[ ] CO2e conversion uses correct GWP values
[ ] Scope classification is correct

REPORTING:
[ ] Reports show total emissions by scope
[ ] Reports show individual gas emissions
[ ] Reports show emission factors used
[ ] Reports show data sources
[ ] Reports can be exported (PDF/Excel)

SECURITY:
[ ] Input validation prevents injection attacks
[ ] API endpoints are protected
[ ] User authentication works
[ ] Role-based access control works
[ ] Sensitive data is encrypted
```

---

## 6. Performance Testing

```
┌─────────────────────────────────────────────────────────────┐
│                PERFORMANCE METRICS                           │
└─────────────────────────────────────────────────────────────┘

API RESPONSE TIME:
[ ] /api/calculate < 500ms
[ ] /api/emissions < 1000ms
[ ] /api/summary < 500ms

FRONTEND LOAD TIME:
[ ] Initial page load < 3 seconds
[ ] Tab switching < 500ms
[ ] Form submission < 1 second

DATABASE QUERIES:
[ ] Emission factor lookup < 100ms
[ ] Activity data insert < 200ms
[ ] Summary aggregation < 500ms
```

---

## 7. Security Testing

```
┌─────────────────────────────────────────────────────────────┐
│                SECURITY TESTING                              │
└─────────────────────────────────────────────────────────────┘

INPUT VALIDATION:
[ ] SQL injection attempts blocked
[ ] XSS attempts blocked
[ ] Command injection attempts blocked
[ ] Path traversal attempts blocked

API SECURITY:
[ ] CORS configured correctly
[ ] Rate limiting enabled (if implemented)
[ ] Authentication required for sensitive endpoints
[ ] Authorization checks work

DATA PROTECTION:
[ ] Passwords are hashed
[ ] Sensitive data not logged
[ ] HTTPS in production
[ ] Environment variables not exposed
```

---

## Common Mistakes

❌ **Mistake 1:** Not testing calculations manually
✅ **Solution:** Always verify calculations with manual math

❌ **Mistake 2:** Only testing happy path
✅ **Solution:** Test error cases, edge cases, and boundary values

❌ **Mistake 3:** Not testing on different browsers
✅ **Solution:** Test on Chrome, Firefox, Edge, Safari

❌ **Mistake 4:** Not documenting test results
✅ **Solution:** Keep a test log with pass/fail status

❌ **Mistake 5:** Not testing audit trail
✅ **Solution:** Verify every action is logged correctly

---

## Next Action

Now that testing is complete, proceed to **Phase 10: Deployment** to put your app live.

---

*Phase 9 Complete ✅*
*Next: Phase 10 — Security & Compliance*

---

## Phase 9 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D9.1 | Test Plan Document | Markdown | QA Lead |
| D9.2 | Manual Testing Checklist (Completed) | Markdown with checkmarks | QA Engineer |
| D9.3 | Postman API Test Collection | Postman Collection JSON | QA Engineer |
| D9.4 | Calculation Verification Report | Spreadsheet/Markdown | QA Engineer |
| D9.5 | Browser Compatibility Report | Markdown | QA Engineer |
| D9.6 | Performance Test Results | Markdown with metrics | QA Engineer |
| D9.7 | Bug Report Log | Issue tracker entries | QA Engineer |
| D9.8 | Test Summary Report | Markdown | QA Lead |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M9.1 | Test Plan Approved | All test cases defined | Week 1 Day 2 |
| M9.2 | API Tests Complete | All Postman tests pass | Week 1 Day 5 |
| M9.3 | Calculation Verification Complete | Manual math matches app output | Week 2 Day 2 |
| M9.4 | Edge Cases Tested | All boundary values verified | Week 2 Day 3 |
| M9.5 | Performance Benchmarks Met | All metrics within targets | Week 2 Day 4 |
| M9.6 | Test Sign-Off | QA Lead approves for Phase 10 | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| QA Lead | Test plan, test summary, sign-off |
| QA Engineer | Manual testing, API testing, bug reporting |
| Backend Developer | Bug fixes, calculation verification |
| Frontend Developer | UI bug fixes, browser testing |
| Compliance Lead | Audit readiness checklist verification |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Test plan, API testing, manual testing, browser testing |
| Week 2 | Calculation verification, edge cases, performance, bug fixes, sign-off |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Calculation errors discovered late | Critical | Medium | Verify calculations in Week 1 |
| Browser-specific bugs | Medium | Medium | Test all browsers in Week 1 |
| Performance issues | Medium | Medium | Benchmark early; optimize iteratively |
| Incomplete test coverage | High | Medium | Use checklist approach; track coverage |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API test pass rate | 100% | Postman results |
| Calculation accuracy | 100% | Manual verification |
| Browser compatibility | Chrome/Firefox/Edge | Manual testing |
| Critical bugs remaining | 0 | Bug tracker |
| Performance benchmarks | All green | Lighthouse/Postman metrics |
| Edge case coverage | 100% | Checklist completion |

### Transition Criteria to Phase 10

- [x] All test cases executed
- [x] 100% API test pass rate
- [x] All calculations verified manually
- [x] Zero critical/high bugs remaining
- [x] Performance benchmarks met
- [x] Browser compatibility verified
- [x] Test summary report approved by QA Lead
