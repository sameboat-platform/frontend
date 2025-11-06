# RFC: Stories – Triggers, Shields, and AI-assisted Content Guard

Status: Draft

Owners: Frontend/Platform

Updated: 2025-11-06

Related code:
- `src/lib/stories.ts` (types, runtime guards, client helpers)
- `src/lib/api.ts` (HTTP helper)
- Future UI: `src/pages/StoriesFeed.tsx`, `src/pages/StoryCreate.tsx`, `src/components/StoryCard.tsx`

## 1) Context & Goals

We’re introducing a "Stories" feature where users can share personal experiences. To reduce harm, stories can be tagged with content warnings ("triggers"). The system should:
- Be safe-by-default for readers (shields before sensitive content).
- Be simple for authors in MVP, but evolve to automated assistance.
- Maintain a clean, typed contract between backend and frontend.

This RFC documents the current MVP, the near-term path to AI-assisted tagging, and an eventual sentence-level guard (hide/rewrite/summarize specific segments).

## 2) Current MVP (v0.3.x)

Data types (see `src/lib/stories.ts`):
- `Trigger` (union): "suicide" | "abuse" | "violence" | "addiction" | "self-harm" | "harassment" | "other"
- `Story`:
  - `id`, `authorId`, `authorName?`, `title`, `content` (plain text v1),
  - `triggers: Trigger[]` (empty means unflagged), `createdAt` (ISO)
- `StoriesResponse`: `{ items: Story[], nextCursor?: string }`

Runtime validation:
- `isTrigger(x)` checks membership in the allowlist.
- `isStory(x)` ensures required fields and that `triggers` is an array of allowed values.
- `isStoriesResponse(x)` validates lists.
- `normalizeStory()` ensures `triggers` is an array in the returned object.

Client helpers:
- `listStories({ limit?, cursor? })` – GET `/api/stories` with validation.
- `createStory({ title, content, triggers? })` – POST `/api/stories`.
- `getStory(id)` – GET `/api/stories/:id` with validation.

MVP UX:
- Author selects zero or more triggers during create. No edit yet.
- Reader sees a shield on cards/pages only when `triggers.length > 0`.
- Shield copy example: "This story contains: suicide, self-harm." + Reveal button.

Notes:
- The guard rejects unknown trigger strings to keep the contract strict.
- Today, `isStory` requires `triggers` to be an array; null/omitted is considered invalid (we may relax this later and normalize to []).

## 3) API Contract (MVP)

- POST `/api/stories` → `{ id }`
  - Request: `{ title: string, content: string, triggers?: Trigger[] }`
- GET `/api/stories` → `{ items: Story[], nextCursor?: string }`
- GET `/api/stories/:id` → `Story`

Backend merges and stores the story; no server-side detection yet in MVP.

## 4) Roadmap to AI-assisted detection (v0.4+)

We’ll add asynchronous AI moderation to reduce reliance on author tagging.

Proposed server-side flow (asynchronous, idempotent):
1. Author submits story (POST). Return `{ id }` immediately; enqueue moderation.
2. Moderation job calls LLM (e.g., ChatGPT API) → detects triggers and risky spans.
3. Persist results:
   - `moderation.status`: "pending" → "complete" | "failed"
   - `moderation.detectedTriggers?: Trigger[]` (mapped to allowlist; unknowns → "other")
   - `moderation.spans?: GuardSpan[]` (sentence/offset annotations)
   - Merge effective `triggers = union(authorTriggers, detectedTriggers)`
4. Reads (GET) always return the merged `triggers`, plus `moderation` when available.

Backward compatibility:
- The current client only relies on `triggers`. Extra `moderation` fields are ignored until we opt-in to richer UI.

### GuardSpan shape

```
GuardSpan {
  id: string
  trigger: Trigger
  severity?: "low" | "medium" | "high"
  location: { charStart: number; charEnd: number } | { sentenceIndex: number }
  replacement?: string   // profanity filtered text
  summary?: string       // neutral paraphrase
  rationale?: string     // optional audit/debug
}
```

### Contract additions (non-breaking)

- Story (additional optional field):
  - `moderation?: { status: "pending" | "complete" | "failed"; detectedTriggers?: Trigger[]; spans?: GuardSpan[] }`

## 5) Reader UX states

- No triggers: render normally.
- `triggers.length > 0`: show whole-story shield with badges and Reveal.
- `moderation.status = pending` and no triggers yet: optional soft note (e.g., "Content review in progress").
- `moderation.status = complete` with `spans`: after Reveal, render sentence-level guards:
  - hide-or-rewrite specific segments based on `spans` with accessible toggles
  - labels like "Reveal sentence flagged for self-harm"

Accessibility:
- Guarded text is not exposed to screen readers until revealed (aria-hidden or render gating).
- Controls are real buttons with keyboard and focus styles.
- Badges meet contrast and include screen-reader text.

## 6) Client rendering plan for spans

Introduce a utility that converts `content + spans` into renderable segments:
- Input: `{ content: string, spans: GuardSpan[], mode: "hide" | "rewrite" | "summarize" }`
- Output: `Array< { type: "text"; text: string } | { type: "guard"; span: GuardSpan; original: string } >`
- Logic: sort spans; split content without overlap; provide a per-segment component with Reveal/Hide and optional Rewrite/Summary view.

This utility is additive and independent of feed/create wiring; it only activates when `spans` exist. Existing code can continue to render plain `content`.

## 7) Incremental rollout

1) MVP (done/doing):
- Types, guards, helpers in `src/lib/stories.ts`.
- Create form sends `triggers` (or []).
- Feed/detail show whole-story shield if `triggers` non-empty.

2) Async moderation pipeline:
- Backend writes `moderation` and merges `triggers`.
- Client optionally surfaces a tiny "review pending" note when empty.

3) Sentence-level guards:
- Backend returns `spans` with offsets and optional `replacement|summary`.
- Client adds the segmented renderer and per-sentence Reveal/Rewrite.

4) Preferences (future):
- Per-user settings to auto-hide or auto-filter certain triggers.
- Feed filtering (exclude stories with selected triggers).

## 8) Edge cases & safeguards

- Unknown triggers from AI: map to "other" on the server before returning to clients.
- Content edits post-moderation: include a checksum/hash in moderation; if it mismatches, ignore spans.
- Overlapping spans: merge on the server; client assumes non-overlapping spans.
- Missing/null triggers from legacy data: client can relax validation to accept null/undefined and normalize to `[]`.
- Failure modes: if moderation fails, keep author-provided `triggers` and proceed.

## 9) Testing & quality

- Unit tests for guards (done for types): ensure strict allowlist and shape checks.
- Add tests for feed shield visibility logic and span rendering (toggle, a11y attributes).
- Contract tests in backend for mapping AI labels → `Trigger` and for span alignment.

## 10) Open questions

- Should the UI show a generic “This content may be sensitive” banner while moderation is pending even when author provided no triggers?
- What is the default mode for spans when both `replacement` and `summary` exist (rewrite vs summarize)?
- Do we need per-trigger severity to drive different UI treatments?

---

This RFC keeps the current code stable while creating a clear, incremental path to AI-assisted detection and sentence-level content guards without breaking the existing `triggers`-based shield.
