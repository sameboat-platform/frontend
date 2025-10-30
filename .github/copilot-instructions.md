## Copilot instructions for SameBoat Frontend

Project: Vite + React 19 + TypeScript (strict), using SWC React plugin. Auth state uses a Zustand store with a stable `useAuth` adapter and `AuthEffects` for bootstrap + visibility refresh.

Big picture

-   SPA bootstrapped by Vite. Entry `src/main.tsx` mounts `src/App.tsx` into `#root` in `index.html`.
-   Build is type-first: `npm run build` executes `tsc -b` before `vite build`. CI fails on any TS errors.
-   Flat ESLint config with React Hooks and React Refresh rules; focus on `.ts/.tsx` files; `dist/` ignored.
-   ESM-only repository (`"type": "module"`, TS `moduleResolution: bundler`, `verbatimModuleSyntax: true`). Prefer `import type` for types.

Key workflows

-   Dev: `npm install` then `npm run dev` (Vite dev server with HMR via React Refresh). Default port 5173 unless overridden.
-   Build: `npm run build` (runs `tsc -b && vite build`). Preview prod bundle with `npm run preview`.
-   Lint: `npm run lint` (ESLint flat config in `eslint.config.js`). Fix issues before pushing to keep CI green.
-   CI: GitHub Actions (`.github/workflows/frontend-ci.yml`) uses Node 20 with `npm ci` then `npm run build`. Align local Node ≈20 for parity.

Architecture and conventions

-   Components: Functional React components with JSX. Example pattern in `src/App.tsx`. Co-locate styles by importing `.css` at the top of components (see `App.tsx`, `App.css`).
-   Entry/render: `createRoot(document.getElementById('root')!).render(<StrictMode>...</StrictMode>)` in `src/main.tsx`.
-   Styling: Plain CSS files imported in TS/TSX (allowed via bundler mode). Keep side-effect imports intentional to satisfy `noUncheckedSideEffectImports`.
-   Assets: Static assets in `public/` served at root (`/vite.svg`) and module-imported assets in `src/assets/`.
-   TypeScript: Strict config (`strict`, `noUnused*`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`). No emit from TS; Vite handles bundling.
-   Imports/exports: ESM only. With `verbatimModuleSyntax`, avoid mixing default/named incorrectly; use `import type` for type-only.
-   State/auth: `src/state/auth/store.ts` (Zustand), `useAuth` adapter, `AuthEffects` for one-time bootstrap and 30s visibility-driven refresh. `AuthProvider` is a thin wrapper that mounts effects.

What to edit where

-   App shell/Routes: `src/App.tsx`. Create new components under `src/` (e.g., `src/components/Foo.tsx`) and import into `App.tsx`.
-   Global styles: `src/index.css`; component styles: local `.css` imports next to components.
-   Vite config/plugins: `vite.config.ts` (currently only `@vitejs/plugin-react-swc`).
-   Lint rules: `eslint.config.js` (flat config; only targets `**/*.{ts,tsx}` today).
 -  Auth: prefer importing `useAuth` from `src/state/auth/useAuth` and avoid reading implementation details directly; effects are mounted once by `AuthProvider`.

Examples

-   New component:
    -   Create `src/components/Hello.tsx` exporting a default function component.
    -   Import in `src/App.tsx`: `import Hello from './components/Hello.tsx'` and render `<Hello name="World" />`.
-   Using public asset: reference `/vite.svg` directly in `img src` or as background in CSS.
-   Add a runtime guard: place `isFooResponse` in `src/lib/foo.ts` mirroring `health.ts`.

Gotchas

-   TS build runs before bundling: fix type errors to pass `npm run build` and CI.
-   Node version: CI uses Node 20. Use the same locally to avoid lockfile or API differences.
-   Lint scope: only TS/TSX files are linted; JS files (none currently) won’t be checked by default.
 -  React Hooks rules: avoid calling hooks conditionally; in dev-only components, return early before any hooks when `isProd()`.

Pointers to key files

-   `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`
-   `package.json` (scripts), `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`
-   `.github/workflows/frontend-ci.yml` (build pipeline)
 -  `src/state/auth/store.ts`, `src/state/auth/useAuth.ts`, `src/state/auth/auth-context.tsx`, `src/state/auth/effects.tsx`

Migration context

-   Repository moved from `ArchILLtect/sameboat-frontend` to `sameboat-platform/frontend`. Historical issue/PR references may use the old org prefix. Use the new path for badges, links, and cloning.

Further docs

-   `README.md` – high-level overview & workflows.
-   `CONTRIBUTING.md` – contribution process & quality gates.
-   `docs/architecture.md` – current architecture + extension points.
-   `docs/rfcs/zustand-auth-store.md` – migration rationale and design.
