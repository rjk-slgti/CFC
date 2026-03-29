# PHASE 10 — SECURITY & COMPLIANCE

## Explanation (WHY)

Security and compliance are non-negotiable for a carbon accounting platform. ISO 14064 requires data integrity, and any breach compromises audit credibility. This phase hardens the system before deployment.

**Why separate from testing?**
- Testing verifies functionality; security verifies protection
- Compliance requires dedicated verification against regulatory standards
- Security vulnerabilities need specialized tools and expertise
- Audit readiness is a distinct deliverable from functional correctness

---

## Step-by-Step Implementation

### 1. Authentication & Authorization Hardening

**A. Password Security**

```javascript
// Enforce strong password policy
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000  // 15 minutes
};
```

**B. JWT Security**

```javascript
// Secure JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,  // 256-bit minimum
  expiresIn: '7d',
  refreshTokenExpiry: '30d',
  issuer: 'carbon-accounting-api',
  audience: 'carbon-accounting-app'
};
```

**C. Role-Based Access Control (RBAC)**

| Role | Data Entry | Validate | Calculate | Report | Admin |
|------|-----------|----------|-----------|--------|-------|
| Student | ✅ | ❌ | ❌ | View Own | ❌ |
| Trainer | ✅ | ✅ | ❌ | View Dept | ❌ |
| Admin | ✅ | ✅ | ✅ | Full | ✅ |

### 2. Input Security

**A. Sanitization**

```javascript
const sanitizeInput = (input) => {
  // Remove HTML tags
  // Escape special characters
  // Trim whitespace
  // Validate against expected format
};
```

**B. Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                    // 100 requests per window
  message: 'Too many requests, please try again later'
});
```

### 3. Data Protection

**A. Encryption at Rest**
- MongoDB Atlas encryption (AES-256)
- Field-level encryption for sensitive data

**B. Encryption in Transit**
- HTTPS enforced on all endpoints
- TLS 1.2+ required

**C. Data Retention Policy**

| Data Type | Retention Period | Action After |
|-----------|-----------------|--------------|
| Activity Data | 7 years | Archive |
| Audit Logs | 7 years | Archive |
| User Accounts | Until deletion request | Anonymize |
| Session Data | 30 days | Delete |

### 4. ISO 14064 Compliance Verification

| Requirement | Verification Method | Status |
|-------------|-------------------|--------|
| Data traceability | Audit trail completeness check | ☐ |
| Calculation reproducibility | Re-run calculations with stored factors | ☐ |
| Emission factor source documentation | Verify all factors have source/year | ☐ |
| Scope classification accuracy | Cross-check against ISO 14064 definitions | ☐ |
| Report completeness | Generate sample report and verify sections | ☐ |
| Data modification tracking | Verify old/new values in audit log | ☐ |
| User action accountability | Verify user ID logged for every action | ☐ |

### 5. Security Testing Checklist

```
AUTHENTICATION:
[ ] Password hashing verified (bcrypt)
[ ] JWT token expiration works
[ ] Invalid token rejected
[ ] Role-based access enforced
[ ] Account lockout after failed attempts
[ ] Password reset flow secure

INPUT VALIDATION:
[ ] SQL injection blocked
[ ] XSS attempts blocked
[ ] Command injection blocked
[ ] Path traversal blocked
[ ] Oversized payloads rejected
[ ] Malformed JSON handled

API SECURITY:
[ ] CORS configured correctly
[ ] Rate limiting active
[ ] HTTPS enforced
[ ] No sensitive data in URLs
[ ] Error messages don't leak internals

DATA PROTECTION:
[ ] Environment variables not exposed
[ ] Database credentials secured
[ ] No .env file in Git
[ ] Audit logs immutable
[ ] Backup encryption enabled
```

---

## Phase 10 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D10.1 | Security Assessment Report | Markdown | Security Lead |
| D10.2 | Penetration Test Results | Markdown | Security Lead |
| D10.3 | ISO 14064 Compliance Verification Report | Markdown with checklist | Compliance Lead |
| D10.4 | RBAC Implementation Verified | Test report | Backend Lead |
| D10.5 | Data Protection Measures Documented | Markdown | DevOps Lead |
| D10.6 | Security Hardening Checklist (Completed) | Markdown | Security Lead |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M10.1 | Security Assessment Complete | All vulnerabilities identified | Week 1 Day 3 |
| M10.2 | Critical Vulnerabilities Fixed | Zero critical/high issues | Week 1 Day 5 |
| M10.3 | ISO Compliance Verified | All checklist items pass | Week 2 Day 3 |
| M10.4 | Security Sign-Off | Approved for deployment | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Security Lead | Penetration testing, vulnerability assessment |
| Compliance Lead | ISO 14064 verification |
| Backend Lead | Security fixes, RBAC verification |
| DevOps Lead | Encryption, data protection, environment security |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | Security assessment, penetration testing, critical fixes |
| Week 2 | ISO compliance verification, documentation, sign-off |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Critical vulnerability found | Critical | Medium | Allocate buffer time for fixes |
| ISO compliance gaps | High | Medium | Cross-reference Phase 1 checklist |
| Performance impact from security measures | Medium | Medium | Benchmark before/after hardening |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Critical vulnerabilities | 0 | Penetration test report |
| High vulnerabilities | 0 | Penetration test report |
| ISO 14064 compliance | 100% | Verification checklist |
| RBAC enforcement | 100% | Role-based access tests |
| Security test pass rate | 100% | Security checklist |

### Transition Criteria to Phase 11

- [x] Zero critical/high security vulnerabilities
- [x] ISO 14064 compliance verified
- [x] RBAC working for all roles
- [x] Data protection measures in place
- [x] Security sign-off obtained
