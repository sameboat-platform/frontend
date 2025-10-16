[![Frontend CI](https://github.com/sameboat-platform/frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/sameboat-platform/frontend/actions/workflows/frontend-ci.yml)
[![Release](https://img.shields.io/github/v/tag/sameboat-platform/frontend?label=release&sort=semver)](https://github.com/sameboat-platform/frontend/releases)
[![License](https://img.shields.io/github/license/sameboat-platform/frontend.svg)](LICENSE)
[![Dependencies](https://img.shields.io/github/actions/workflow/status/sameboat-platform/frontend/frontend-ci.yml?label=build)](https://github.com/sameboat-platform/frontend/actions)
[![Coverage](./.github/badges/coverage.svg)](https://github.com/sameboat-platform/frontend/actions/workflows/coverage-badge.yml)
[![Dependency Audit](https://github.com/sameboat-platform/frontend/actions/workflows/dependency-audit.yml/badge.svg)](https://github.com/sameboat-platform/frontend/actions/workflows/dependency-audit.yml)
[![Security Policy](https://img.shields.io/badge/security-policy-blue)](./SECURITY.md)
[![Netlify Status](https://api.netlify.com/api/v1/badges/73bee901-5d98-4400-9fac-17cd8d86c72e/deploy-status)](https://app.netlify.com/projects/app-sameboat/deploys)
# SameBoat Frontend (Vite + React + TS)

## Overview

SameBoat Frontend is a lightweight Vite + React 19 single-page application scaffold. It focuses on fast local iteration (HMR), strict TypeScript, and a minimal baseline you can extend (routing, API clients, state management) without vendor lock-in.

Live App: https://sameboatplatform.org/

Also available via Netlify default domain: https://app-sameboat.netlify.app/

Note: adopting a dedicated subdomain like https://app.sameboatplatform.org is a common production practice. It cleanly separates marketing/docs (root) from the application, simplifies cookie scoping and CSP, and scales well as you add more subdomains. You can adopt it later without code changes.

### Planning Artifacts

-   Week 3 Progress Checklist: `docs/week-3-plan-checklist.md`
-   Week 4 Draft Plan: `docs/week-4-plan-draft.md`
-   Changelog: `CHANGELOG.md` (see [Unreleased] section for in-flight changes)
-   Developer Workflow Checklist: `docs/developer-workflow-checklist.md`

### Versioning

Pre-1.0 releases use `0.x.y`; breaking changes may occur between minor bumps. Each meaningful change should append a line under `[Unreleased]` in the changelog; on tagging a release, move those lines into a dated section.

## Tech Stack

| Layer            | Choice                             | Notes                                                           |
| ---------------- | ---------------------------------- | --------------------------------------------------------------- |
| Build dev server | Vite 7                             | HMR + fast SWC transforms                                       |
| UI library       | React 19 + Chakra UI (selective)   | React for core + incremental Chakra adoption (cards, forms)     |
| Transpilation    | SWC via `@vitejs/plugin-react-swc` | Faster than Babel for local dev                                 |
| Language         | TypeScript ^5.8.0 (strict)         | `noUncheckedSideEffectImports`, `verbatimModuleSyntax` enforced |
| Linting          | ESLint flat config + plugins       | React Hooks, Refresh, a11y, import sorting                      |
| Conventional commits | commitlint + Husky hooks       | Enforces `type(scope?): subject` style                          |
| CI               | GitHub Actions                     | Lint, type, tests; coverage (PRs, ≥50%); changelog check; build |
| Release utility  | Custom script `npm run release`    | Bumps version + moves `[Unreleased]` in CHANGELOG               |

## Project Structure

```
src/
  main.tsx          # Entry – mounts <App />
  App.tsx           # App shell (wraps providers + routes)
    routes/           # Route configuration + ProtectedRoute + layout transitions
    state/auth/       # Auth context store (bootstrap, login/logout/refresh, error mapping)
    pages/            # Page-level React components
    components/       # Reusable UI bits (AuthForm, FormField, Footer, UserSummary, RuntimeDebugPanel, GlobalRouteTransition)
    lib/              # Shared utilities (api.ts, health.ts)
    theme.ts          # Chakra theme customization (dark-mode default, brand tokens)
public/             # Static assets served at root (/favicon, /vite.svg)
```

### Health Monitoring Component

`HealthCheckCard` centralizes backend liveness/health polling with:

-   Configurable interval via prop or `VITE_HEALTH_REFRESH_MS`.
-   Minimum skeleton duration to reduce UI flicker.
-   Manual refresh button.
-   Status + message extraction from Spring Boot Actuator style responses.
-   Stable polling loop (no re-subscribe on status changes).

Usage:

```tsx
import HealthCheckCard from './components/HealthCheckCard';

export default function Home() {
    return (
        <div>
            {/* other content */}
            <HealthCheckCard />
        </div>
    );
}
```

If you need a one-off health check somewhere else, prefer reusing this component to avoid duplicate intervals.

Add components under `src/components/` and import into pages or `App.tsx`.

## Development Workflow

1. Install deps: `npm install`
2. Start dev server: `npm run dev` (default http://localhost:5173)
3. Type-first build: `npm run build` (runs `tsc -b && vite build`)
4. Preview production bundle: `npm run preview`
5. Bundle analyze (optional): `npm run analyze` (generates a visual report of bundle composition)
6. Lint before commit: `npm run lint`
7. Bundle analysis: `npm run analyze` generates `dist/bundle-stats.html` and opens it.

### Performance Budget (soft)

- Initial app JS (gzip) target: ≤ 250 kB (soft gate; no CI block yet).
- Use the bundle analyzer to spot large libs and consider:
    - code-splitting via dynamic `import()`
    - lighter alternatives to heavy packages
    - tree-shaking-friendly import paths
7. (Optional) Auto hooks: Husky runs lint/tests/commitlint pre-push / commit.

## Environment Variables

All variables must be prefixed with `VITE_` for exposure to the client bundle.

| Variable                    | Purpose                                       | Notes                                       |
| --------------------------- | --------------------------------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL`         | Override backend origin (dev)                 | Fallback to relative `/` (proxy) when unset |
| `VITE_DEBUG_AUTH`           | Enable verbose auth console diagnostics       | Any truthy value enables extra logs         |
| `VITE_DEBUG_AUTH_BOOTSTRAP` | Additional bootstrap heartbeat logs           | Aids diagnosing early 401 noise             |
| `VITE_HEALTH_REFRESH_MS`    | Interval (ms) between health pings            | Defaults to `30000`; must be > 1000         |
| `VITE_APP_VERSION`          | Build/app version string                      | Shown in footer when present                |
| `VITE_COMMIT_HASH`          | Git commit hash (fallback if version missing) | Truncated to 7 chars in footer              |
| `VITE_FEEDBACK_URL`         | External feedback / issue link                | Defaults to repo issue creation URL         |

You can create a `.env.example` enumerating these for contributors. Local overrides belong in `.env.local` (git‑ignored).

## API Layer

`src/lib/api.ts` exports a small generic `api<T>` wrapper around `fetch`.
All requests automatically include `credentials: 'include'` so the backend's
`SBSESSION` (httpOnly) cookie-based session flows transparently.
Structured error JSON (shape: `{ error, message }`) is surfaced via `err.cause`.

Example:

```ts
const health = await api<HealthResponse>("/actuator/health");
```

Add narrowers / runtime guards in `src/lib/*` (e.g., `health.ts`).

### Environment helpers

Use `src/lib/env.ts` to gate dev/test/prod behavior consistently across the app:

- `isDev()` – true for Vite development builds
- `isProd()` – true for Vite production builds
- `isTest()` – true when running tests (Vitest)

Recommended patterns:

- Place `if (isProd()) return null;` at the very top of dev-only components, before any React hooks, to prevent effects from running in production bundles.
- At call-sites, conditionally render dev-only components with `{isDev() && <DevPanel />}` for clarity and better tree-shaking.

### Canonical endpoints

- Health: `/actuator/health` (public; no credentials).
- Version: `/api/version` (public; optional for display).
- Auth (cookie session; always include credentials):
    - `POST /api/auth/login`
    - `POST /api/auth/register`
    - `POST /api/auth/logout`
    - `GET /api/me` (bootstrap + subsequent session checks)

Important: Do NOT call bare `/me` from the client. Always use `/api/me` to avoid ambiguity and align with backend policy and CSP/proxy rules.

## Authentication System

The authentication layer uses a React Context (`AuthProvider`) that performs exactly one bootstrap fetch to `/api/me` to hydrate the session user (cookie-based). React 19 StrictMode double-mount is neutralized via a module-level flag ensuring `refresh()` is not called twice.

### Key Points

-   Provider: `AuthProvider` (`src/state/auth/auth-context.tsx`) – wraps the router.
-   Actions: `login`, `register`, `refresh`, `logout`, `clearError`.
-   Status: `status` cycles through `idle | loading | authenticated | error` while `bootstrapped` gates initial redirects.
-   Error Mapping: Server error payload (`{ error, message }`) is normalized in `errors.ts` to friendly messages (e.g. `BAD_CREDENTIALS`, `EMAIL_EXISTS`, `VALIDATION_ERROR`).
-   User Normalization: Responses may return `{ user: {...} }` or raw user; normalization flattens `role` into `roles[]`, surfaces `displayName`.
-   Protected Routes: `ProtectedRoute` blocks redirect until `bootstrapped` true; shows a Chakra spinner with framer-motion transitions.
-   Environment Debug Flags: `VITE_DEBUG_AUTH`, `VITE_DEBUG_AUTH_BOOTSTRAP` toggle verbose logging & heartbeats (useful for analyzing early 401 patterns).

### Forms & UI

-   Forms rewritten using Chakra `FormControl`, `Input`, `FormErrorMessage`, and `Button`.
-   Field-level client validation (email format, password length) surfaces inline errors while backend errors appear in a Chakra `Alert`.
-   Redirect logic preserves original route (`location.state.from`) after successful auth.

### Session Refresh Strategy

1. On first mount: run `refresh()` to attempt session hydration.
2. If unauthenticated (401) during bootstrap: treat as normal (no noisy error state).
3. Post-bootstrap 401s (e.g. expiry): surface mapped error and allow UI to re-auth.
4. A fail-safe timeout flips `bootstrapped` after 5s if the network call hangs.

### Future Store Swap

Because components import only `useAuth()` (wrapper), migrating to Zustand requires only replacing its internals with a store hook matching the same return contract.

## Runtime Debug Panel

`RuntimeDebugPanel` (dev-only) provides an at-a-glance status overlay:

-   Collapsible floating panel (bottom-right) with reduced-motion respect.
-   Displays auth state (`status`, `bootstrapped`, `lastFetched`), active user, and API base.
-   Probes `/actuator/health` & `/api/me` every 15s; maintains last 25 probe history entries.
-   Cumulative error count badge; copy buttons for API base & user ID.
-   Manual refresh & force-refresh controls for diagnosing bootstrap issues.

Remove or disable this panel for production builds (guarded by `import.meta.env.PROD`). In this codebase, both `RuntimeDebugPanel` and `UserSummary` are DEV-only:

- `RuntimeDebugPanel` short-circuits at the top of the component if `import.meta.env.PROD` and is rendered only when `import.meta.env.DEV`.
- `UserSummary` is rendered only when `import.meta.env.DEV`.

This ensures they do not appear or run any effects in production, preventing unintended network probes (e.g., `/api/me`).

## Testing Workflow

### Tooling

-   Test runner: Vitest (`npm run test`)
-   Environment: jsdom
-   Libraries: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

### Running Tests & Coverage

```bash
npm run test          # Single run
npm run test:coverage # Run with v8 provider; thresholds (50%) enforced locally
npx vitest watch      # Interactive watch (coverage summary on exit)
```

Coverage thresholds (initial baseline): lines/functions/statements/branches ≥ 50%. PRs run coverage; CI fails below.

### Test Locations

All test files live under `src/__tests__/` (`*.test.tsx` for component/routes logic).

### Current Coverage Focus

-   Protected route access & redirect
-   Client-side form validation for login/register (email format + password length)

### Writing New Tests

1. Import the component under test.
2. Wrap with `AuthProvider` + a memory router if route context needed.
3. Mock network as required (e.g. `vi.spyOn(global, 'fetch')` returning a resolved `Response`).
4. Use semantic queries (`getByRole`, `findByText`) over `querySelector`.
5. Assert side-effects (redirect) via `history` (MemoryRouter entries) or presence of destination content.

### Mocking Fetch Example

```ts
vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(
        JSON.stringify({
            id: "u1",
            email: "a@b.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
    )
);
```

### Adding Backend Scenario Tests

-   Successful login → redirected to `/me`.
-   BAD_CREDENTIALS response → `<Alert>` shows friendly message.
-   SESSION_EXPIRED path (simulate `/me` 401 after initial bootstrap) → redirect preserved.

### Performance / Stability Tips

-   Keep auth store interactions synchronous except for actual network calls.
-   Use `await waitFor(...)` only for async UI transitions; prefer immediate assertions when possible.
-   Avoid leaking fetch mocks between tests – reset with `vi.restoreAllMocks()` in `afterEach`.

## Quality Gates

-   TypeScript clean (build runs `tsc -b`).
-   ESLint passes (`npm run lint`).
-   Tests pass; coverage ≥ thresholds.
-   Changelog updated when source/docs change (`npm run changelog:check`).
-   Conventional commit style enforced (Husky + commitlint).
-   CI replicates local gates: lint → type → tests → changelog check → build.
 -   Dependency audit runs in CI: High/Critical vulnerabilities fail; Moderate/Low are reported but non-blocking (runtime deps only). See `docs/security/dependency-audit.md`.

## Contributing (Quick Summary)

1. Branch from `main` (`feat/*`, `fix/*`).
2. Make changes; keep PRs small & focused.
3. Ensure `npm run lint && npm run build` succeeds.
4. Open PR; CI must be green before merge.

> For extended guidelines see `CONTRIBUTING.md` (to be added).

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Scripts

-   dev – start Vite dev server
-   build – production build
-   preview – preview production build locally
-   test – run Vitest suite
-   test:coverage – run Vitest with @vitest/coverage-v8 (thresholds enforced)
-   analyze – build in analyze mode and generate `dist/bundle-stats.html` (auto-opens)
-   release – run automated version + changelog update script
-   changelog:check – enforce changelog entry presence
-   lint / lint:fix – run (and optionally fix) ESLint

## Repository Migration

This project was migrated from `ArchILLtect/sameboat-frontend` to `sameboat-platform/frontend`.

If you previously cloned the old repository, update your git remote:

```bash
git remote set-url origin https://github.com/sameboat-platform/frontend.git
git fetch origin --prune
```

CI badge & links have been updated to the new organization path.

## Performance Budget (soft targets)

Track these as guidelines (non-blocking) and iterate once stable. Use a bundle analyzer locally and Lighthouse for quick checks.

- JavaScript (gzipped)
    - Initial JS on home route ≤ 250 KB
    - Largest single JS chunk ≤ 150 KB
    - Initial JS requests ≤ 5
- CSS (gzipped): initial route ≤ 50 KB
- Web Vitals (lab targets)
    - LCP ≤ 2.5s (desktop), ≤ 4.0s (simulated mid‑tier mobile)
    - CLS ≤ 0.10
    - TBT ≤ 200 ms (desktop lab)
- Images: avoid render‑blocking images on initial route; lazy‑load non‑critical assets

Later, you can add a non-failing CI job to post bundle/Lighthouse deltas on PRs and convert to hard gates once the app stabilizes.

## Notes

- Local coverage artifacts (coverage/) are ignored by git; the CI workflow uploads coverage as PR artifacts and updates the badge on main after merge.
 - If dependency audit fails on High/Critical, prefer updating direct deps. If needed, use `overrides` in `package.json` to force patched transitives:
     ```json
     {
         "overrides": {
             "pkg@^1": "1.2.3"
         }
     }
     ```
     As a last resort, use `patch-package` and remove once upstream publishes a fix. Temporary allowlists via `audit-ci` should have an expiration and a tracking issue.
