# SameBoat – Progress Summary (through 10‑30-2025)

This snapshot captures what’s shipped through frontend v0.3.0 and the current backend status; Week 5 focus is stories v1 and minimal profile edit.

## Frontend
- Releases:
    - v0.1.0 (2025‑10‑02) – initial auth/pages/health, CI baseline.
    - v0.2.0 (2025‑10‑04) – health stability, coverage pipeline, security policy.
    - v0.3.0 (2025‑10‑30) – Zustand auth store + effects, visibility‑based session refresh (30s cooldown), intendedPath preservation, dependency‑audit workflow, bundle analyzer, docs sweep.
- Health aligned to `/actuator/health`; ProtectedRoute preserves full intended path; tests and build/lint pass on main; security audit 0 vulns at release time.

## Backend (high‑level)
- Java 21 + Spring Boot 3.5.x; Flyway migrations; Postgres (Neon) in prod.
- Auth endpoints: `POST /api/auth/{login,register,logout}` and `GET /api/me` for session bootstrap (cookie `SBSESSION`).
- Users API: `GET /api/users/{id}`, `PATCH /api/users/{id}`; Actuator health at `/actuator/health`.
- Tests: service + controller; Jacoco ≥ 70%.

## Week 5 focus (next)
- Frontend: Stories feed `/stories`, create `/stories/new` with spoiler shields; profile edit (name/role/bio) via `PATCH /api/me`.
- Backend: Stories endpoints (`GET /api/stories`, `POST /api/stories`, `GET /api/stories/{id}`) and extend profile fields.

Links: Frontend release v0.3.0 → https://github.com/sameboat-platform/frontend/releases/tag/v0.3.0; Week 5 plan → `docs/weekly-reports/week-5-frontend-plan.md`.

# SameBoat Backend – Progress Summary

## Completed Work (10-08-2025)

### 1. Project Setup
- **Tech stack selected:** Java 21, Spring Boot 3.5.x, Maven, PostgreSQL (Neon for prod, H2/Testcontainers for tests).
- **Repo initialized:** Standard package structure under `com.sameboat.backend`.
- **Flyway configured:** Migration scripts in `src/main/resources/db/migration`.
- **CI:** Single workflow file `.github/workflows/backend-ci.yml` (enforces tests, coverage, lint).

### 2. Core Domain & Auth
- **User entity:**
    - Fields: `id`, `email`, `displayName`, `role`, `createdAt`, etc.
    - Mapped via JPA, validated with Bean Validation.
- **Authentication:**
    - Session-based auth (`SBSESSION` cookie, Secure/HttpOnly/SameSite=Lax).
    - Spring Security config in `security/` and `auth/`.
    - Endpoints: `/auth/login`, `/auth/logout`, `/auth/register`.
    - Integration tests: `AuthFlowIntegrationTest` covers success/failure paths.
- **User roles:**
    - Enum: `USER`, `ADMIN`, etc.
    - Role checks enforced in service layer.

### 3. REST API Endpoints
- **UserController:**
    - `GET /users/{id}`: Fetch user by ID (returns 404 if not found).
    - `PATCH /users/{id}`: Update display name (validates input).
    - **Tests:**
        - Integration tests for 404, update, validation errors.
- **HealthController:**
    - `GET /health`: Returns app status (used for deployment checks).

### 4. Service Layer
- **UserService:**
    - Methods: `getUser(id)`, `updateDisplayName(id, name)`, etc.
    - All business logic and validation centralized here.
    - Unit tests mock repository, verify exception handling and persistence.

### 5. Database & Migrations
- **Initial migration:**
    - Created `users` table with constraints (PK, NOT NULL, UNIQUE on email).
- **Audit fields:**
    - Added `created_at` and `last_login` (nullable) via atomic migrations.
- **Migration tests:**
    - Verified schema with Testcontainers profile.

### 6. Security & Validation
- **Bean Validation:**
    - All request DTOs annotated for field-level validation.
- **Exception handling:**
    - Centralized in `common.GlobalExceptionHandler`.
    - Error codes: `NOT_FOUND`, `VALIDATION_ERROR`, `BAD_REQUEST`, etc.
    - Tests assert error envelope matches spec.

### 7. Testing & Coverage
- **Unit tests:**
    - Service methods tested for positive/negative paths.
- **Integration tests:**
    - Controller endpoints tested with MockMvc.
- **Coverage:**
    - Jacoco gate at 70%+ instruction coverage (enforced in CI).

### 8. Documentation & Conventions
- **Architecture notes:**
    - Package layout, layering rules, and security baseline documented in `.github/copilot-instructions.md`.
- **API docs:**
    - Endpoints and error codes catalogued in `docs/api.md`.

---

## Next Steps

- Implement story submission and profile integration.
- Add trust metric and connection system.
- Continue atomic migrations for new features.
- Expand integration tests for new endpoints.