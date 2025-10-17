# Week 4 – Frontend Detailed Plan (SameBoat)
**Scope:** Authentication flow + session persistence + conditional UI + tests  
**DoR:** Backend `/api/me`, `/api/auth/login`, `/api/auth/logout` live; CORS OK; cookies enabled  
**DoD (frontend):** See “Acceptance Criteria” at bottom

---

## Architecture/Files to Touch

- `src/lib/api.ts` – fetch/axios wrapper (must send cookies)
- `src/store/auth.ts` – Zustand global auth store
- `src/components/Navbar.tsx` – conditional links (Login / Logout / Profile)
- `src/routes/ProtectedRoute.tsx` – auth guard (no “flash”)
- `src/pages/Login.tsx` – login form (POST), error mapping, redirect to `returnTo`
- `src/pages/Me.tsx` – signed-in state display (basic)
- `src/App.tsx` (or `src/main.tsx`) – **single bootstrap** of session on mount
- `src/env.d.ts` / `.env.example` – ensure `VITE_API_BASE_URL`
- `__tests__/auth/*.test.tsx` – routing + auth tests (Vitest + RTL)

> **Env expectation:**  
> `VITE_API_BASE_URL=https://<render-api-domain>` (Netlify build env)  
> All requests **must** include credentials (cookies).

---

## API Contracts (frontend expectations)

- `POST /api/auth/login`  
  - Body: `{ email: string, password: string }`  
  - Success: `200` or `201`, sets `SBSESSION` HttpOnly cookie  
  - Failure: `401` with code we can map (e.g., `BAD_CREDENTIALS`)
- `POST /api/auth/logout`  
  - Success: `204` (or `200`), server invalidates session
- `GET /api/me`  
  - Success: `200 { id, email, name? }`  
  - Unauth/expired: `401`

---

## Implementation Plan (ordered)

### 1) HTTP client with cookies
- [ ] Create or update `src/lib/api.ts` to send `credentials: 'include'`

### 2) Zustand auth store
- [ ] Implement store with `user`, `loading`, `error`, `intendedPath`, and actions for `login`, `logout`, `checkSession`, and `setIntendedPath`.

```ts
import { create } from 'zustand';

type User = { id: string; email: string; name?: string };
type State = {
  user: User | null;
  loading: boolean;
  error?: string | null;
  intendedPath?: string | null; // for redirect preservation
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setIntendedPath: (p: string | null) => void;
};

export const useAuth = create<State>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  intendedPath: null,

  async checkSession() {
    set({ loading: true, error: null });
    try {
      const me = await api<User>('/api/me');
      set({ user: me, loading: false });
    } catch (e: any) {
      // 401 → no session; do not surface error toast on bootstrap
      set({ user: null, loading: false });
    }
  },

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      const me = await api<User>('/api/me'); // get fresh identity
      set({ user: me, loading: false, error: null });
    } catch (e: any) {
      set({ error: mapAuthError(e), loading: false });
      throw e;
    }
  },

  async logout() {
    set({ loading: true, error: null });
    try {
      await api('/api/auth/logout', { method: 'POST' }); // expect 204/200
    } finally {
      set({ user: null, loading: false });
    }
  },

  setIntendedPath(p) { set({ intendedPath: p }); },
}));
```

- `mapAuthError(e)` returns friendly strings for 401, network, etc.

### 3) Session bootstrap (StrictMode-safe) [**ONLY IF THIS MAKES SENSE**]
- [ ] Call `checkSession()` once on mount in `App.tsx` or root component.

```ts
const { checkSession } = useAuth();
useEffect(() => { checkSession(); }, [checkSession]);
```

- Ensure it runs once per page load (guard against duplicate calls if StrictMode double-mount is in play—store can debounce with an internal flag if needed).

### 4) ProtectedRoute (no “flash”)
- [ ] Gate routes based on `user` and `loading` states; preserve `intendedPath`.

### 5) Login page
- [ ] Add form validation; handle redirects and friendly Inline form error summary using auth.error mapping.

### 6) Navbar conditional UI
- [ ] Display `Login` or `Logout`/`Me` based on auth state; wire logout handler.

### 7) Session freshness on tab visibility
- [ ] Throttled `visibilitychange` listener to call `checkSession()` when tab regains focus.

### 8) Error handling UX
- [ ] Gracefully handle expired sessions and global 401s; avoid repeated toasts.

---

## Tests (Vitest + React Testing Library)

- [ ] `bootstrap-restores-session.spec.tsx` – `/api/me` → authenticated state persists
- [ ] `protected-route-redirects-guest.spec.tsx` – guest redirect + intendedPath
- [ ] `login-success-redirects-intended.spec.tsx` – login redirect back to intended route
- [ ] `login-failure-maps-error.spec.tsx` – maps BAD_CREDENTIALS
- [ ] `logout-clears-session.spec.tsx` – clears UI + state
- [ ] `visibility-refresh.spec.tsx` – triggers refresh on tab regain

---

## Acceptance Criteria (frontend)

- [ ] `/api/me` check on load restores session.
- [ ] Protected routes redirect guests, preserve path, and avoid content flash.
- [ ] Login sets cookie, updates UI, redirects correctly, and maps errors.
- [ ] Logout clears client + server session.
- [ ] Tab visibility regain refreshes session (throttled).
- [ ] Tests pass in CI and block failing PRs.
- [ ] `.env.example` and README updated accordingly.

---

## Pitfalls to Avoid

- Missing `credentials: 'include'` → cookies won’t persist.
- Cross-site cookies → backend must set `Secure` + `SameSite=None`.
- StrictMode double mount → debounce or guard bootstrap.
- Race conditions → don’t overlap `checkSession()` with `login()`/`logout()`.
- Error spam → suppress 401 toasts during initial bootstrap.
