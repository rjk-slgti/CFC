# Carbon Accounting Platform - Complete Specification

## Executive Summary

This document provides a comprehensive specification for a **Carbon Accounting Web App** built on **ISO 14064 principles**. The platform is designed for institutional use (e.g., SLGTI - Sri Lanka German Training Institute) to systematically track, calculate, and report greenhouse gas emissions across organizational operations.

**Key Features:**
- ISO 14064-1:2018 compliant emission tracking
- Scope 1, 2, and 3 emission classification
- Real-time CO₂e calculations
- Audit trail for external verification
- Role-based access control
- Scalable, modular architecture

---

## Table of Contents

1. [Phase 1: ISO 14064 Definition](#phase-1-iso-14064-definition)
2. [Phase 2: System Architecture](#phase-2-system-architecture)
3. [Visual Diagrams](#visual-diagrams)
4. [Implementation Roadmap](#implementation-roadmap)

---

## Phase 1: ISO 14064 Definition

### Problem Statement

**Institutional Context: SLGTI**

SLGTI faces increasing pressure to:
- Comply with national environmental regulations
- Demonstrate environmental responsibility to stakeholders
- Track and reduce carbon footprint across campus operations
- Prepare for carbon taxation and ESG reporting requirements
- Educate students on sustainable practices

**Core Challenges:**
- Manual spreadsheet-based tracking (error-prone, not auditable)
- No standardized emission factors or calculation methodologies
- Inability to produce ISO-compliant reports
- Limited visibility into high-impact emission sources
- No historical data for trend analysis

### User Roles

| Role | Purpose | Key Permissions |
|------|---------|-----------------|
| **Student** | Learn carbon accounting through hands-on application | Input assigned data, view personal reports |
| **Trainer** | Oversee data collection and validation | Validate data, generate educational reports |
| **Organization** | Manage institutional carbon accounting | Full system access, generate audit reports |

### System Boundary

#### Organizational Boundary
- **Approach:** Operational Control
- **Included:** All SLGTI campuses, administrative offices, hostels, transportation services
- **Excluded:** Student-owned vehicles, contractor operations, alumni activities

#### Operational Boundary
- **Included:** Energy consumption, transportation, waste, water, refrigerants, purchased goods
- **Excluded:** Employee business travel (personal vehicles), supply chain emissions
- **Temporal:** Annual reporting (Jan 1 - Dec 31), 3-year historical data

### Emission Categories

#### Scope 1: Direct Emissions
- Stationary combustion (diesel generators, LPG)
- Mobile combustion (SLGTI vehicles)
- Fugitive emissions (refrigerant leakage)
- Process emissions (laboratory chemicals)

#### Scope 2: Indirect from Purchased Energy
- Purchased electricity (grid)
- Purchased heat/steam (if applicable)

#### Scope 3: Other Indirect Emissions
- Purchased goods & services
- Capital goods
- Waste generated
- Employee commuting
- Transportation & distribution

### Inputs by Scope

| Scope | Input Fields | Data Source | Frequency |
|-------|-------------|-------------|-----------|
| **Scope 1** | Diesel (liters), LPG (kg), Refrigerant (kg), Vehicle distance (km) | Fuel logs, maintenance records | Monthly |
| **Scope 2** | Electricity (kWh), Grid emission factor | Utility bills | Monthly |
| **Scope 3** | Paper (reams), Waste (kg), Equipment (USD), Employee count | Procurement, waste audits | Quarterly |

### Outputs

#### Gas-Specific Emissions
- **CO₂:** Carbon Dioxide (GWP = 1)
- **CH₄:** Methane (GWP = 28)
- **N₂O:** Nitrous Oxide (GWP = 265)

#### CO₂e Calculation
```
CO₂e = (CO₂ × 1) + (CH₄ × 28) + (N₂O × 265)
```

#### Reporting Outputs
1. Emission summary by scope
2. Emission by gas type
3. Emission by source category
4. Trend analysis (year-over-year)
5. Scope classification matrix

### Real Reporting Use Case

**Scenario:** Annual Carbon Footprint Report for Government Compliance

**Workflow:**
1. **Data Collection** (Jan-Feb): Students input monthly activity data
2. **Validation** (Mar): Trainers review and approve data
3. **Calculation** (Mar): System applies emission factors
4. **Review** (Apr): Administrators approve final inventory
5. **Reporting** (Apr-May): Generate ISO 14064-compliant report
6. **Verification** (Jun): Third-party auditor reviews audit trail

**Report Contents:**
- Executive summary with total emissions
- Organizational and operational boundary descriptions
- Detailed emission inventory by scope
- Methodology and emission factors used
- Data quality assessment
- Year-over-year comparison
- Verification statement

---

## Phase 2: System Architecture

### Architecture Overview

The platform follows a **modular, microservices-inspired architecture** designed for:
- **Scalability:** Handle growing user base and data volume
- **Maintainability:** Independent modules for easier updates
- **Auditability:** Complete traceability for ISO compliance
- **Modularity:** Reusable components across different standards

### Frontend Responsibilities

#### Data Input Layer
- **Activity Data Forms:** Capture monthly/quarterly emission data
- **File Upload:** Import utility bills, fuel receipts
- **Bulk Import:** CSV/Excel import for historical data
- **Real-time Validation:** Client-side data quality checks

#### Visualization Layer
- **Dashboard:** Real-time emission overview
- **Scope Breakdown:** Pie/bar charts by scope
- **Trend Analysis:** Year-over-year comparisons
- **Source Analysis:** Emission by source category
- **Export Module:** PDF/Excel report generation

### Backend Components

#### A. Calculation Engine
**Purpose:** Perform ISO 14064-compliant emission calculations

**Core Functions:**
- `calculate_scope1()`: Direct emissions (Activity × Factor × GWP)
- `calculate_scope2()`: Purchased energy (kWh × Grid Factor)
- `calculate_scope3()`: Other indirect emissions
- `convert_to_co2e()`: Convert individual gases to CO₂e

#### B. Scope Classification Module
**Purpose:** Automatically classify emissions into ISO 14064 scopes

**Classification Rules:**
- Scope 1: diesel_generator, diesel_vehicle, lpg_combustion, refrigerant_leak
- Scope 2: electricity_grid, purchased_heat, purchased_steam
- Scope 3: office_paper, waste_landfill, equipment_purchase, employee_commuting

#### C. Validation Layer
**Purpose:** Ensure data quality before calculation

**Validation Rules:**
- **Range Check:** Values within expected bounds
- **Completeness:** All required fields present
- **Consistency:** Related data aligns
- **Temporal:** Dates within reporting period
- **Format:** Correct data types
- **Business Logic:** Domain-specific rules

### Database Design

#### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | User management | id, email, role_id, org_id |
| **organizations** | Organizational boundary | id, name, boundary_type |
| **activity_data** | Emission source data | id, scope, source_type, activity_value, unit |
| **emission_factors** | Calculation factors | id, source_type, gas_type, factor_value, source |
| **calculations** | Calculated emissions | id, activity_id, co2, ch4, n2o, co2e_total |
| **audit_log** | Change tracking | id, user_id, action, table_name, old_value, new_value |
| **reports** | Generated reports | id, org_id, report_type, total_scope1/2/3 |

#### Database Schema Highlights
- **UUID primary keys** for distributed systems
- **JSONB columns** for flexible data storage
- **Soft deletes** for data retention
- **Comprehensive indexing** for query performance
- **Audit triggers** for automatic change logging

### Data Flow

```
Input → Validation → Scope Classification → Calculation → Storage → Reporting
```

**Detailed Steps:**
1. **Input:** User submits activity data via frontend
2. **Validation:** Multi-layer validation (format, range, consistency)
3. **Classification:** Automatic scope assignment based on source type
4. **Calculation:** Emission factor lookup and CO₂e conversion
5. **Storage:** Database write with audit log entry
6. **Reporting:** Aggregation, visualization, and export

### Audit Trail Mechanism

#### Implementation Approach
- **Database Triggers:** Automatic logging of all data changes
- **Application-Level:** Additional logging for business actions
- **Immutable Records:** Audit logs cannot be modified
- **Comprehensive Tracking:** User, timestamp, IP, action, old/new values

#### Audit Trail Use Cases
1. **Data Entry Audit:** Track who entered what data and when
2. **Validation Audit:** Record approval/rejection decisions
3. **Calculation Audit:** Log all calculation results
4. **Report Generation Audit:** Track report creation and access

### Scalability and Modularity

#### Scalability Features
- **Horizontal Scaling:** Load balancer + multiple app servers
- **Database Replication:** Primary-replica setup for read scalability
- **Caching:** Redis for emission factors and sessions
- **Async Processing:** Message queue for non-blocking calculations
- **CDN:** Static asset delivery optimization

#### Modular Design
- **Auth Module:** Independent authentication and authorization
- **Data Module:** Generic CRUD operations
- **Calculation Module:** Pure functions, no side effects
- **Reporting Module:** Pluggable report generators

#### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js/Vue.js | User interface |
| **Backend** | Node.js/Python | API and business logic |
| **Database** | PostgreSQL | Relational data storage |
| **Cache** | Redis | Session and data caching |
| **Queue** | RabbitMQ/Redis | Async processing |
| **Infrastructure** | Docker/Kubernetes | Containerization |

---

## Visual Diagrams

### 1. High-Level System Architecture

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
              │ • PostgreSQL    │
              │ • Redis Cache   │
              └─────────────────┘
```

### 2. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                               │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   INPUT     │
    │  (User/     │
    │   File)     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  VALIDATION │
    │  LAYER      │
    │             │
    │ • Format    │
    │ • Range     │
    │ • Consistency│
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  SCOPE      │
    │ CLASSIFI-   │
    │  CATION    │
    │             │
    │ • Scope 1   │
    │ • Scope 2   │
    │ • Scope 3   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ CALCULATION │
    │  ENGINE     │
    │             │
    │ • Emission  │
    │   factors   │
    │ • Gas-spec  │
    │ • CO₂e conv │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   STORAGE   │
    │             │
    │ • Activity  │
    │   data      │
    │ • Calculated│
    │   emissions │
    │ • Audit log │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  REPORTING  │
    │             │
    │ • Dashboard │
    │ • ISO report│
    │ • Export    │
    └─────────────┘
```

### 3. Database Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    USERS     │       │  ORGANIZATIONS│       │   ROLES      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ name         │       │ name         │
│ name         │       │ boundary_type│       │ permissions  │
│ role_id      │◄──────│ created_at   │       │ description  │
│ org_id       │       └──────────────┘       └──────────────┘
└──────────────┘
        │
        ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ ACTIVITY_DATA│       │EMISSION_FACTORS│     │ CALCULATIONS │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ user_id      │       │ source_type  │       │ activity_id  │
│ scope        │       │ gas_type     │       │ scope        │
│ source_type  │       │ factor_value │       │ co2_emission │
│ activity_value│      │ unit         │       │ ch4_emission │
│ unit         │       │ source       │       │ n2o_emission │
│ reporting_period│    │ year         │       │ co2e_total   │
│ created_at   │       │ region       │       │ calculated_at│
│ validated_at │       └──────────────┘       └──────────────┘
│ validated_by │
└──────────────┘
        │
        ▼
┌──────────────┐       ┌──────────────┐
│  AUDIT_LOG   │       │   REPORTS    │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ user_id      │       │ org_id       │
│ action       │       │ report_type  │
│ table_name   │       │ period_start │
│ record_id    │       │ period_end   │
│ old_value    │       │ total_scope1 │
│ new_value    │       │ total_scope2 │
│ ip_address   │       │ total_scope3 │
│ timestamp    │       │ generated_at │
└──────────────┘       │ generated_by │
                       └──────────────┘
```

### 4. Audit Trail Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ USER ACTION │
    │             │
    │ • Create    │
    │ • Update    │
    │ • Delete    │
    │ • Validate  │
    │ • Calculate │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT       │
    │ INTERCEPTOR │
    │             │
    │ • Capture   │
    │   action    │
    │ • Record    │
    │   user      │
    │ • Timestamp │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT LOG   │
    │ DATABASE    │
    │             │
    │ • Immutable │
    │ • Indexed   │
    │ • Queryable │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT       │
    │ REPORTS     │
    │             │
    │ • User      │
    │   activity  │
    │ • Data      │
    │   changes   │
    │ • Compliance│
    │   reports   │
    └─────────────┘
```

### 5. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

Internet → CDN → Load Balancer → App Servers → Database Cluster
                                    ↓
                              Cache (Redis)
                                    ↓
                              Message Queue
                                    ↓
                              File Storage (S3)
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up development environment
- [ ] Design database schema
- [ ] Implement user authentication
- [ ] Create basic CRUD APIs
- [ ] Build frontend scaffolding

### Phase 2: Core Features (Weeks 5-8)
- [ ] Implement activity data entry forms
- [ ] Build validation layer
- [ ] Create scope classification logic
- [ ] Develop calculation engine
- [ ] Implement audit trail

### Phase 3: Reporting (Weeks 9-12)
- [ ] Build dashboard visualizations
- [ ] Create ISO 14064 report generator
- [ ] Implement data export (PDF/Excel)
- [ ] Add trend analysis charts
- [ ] Build user management interface

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Implement bulk data import
- [ ] Add advanced validation rules
- [ ] Create emission factor management
- [ ] Build audit reporting tools
- [ ] Implement notification system

### Phase 5: Testing & Deployment (Weeks 17-20)
- [ ] Unit and integration testing
- [ ] User acceptance testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment

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

## Key Performance Indicators (KPIs)

### System Performance
- **Response Time:** < 200ms for API calls
- **Uptime:** 99.9% availability
- **Data Accuracy:** 100% calculation accuracy
- **Audit Trail:** 100% action logging

### User Adoption
- **Active Users:** Track monthly active users
- **Data Entry:** Monitor data completeness
- **Report Generation:** Track report usage
- **User Satisfaction:** Regular feedback surveys

### Business Impact
- **Emission Reduction:** Year-over-year reduction targets
- **Compliance:** 100% regulatory compliance
- **Cost Savings:** Reduced manual effort
- **Training Value:** Student learning outcomes

---

## Conclusion

This Carbon Accounting Platform provides a comprehensive, ISO 14064-compliant solution for institutional carbon footprint tracking. The modular architecture ensures scalability and maintainability, while the robust audit trail guarantees compliance and transparency.

**Key Strengths:**
- Standards-compliant methodology
- Complete audit trail for verification
- Scalable, modular architecture
- User-friendly interface for all roles
- Real-time calculation and reporting

**Next Steps:**
1. Review and approve this specification
2. Assemble development team
3. Begin Phase 1 implementation
4. Conduct regular progress reviews
5. Plan for production deployment

---

*Document Version: 1.0*
*Last Updated: 2026-03-28*
*ISO Standard: 14064-1:2018*
*Architecture: Modular Monolith with Microservices-ready Design*
