# Architecture Overview

Current scope: Minimal Vite + React SPA scaffold intended for incremental expansion.

## Runtime Flow

1. Browser loads `index.html` (Vite injects built assets).
2. `src/main.tsx` mounts `<App />` inside `#root` with React 19 `StrictMode`.
3. `<App />` (currently a placeholder) will evolve to provide global layout & routing integration.
4. Page-level components (e.g., `src/pages/Home.tsx`) fetch backend data using `api.ts`.

## Key Modules

| Module               | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `src/lib/api.ts`     | Generic JSON fetch helper with typed response generics.    |
| `src/lib/health.ts`  | Runtime type guard for health endpoint responses.          |
| `src/pages/Home.tsx` | Example page performing health check and rendering status. |
| `src/App.tsx`        | Application shell; future router provider mount point.     |

## Data Fetching

-   Simple wrapper: `api<T>(path)` returns parsed JSON as `T` (no retry/backoff logic yet).
-   Add narrowers/runtime guards (`isSomething(value)`) in `src/lib/` to avoid `any`.

## Styling

-   Global styles: `src/index.css`.
-   Component/page styles: co-located `.css` imported at top of file.
-   Tailwind/utility libraries not present; can be added without conflict.

## TypeScript Conventions

-   Strict TS, ESM-only (`verbatimModuleSyntax`).
-   Prefer `import type` for type-only imports.
-   Avoid `any`; use discriminated unions or index signatures with narrowers.

## Build & CI

-   Command chain: `npm run build` → `tsc -b` (type check only) → `vite build` (bundle & optimize).
-   GitHub Actions runs the same sequence on Node 20.

## Extension Points (Planned / Recommended)

| Area             | Suggested Approach (when needed)                                                  |
| ---------------- | --------------------------------------------------------------------------------- |
| Routing          | Add `react-router-dom` and mount `<RouterProvider>` in `App.tsx`.                 |
| State management | Start with React context/hooks; introduce Zustand/Redux only if complexity grows. |
| Testing          | Add Vitest + Testing Library; colocate `*.test.ts(x)` near modules.               |
| Styling system   | Optional adoption of CSS Modules or utility CSS framework.                        |
| API evolution    | Layer domain-specific functions (e.g., `getHealth()`) over `api.ts`.              |

## Non-Goals (Current Phase)

-   SSR / hydration
-   Internationalization
-   Advanced performance optimizations

These can be revisited when feature scope expands.

## Migration Note

Repository relocated: `ArchILLtect/sameboat-frontend` → `sameboat-platform/frontend`. Historical links may reference the former path.
