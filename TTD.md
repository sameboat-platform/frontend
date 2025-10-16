# Things To Do (TTD)

## ASAP (next tiny PRs)

- Adopt GitHub CLI for release and project automation (gh install, auth, basic scripts).

- Add fetch-mocked login success test
- (Done) Add a “require main branch” guard in `scripts/release.mjs` to avoid accidental releases from feature branches.
- (Done) Standardize tag naming to `vX.Y.Z` and align CHANGELOG compare links accordingly.
- (Done) PR template: add a “Post‑merge actions” checklist so setting branch protection required checks is always captured.
- (Done) CI: Dependency audit step (fail on high/critical) and surface results in PR summary.
- Observability: introduce a minimal event bus with a console sink for key app events.
- Docs: expand environment variables reference and add a runtime guard section.

## Testing Coverage

### Recently added (done)

- API wrapper baseline tests (`src/__tests__/api.test.ts`)
  - buildUrl passes through absolute URLs
  - returns parsed JSON on success
  - returns text when response is not JSON
  - throws with structured cause on error JSON (assert message + cause)

- Utility tests (`src/__tests__/utils.test.ts`)
  - health.isHealthResponse type guard: valid/invalid shapes
  - env helpers: isDev/isProd boolean smoke; isTest true under Vitest

These provide a stable coverage floor with minimal maintenance.

### Next candidates (small, high-yield)

- api.ts: fallback path when JSON parse fails but body is text (exercise final catch)
- health UI: HealthCheckCard handles non-JSON text payload (status display remains robust)
- auth flow: happy-path login and logout (use fetch mocks, avoid complex UI assertions)

## UI/UX

-   Debounce rapid backend health status flips by enforcing a minimum skeleton display duration.
-   Expose backend health refresh interval via `VITE_HEALTH_REFRESH_MS` environment variable.
-   Add a global `<AnimatePresence>` around route transitions for cohesive page motion.
-   Add a small UI control (dropdown or input) in dev mode to adjust the interval live.
-   Persist preferred interval in localStorage for dev tuning.
-   Animate auth form page transitions distinctly (scale + fade) separate from general routes.
-   Add reduced motion support: disable transitions if user prefers reduced motion (respect `prefers-reduced-motion`).
-   Add copy-to-clipboard button for User ID.
-   Lazy-load avatar with generated identicon fallback.
-   Show lastFetched timestamp and manual refresh (leveraging existing auth context).
-   Introduce a compact mobile variant hiding the identifiers section behind a disclosure.
-   Add a layout test to ensure footer positioning (e.g., snapshot with small content).
-   Implement reduced motion media query to disable route transitions.
-   Pause-on-error behavior for health auto-refresh (stop interval after consecutive failures until manual retry).
-   Add additional env var typings & sample `.env.example` for debug / feature flags (e.g. `VITE_DEBUG_AUTH`, `VITE_HEALTH_REFRESH_MS`, future flags).
-   Add sticky top navigation bar (reuse `Layout` / extend `AppShell` with nav actions, responsive collapse if needed).
-   Implement reduced motion guard using `window.matchMedia('(prefers-reduced-motion: reduce)')` before triggering animations.

## Workflow / Tooling

-   Review and iterate `docs/developer-workflow-checklist.md` after first full usage cycle.
-   Wire `changelog:check` into CI as a required status (already present; enforce branch protection rule).
-   Add a coverage threshold to Vitest (fail CI if below baseline; decide initial %).
-   Introduce conventional commit linting (commitlint + husky) to standardize messages.
-   Implement a release automation script (move `[Unreleased]` → new version section, update diff links, bump package version).
-   (Former wording retained conceptually: prior tasks consolidated into explicit phrasing above.)
-   After workflow automation stabilized: begin adding enumerated missing auth & CI tests (see week-3 checklist Completion Blockers) and update blocker section iteratively.
-   Add a custom CI step that fails if no test files were touched for a PR containing `feat:` or `fix:` commits.
-   Script/guard to fail if a `feat:` commit lands without any matching diff in `src/__tests__/` (heuristic; allow override via `[skip-test-guard]`).
-   GitHub Action to auto-assign PR label based on first conventional commit type (feat/fix/docs/chore/refactor/test/perf).

## Performance

-   Route-level code-splitting: convert top-level routes to `React.lazy` + `Suspense` to reduce initial JS.
-   Vendor chunking: configure `build.rollupOptions.output.manualChunks` to isolate large libs (e.g., framer-motion, chakra-ui) into async chunks used where needed.
-   Audit heavy deps in analyzer report and evaluate lighter alternatives or partial imports.
-   Prefer tree-shakable entrypoints (e.g., import only used icons/components; avoid deep wildcard imports).
-   Consider dynamic imports for rarely used panels (e.g., `RuntimeDebugPanel`) in dev-only builds.
-   Track regression threshold against soft budget (initial JS ≤ 250 kB gzip) in PR descriptions until we automate a check.

### Project Automation

-   Auto-update the Project “Status” field when a linked PR is merged (project workflows; ensure issues close via closing keywords).
-   Automated release creation: script adds tag + creates GitHub Release in one step (use gh CLI once adopted).
-   Script dependency triage or labeling (e.g., label Dependabot PRs by group and auto-add to Project backlog).
-   Scriptable gating: verify CHANGELOG entry before tagging a release; fail CI otherwise.
    
### Dependency / Security Automation

-   Create Dependabot config groups separating critical/security deps from test/tooling deps (distinct PR labels & visibility).
-   Add CI job for dependency audit (e.g. `npm audit --audit-level=moderate` or Snyk) highlighting severity delta between main and PR.
-   Add GitHub Action guard: fail Dependabot PR if it modifies > N (configurable) devDependencies without a CHANGELOG entry under Security or Internal.

## Notes

Add new sections here as areas expand (e.g., Testing, Performance, Accessibility).


### Potential workflow--for badge coverage updating:

name: Update Badge
on:
  workflow_run:
    workflows: ["CI"]   # or on: push: branches: [main]
    types: [completed]

permissions:
  contents: write
  pull-requests: write

jobs:
  badge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # TODO: generate/update your badge/readme here
      - run: |
          ./scripts/update-badge.sh
          git status --porcelain || true

      # Use peter-evans/create-pull-request to open/refresh a PR
      - uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "chore(badge): update status badge"
          branch: badges/auto
          title: "chore(badge): update status badge"
          body: "Automated badge update."
          signoff: false
          delete-branch: false   # keep or auto-delete after merge if you prefer
