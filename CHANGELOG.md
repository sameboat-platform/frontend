# Changelog

All notable changes to this project will be documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and (once stabilized) will align with [Semantic Versioning](https://semver.org/) for tagged releases.

## [Unreleased]

### Added
- Release automation script (`scripts/release.mjs`) – bumps version, migrates `[Unreleased]`, updates diff links, optional tag.
- Changelog enforcement script (`scripts/check-changelog.mjs`) – CI fails if source/docs change without CHANGELOG update.
- Husky integration (`prepare` script) with active commit message (commitlint) & pre-push quality gate hooks.
- Conventional commit rules (`commitlint.config.cjs`) enforcing `type(scope?): subject` style.
- Vitest coverage thresholds (50% lines / statements / functions / branches) in `vitest.config.ts`.
- Developer Workflow Checklist (`docs/developer-workflow-checklist.md`) – end‑to‑end contribution SOP.
- Coverage & workflow documentation surfaced in README and architecture docs.
- CI enhancements: tests run by default; coverage gate; changelog check step; consolidated lint → type → test → changelog → build order.

### Changed
- `README.md`: Added workflow, coverage threshold, release script usage, Husky/commitlint details, expanded scripts table.
- `docs/architecture.md`: Clarified CI pipeline order, added tooling pipeline extension point, release automation details.
- `TTD.md`: Expanded workflow/tooling backlog with test guard, auto‑labeling, feature test heuristics.

### Docs
- Week 3 plan checklist augmented with percentage metrics and completion blockers section.
- Week 4 draft plan scaffold created (`docs/week-4-plan-draft.md`).
- Developer workflow appendix expanded (git hooks, commit message enforcement).
- Added planning & workflow links across docs set.

### Internal / Tooling
- ESLint configuration tightened (import sorting / a11y plugins; explicit `lint` / `lint:fix` scripts).
- Standardized test invocation (`npm run test`) to produce coverage output for CI gating.
- Added `release`, `changelog:check`, and `lint:fix` scripts to `package.json`.
- Implemented `prepare` script to auto‑install Husky hooks on `npm install`.

### Pending / In Progress
- Auth test expansions: success redirect, BAD_CREDENTIALS mapping, session expiry handling, wrapped user normalization, bootstrap timeout.
- Pause-on-error + (optional) backoff logic for health polling.
- Reduced-motion global toggle for route + debug panel transitions.
- `.env.example` scaffold & environment docs refresh.
- Test-change guards (fail PR if `feat:` or `fix:` lacks related test diff).
- Auto PR labeling GitHub Action based on first conventional commit type.

### Notes
- Next minor release (`0.2.0`) targeted after closing auth test gaps + shipping first resilience enhancement (pause-on-error health polling or reduced-motion toggle).
- Patch release (`0.1.x`) pathway remains if early publication of automation improvements is required.

## [0.1.0] - 2025-10-02

> Initial structured milestone capturing Week 3 outcomes (auth + UI/UX pass). Version number provisional until formal release process defined.

### Added

-   Auth pages: Login, Register, Me (protected) with Chakra-based forms.
-   Central `AuthProvider` with single guarded bootstrap (`/api/me`).
-   Error mapping layer (`errors.ts`) with friendly codes (BAD_CREDENTIALS, EMAIL_EXISTS, etc.).
-   User normalization (role→roles[], displayName inference).
-   ProtectedRoute gating + framer-motion route/state transitions.
-   Health check card with interval polling, skeleton debounce, manual refresh.
-   Runtime Debug Panel (collapsible, probe history, copy helpers, error count, reduced-motion respect).
-   Chakra theme (dark mode default), selective component integration (Cards, Alerts, Buttons, Badges).
-   Sticky footer with version + commit hash + feedback link.
-   Environment variable typings (`vite-env.d.ts`).

### Changed

-   Layout refactored to full-height flex shell (`AppShell`) with sticky footer.
-   Forms migrated from basic HTML to Chakra primitives with inline validation.
-   Me page enhanced (avatar placeholder, role badges, grouped sections).

### Documentation

-   README: Auth lifecycle, runtime debug panel, planning artifact links.
-   `architecture.md`: Auth lifecycle, transitions, planning references.
-   Week 3 progress checklist with automated percentage metrics.
-   Week 4 draft plan scaffold.

### Internal / Developer Experience

-   Structured fetch wrapper (`api.ts`) with typed generics and error cause propagation.
-   Added optional verbose auth bootstrap logging via `VITE_DEBUG_AUTH*` flags.

### Notes

-   Testing breadth still partial (baseline protected route + validation tests only).
-   CI currently ensures type + build; test execution step pending.

---

Guidelines:

-   Start new entries under [Unreleased]; move them into a dated version section when cutting a release (and optionally tagging in git).
-   Group changes under: Added / Changed / Fixed / Removed / Deprecated / Security / Docs / Internal as needed.

[Unreleased]: https://github.com/sameboat-platform/frontend/compare/0.1.0...HEAD
[0.1.0]: https://github.com/sameboat-platform/frontend/tree/0.1.0
