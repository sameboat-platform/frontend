# SameBoat – Week 5 Frontend Copilot Query (Stories MVP)

> Purpose: Guideline-style plan for IntelliJ GitHub Copilot to implement the minimal **Stories** slice on the **Vite + React + TS** frontend, integrating with the live backend via cookie-based auth. Prefer existing patterns over new abstractions.

---

## 🎯 Goal (Week 5 – Stories MVP)
Deliver minimal UI + client code so an **authenticated** user can:
- create a text story (50–1000 chars),
- view a recent feed (paged),
- view their own stories,
- delete their own stories.

Keep it aligned with current app structure (Zustand auth store, `api.ts` fetch helper, routes, tests).

---

## 🧩 Context to Respect
- **Auth/session:** Server sets HttpOnly cookie `SBSESSION`. All authenticated requests must use `credentials: 'include'` (already handled in `api.ts`). Redirect 401 to `/login`.  
- **Env:** `VITE_API_BASE_URL` points to the Render API in Netlify builds.  
- **Routing/guard:** Use existing `<ProtectedRoute>` pattern (no content flash).  
- **Design:** Keep minimal UI; accessibility first (labels, ARIA).  
- **Testing:** Vitest + React Testing Library; keep the suite fast and deterministic.

Reference files that likely already exist:
- `src/lib/api.ts` (fetch helper + base URL)
- `src/state/auth/*` (Zustand store + `useAuth()` adapter)
- `src/routes/ProtectedRoute.tsx`
- `src/pages/Login.tsx`, `src/pages/Me.tsx`
- Existing tests and environment guards

---

## 🔌 Backend Contracts (assumed per Week 5 BE plan)
- `POST /api/stories` `{ content }` → **201** `{ id, authorId, content, createdAt, updatedAt? }`
- `GET  /api/stories?limit=20&before=<ISO>` → **200** `Story[]` (recent first)
- `GET  /api/me/stories` → **200** `Story[]` (current user’s stories, recent first)
- `DELETE /api/stories/{id}` → **204** on owner; **403** not owner; **404** unknown
- Errors follow unified envelope: `{ "error": "<CODE>", "message": "..." }` with codes like `UNAUTHENTICATED`, `VALIDATION_ERROR`, `FORBIDDEN`, `NOT_FOUND`.

---

## 🗺️ Routing
Add protected routes:
- `/feed` – recent feed
- `/compose` – compose new story
- `/me/posts` – current user’s stories

Ensure they are behind `<ProtectedRoute>` and preserve intendedPath.

---

## 🧱 Components & Screens
### 1) `ComposeForm`
- **UI**: `<textarea>` with maxLength=1000, character counter, Submit button (disabled when empty/over limit/submitting).
- **Behavior**: optimistic create → prepend to feed (if available in store) and clear form. Roll back on server failure.
- **Validation**: 1–1000 chars; show inline message before network call.

### 2) `StoryList`
- Renders a list of `StoryCard` items; preserves newlines (e.g., simple `white-space: pre-wrap` or replace `\n` → `<br/>`).
- Each item shows minimal metadata (author displayName or fallback + relative time if available; else absolute).
- If `canDelete`, show a Delete icon/button → confirm modal → call DELETE.

### 3) Pages
- `/feed`: fetch on mount (`getFeed({ limit, before? })`), support “Load more” using `before` cursor. Minimal empty state.
- `/compose`: mount `ComposeForm` plus minimal helper text.
- `/me/posts`: fetch current user’s stories (`getMyStories()`), show delete affordance.

---

## 🌐 API Layer Additions (`src/lib/api.ts` or a nearby `stories.ts`)
Expose thin helpers (all `credentials: 'include'`):
```ts
type Story = { id: string; authorId: string; content: string; createdAt: string; updatedAt?: string | null };

export async function createStory(content: string): Promise<Story> {}
export async function getFeed(params?: { limit?: number; before?: string }): Promise<Story[]> {}
export async function getMyStories(): Promise<Story[]> {}
export async function deleteStory(id: string): Promise<void> {}
```
- Map error envelopes; for 401, bubble a recognizable error to trigger redirect (existing global behavior).  
- Keep logs gated by `VITE_DEBUG_AUTH` (no console noise by default).

---

## 🗃️ State (Zustand suggestion)
Create a focused slice (or reuse an existing pattern) e.g., `src/state/stories/store.ts`:
- `feed: Story[]`, `feedStatus: 'idle'|'loading'|'ready'|'error'`, `feedBefore?: string`
- `my: Story[]`, `myStatus: ...`
- actions: `fetchFeed`, `fetchMore`, `fetchMine`, `addOptimistic`, `replaceAt`, `removeById`

Keep it small; avoid over-generalization. Pages may also local-state manage if simpler.

---

## 🧭 UX & Error Handling
- **401** → central handler redirects to `/login` (existing behavior).  
- **403 on delete** → toast “Not your story.” Leave UI unchanged.  
- **Validation errors (400)** → inline message on `ComposeForm`.  
- **Loading** → simple spinners or skeletons; no blocking overlays.  
- **Optimistic create** → prepend; if failure, remove and show toast.

Accessibility:
- Associate labels with textarea; announce validation messages via `aria-live="polite"`.
- Buttons have discernible text; confirm modal focuses the primary action.

---

## 🧪 Tests (Vitest + RTL)
- `ComposeForm.test.tsx`:  
  - rejects empty/over-1000 before network;  
  - successful submit calls `createStory` once; clears input; counter resets.
- `Feed.test.tsx`:  
  - renders stories returned by `getFeed`;  
  - “Load more” appends correctly using `before` param.
- `DeleteStory.test.tsx`:  
  - 204 → removes item from UI;  
  - 403 → leaves item + shows error toast;  
  - 404 → shows “not found” style error (optional).
- `ProtectedRoutesStillPass.test.tsx`: sanity check that existing protected route tests still pass.

Mock fetch or the API helpers; don’t hit the network. Keep deterministic (no real timers).

---

## 🔧 Implementation Guidance
- Reuse existing fetch helper and auth store; don’t introduce a new HTTP client.
- Keep components small and readable; push async work to the store or API layer.
- Prefer composition (Feed -> StoryList -> StoryCard) over deep prop drilling; use context or store carefully.
- Newline rendering: CSS `white-space: pre-wrap;` is fine for MVP.
- Date formatting: start with raw ISO; add relative time later if desired.
- Keep logs behind debug flags (`VITE_DEBUG_AUTH*`).

---

## ✅ Acceptance (Frontend)
- Authenticated user can **create**, **see feed**, **see own stories**, and **delete only their own**.
- 401 path → redirect to `/login`; 403 delete → toast; 400 validation → inline feedback.
- Unit tests green in CI; Netlify preview shows `/feed` working against live API.

---

## 🌱 Stretch (Optional if time permits)
- Relative timestamps (“2 min ago”).
- Optimized keyset pagination with a stable `before` cursor from the backend.
- Basic author chip (displayName, fallback to email left-part).

---

## 📝 Docs
- Update README with routes + “Stories MVP” summary.
- Add API snippet to `docs/api.md` (consumer view) to mirror backend spec.
- Include any new env flags or debug toggles if added (keep minimal).

---

**Hand-off summary for Copilot:**  
Implement routes, API helpers, and minimal components to satisfy the above behaviors using existing project patterns. Keep the solution small, accessible, and testable. Favor current conventions over inventing new abstractions.
