[![Frontend CI](https://github.com/sameboat-platform/frontend/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/sameboat-platform/frontend/actions/workflows/frontend-ci.yml)

# SameBoat Frontend (Vite + React + TS)

## Overview

SameBoat Frontend is a lightweight Vite + React 19 single-page application scaffold. It focuses on fast local iteration (HMR), strict TypeScript, and a minimal baseline you can extend (routing, API clients, state management) without vendor lock-in.

## Tech Stack

| Layer            | Choice                             | Notes                                                           |
| ---------------- | ---------------------------------- | --------------------------------------------------------------- |
| Build dev server | Vite 7                             | HMR + fast SWC transforms                                       |
| UI library       | React 19                           | Concurrent features enabled by default StrictMode               |
| Transpilation    | SWC via `@vitejs/plugin-react-swc` | Faster than Babel for local dev                                 |
| Language         | TypeScript ^5.8.0 (strict)         | `noUncheckedSideEffectImports`, `verbatimModuleSyntax` enforced |
| Linting          | ESLint flat config                 | React Hooks + React Refresh plugins                             |
| CI               | GitHub Actions                     | Node 20, type-check + build                                     |

## Project Structure

```
src/
  main.tsx          # Entry – mounts <App />
  App.tsx           # App shell (wraps providers + routes)
  routes/           # Route configuration + ProtectedRoute
  state/auth/       # Auth context store (login/logout/refresh)
  pages/            # Page-level React components
  components/       # Reusable UI bits (Alert, FormField, etc.)
  lib/              # Shared utilities (api.ts, health.ts)
public/             # Static assets served at root (/favicon, /vite.svg)
```

Add components under `src/components/` and import into pages or `App.tsx`.

## Development Workflow

1. Install deps: `npm install`
2. Start dev server: `npm run dev` (default http://localhost:5173)
3. Type-first build: `npm run build` (runs `tsc -b && vite build`)
4. Preview production bundle: `npm run preview`
5. Lint before commit: `npm run lint`

## Environment Variables

Vite exposes variables prefixed with `VITE_`. Example:

```
VITE_API_BASE_URL=http://localhost:8080
```

Access via `import.meta.env.VITE_API_BASE_URL` (see `src/lib/api.ts`). Provide a `.env.local` (ignored) for machine-specific overrides.

## API Layer

`src/lib/api.ts` exports a small generic `api<T>` wrapper around `fetch`.
All requests automatically include `credentials: 'include'` so the backend's
`SBSESSION` (httpOnly) cookie-based session flows transparently.
Structured error JSON (shape: `{ error, message }`) is surfaced via `err.cause`.

Example:

```ts
const health = await api<HealthResponse>("/api/actuator/health");
```

Add narrowers / runtime guards in `src/lib/*` (e.g., `health.ts`).

## Auth UI (Week 3 Sprint)

The authentication UX is implemented using a lightweight React Context store designed to be swappable with Zustand later without changing component call sites.

### Architecture

-   Provider: `AuthProvider` in `src/state/auth/auth-context.tsx` mounts high in `App.tsx`.
-   Hook: `useAuth()` (re-export) – consumers import only from `state/auth/useAuth`.
-   State shape (`AuthStore`): `{ user, status, errorCode, errorMessage, lastFetched, bootstrapped }` plus actions.
-   Actions: `login(email, password)`, `register(email, password)`, `refresh()`, `logout()`, `clearError()`.
-   Bootstrapping: A single `refresh()` runs on mount to hydrate session (`bootstrapped` flag prevents flash redirects).
-   Protected routes: `ProtectedRoute` defers redirect until `bootstrapped` is true and `status` not loading.
-   Errors: Backend auth codes (`BAD_CREDENTIALS`, `EMAIL_EXISTS`, `SESSION_EXPIRED`, etc.) mapped to friendly strings in `state/auth/errors.ts`.

### Forms

-   Pages: `Login` (`/login`) and `Register` (`/register`), with client validation (email format + password ≥ 6 chars).
-   Submit buttons disable only during actual submission (local `submitting` flag) – initial session check does not block form interaction.
-   Errors (client + backend) presented via shared `<Alert kind="error" />` component.
-   Navigation after success: Redirect returns to original protected destination if user arrived via `ProtectedRoute` bounce (stored in `location.state.from`).

### Redirect Preservation

When an unauthenticated user visits `/me`, `ProtectedRoute` navigates to `/login` with state:

```ts
{
    from: location, authMsg, authCode;
}
```

Post-auth success redirects to `from.pathname` or `/me` fallback.

### Future Migration (Zustand)

To swap to Zustand later, implement a `useAuthStore` with the same contract and replace the body of `useAuth()`; no component changes required.

## Testing Workflow

### Tooling

-   Test runner: Vitest (`npm run test`)
-   Environment: jsdom
-   Libraries: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`

### Running Tests

```bash
npm run test          # Single run
npx vitest watch      # (Optional) Interactive watch mode
```

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

-   TypeScript must be clean (build runs `tsc -b`).
-   ESLint must pass (`npm run lint`).
-   CI workflow: `.github/workflows/frontend-ci.yml` – mirrors build locally; keep Node 20 parity.

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

## Repository Migration

This project was migrated from `ArchILLtect/sameboat-frontend` to `sameboat-platform/frontend`.

If you previously cloned the old repository, update your git remote:

```bash
git remote set-url origin https://github.com/sameboat-platform/frontend.git
git fetch origin --prune
```

CI badge & links have been updated to the new organization path.
