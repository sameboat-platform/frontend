## Overview (Week 3 – Sept 29 – Oct 4)

Milestone focus: Auth UX end-to-end, health polling stability, CI coverage visibility, and release 0.2.0.

### Highlights

- Shipped release v0.2.0 (tagged) with CHANGELOG updated; post-release triage completed and milestone closed.
- Consolidated backend health logic into `HealthCheckCard` with pause-on-error + Resume and immediate interval restart.
- Fixed prior health polling spam and interval churn; stabilized tests (no giant timers; deterministic flow).
- CI coverage pipeline: switched to `@vitest/coverage-v8`, added PR coverage run, committed badge on main, and surfaced coverage percent in the PR job summary.
- Developer workflow docs improved: added “Immediately After 0.2.0” checklist; clarified coverage behavior and local gates.
- Release automation hardened: validated [Unreleased] before bumping; standardized on v‑prefixed tags for future releases.

### What Went Well

- Clear reduction in console noise and stable health polling behavior with simple, testable logic.
- CI visibility improved—reviewers can see coverage percent directly in the Checks panel without downloading artifacts.
- Documentation and checklists kept in sync with actual behavior (coverage, health pause/resume, release steps).
- Rapid recovery from release scripting edge cases (double-bump & stray tag) with minimal code changes and clear SOP updates.

### What We Struggled With

- Release cut sequence: running from the wrong branch and pushing stray local tags led to a brief tag mismatch (0.3.0). Resolved by resetting to main, deleting stray tag, and adding script guardrails.
- Subtle CI YAML quoting issue in the job summary step; fixed by using simple echo redirection.

### Completed vs Planned

- Auth routes, store, validation, protected routing: Done (baseline).  
- Tests (baseline): Done; flow expansions scheduled for Week 4.  
- Health pause-on-error with Resume: Done with tests.  
- CI tests + coverage on PRs: Done; coverage job set as required on main.  
- `.env.example` and docs updates: Done.  
- Release 0.2.0: Done; changelog + tag; post-release triage complete.

Deferred to Week 4+/Next Milestones:
- Broader auth flow tests (success/error, session expiry flows).
- Identicon/lazy avatar fallback; logout button & user info polish.
- Observability event bus + console sink.
- Dependency audit CI (fail on high/critical) and PR summary surfacing.

### Notable PRs/Commits

- fix(health): pause/resume with stable interval; tests stabilized.
- chore(ci): coverage workflow with v8 provider; coverage badge & PR summary.
- docs: developer workflow checklist (“Immediately After 0.2.0”), README badge & coverage notes.
- chore(release): guard [Unreleased] before bump; standardize future tags with v‑prefix.

### Metrics & Quality Gates

- Typecheck: PASS  
- Lint: PASS  
- Tests: PASS (Vitest, coverage scoped to src/**, thresholds 50%)  
- Build: PASS (`tsc -b && vite build`)  
- Coverage: Visible in PR job summary; badge generated on main.

### Follow‑ups (ASAP small PRs)

- Add main‑branch guard in `release.mjs` (refuse release off main).  
- PR template with “Post‑merge actions” checklist.  
- CI: dependency audit step with fail on high/critical and PR summary.  
- Observability: minimal event bus + console sink.  
- Docs: env variables reference + runtime guard write‑up.

### Appendix

- Week 3 plan and checklist updated to reflect completion; Week 4 milestones created (0.2.1/0.3.0) and carryovers triaged.
- Coverage workflow and release script improvements documented in `TTD.md` and developer checklist.
