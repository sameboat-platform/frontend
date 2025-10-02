# Changelog

All notable changes to this project will be documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and (once stabilized) will align with [Semantic Versioning](https://semver.org/) for tagged releases.

## [Unreleased]

### Added

-   CHANGELOG scaffold introduced.

### Planned

-   Health polling pause / backoff.
-   Expanded auth test coverage (success + expiry scenarios).
-   Reduced-motion global toggle.
-   `.env.example` onboarding file.

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
