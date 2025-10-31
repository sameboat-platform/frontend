# Week 5 – Frontend Plan (SameBoat)

Scope: Stories v1 (feed + create + spoiler shields) and minimal Profile edit (name, role, bio). Keep auth stable. Build on v0.3.0.

Assumptions
- Backend provides cookie‑session auth with `/api/me`, `/api/auth/*` (as in Week 4).
- Stories API exists or will be scaffolded to match the contracts below; if not ready, mock via dev routes.
- Use Chakra UI and strict TypeScript; no new heavy libs (no React Query). Keep fetch wrapper `api.ts`.

Outcomes
- Users can view a global stories feed and create a story with trigger flags.
- Spoiler shield pattern hides flagged content until revealed (per story card).
- Users can edit their profile basics (name, role, bio) on `Me`.
- Tests cover feed rendering, create flow validation, and shield reveal behavior.

---

## Week 5 Checklist

- [ ] Types and client helpers for stories (`src/lib/stories.ts`: `Story`, `Trigger`, guards, `listStories/createStory/getStory`).
- [ ] Pages: `StoriesFeed.tsx` (`/stories`), `StoryCreate.tsx` (`/stories/new`), optional `StoryView.tsx`.
- [ ] Components: `StoryCard` (with spoiler shield), `TriggerBadges`.
- [ ] Routes wired in `AppRoutes.tsx`; protect `/stories/new` with `ProtectedRoute`.
- [ ] Profile edit section on `Me.tsx` (name, role, bio) with `PATCH /api/me`.
- [ ] Tests: Feed (happy + empty), Create (client validation + submit), Shield reveal a11y, Profile edit save.
- [ ] Accessibility: buttons have `aria-expanded`/`aria-controls`; keyboard focus outline preserved.
- [ ] Docs: Update README “Pages” and add Unreleased notes to `CHANGELOG.md`.
- [ ] CI gates: lint, typecheck, tests, build all PASS.

## Architecture / Files to Touch

- `src/pages/StoriesFeed.tsx` – list stories, filter controls (basic), route `/stories`.
- `src/pages/StoryCreate.tsx` – form to create story, route `/stories/new` (protected).
- `src/pages/StoryView.tsx` – minimal single story read page, route `/stories/:id` (optional if time allows).
- `src/components/StoryCard.tsx` – render title/author/timestamp + spoiler shield toggle + badges for triggers.
- `src/components/TriggerBadges.tsx` – small badge list for trigger categories.
- `src/lib/stories.ts` – types + runtime guards (`isStory`, `isStoriesResponse`) and thin client helpers using `api.ts`.
- `src/routes/AppRoutes.tsx` – add routes; gate `/stories/new` behind auth.
- `src/pages/Me.tsx` – add minimal profile edit section (name, role, bio) with save.
- Tests under `src/__tests__/`:
  - `StoriesFeed.test.tsx` (happy path + empty)
  - `StoryCreate.test.tsx` (client validation + submit path)
  - `StoryCardShield.test.tsx` (shield reveal a11y)
  - `ProfileEdit.test.tsx` (save success path)

---

## API Contracts (frontend expectations)

Story
```ts
export type Trigger = 'suicide' | 'abuse' | 'violence' | 'addiction' | 'self-harm' | 'harassment' | 'other';
export interface Story {
  id: string;
  authorId: string;
  authorName?: string;
  title: string;
  content: string; // plain text v1
  triggers: Trigger[]; // optional list; empty means unflagged
  createdAt: string; // ISO
}
```

Endpoints
- `GET /api/stories?limit=20&cursor=` → `{ items: Story[]; nextCursor?: string }`
- `POST /api/stories` body `{ title: string; content: string; triggers?: Trigger[] }` → `201 { id }`
- `GET /api/stories/:id` → `Story`
- `PATCH /api/me` body `{ name?: string; role?: 'mentor'|'peer'|'professional'; bio?: string }` → `200 { ...user }`

Notes
- All requests include cookies; reuse `api.ts`.
- For dev if backend lags, we’ll mock with `vi.spyOn(global, 'fetch')` in tests and use a fallback mock server in dev only if needed.

---

## Implementation Plan

1) Data types + client helpers
- Add `src/lib/stories.ts` with `Story`, `Trigger`, guards, and helpers: `listStories`, `createStory`, `getStory`.
- Narrow/validate on parse; default `triggers` to an empty array.

2) Feed page
- Fetch list on mount; show skeletons; empty state with CTA to write a story.
- Render with `StoryCard` components; paginate by `nextCursor` (load more) if backend supports; otherwise a single page.

3) Story card + spoiler shield
- If `triggers.length > 0`, render shielded content: show badges + "Reveal" button; reveal toggles full content in place.
- Respect reduced‑motion.
- A11y: `aria-controls` and `aria-expanded` on the button; keyboard accessible.

4) Create story page
- Chakra form with fields: title, content (textarea), trigger multiselect (checkbox group).
- Client validation: title ≥ 3 chars, content ≥ 50 chars (tunable), max triggers 5.
- On submit: call `createStory`, redirect to `/stories` or the new story view; handle server error mapping.

5) Profile edit (Me)
- Section with fields name, role (select), bio (textarea); Save button.
- Call `PATCH /api/me`; on success, update local auth store `user` fields optimistically.

6) Routes
- `/stories`, `/stories/new`, optional `/stories/:id` (if time allows).
- Protect `/stories/new` with `ProtectedRoute`.

7) Tests
- Feed: renders list, shows empty state when no stories.
- Create: prevents submit on invalid inputs; submits and calls `createStory` once; clears form or navigates.
- Shield: hidden content not in DOM until revealed; after clicking, content visible and button reflects expanded state.
- Profile: updates name/bio and shows confirmation.

---

## Acceptance Criteria
- Feed displays stories with author, timestamp, and trigger badges; shows empty state gracefully.
- Spoiler shield hides content when triggers present; reveal toggles with accessible semantics.
- Create flow validates inputs client‑side and submits to backend; success navigates or confirms.
- Profile edit saves and updates UI; errors surfaced inline.
- Tests pass in CI; lint/type/build clean.

---

## Risks & Mitigations
- Backend timeline: if endpoints not ready, use mocks/dev routes; keep UI integrated behind a simple switch.
- Content length and storage concerns: keep plain text; avoid rich text until after MVP.
- Pagination: default to single page; add cursor when backend lands it.

---

## Nice‑to‑haves (stretch)
- Story view page with deep link `/stories/:id`.
- Simple filter by trigger badge on feed.
- Copy link / share for a story.

---

## Definition of Done
- All acceptance criteria met; tests passing; coverage does not regress.
- Docs: CHANGELOG Unreleased updated; README "Pages" mentions Stories feed and Create.
- A short demo clip or screenshots added to the Week 5 report.
