# Week 3 Frontend Plan – Auth UX & Session Foundations

Date Range: Week 3 (Sprint kickoff)  
Primary Theme: End‑to‑end user authentication experience (login, register, session refresh, protected pages) for SameBoat.

## 1. Context Recap

-   Weeks 1–2 delivered: project scaffold (Vite + React 19 + TS strict), API helper, health check, CI (type + build), initial docs, routing baseline.
-   Backend: Spring Boot exposes session‑based auth with httpOnly cookie (`SBSESSION` / `sb_session`).
-   Frontend must send `credentials: 'include'` for all authenticated requests; no token storage client‑side.

## 2. Goals (What We Intend to Accomplish This Week)

1. Implement minimal but complete authentication UX:
    - Login, Register, and Me (profile placeholder) pages.
    - Protected routing gate for `/me` (and future private routes).
2. Centralize auth state (React Context store) with clean contract to later swap to Zustand if complexity grows.
3. Automatically bootstrap session (`/api/auth/me`) exactly once on app load.
4. Preserve intended destination on redirect to login (deep link friendly).
5. Provide consistent inline error messaging mapped from backend error codes.
6. Establish client‑side validation (email format, password length) prior to network calls.
7. Expand tests to cover protected redirects + form validations (foundation for future integration tests).
8. Document auth flow & test workflow (README + this plan).
9. Ensure CI runs tests (add / confirm `npm run test` in pipeline if not already enforced).

## 3. In Scope

-   React Router integration for new routes: `/login`, `/register`, `/me`.
-   Auth context & hook (`useAuth`) with actions: `login`, `register`, `logout`, `refresh`, `clearError`.
-   Error mapping (`BAD_CREDENTIALS`, `EMAIL_EXISTS`, `SESSION_EXPIRED`, `UNAUTHORIZED`).
-   Form components: reusable `FormField`, `Alert`.
-   Basic accessibility for forms and error messages (roles + labels).
-   Unit/component tests using Vitest + Testing Library.

## 4. Out of Scope (Deferred)

-   UI polish / theming / design system.
-   Password reset / email verification flows.
-   Multi‑factor auth.
-   Role‑based conditional UI beyond placeholder roles array.
-   Persistent caching of user object (no localStorage/sessionStorage yet).
-   Rate limiting / lockout UX.
-   Zustand or other external state libraries.

## 5. Deliverables

| Deliverable           | Description                                              | Status     |
| --------------------- | -------------------------------------------------------- | ---------- |
| Auth Routes           | `/login`, `/register`, `/me` + ProtectedRoute            | Done       |
| Auth Store            | Context store w/ bootstrap & actions                     | Done       |
| Error Mapping         | `state/auth/errors.ts` mapping codes -> friendly strings | Done       |
| Forms                 | Validated login & register with inline `<Alert>`         | Done       |
| Redirect Preservation | `location.state.from` redirection post-login             | Done       |
| Tests (Core)          | Protected route redirect + client validation             | Done       |
| README Updates        | Auth architecture + testing workflow                     | Done       |
| Week 3 Plan Doc       | This file                                                | Done       |

(We keep statuses dynamic; update mid‑week.)

## 6. Milestones & Suggested Sequence

1. Routing scaffold + placeholder pages (DONE).
2. Auth context & bootstrap refresh (DONE initial, refine if needed).
3. Form logic (submission, validation, error clearing) (DONE initial).
4. Destination preservation & no flash redirect (DONE).
5. Test suite: add protected route + validation tests (DONE baseline) & optional fetch mocks.
6. README / docs finalization (Auth UI + Testing) (DONE baseline; refine end of week).
7. CI adjustment (ensure tests run & are required) (DONE – tests run in CI; coverage check added on PRs; coverage job required on main).
8. Buffer / hardening: abort controllers, empty body handling (DONE), edge case cleanup.

## 7. Technical Decisions (Codified)

-   State: React Context now; keep a single exported hook layer to allow future Zustand migration with zero call‑site changes.
-   API helper injects `credentials: 'include'` globally to avoid per‑call drift.
-   Bootstrapping guarded by `bootstrapped` flag to prevent flash redirects.
-   Local form `submitting` state decoupled from global `status` to avoid disabled forms during initial session refresh.
-   Error payload surfaced via `err.cause` for structured mapping.

## 8. Testing Strategy

| Area              | Approach                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Protected Route   | MemoryRouter + AuthProvider; assert redirect to `/login`                  |
| Form Validation   | Client-side (regex + length) – ensure no network call before valid inputs |
| Error Display     | Simulate backend error (future: mock fetch returning error JSON)          |
| Redirect Restore  | (Future) Attempt `/me` → login → assert navigation back                   |
| Session Bootstrap | (Future) Mock `/me` success path & unauthorized path                      |

Stretch (optional end-of-week): fetch-mocked success + failure flows for login / register.

## 9. Risks & Mitigation

| Risk                                      | Impact                      | Mitigation                                                |
| ----------------------------------------- | --------------------------- | --------------------------------------------------------- |
| Backend error shape changes               | Wrong friendly messages     | Keep mapping isolated; add runtime guard & fallback       |
| Flash redirect regression                 | Poor UX / flicker           | Bootstrapped gate test + CI coverage                      |
| Form regressions when moving to Zustand   | Break auth actions          | Encapsulate API in same contract; integration tests guard |
| Node version mismatch (local 23 vs CI 20) | Subtle behavior differences | Ensure CI pinned Node 20; avoid Node 22/23 APIs           |

## 10. Metrics / Definition of Done

-   User can: register → redirected to `/me` (placeholder), login → redirected to `/me`, visit `/me` unauthenticated → see login.
-   Auth context stable: no console errors, no infinite refresh loops.
-   Test suite green in CI (at least protected route + form validation passing).
-   README documents auth flow & testing instructions.
-   Clear path to add additional protected pages (`<ProtectedRoute>` wrap works generically).

## 11. Post-Week Follow‑Ups (Candidates for Week 4)

-   Add logout UI + user info on `/me` page.
-   Add fetch-mocked integration tests for success & error auth flows.
-   Introduce coverage thresholds & badge.
-   Evaluate adding Zustand (only if more cross‑cutting state emerges).
-   Implement session refresh on window visibility regain if stale.
-   Add accessibility pass (ARIA live region for auth errors).

## 12. Quick Checklist

-   [x] Routes scaffold
-   [x] Auth provider & bootstrap
-   [x] Protected route gating w/o flash
-   [x] Error mapping module
-   [x] Forms with validation
-   [x] Local submitting vs global status
-   [x] Base tests (redirect, validations)
-   [x] README auth section
-   [x] Week plan doc
-   [ ] Add logout button (optional this week)
-   [ ] Add user info display on `/me`
-   [ ] Add fetch-mocked login success test
-   [x] Verify CI runs tests by default

---

**Owner:** Frontend team  
**Last Updated:** (initial commit – update as tasks complete)
