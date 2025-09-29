# Contributing to SameBoat Frontend

Thanks for your interest in improving the project! This guide keeps contributions consistent and the CI pipeline green.

## Quick Start

```bash
npm install
npm run dev
```

## Branching Strategy

-   Base branch: `main`
-   Use prefixes: `feat/short-description`, `fix/bug-xyz`, `chore/tooling`, `docs/update-readme`
-   Keep branches small & focused; open a draft PR early if helpful.

## Commit Style

Use concise, imperative messages:

```
feat: add health runtime guard
fix: correct api error message formatting
```

No enforced conventional commit tooling yet, but following the pattern helps with history scans.

## Scripts

| Purpose       | Command           |
| ------------- | ----------------- |
| Dev server    | `npm run dev`     |
| Type + bundle | `npm run build`   |
| Lint          | `npm run lint`    |
| Preview build | `npm run preview` |

`npm run build` fails fast on type errors before bundling.

## TypeScript / Code Style

-   Strict mode is enabled; fix all type errors before pushing.
-   Prefer `import type { Foo } from './types'` for type-only imports.
-   Avoid `any`; add narrowers or utility types instead.
-   Co-locate component-specific styles with the component and import at top.

## API Utilities

-   Use `api<T>(path)` from `src/lib/api.ts` for HTTP calls.
-   Add runtime guards (e.g., `isHealthResponse`) under `src/lib/` when parsing JSON with uncertain shape.

## Adding Dependencies

-   Prefer lightweight, tree-shakeable libraries.
-   Avoid large state libs until justified (start with React hooks / context if needed).
-   If adding a dependency, mention rationale in the PR description.

## Testing (Future)

Vitest / Testing Library not yet added. If you introduce tests:

1. Add dev deps: `vitest @testing-library/react @testing-library/jest-dom @types/jsdom`
2. Create `vitest.config.ts`
3. Put tests next to code: `Component.test.tsx`

## Accessibility & Performance

-   Use semantic HTML elements (`main`, `nav`, `button`, etc.).
-   Defer premature optimization; rely on Vite + React 19 defaults.

## Pull Requests

Before opening:

```bash
npm run lint
npm run build
```

Checklist:

-   [ ] Lint passes
-   [ ] Type-check passes
-   [ ] Minimal scope / clear title
-   [ ] Explains any new dependency

## CI Expectations

-   CI runs `npm ci && npm run build`. A failing type build fails the PR.
-   Keep Node version ≈ 20 locally to avoid surprises.

## Documentation

-   Update `README.md` if you add a notable feature, command, or structural change.
-   Update `.github/copilot-instructions.md` only when core architecture/workflows change.

## Migration Note

Repository relocated from `ArchILLtect/sameboat-frontend` to `sameboat-platform/frontend`; reference the new path in links and badges.

## Questions / Discussion

Open a GitHub Discussion or a draft PR for architectural proposals before large changes.

Happy shipping! 🚢
