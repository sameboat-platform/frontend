# SameBoat Backend – Progress Summary

## Completed Work (as of [date])

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