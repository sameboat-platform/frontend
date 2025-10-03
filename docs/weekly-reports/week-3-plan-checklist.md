# Week 3 Plan – Checklist & Current Status

Date: 2025-10-02
Scope Theme: Auth UX, session bootstrap, protected routing, developer ergonomics (debug + docs), initial UI consistency.

## Legend

| Symbol | Meaning                            |
| ------ | ---------------------------------- |
| [x]    | Complete                           |
| [~]    | Partial / In Progress              |
| [ ]    | Not started / Deferred             |
| [▶]    | Newly added (not in original plan) |

## Progress Metrics (Auto-Calculated)

Computed from the tables below (date of calculation: 2025-10-02).

| Category        | Total | Complete ([x]) | Partial ([~]) | Pending ([ ]) | % Complete | % At Least Partial |
| --------------- | ----- | -------------- | ------------- | ------------- | ---------- | ------------------ |
| Core Goals      | 10    | 8              | 2             | 0             | 80%        | 100%               |
| Enhancements    | 12    | 11             | 0             | 1             | 91.7%      | 91.7%              |
| Deferred (orig) | 6     | 0              | 0             | 6             | 0%         | 0%                 |

Notes:

-   The earlier snapshot (before this metrics section) listed "Core: 8/9" and "Enhancements: 13 completed, 2 pending"; those counts were stale. The tables currently reflect 10 core items and 12 enhancement items.
-   Percentages rounded to one decimal where needed; whole numbers shown without decimal.

## Core Goals (Original Plan)

| Task                                       | Status | Notes                                                                                  |
| ------------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| Implement login/register/me pages          | [x]    | All pages functional; Me page fully Chakra converted with profile layout.              |
| Protected routing for `/me`                | [x]    | `ProtectedRoute` + spinner + motion transitions.                                       |
| Central auth context with future swap path | [x]    | `AuthProvider` + `useAuth()` wrapper; normalization util.                              |
| Single bootstrap refresh (no duplicate)    | [x]    | Module-level flag; StrictMode double-mount handled; fail-safe timeout.                 |
| Redirect preservation after login          | [x]    | `location.state.from` respected.                                                       |
| Inline error mapping (backend codes)       | [x]    | Extended: `BAD_CREDENTIALS`, `EMAIL_EXISTS`, `VALIDATION_ERROR`, `UNKNOWN_ERROR`, etc. |
| Client-side validation (email/pass)        | [x]    | Chakra forms with field-level errors.                                                  |
| Tests: protected + form validation         | [~]    | Baseline tests exist; expanded coverage pending (auth success / error flows).          |
| Document auth flow & testing               | [x]    | README + architecture updated (authentication + debug).                                |
| CI runs tests                              | [~]    | Build CI confirmed; add explicit test run step (pending verification).                 |

## In-Scope Implementation Details

| Area                       | Status | Highlight                                                     |
| -------------------------- | ------ | ------------------------------------------------------------- |
| Error handling             | [x]    | Structured error cause, mapping isolated in `errors.ts`.      |
| User normalization         | [x]    | Handles wrapped `{ user: {...} }`, role→roles[], displayName. |
| Form UX separation         | [x]    | Local `submitting` vs global `status`.                        |
| Accessibility basics       | [x]    | Form labels, button text, semantic headings.                  |
| Abort / network resilience | [x]    | AbortControllers in auth actions; fail-safe bootstrap.        |

## Deferred / Out of Scope (Original List)

| Item                                       | Current State              |
| ------------------------------------------ | -------------------------- |
| Password reset / email verification        | Deferred                   |
| MFA                                        | Deferred                   |
| Role-based conditional UI (beyond display) | Deferred                   |
| Local/session storage user cache           | Deferred                   |
| Rate limiting / lockout UX                 | Deferred                   |
| Zustand store migration                    | Deferred (path documented) |

## Stretch / Enhancements (Added During Week)

| Enhancement                          | Status | Notes                                             |
| ------------------------------------ | ------ | ------------------------------------------------- |
| Chakra UI selective integration      | [x]    | Cards, Alerts, Forms, Buttons, Layout, Theme.     |
| Dark mode default theme              | [x]    | Custom `theme.ts`.                                |
| Health check card + interval         | [x]    | Auto-refresh + skeleton debounce; env interval.   |
| Env var typing (`vite-env.d.ts`)     | [x]    | Added multiple debug + health vars.               |
| Framer-motion route transitions      | [x]    | Global layout transition + ProtectedRoute states. |
| Runtime debug panel                  | [x]    | Collapsible, copy, history, reduced motion.       |
| Footer build/version + feedback link | [x]    | Uses `VITE_APP_VERSION` / `VITE_COMMIT_HASH`.     |
| Me page advanced layout              | [x]    | Avatar placeholder, grouped cards, roles badges.  |
| Sticky footer + full-height layout   | [x]    | Flex column `AppShell`.                           |
| Copy buttons (debug panel)           | [x]    | API base & user ID.                               |
| Reduced-motion respect               | [x]    | Debug panel collapse animation toggled.           |
| Pause-on-error health idea           | [ ]    | Tracked in `TTD.md`.                              |

## Remaining Gaps / Next Week Candidates

| Candidate                                        | Rationale                                 |
| ------------------------------------------------ | ----------------------------------------- |
| Add explicit `npm test` in CI workflow           | Ensure regressions caught automatically.  |
| Expanded auth tests (success/error flows)        | Increase confidence for future refactors. |
| Pause-on-error health refresh toggle             | Avoid noisy logs when backend degraded.   |
| Configurable health interval UI (dev)            | Improves developer feedback loop.         |
| Reduced motion global flag for route transitions | Accessibility polish milestone.           |
| `.env.example` scaffold                          | Onboarding clarity.                       |
| Copy-to-clipboard on Me page (User ID)           | Developer / debugging convenience.        |
| Identicon / lazy avatar fallback                 | Visual clarity for multi-user demos.      |
| Session stale refresh on visibility change       | Better long-lived tab experience.         |

## Quality Gate Status (Current)

| Gate             | Status       | Notes                                           |
| ---------------- | ------------ | ----------------------------------------------- |
| TypeScript       | Pass         | No outstanding TS errors.                       |
| Lint             | Pass (local) | Keep flat ESLint config updated as scope grows. |
| Build            | Pass         | `tsc -b && vite build` green.                   |
| Tests (baseline) | Partial      | Need broader auth flow coverage.                |
| Docs             | Updated      | README + architecture reflect current system.   |

## Completion Blockers (Core & Enhancements)

Focused list of concrete gaps preventing 100% completion of Core Goals and Enhancements.

### Core Goal: "Tests: protected + form validation" (Partial)

Outstanding granular items:

-   Add success-path auth test (login → redirect to intended route when `location.state.from` is set).
-   Add backend error path test for `BAD_CREDENTIALS` mapping (assert Chakra Alert shows friendly message).
-   Add session expiry simulation test: authenticated → subsequent `/api/me` 401 triggers mapped error & redirect handling.
-   Add wrapped user normalization test (response `{ user: { ... } }` → context user normalized with `roles[]`).
-   Add minimal refresh failure timeout test (bootstrap fail-safe sets `bootstrapped` after timeout).

### Core Goal: "CI runs tests" (Partial)

Outstanding granular items:

-   Confirm CI workflow consistently executes `npm run test` (recent changes added this; needs validation run on main).
-   Enforce test execution as required status in branch protection (GitHub settings, manual admin step).
-   (Planned) Add coverage threshold enforcement (see TODO) to raise bar for future partial credit removal.

### Enhancement (Pending): "Pause-on-error health idea"

Outstanding granular items:

-   Implement failure streak tracking for health polling.
-   Introduce pause condition after N consecutive failures (configurable; start with 3).
-   UI control to manually resume polling.
-   Optional exponential backoff (document strategy if deferred).

### Cross-Cutting Finishing Touches

-   Reduced motion global flag (applies to route & panel animations; currently only debug panel respects preference).
-   `.env.example` scaffold (onboarding clarity and to finalize environment documentation).
-   Copy-to-clipboard user ID button on Me page (developer convenience) – minor but listed to close enhancement polish.
-   Identicon fallback for avatar (visual polish; low risk, can defer if time constrained).
-   Visibility-based session stale refresh (long-lived tab UX) – not required for 100% of current plan but improves robustness.

### Clarification

Deferred items remain intentionally out-of-scope for Week 3 and do not count against completion metrics.

## Auth Flow Summary (Condensed)

1. App mounts → guarded `refresh()` (single run) → sets `bootstrapped`.
2. If user present → status `authenticated` else `idle` (no error).
3. Actions (login/register) normalize user; fallback to `refresh()` if body shape unexpected.
4. Post-bootstrap 401 sets mapped error and returns user to unauthenticated state.
5. Protected routes render spinner until `bootstrapped`; then redirect or render.

## Checklist Snapshot

```
Core Goals: 8/10 complete (2 partial) → 80% complete, 100% at least partial
Enhancements: 11/12 complete (1 pending) → 91.7% complete
Deferred items intentionally untouched
Overall (Core + Enhancements): 19/22 fully complete (86.4%)
```

### Recalculation Helper (Optional)

If you want to auto-refresh these metrics locally, you can add a tiny Node script (not yet committed) to parse this file and recompute counts:

```js
// scripts/calc-progress.mjs
import { readFileSync } from "node:fs";
const md = readFileSync("docs/week-3-plan-checklist.md", "utf8");
function extract(section) {
    const re = new RegExp(`## ${section}[\\s\\S]*?(?:\n##|$)`, "m");
    const block = md.match(re)?.[0] ?? "";
    const rows = [...block.matchAll(/\|([^\n]+)\|/g)].slice(2); // skip header & separator
    return rows.map((r) => r[1].split("|").map((c) => c.trim()));
}
function tally(rows) {
    return rows.reduce(
        (acc, cols) => {
            const status = cols[1];
            if (status?.includes("[x]")) acc.done++;
            else if (status?.includes("[~]")) acc.partial++;
            else if (status?.includes("[ ]")) acc.pending++;
            return acc;
        },
        { done: 0, partial: 0, pending: 0 }
    );
}
const core = tally(extract("Core Goals"));
const enh = tally(extract("Stretch / Enhancements"));
console.log({ core, enh });
```

Run with: `node scripts/calc-progress.mjs`.

## Risks (Updated)

| Risk                                            | Current Mitigation                                      |
| ----------------------------------------------- | ------------------------------------------------------- |
| Missing CI test execution                       | Add test step to workflow; fail build on failures.      |
| Over-expanding Chakra migration                 | Maintain selective scope; track TODO before converting. |
| Health polling noise on failure                 | Implement pause/backoff (planned).                      |
| Route animation motion for reduced-motion users | Provide global opt-out toggle (planned).                |

## Definition of Done (Revisited)

All functional auth goals met; outstanding items are refinement (tests breadth, CI enforcement, polish) rather than core feasibility.

---

**Last Updated:** 2025-10-02
**Maintainer:** Frontend Team
