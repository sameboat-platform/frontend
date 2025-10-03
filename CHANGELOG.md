# Changelog

All notable changes to this project will be documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and (once stabilized) will align with [Semantic Versioning](https://semver.org/) for tagged releases.

## [Unreleased]

### Added
- Nothing yet.

### Changed
- Nothing yet.

### Fixed
- Nothing yet.

### Documentation
- Nothing yet.

### Internal
- Nothing yet.

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

[Unreleased]: https://github.com/sameboat-platform/frontend/compare/0.1.0...HEAD
[0.1.0]: https://github.com/sameboat-platform/frontend/tree/0.1.0
