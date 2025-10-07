# Changelog

All notable changes to this project will be documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and (once stabilized) will align with [Semantic Versioning](https://semver.org/) for tagged releases.

## [Unreleased]

### Added
- CI: Dependency Audit workflow (`dependency-audit.yml`) runs `npm audit` on runtime dependencies; fails on High/Critical, summarizes results in PR/job summary.
- Security docs: dependency audit policy and fallbacks (`docs/security/dependency-audit.md`).
- Bundle analysis script (`npm run analyze`) that builds in analyze mode, generates a bundle report, saves it to `dist/bundle-stats.html`, and auto-opens it.

### Changed
- Release script hardening: refuse to run unless on `main` (require‑main guard) to prevent accidental releases from feature branches.

### Documentation
- PR template now includes a "Post‑merge actions" checklist (required checks, tag push, milestone closure).
- README and Architecture updated to describe dependency audit policy and release guard.
- README documents a soft performance budget (initial JS ≤ 250 kB gzip) and bundle analysis workflow.

## [0.2.0] - 2025-10-04
### Added
- SECURITY policy (`SECURITY.md`).
- MIT license file (`LICENSE`).
- Coverage badge workflow (`coverage-badge.yml`) that:
	- runs tests with coverage on pull requests targeting `main` (no pushes),
	- generates and commits a badge to `.github/badges/coverage.svg` only on pushes to `main`,
	- uploads coverage artifacts on PRs for review.
- `.env.example` template enumerating supported environment variables.
- Dependabot configuration skeleton (`.github/dependabot.yml`) grouping security vs tooling updates.
- Smoke test for `HealthCheckCard` component.
 - Pause-on-error health polling with Resume CTA, plus tests covering pause/resume behavior.

### Changed
- Replaced ad-hoc inline Home page health logic with reusable `<HealthCheckCard />` component.
- Removed transient auth bootstrap "heartbeat" interval (was only for earlier debugging) to reduce console noise.
- Stabilized health polling implementation (single interval; eliminated status-driven re-subscribe loop).
 - README coverage badge now references the generated SVG in-repo and links to the workflow.
 - Vitest coverage provider switched to `@vitest/coverage-v8` and scoped to `src/**` files.

### Fixed
- Excessive `/actuator/health` polling spam caused by effect dependency loop and duplicate Home page implementation.
- HealthCheckCard now restarts auto-polling after clicking Resume (previously stayed paused with no interval until manual refresh).
- HealthCheckCard tests stabilized (no giant timers; deterministic pause/resume flow).

### Documentation
- Added minimal security policy document.
- README badges (release, coverage, security, license); added performance budget notes and live app links.
- Developer docs updated to reflect coverage thresholds and PR coverage workflow.

### Security
- Bump esbuild to 0.25.10 resolving moderate advisory.
- Upgrade Vitest to 3.2.4 and enable v8 coverage provider.

### Internal
- Removed legacy .eslintignore by migrating ignore patterns to flat config.
- Silenced auth debug logs during Vitest via `isVitest` guard.
- Automated coverage badge generation with branch-protection-safe push step.
- Refactored health polling to use stable callback + ref tracking (`statusRef`) preventing rapid interval churn.
- Consolidated health checks (Home now delegates to `HealthCheckCard`).
 - Ignore local `coverage/` directory in git; upload artifacts in CI instead.

### Notes
- Nothing yet.

## [0.1.0] - 2025-10-02

> Initial structured milestone capturing Week 3 outcomes (auth + UI/UX + tooling baseline).

### Added
- Auth pages: Login, Register, Me (protected) with Chakra-based forms.
- Central `AuthProvider` with single guarded bootstrap (`/api/me`).
- Error mapping layer (`errors.ts`) with friendly codes (BAD_CREDENTIALS, EMAIL_EXISTS, etc.).
- User normalization (role→roles[], displayName inference).
- ProtectedRoute gating + framer-motion route/state transitions.
- Health check card with interval polling, skeleton debounce, manual refresh.
- Runtime Debug Panel (collapsible, probe history, copy helpers, error count, reduced-motion respect).
- Chakra theme (dark mode default), selective component integration (Cards, Alerts, Buttons, Badges).
- Sticky footer with version + commit hash + feedback link.
- Environment variable typings (`vite-env.d.ts`).
- Release automation script (`scripts/release.mjs`).
- Changelog enforcement script (`scripts/check-changelog.mjs`).
- Husky integration & commitlint hook enforcement.
- Conventional commit rules (`commitlint.config.cjs`).
- Vitest coverage thresholds (50%).
- Developer Workflow Checklist (`docs/developer-workflow-checklist.md`).
- Coverage & workflow docs surfaced in README / architecture.
- CI enhancements (tests default, coverage gate, changelog step, ordered pipeline).

### Changed
- Layout refactored to full-height flex shell (`AppShell`) with sticky footer.
- Forms migrated from basic HTML to Chakra primitives with inline validation.
- Me page enhanced (avatar placeholder, role badges, grouped sections).
- `README.md`: workflow, coverage threshold, release script, Husky/commitlint details, expanded scripts table.
- `docs/architecture.md`: CI pipeline order clarity, tooling extension point, release automation details.
- `TTD.md`: Expanded workflow/tooling backlog (test guard, auto-labeling, feature test heuristics).

### Documentation
- README: Auth lifecycle, runtime debug panel, planning artifacts.
- `architecture.md`: Auth lifecycle, transitions, planning references.
- Week 3 progress checklist (percent metrics & blockers).
- Week 4 draft plan scaffold.
- Developer workflow appendix (git hooks, commit message enforcement) & planning/workflow links.

### Internal / Tooling / Dev Experience
- Structured fetch wrapper (`api.ts`) with typed generics and error cause propagation.
- Optional verbose auth bootstrap logging via `VITE_DEBUG_AUTH*` flags.
- ESLint configuration tightened (import sorting / a11y plugins; explicit `lint` / `lint:fix`).
- Standardized test invocation (`npm run test`) for coverage gating.
- Added `release`, `changelog:check`, and `lint:fix` scripts to `package.json`.
- Implemented `prepare` script for automatic Husky hook install.

### Notes
- Testing breadth still partial (protected route + basic form validation only).
- Next minor release (`0.2.0`) will focus on auth test gap closure + first resilience enhancement (pause-on-error health polling or reduced-motion toggle).
- Patch release pathway (`0.1.x`) available if urgent fixes needed.

---

Guidelines:

-   Start new entries under [Unreleased]; move them into a dated version section when cutting a release (and optionally tagging in git).
-   Group changes under: Added / Changed / Fixed / Removed / Deprecated / Security / Docs / Internal as needed.

[Unreleased]: https://github.com/sameboat-platform/frontend/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sameboat-platform/frontend/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/sameboat-platform/frontend/tree/v0.1.0
