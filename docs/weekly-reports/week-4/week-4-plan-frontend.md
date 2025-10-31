# Week 4 – Frontend Detailed Plan (SameBoat)
**Scope:** Authentication flow + session persistence + conditional UI + tests  
**DoR:** Backend `/api/me`, `/api/auth/login`, `/api/auth/logout` live; CORS OK; cookies enabled  
**DoD (frontend):** See “Acceptance Criteria” at bottom

---

> Release status: v0.3.0 shipped on 2025-10-30. See tag and notes: https://github.com/sameboat-platform/frontend/releases/tag/v0.3.0. Milestone “v0.3.0” is closed; “v0.3.1” (patches) and “v0.4.0” (next minor) are open.

## Architecture/Files Touched (Implemented)

- `src/lib/api.ts` – fetch wrapper with `credentials: 'include'`, debug gated by `VITE_DEBUG_AUTH='true'`.
- `src/state/auth/` – Auth store powered by Zustand with a stable `useAuth()` adapter and `AuthEffects` side-effects component; includes intendedPath, inFlight concurrency guard, error mapping, one-time bootstrap with 5s fail-safe, and visibility-based refresh with 30s cooldown.
- `src/routes/ProtectedRoute.tsx` – auth guard (stores full intended path; no content flash after bootstrap).
- `src/pages/Login.tsx` – login form, error mapping, redirect to intended path.
- `src/pages/Me.tsx` – minimal signed-in state display.
- `src/components/HealthCheckCard.tsx` – stable polling and tests (Actuator).
- `.env.example`/README – documented flags (see Env below).
- `src/__tests__/*` – added targeted tests to keep coverage stable.

> **Env expectation:**  
> `VITE_API_BASE_URL=https://<render-api-domain>` (Netlify build env)  
> All requests **must** include credentials (cookies).

---

## API Contracts (frontend expectations)

- `POST /api/auth/login`  
  - Body: `{ email: string, password: string }`  
  - Success: `200` or `201`, sets `SBSESSION` HttpOnly cookie  
  - Failure: `401` with code we can map (e.g., `BAD_CREDENTIALS`)
- `POST /api/auth/logout`  
  - Success: `204` (or `200`), server invalidates session
- `GET /api/me`  
  - Success: `200 { id, email, name? }`  
  - Unauth/expired: `401`

---

## Implementation Summary (delivered)

1) HTTP client with cookies
- [x] `src/lib/api.ts` ensures `credentials: 'include'`; debug logs only when `VITE_DEBUG_AUTH='true'`.

2) Auth store (Zustand + adapter, parity with MVP)
- [x] `src/state/auth/store.ts` + `src/state/auth/useAuth.ts` + `src/state/auth/auth-context.tsx` (thin wrapper) with `user`, `status`, `error`, `intendedPath`, `inFlight`, and actions `login`, `logout`, `refresh`, `register`, `setIntendedPath`.
- [x] Concurrency guard to prevent overlapping auth requests.
- [x] Error mapping normalized and tested; friendly messages aligned.

3) Session bootstrap (StrictMode-safe)
- [x] One bootstrap attempt per page load via module-level flag; 401 on first run is expected and silent.
- [x] Fail-safe timer ensures `bootstrapped=true` even if network hangs.

4) ProtectedRoute (no “flash”)
- [x] Stores full intended path (pathname+search+hash); doesn’t set intended for `/login`.

5) Login page
- [x] Validates, performs login, redirects back to intended path; clears intended post-login.

6) Console hygiene
- [x] Gate auth/API logs behind `VITE_DEBUG_AUTH='true'` and `VITE_DEBUG_AUTH_BOOTSTRAP='true'`.
- [x] Added a console hygiene test to ensure no warn/error during happy bootstrap.

- 7) Session freshness on tab visibility
- [x] `visibilitychange` listener (in `AuthEffects`) triggers `refresh()` when visible, not in-flight, and last fetch ≥ 30s ago (pure helper `shouldRefreshOnVisibility`).
- [x] Unit-tested the cooldown logic in isolation to keep tests deterministic.

8) Error handling UX
- [x] Post-bootstrap 401s surface a mapped auth error; initial bootstrap 401 is silent.

---

## Tests (Vitest + React Testing Library)

- [x] `AuthBootstrap.test.tsx` – bootstrap happy path.
- [x] `ProtectedRoute.test.tsx` – redirects guest to `/login`.
- [x] `IntendedPath.test.tsx` – preserves full path (pathname+search+hash) on post-login redirect.
- [x] `AuthFlow.test.tsx` – basic form interactions and validation.
- [x] `LogoutRace.test.tsx` – ensure no re-auth flip after logout.
- [x] `VisibilityRefresh.test.tsx` – unit tests for cooldown logic helper.
- [x] `errors.test.ts` – error mapping/normalization.
- [x] `ConsoleHygiene.test.tsx` – no warn/error on happy bootstrap.

---

## Acceptance Criteria (frontend)

- [x] `/api/me` check on load restores session (unauthenticated shows expected 401, handled silently).
- [x] Protected routes redirect guests, preserve path, and avoid content flash.
- [x] Login sets cookie, updates UI, redirects correctly, and maps errors.
- [x] Logout clears client + server session.
- [x] Tab visibility regain refreshes session (throttled by cooldown helper).
- [x] Tests pass in CI and block failing PRs.
- [x] `.env.example` and README updated with flags and canonical endpoints.

---

## Pitfalls to Avoid

- Missing `credentials: 'include'` → cookies won’t persist.
- Cross-site cookies → backend must set `Secure` + `SameSite=None`.
- StrictMode double mount → module-level bootstrap guard prevents duplicate refresh.
- Race conditions → in-flight guard prevents overlapping `refresh/login/logout`.
- Error spam → suppress 401 toasts during initial bootstrap.

---

## Post‑MVP

- Add an end-to-end integration test for the actual visibility event + 30s cooldown flow using a real browser runner (e.g., Playwright). The browser environment provides a faithful visibility lifecycle and reliable time control, making this scenario deterministic.

## Completion note: Zustand migration

- Implemented per RFC: `docs/rfcs/zustand-auth-store.md`.
- `useAuth` public contract preserved; consumers unchanged.
- `AuthProvider` remains as a thin wrapper to mount `AuthEffects`.
- Tests remained green; console hygiene preserved.
 - Release v0.3.0 cut and tagged; post‑release triage completed.
