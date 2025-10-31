# Week 5 – Frontend Issue Seeds (copy/paste into GitHub)

Each section below is a ready‑to‑copy issue template. Every issue includes the required sections (Labels, Milestone, Title, Summary, Motivation / Problem, Acceptance Criteria, Notes / Links). Adjust scope if backend endpoints change.

---

## 1) feat(stories): Types + client helpers (`src/lib/stories.ts`)

Labels: area:stories, type:feature, roadmap
Milestone: v0.3.1

Title
- feat(stories): Types + client helpers (`src/lib/stories.ts`)

Summary
- Introduce Story/Trigger types, runtime guards, and thin client helpers (`listStories`, `createStory`, `getStory`) using the existing `api.ts` wrapper.

Motivation / Problem
- The feed, create page, and card components require a typed contract and safe parsing before UI work. Establishing types/guards first de-risks the rest of Week 5 and prevents `any` creep.

Acceptance Criteria
- Guards validate payloads and reject invalid shapes with clear errors.
- Helpers return typed data for single story and list responses.
- Unit tests cover happy path and malformed payloads (missing `triggers`, wrong field types).

Notes / Links
- Plan: `docs/weekly-reports/week-5-frontend-plan.md`
- Files: `src/lib/stories.ts`, `src/__tests__/Stories.types.test.ts` (suggested)

---

## 2) feat(stories): StoriesFeed page (`/stories`)

Labels: area:stories, type:feature, pages, roadmap
Milestone: v0.3.1

Title
- feat(stories): StoriesFeed page (`/stories`)

Summary
- Render a global stories feed with empty state and optional Load More if backend returns a cursor.

Motivation / Problem
- The feed is the primary discovery surface and a dependency for validating create/submit flows end to end.

Acceptance Criteria
- Feed loads and renders items using `StoryCard`.
- Empty state shows CTA to write a story when no items.
- No console errors on happy path.

Notes / Links
- Plan: `docs/weekly-reports/week-5-frontend-plan.md`
- Files: `src/pages/StoriesFeed.tsx`, route in `src/routes/AppRoutes.tsx`
- Tests: `src/__tests__/StoriesFeed.test.tsx`

---

## 3) feat(stories): StoryCreate page (`/stories/new`, protected)

Labels: area:stories, type:feature, pages, roadmap
Milestone: v0.3.1

Title
- feat(stories): StoryCreate page (`/stories/new`, protected)

Summary
- Form with title, content, and trigger flags; client validation; submit to POST `/api/stories`; redirect on success.

Motivation / Problem
- Enables content creation to populate the feed; validates the typed client and route guard behavior.

Acceptance Criteria
- Invalid inputs block submit with inline errors (title ≥ 3, content ≥ 50, ≤ 5 triggers).
- Successful submit performs one network call and navigates or clears appropriately.
- Route `/stories/new` is protected and preserves intendedPath for guests.

Notes / Links
- Plan: `docs/weekly-reports/week-5-frontend-plan.md`
- Files: `src/pages/StoryCreate.tsx`, `src/routes/AppRoutes.tsx`
- Tests: `src/__tests__/StoryCreate.test.tsx`

---

## 4) feat(stories): StoryCard + spoiler shield

Labels: area:stories, type:feature, components, a11y, roadmap
Milestone: v0.3.1

Title
- feat(stories): StoryCard + spoiler shield

Summary
- Display stories with a spoiler shield when triggers exist; provide badges and a Reveal toggle that is keyboard accessible.

Motivation / Problem
- Safety: flagged content must be user‑revealed; this also provides the core visual element of the feed.

Acceptance Criteria
- Content is hidden when `triggers.length > 0`; clicking Reveal toggles in place.
- A11y: button has `aria-expanded` and `aria-controls`; keyboard activation works; respects reduced‑motion.

Notes / Links
- Files: `src/components/StoryCard.tsx`, `src/components/TriggerBadges.tsx`
- Tests: `src/__tests__/StoryCardShield.test.tsx`

---

## 5) chore(routes): wire stories routes + guard `/stories/new`

Labels: area:stories, type:chore, routes, roadmap
Milestone: v0.3.1

Title
- chore(routes): wire stories routes + guard `/stories/new`

Summary
- Register `/stories`, `/stories/new`, and optional `/stories/:id`; ensure create route is protected.

Motivation / Problem
- Routing is required glue for the new pages; guard enforces auth and intendedPath semantics.

Acceptance Criteria
- Navigation works; unauthenticated users hitting `/stories/new` are redirected to `/login` and returned post‑login.

Notes / Links
- Files: `src/routes/AppRoutes.tsx`

---

## 6) feat(profile): minimal profile edit on `Me`

Labels: area:profile, type:feature, pages, roadmap
Milestone: v0.4.0

Title
- feat(profile): minimal profile edit on `Me`

Summary
- Add name, role (mentor/peer/professional), and bio fields; PATCH `/api/me`; optimistic store update on success.

Motivation / Problem
- Basic profile completeness is part of MVP; not blocking core Stories UX so can land after feed/create.

Acceptance Criteria
- Values persist after reload per backend response; Save disabled during submit; friendly error surfaced.

Notes / Links
- Files: `src/pages/Me.tsx`; store update in `src/state/auth/store.ts`
- Tests: `src/__tests__/ProfileEdit.test.tsx`

---

## 7) test(stories): StoriesFeed tests

Labels: area:stories, type:test, typetest
Milestone: v0.3.1

Title
- test(stories): StoriesFeed tests

Summary
- Validate list render and empty state for the feed.

Motivation / Problem
- Prevent regressions in the primary discovery surface.

Acceptance Criteria
- Happy path renders items; empty state shows CTA.

Notes / Links
- Files: `src/__tests__/StoriesFeed.test.tsx`

---

## 8) test(stories): StoryCreate tests

Labels: area:stories, type:test, typetest
Milestone: v0.3.1

Title
- test(stories): StoryCreate tests

Summary
- Client validation and submit behavior tests.

Motivation / Problem
- Ensure form UX and navigation stay correct as fields evolve.

Acceptance Criteria
- Invalid inputs block submit; valid submit calls `createStory` once and navigates.

Notes / Links
- Files: `src/__tests__/StoryCreate.test.tsx`

---

## 9) test(stories): StoryCard shield a11y tests

Labels: area:stories, type:test, a11y, typetest
Milestone: v0.3.1

Title
- test(stories): StoryCard shield a11y tests

Summary
- Verify hidden content, reveal behavior, and ARIA state.

Motivation / Problem
- Guard against regressions in safety affordances and accessibility.

Acceptance Criteria
- Content not present before reveal; after click, visible; ARIA reflects expanded state.

Notes / Links
- Files: `src/__tests__/StoryCardShield.test.tsx`

---

## 10) test(profile): Profile edit tests

Labels: area:profile, type:test, typetest
Milestone: v0.4.0

Title
- test(profile): Profile edit tests

Summary
- Verify save updates and confirmation UI.

Motivation / Problem
- Ensure profile edit UX remains stable.

Acceptance Criteria
- Save updates name/bio and shows confirmation.

Notes / Links
- Files: `src/__tests__/ProfileEdit.test.tsx`

---

## 11) docs: CHANGELOG Unreleased entries for Stories v1 + Profile edit

Labels: docs, type:chore
Milestone: v0.4.0

Title
- docs: CHANGELOG Unreleased entries for Stories v1 + Profile edit

Summary
- Document new pages/components and profile edit under `[Unreleased]`.

Motivation / Problem
- Keep changelog accurate for upcoming 0.4.0.

Acceptance Criteria
- Added/Changed bullets in CHANGELOG clearly describe Stories and Profile work.

Notes / Links
- File: `CHANGELOG.md`
- Plan: `docs/weekly-reports/week-5-frontend-plan.md`

---

## 12) a11y: Shield/button semantics review

Labels: a11y, type:chore, area:stories
Milestone: v0.4.0

Title
- a11y: Shield/button semantics review

Summary
- Review keyboard activation, focus outline, roles/labels, and contrast for shield controls.

Motivation / Problem
- Ensure accessibility compliance and good keyboard UX beyond base tests.

Acceptance Criteria
- Keyboard activation works; focus outline visible; roles/labels correct; contrast OK.

Notes / Links
- Files: `src/components/StoryCard.tsx`

---

## 13) ci: gates remain green

Labels: area:ci, type:chore
Milestone: v0.3.1

Title
- ci: gates remain green

Summary
- Ensure lint, typecheck, tests, and build pass; address regressions fast.

Motivation / Problem
- Maintain iteration speed and release confidence as stories work lands.

Acceptance Criteria
- All gates pass on PRs and main; console hygiene remains clean on happy paths.

Notes / Links
- Workflows: `.github/workflows/frontend-ci.yml`, `dependency-audit.yml`
