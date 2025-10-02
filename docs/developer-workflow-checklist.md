# Developer Workflow Checklist

End-to-end repeatable steps for making, validating, and shipping a change. Use this as a living SOP. Feel free to prune / adapt as tooling evolves.

---

## 0. One-Time Local Setup

-   [ ] Install Node 20 (match CI) – verify with `node -v`.
-   [ ] `npm install`
-   [ ] (Optional) Configure an editor ESLint + TypeScript plugin.
-   [ ] (Optional) Add a pre-push hook (see Appendix) to run lint/type/tests/changelog check.

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
-   [ ] Changelog enforcement: `npm run changelog:check` (ensures entry is present if source changed).

## 6. Commit & Push

-   [ ] Write clear commit messages (imperative mood): `feat: add pause-on-error health backoff`.
-   [ ] Push branch: `git push -u origin <branch>`.

## 7. Open Pull Request

-   [ ] Fill out PR template (summary, changelog confirmation, testing notes).
-   [ ] Add screenshots / logs for visual or behavioral changes.
-   [ ] Request review (auto reviewers or tag teammate).

## 8. CI Validation

-   [ ] Confirm CI passes: lint, typecheck, tests, changelog check, build.
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

-   [ ] Decide new version bump (pre-1.0: minor for feature, patch for fix/docs). Example: `0.1.1`.
-   [ ] Move `[Unreleased]` entries into a new section:
    ```markdown
    ## [0.1.1] - YYYY-MM-DD
    ```
-   [ ] Add fresh empty `[Unreleased]` section (with placeholder if desired).
-   [ ] Commit: `chore: release 0.1.1`.
-   [ ] Tag: `git tag -a 0.1.1 -m "Release 0.1.1" && git push --tags`.
-   [ ] (Optional) Update diff links at bottom of `CHANGELOG.md`.

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

## Appendix: Git Hook (Optional)

Create `.git/hooks/pre-push` (chmod +x) with:

```bash
#!/usr/bin/env bash
set -e
npm run typecheck
npm run lint
npm test
npm run changelog:check
```

This prevents pushing code that fails gates.

---

**Maintainer:** Frontend Team  
**Status:** Living Document
