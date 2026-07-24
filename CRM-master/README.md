# Project KEYSTONE — Field Service Management Platform

Project KEYSTONE is a field service management platform for Meridian Facilities Management. It serves as the system of record for raising work orders, dispatching field technicians to commercial sites, tracking SLA compliance, logging parts and labor time, and delivering a self-service customer portal.

---

## Seed Login Credentials Table

| Role | Name | Email | Password | Scope / Organization |
|---|---|---|---|---|
| **MANAGER** | Morgan Manager | `admin@meridian.com` | `password123` | Full system access, closure rights, reporting & user management |
| **DISPATCHER** | Dan Dispatcher | `dispatcher@meridian.com` | `password123` | Customer/site management, work order creation & technician assignment |
| **TECHNICIAN** | Alex Tech | `tech1@meridian.com` | `password123` | Field job view (assigned jobs only), start/hold/resume/complete, parts & time logging |
| **TECHNICIAN** | Bob Technician | `tech2@meridian.com` | `password123` | Field job view (assigned jobs only) |
| **CUSTOMER** | Alice Apex Rep | `customer1@apex.com` | `password123` | Customer Portal (Apex Commercial Properties only) |
| **CUSTOMER** | Charlie Metro Rep | `customer2@metro.com` | `password123` | Customer Portal (Metro Retail Group only) |

---

## Tech Stack (100% Free & Open Source)

- **Language & Runtime**: Java 21 LTS
- **Backend Framework**: Spring Boot 3.3 (Spring Web, Spring Validation, Spring Security)
- **Security**: Stateless JWT with BCrypt password hashing & method-level `@PreAuthorize` RBAC
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL (via Docker)
- **Migrations**: Flyway versioned SQL migrations (`V1__init_schema.sql`, `V2__seed_data.sql`)
- **Frontend**: React + TypeScript built with Vite, styled with modern Glassmorphic CSS tokens & Lucide Icons
- **API Documentation**: OpenAPI 3.0 / Swagger UI browsable at `/swagger-ui.html`
- **Email & Notifications**: MailHog local SMTP email catcher (Port 1025 SMTP, Port 8025 Web UI) + in-app notification inbox
- **Build & Containerization**: Maven 3.9 + Docker & Docker Compose

---

## SLA Duration Mapping

| Priority | Response SLA Target | Automated Alert Threshold |
|---|---|---|
| **CRITICAL** | **4 Hours** | At Risk: <= 2 Hours to breach |
| **HIGH** | **24 Hours (1 Day)** | At Risk: <= 2 Hours to breach |
| **MEDIUM** | **72 Hours (3 Days)** | At Risk: <= 2 Hours to breach |
| **LOW** | **120 Hours (5 Days)** | At Risk: <= 2 Hours to breach |

A background `@Scheduled` background audit runner checks open work orders every 5 minutes, flagging jobs as `AT_RISK` or `BREACHED` and dispatching SMTP notifications via MailHog to all Managers.

---

## Work Order State Machine Lifecycle

Allowed status transitions are enforced by a server-side guarded state machine:

```
          [assign]                  [start]                [complete]            [close]
   NEW --------------> ASSIGNED ---------------> IN_PROGRESS ---------------> COMPLETED ----------> CLOSED (Terminal)
    |                     |                          ^ |                           |
    | [cancel]            | [cancel]           [resume]| |[hold]                   | [reopen]
    v                     v                          | v                           v
CANCELLED (Terminal)  CANCELLED (Terminal)          ON_HOLD                    IN_PROGRESS
```

- Any unauthorized or invalid transition throws **HTTP 409 Conflict**.
- Every status transition writes an immutable row into `WorkOrderStatusHistory` inside the same database transaction.

---

## Data Ownership & Security Controls

1. **Customer Data Isolation**: Users with `CUSTOMER` role are strictly restricted to reading and creating work orders for their linked `customerId`. Cross-customer access attempts via direct API calls return **HTTP 403 Forbidden**.
2. **Technician Job Isolation**: Technicians can only view and perform field actions (start/hold/resume/complete/parts/time) on jobs assigned to them (`assignedTo == currentUser`).
3. **Atomic Stock Decrement**: Logging parts usage decrements `Part.stockQty` in a single atomic `@Transactional` boundary. If requested quantity exceeds available stock, the request is cleanly rejected with **HTTP 409 Conflict** and stock remains untouched.
4. **Stateless JWT**: Authentication headers pass signed JWT tokens; secrets are loaded via environment variables (`KEYSTONE_JWT_SECRET`).

---

## Quick Start (Docker Compose)

To launch the full production-ready stack (PostgreSQL + MailHog + Backend + Frontend):

```bash
docker-compose up --build
```

Access services:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:8080](http://localhost:8080)
- **Swagger UI Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **MailHog Web UI**: [http://localhost:8025](http://localhost:8025)

---

## Local Development Setup

### 1. Database & MailHog
Start local Postgres and MailHog:
```bash
docker-compose up postgres mailhog -d
```

### 2. Backend
Run Spring Boot with Maven:
```bash
cd backend
mvn spring-boot:run
```

Execute backend tests:
```bash
cd backend
mvn test
```

### 3. Frontend
Run Vite dev server:
```bash
cd frontend
npm install
npm run dev
```

---

## Verification & Test Suite

The repository includes comprehensive JUnit 5 integration & security test suites:
- `WorkOrderLifecycleTest`: Validates state machine transition paths and terminal state restrictions.
- `CustomerSecurityIsolationTest`: Verifies 403 Forbidden rejection when Customer A attempts to access Customer B's work order.
- `TechnicianSecurityIsolationTest`: Verifies Technicians cannot act on unassigned work orders.
- `PartStockTransactionTest`: Verifies atomic stock decrements and insufficient stock 409 Conflict rejections.
