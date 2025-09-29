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
| Language         | TypeScript ~5.8 (strict)           | `noUncheckedSideEffectImports`, `verbatimModuleSyntax` enforced |
| Linting          | ESLint flat config                 | React Hooks + React Refresh plugins                             |
| CI               | GitHub Actions                     | Node 20, type-check + build                                     |

## Project Structure

```
src/
	main.tsx          # Entry – mounts <App />
	App.tsx           # App shell placeholder
	index.css         # Global styles
	pages/            # (Added) Page-level React components
	lib/              # Shared utilities (e.g., api.ts, health.ts)
public/             # Static assets served at root (/favicon, /vite.svg)
```

Add components under `src/components/` (create folder when needed) and import into pages or `App.tsx`.

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

`src/lib/api.ts` exports a small generic `api<T>` wrapper around `fetch`. Prefer:

```ts
const health = await api<HealthResponse>("/api/actuator/health");
```

Add narrowers / runtime guards in `src/lib/*` (e.g., `health.ts` with `isHealthResponse`).

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

## Repository Migration

This project was migrated from `ArchILLtect/sameboat-frontend` to `sameboat-platform/frontend`.

If you previously cloned the old repository, update your git remote:

```bash
git remote set-url origin https://github.com/sameboat-platform/frontend.git
git fetch origin --prune
```

CI badge & links have been updated to the new organization path.
