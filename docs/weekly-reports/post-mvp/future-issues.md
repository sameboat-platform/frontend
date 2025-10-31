# Post‑MVP – Future Issues Backlog

This file collects pre‑scoped issue drafts you can copy/paste into new GitHub issues. Each draft includes labels, milestone, acceptance criteria, and a small test plan.

---

## Draft: Playwright E2E – Visibility‑based session refresh cooldown

Title
- E2E(auth): visibility‑based session refresh respected with 30s cooldown

Milestone
- v0.4.0

Labels
- area:auth, e2e, type:test, roadmap

Background
- The app refreshes session state on `visibilitychange` when a tab becomes visible, provided:
  - no auth request is currently in flight, and
  - the last successful fetch was ≥ 30 seconds ago.
- The cooldown logic lives in a pure helper `shouldRefreshOnVisibility(lastFetchedMs: number, nowMs: number, minIntervalMs = 30000)` and is exercised by unit tests. We want a browser‑level E2E to validate the real visibility lifecycle and interaction with the app shell.

Goals
- Confirm that switching a tab from hidden→visible triggers a session refresh only when past the 30s threshold.
- Confirm that repeated visibility events within the 30s window do not trigger additional refreshes.
- Confirm that a refresh is skipped when already in‑flight.

Acceptance Criteria
- Given an authenticated session and last refresh < 30s ago, when the tab becomes visible, then no network call to `/api/me` is made.
- Given an authenticated session and last refresh ≥ 30s ago, when the tab becomes visible, then exactly one network call to `/api/me` is made and store `lastFetched` updates.
- Given `refresh()` is currently in‑flight, when the tab becomes visible, then no additional `/api/me` call is made until the current one completes.
- Test runs headless and passes in CI (GitHub Actions) with Playwright’s Chrome channel.

Out of scope
- Backend behavior beyond returning a static user JSON.
- Full login UI flow; use API seeding or cookie injection for session state.

Implementation Notes
- Use Playwright test runner with `chromium`.
- Seed an authenticated state by stubbing `/api/me` with a route handler (Playwright `page.route`) and setting a cookie if needed.
- Control time via Playwright’s `page.addInitScript(() => { Date.now = () => FIXED; })` or by injecting a time shim. Alternatively, wait using `page.waitForTimeout(30000)` but prefer time control to keep tests fast.
- Use the document visibility API to flip visibility:
  - Either open a second tab (Page 2) to cover the current tab, then bring Page 1 to front, or
  - Programmatically dispatch `visibilitychange` by toggling `document.hidden` via a stub (requires page init script to override the getter) and dispatching the event.
- Spy on fetch calls by intercepting `/api/me` and counting invocations; assert using expect counters.

Test Plan (Playwright pseudo‑code)
```ts
import { test, expect } from '@playwright/test';

const USER = { id: 'u1', email: 'a@b.com' };

function mockMe(page, countRef) {
  page.route('**/api/me', async route => {
    countRef.count++;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(USER),
    });
  });
}

test.describe('visibility refresh cooldown', () => {
  test('does not refresh within 30s window; refreshes after 30s', async ({ page }) => {
    const calls = { count: 0 };
    await mockMe(page, calls);

    // Start app
    await page.goto('http://localhost:5173');

    // Bootstrap fires once
    await expect.poll(() => calls.count).toBe(1);

    // Within cooldown: simulate visible event → no extra call
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(200); // settle
    expect(calls.count).toBe(1);

    // Move time forward ≥30s and trigger again
    await page.addInitScript(() => {
      const start = Date.now();
      Date.now = () => start + 31_000;
    });
    await page.reload();
    await expect.poll(() => calls.count).toBeGreaterThanOrEqual(2);
  });
});
```

Risks & Mitigations
- Dispatching `visibilitychange` in real browsers may be gated—inject a visibility getter shim if needed or use multi‑page focus handoff.
- Time manipulation must be consistent across app and test; prefer overriding `Date.now()` early via `addInitScript`.

Estimati on
- Small (0.5–1d) including CI wiring.

Definition of Done
- Playwright test checked in under `e2e/` and passing locally and on CI.
- Docs updated (testing section) with a short note on the E2E and how to run it.
- Milestone v0.4.0 linked and labels applied.

---

## Draft: Automate README “Changelog” badge to latest section on release

Title
- chore(tooling): auto‑update README “Changelog” badge to latest section on release

Milestone
- v0.3.1 (tooling)

Labels
- area:tooling, type:chore, docs, release

Background
- README currently includes a static badge linking directly to the 0.3.0 section of `CHANGELOG.md`. After each release we must update this anchor manually. We can automate this as part of the release flow so the badge always points at the newest version section.

Goals
- Ensure the README “Changelog” badge link targets the most recent version section in `CHANGELOG.md` immediately after a release is cut/tagged.

Approach (pick one)
1) Script integration:
  - Enhance `scripts/release.mjs` to compute the anchor for the new section header `## [x.y.z] - YYYY-MM-DD` using GitHub’s slug rules (lowercase, strip punctuation like brackets/dots, spaces→`-`).
  - Update or insert the badge link in `README.md` to `CHANGELOG.md#<computed-anchor>` as part of the release commit.
2) GitHub Action:
  - On `release` (published), run a tiny Node step that reads `CHANGELOG.md`, finds the latest `## [x.y.z] - YYYY-MM-DD` header, computes the anchor, updates README, and opens a PR (or pushes with a workflow token).
3) Fallback (if anchor calc is brittle):
  - Link badge to the Releases page or to `[Unreleased]` and keep the deep link optional. Prefer (1) or (2) for true deep‑linking.

Acceptance Criteria
- After running the release flow for a new version, README’s “Changelog” badge points to the new section anchor (e.g., `CHANGELOG.md#040---2025-11-15`).
- No manual edits required post‑release; changes are part of the release commit or an automated PR.
- If the badge is missing, the automation inserts it below the Release badge.

Test Plan
- Dry run locally by pretending to cut a test version (e.g., bump to `0.3.1` in a throwaway branch) and confirm README link updates to the computed anchor.
- Validate anchor by clicking through in GitHub UI.

Risks & Mitigations
- GitHub slug rules nuance: prefer deriving the anchor by reading the exact header text and applying the same slug transform used for headings (remove `[]()`, replace spaces with `-`, drop punctuation like `.`). Add a small unit test for the slug helper.
- Workflow token push permissions: if using an Action, use a PAT or set `permissions: contents: write` on the workflow.

Definition of Done
- Automation implemented via script or Action.
- README badge reliably targets the latest CHANGELOG section after release.
- Documented in `docs/developer-workflow-checklist.md` under the Release steps.
