# Week 4 – Frontend Plan (SameBoat)

Scope: Authentication flow, session persistence, conditional UI, and tests. Aligns with `week-4-frontend-plan.md` while adapting to our current architecture (AuthProvider context, not Zustand). We will not change implementation solely to match suggestions when the feature already exists and works.

## Ground rules

- Do not migrate to a different state library this week. Keep `AuthProvider`/context.
- Use existing endpoints and URL helpers; do not introduce new endpoints unless required by backend changes.
- Be explicit about user-visible behavior and tests; keep console clean except for intentional 401 during bootstrap.

## Status reconciliation (vs. week-4-frontend-plan.md)

- HTTP client with cookies (`src/lib/api.ts`): Done. All requests default to `credentials: 'include'`.
- Single bootstrap of session on mount: Done. Guarded against StrictMode double-invoke.
- ProtectedRoute without flash: Done. Uses `bootstrapped` gate and spinner.
- Login page: Exists. Friendly error mapping in place; needs tests for success redirect and failure mapping.
- Me page: Exists.
- Navbar conditional UI: Not present yet; add basic auth-aware actions to header in `AppShell`.
- Env docs/sample (`.env.example`): Present; ensure references are up to date.
- Tests: Partial. We have bootstrap and protected-route tests. Add the remaining ones below.
- Session freshness on tab visibility: Not implemented; add a throttled listener.
- Store migration to Zustand: Not needed this week (out of scope).

## Deliverables

1) Conditional navbar actions
- Add auth-aware header actions in `src/components/AppShell.tsx`:
  - When not authenticated: show Login and Register links.
  - When authenticated: show Me and Logout. Wire `logout()`.
- Keep styling minimal and consistent with current header.

2) Session freshness on visibility
- Add a throttled `visibilitychange` listener in `AuthProvider` to call `refresh()` when the tab regains focus (min interval ~30s to avoid spam).
- Ensure cleanup on unmount.

3) Auth tests (Vitest + RTL)
- login-success-redirects-intended.spec.tsx: login sets cookie and redirects back to `state.from`/intended route.
- login-failure-maps-error.spec.tsx: BAD_CREDENTIALS maps to friendly message.
- logout-clears-session.spec.tsx: clears UI/state and redirects as expected.
- visibility-refresh.spec.tsx: refresh runs on tab regain (throttled) without firing while hidden.

4) Docs
- README: Auth section and Bootstrap flow updated (done). No further changes unless behavior changes.
- TTD: Track the above tasks under Testing Coverage and UI/UX.

## Acceptance criteria

- On initial load, `/api/me` runs once; 401 unauthenticated is handled silently (no app-thrown error). Console/network may show 401 by design (documented).
- Protected routes do not "flash" content and properly redirect guests, preserving `state.from`.
- Login:
  - On success, sets user, updates UI, and redirects to intended route (or `/me`).
  - On failure (BAD_CREDENTIALS), surfaces friendly inline error.
- Logout clears user state and returns to a public route.
- Regaining tab focus triggers a single, throttled session refresh.
- Tests for the above pass in CI and coverage remains at/above the repo threshold.

## Non-goals this week

- Migrating auth to Zustand.
- Replacing `/api/me` initial check with a new endpoint.
- Large UI refactors beyond adding header actions.

## Risks and mitigations

- Flaky tests around timing (animations, async): use `waitFor` appropriately and stabilize with minimal throttling/mocks.
- Over-refresh on visibility: throttle with a timestamp guard (e.g., ≥30s since last refresh).

## Implementation notes

- Use existing `useAuth()` API for Navbar actions.
- Keep `AuthProvider` refresh codepath as the single source of truth.
- Ensure header links use `react-router-dom` `<Link>` for SPA navigation.

## Task list

- [ ] Header: Login/Register or Me/Logout actions wired.
- [ ] Visibility refresh: throttled listener calling `refresh()` on focus.
- [ ] Tests: login-success redirect.
- [ ] Tests: login-failure BAD_CREDENTIALS mapping.
- [ ] Tests: logout clears session.
- [ ] Tests: visibility-triggered refresh.
- [ ] Docs/TTD updates if needed.

## Estimation (relative)

- Header actions: S
- Visibility refresh: S
- Each test spec: S (4 specs → M overall)
- Glue/docs: XS

## Open questions / confirmations

- Keep the intentional 401 at startup (documented): Yes.
- Redirect target after login with no intended path: `/me` (current behavior).
- Any additional error codes to map beyond BAD_CREDENTIALS? If so, list.

---

This plan aligns with the intent of `week-4-frontend-plan.md` while respecting the current architecture to deliver the outcomes within the week.