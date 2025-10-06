# Developer Workflow Checklist

End-to-end repeatable steps for making, validating, and shipping a change. Use this as a living SOP. Feel free to prune / adapt as tooling evolves.

---

## 0. One-Time Local Setup (Completed)

-   [X] Install Node 20 (match CI) – verify with `node -v`.
-   [X] `npm install`
-   [X] Configure editor ESLint + TypeScript integration (VS Code: install "ESLint" + "TypeScript (built-in)" extensions; enable `"editor.codeActionsOnSave": { "source.fixAll.eslint": true }`).
-   [X] Husky installed (`prepare` script in `package.json`) – hooks live under `.husky/`.
-   [X] Pre-push & commit-msg hooks active (quality gate + commitlint).
-   [X] Conventional commits enforced (commitlint + Husky).

## 1. Plan the Change

-   [ ] Capture intent: user story / bug / refactor note.
-   [ ] Check existing TODOs in `TTD.md` (avoid duplication).
-   [ ] Decide if change affects UI, API contracts, or build tooling.

## 2. Branch

-   [ ] Pull latest `main`: `git fetch origin && git checkout main && git pull`.
-   [ ] Create branch: `git checkout -b feat/<short-name>` (or `fix/`, `chore/`, `docs/`).

## 3. Implement

-   [ ] Write code in small, logically coherent commits.
-   [ ] Keep imports ESM + use `import type` for types.
-   [ ] Add/adjust tests (Vitest) alongside code under `src/__tests__/`.
-   [ ] Update or create types / runtime guards if new API shapes appear.

## 4. Changelog (During Implementation)

-   [ ] For user-visible or developer-facing changes: add bullet under `[Unreleased]` in `CHANGELOG.md` with appropriate heading:
    -   `### Added` | `Changed` | `Fixed` | `Docs` | `Removed` | `Security` | `Internal`.
-   [ ] If purely internal & trivial (typo, comment), may skip—but be consistent.

## 5. Local Quality Gates

-   [ ] Type check: `npm run typecheck` (or `npm run build` for full chain).
-   [ ] Lint: `npm run lint` (fix issues or refactor).
-   [ ] Tests: `npm test` (ensure green; add missing cases for new logic paths).
-   [ ] Coverage: `npm run test:coverage` (thresholds: lines/functions/statements/branches ≥ 50%).
-   [ ] Changelog enforcement: `npm run changelog:check` (ensures entry is present if source changed).

## 6. Commit & Push

-   [ ] Write clear commit messages (imperative mood): `feat: add pause-on-error health backoff`.
-   [ ] Push branch: `git push -u origin <branch>`.

## 7. Open Pull Request

-   [ ] Fill out PR template (summary, changelog confirmation, testing notes).
-   [ ] Add screenshots / logs for visual or behavioral changes.
-   [ ] Request review (auto reviewers or tag teammate).

## 8. CI Validation

-   [ ] Confirm CI passes: lint, typecheck, tests, coverage on PR, changelog check, build.
-   [ ] Dependency audit: review PR/job summary. High/Critical must be resolved or explicitly allowlisted with expiration; Moderate/Low are informational.
-   [ ] Address failures immediately (amend fix commits rather than stacking noise if early in review).

## 9. Review Iteration

-   [ ] Apply reviewer feedback in focused commits (`fix: address review feedback` or more specific).
-   [ ] Re-run local quality gates if change was non-trivial.

## 10. Merge Strategy

-   [ ] Prefer squash merge for feature branches (clean linear history) OR merge commit if preserving commit boundaries is important.
-   [ ] Ensure `[Unreleased]` still accurately reflects the PR content (adjust if scope changed during review).

## 11. Post-Merge Housekeeping

-   [ ] Pull latest main locally.
-   [ ] Delete remote & local feature branch if no longer needed.
-   [ ] Create follow-up tickets / TODO entries for any deferred items discovered during review.

## 12. Release (When Cutting a Version)

Trigger this AFTER the PR containing the final set of changes for the release has merged (or just before merge if you prefer tagging on main only). Use the automation script instead of doing the mechanical steps manually.

### Safety Checks First
- Working tree clean: git status → ensure no unstaged changes.
- CI green on the commit you’ll release.
[Unreleased] not empty (script aborts otherwise).
- Version bump matches intent (patch vs minor).
- After release script: review diff of CHANGELOG.md quickly.
 - You must be on `main` to run the release script (guard enforced).

### When ready

-   [ ] Ensure `[Unreleased]` has meaningful entries (no leftover noise).
-   [ ] Decide bump: `--minor` for feature set, patch default for fixes/docs (pre-1.0 semantics).
-   [ ] Run script (from a clean working tree) – examples:
    -   Patch: `npm run release`
    -   Minor + tag: `npm run release -- --minor --tag`
    -   Major (rare pre-1.0): `npm run release -- --major --tag`
-   [ ] Push commits & tags: `git push && git push --tags`.
-   [ ] Open PR if release commit was done on a branch; otherwise verify on `main`.
-   [ ] Verify updated links at bottom of `CHANGELOG.md` render as expected.
-   [ ] Create GitHub Release (optional) referencing CHANGELOG section.

### Milestones & Carryover

- Timeboxed releases are OK. Only ship what’s done; carry over the rest.
- Before tagging, triage the milestone:
    - Label hard requirements as release-blocker (if used) and ensure they’re done.
    - Move non-blockers to the next milestone (e.g., 0.2.1 or 0.3.0) or clear the milestone for truly “anytime” tasks.
    - Update the Project board (Done/In Progress/Backlog) to reflect actual status.
- After tagging:
    - Close the milestone.
    - Ensure leftover issues were moved forward (bulk edit via the Issues list is fine).
    - Verify dependency audit remains green on main; track any Moderate/Low as issues if needed.
- Changelog lists only shipped changes. Don’t include planned-but-deferred items; they remain in issues/projects.

## 13. Production / Deployment (Future Hook)

-   [ ] Trigger environment deploy or pipeline once build artifact is green.
-   [ ] Validate smoke tests / basic navigation & protected route flows.

## 14. Monitor & Iterate

-   [ ] Observe logs / metrics (when added) for regressions.
-   [ ] Feed learnings into next sprint checklist (`week-*-plan-*`).

---

## Minimal Quick Checklist (TL;DR)

1. Branch from main
2. Code + tests + changelog bullet
3. `npm run typecheck && npm run lint && npm test && npm run changelog:check`
4. Open PR (template) → CI green → review → merge
5. On release: move bullets out of `[Unreleased]`, tag

---

## Common Pitfalls & Remedies

| Pitfall                          | Symptom                  | Fix                                                                    |
| -------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| Forgetting changelog             | CI changelog check fails | Add bullet under `[Unreleased]`                                        |
| Intermittent test failure        | Flaky timing waits       | Replace `setTimeout` with deterministic mock / use `waitFor` correctly |
| Unused imports / types           | Lint errors              | Remove or use                                                          |
| Accidental double bootstrap logs | Extra refresh calls      | Confirm module-level guard intact in auth context                      |

---

## TODO (Next Improvements)

- Write coverage percentage to the GitHub Actions job summary on PRs so reviewers see it without downloading artifacts.

---

## Appendix: Git Hooks (Optional)

### Pre-push Quality Gate

Create `.git/hooks/pre-push` with (Windows Git Bash / WSL compatible):

```bash
#!/usr/bin/env bash
set -e
npm run typecheck
npm run lint
npm test
npm run changelog:check
```

This prevents pushing code that fails gates (local only; not shared in repo unless you adopt Husky).

### Commit Message (Commitlint) Hook

Create `.git/hooks/commit-msg` containing:

```bash
#!/usr/bin/env bash
exec npx --no-install commitlint --edit "$1"
```

On Windows (Git Bash), no `chmod` typically needed; if commit is rejected, adjust message to follow `type(scope?): subject` (e.g., `feat(auth): add session expiry handling`).

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`.

---

**Maintainer:** Frontend Team  
**Status:** Living Document
