# Architecture Overview

Current scope: Vite + React 19 SPA with incremental Chakra UI adoption, auth context, protected routing, health telemetry, and a dev runtime debug panel.

Planning references:

-   Week 3 Checklist (`week-3-plan-checklist.md`) – status & metrics for auth/UI sprint.
-   Week 4 Draft (`week-4-plan-draft.md`) – proposed quality & resilience objectives.
-   Developer Workflow Checklist (`developer-workflow-checklist.md`) – end-to-end contribution SOP.

## Runtime Flow

1. Browser loads `index.html` (Vite injects built assets).
2. `src/main.tsx` mounts `<App />` inside `#root` with React 19 `StrictMode`.
3. `<App />` mounts `AuthProvider`, Chakra `ChakraProvider`, theme, and route tree.
4. Layout / navigation + animated route transitions (Framer Motion) wrap page outlets.
5. Page-level components (e.g., `Home.tsx`) use shared `api.ts` helper & Chakra components.

## Key Modules

| Module                                 | Purpose                                                   |
| -------------------------------------- | --------------------------------------------------------- |
| `src/lib/api.ts`                       | JSON fetch helper (credentials included) + error parsing. |
| `src/lib/health.ts`                    | Runtime type guard for health endpoint responses.         |
| `src/state/auth/`                      | Auth context (bootstrap, login/register/logout, errors).  |
| `src/routes/`                          | Router config, `ProtectedRoute`, layout & transitions.    |
| `src/components/RuntimeDebugPanel.tsx` | Dev overlay for auth + probe telemetry.                   |
| `src/pages/Home.tsx`                   | Health check card, auth entry links, user summary.        |
| `src/theme.ts`                         | Chakra theme (dark mode default, brand tokens).           |

## Data Fetching

-   Simple wrapper: `api<T>(path)` returns parsed JSON as `T` (no retry/backoff logic yet).
-   Add narrowers/runtime guards (`isSomething(value)`) in `src/lib/` to avoid `any`.

## Styling & UI

-   Chakra UI for primitives (cards, layout, forms, alerts, badges, buttons).
-   Custom theme in `src/theme.ts` (default dark mode, brand color scale).
-   Remaining legacy global CSS (`index.css`) retained for base resets; progressive migration in progress.

## TypeScript Conventions

-   Strict TS, ESM-only (`verbatimModuleSyntax` ensures TypeScript preserves your import/export syntax exactly as written, which is important for correct ESM output and avoiding accidental default/named import mixing).
-   Prefer `import type` for type-only imports.
-   Avoid `any`; use discriminated unions or index signatures with narrowers.

## Build & CI

-   Command chain: `npm run build` → `tsc -b` (type check only) → `vite build` (bundle & optimize).
-   CI pipeline order: lint → typecheck → test (Vitest) → coverage (PRs) → changelog check → build → artifacts.
-   Dependency audit workflow: runs `npm audit --omit=dev` and fails on High/Critical; summarizes severity counts in PRs. Moderate/Low are reported but non-blocking.
-   Changelog enforcement: script fails CI if source changes without `CHANGELOG.md` update.
-   Conventional commits enforced locally via Husky + commitlint.
-   Coverage provider: @vitest/coverage-v8 with thresholds ≥ 50% (scoped to src/**/*).
-   Release automation script (`npm run release`) bumps version, migrates `[Unreleased]`, updates diff links, commits (+ optional tag). Safety guard prevents running off `main`.
-   Bundle analysis: `npm run analyze` generates `dist/bundle-stats.html` for visualizing module sizes and spotting split points.

## Extension Points

| Area             | Current                                  | Future Path                                    |
| ---------------- | ---------------------------------------- | ---------------------------------------------- |
| State management | React Context (auth)                     | Swap to Zustand keeping `useAuth()` contract   |
| Animations       | Framer Motion (route + auth transitions) | Reduced motion toggle / granular variants      |
| Telemetry        | Runtime debug panel (dev only)           | Expand to include latency, feature flags       |
| Forms            | Chakra primitives                        | Extract form schema validation layer (Zod)     |
| Health checks    | Interval polling                         | Pause-on-error, exponential backoff, SSE or WS |
| Tooling pipeline | Lint + tests + release script            | Add test-change guards, auto PR labeling; dependency audit allowlist policy |

## Non-Goals (Current Phase)

-   SSR / hydration
-   i18n
-   Advanced perf optimizations / code-splitting beyond default

Revisit as feature complexity increases.

## Migration Note

Repository relocated: `ArchILLtect/sameboat-frontend` → `sameboat-platform/frontend`. Historical links may reference the former path.

## Authentication Lifecycle (Summary)

1. App mounts → `AuthProvider` runs guarded `refresh()` once (mitigates StrictMode double call).
2. If `/api/me` returns user → state becomes `authenticated`.
3. If 401 during bootstrap → treated as unauthenticated (no error yet); `bootstrapped` flips.
4. Post-bootstrap auth failures (e.g., session expiry) set mapped error and revert user to null.
5. `ProtectedRoute` waits for `bootstrapped` then decides redirect vs rendering child.

## Runtime Debug Panel

-   Floating dev overlay: health + auth probe results (last 25) with cumulative error count.
-   Copy helpers for API base & user ID.
-   Collapse/expand with motion respecting reduced motion preferences.
-   (Planned) Integration with future feature-flag / backoff states.
