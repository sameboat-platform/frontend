# RFC: Migrate Auth Store to Zustand (keep `useAuth` API)

- Status: Draft
- Author: SameBoat Frontend
- Date: 2025-10-29
- Target: Week 5/6

## Summary

Replace the current React Context-based auth store with a Zustand-backed store while preserving the existing public hook API (`useAuth`) and user-facing behavior. This should be a no-op migration for components: types and returned shape remain the same.

## Motivation

- Reduce re-renders by using selector-based subscriptions.
- Simplify concurrency and side-effects using a lightweight store.
- Keep the codebase ready for incremental cross-cutting features (e.g., global snackbars, feature flags) without large context trees.

## Current state (MVP)

- Implementation: `src/state/auth/auth-context.tsx`
- Exposed state: `user`, `status`, `errorCode`, `errorMessage`, `lastFetched`, `bootstrapped`, `intendedPath`, `inFlight`.
- Actions: `login`, `register`, `refresh`, `logout`, `clearError`, `setIntendedPath`.
- Concurrency: withInFlight guard prevents overlapping `login/refresh/logout`.
- Bootstrap: one-time `refresh()` on mount, StrictMode-safe; 5s fail-safe.
- Visibility: `visibilitychange` triggers `refresh()` if visible, not in flight, and last fetch ≥ 30s (pure helper `shouldRefreshOnVisibility`).
- Events: `emit('auth:login'|'auth:logout'|'auth:refresh', payload)` for observability.

## Goals / Non-goals

Goals
- Preserve public API and types (no component changes expected).
- Preserve behavior (bootstrap semantics, error mapping, concurrency guard).
- Keep tests green; add a few store-specific tests if needed.

Non-goals
- Changing routing or component trees.
- Switching to a different API client or introducing server-state libs (e.g., React Query) in this RFC.

## Proposed design

### Files and structure

- `src/state/auth/store.ts` – Zustand store + actions.
- `src/state/auth/useAuth.ts` – thin adapter returning the same shape as current `useAuthContext()`.
- `src/state/auth/effects.tsx` – optional single-mount component for bootstrap and visibility listeners (AuthEffects), to keep side-effects out of the store definition.
- Keep `errors.ts`, `constants.ts`, `visibility.ts`, and `events.ts` as-is.

### Public contract (unchanged)

```ts
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthStore {
  user: { id: string; email: string; displayName?: string | null; roles?: string[] } | null;
  status: AuthStatus;
  errorCode?: string;
  errorMessage?: string;
  lastFetched?: number;
  bootstrapped: boolean;
  intendedPath: string | null;
  inFlight: boolean;
  login(email: string, password: string): Promise<boolean>;
  register(email: string, password: string): Promise<boolean>;
  refresh(): Promise<void>;
  logout(): Promise<void>;
  clearError(): void;
  setIntendedPath(p: string | null): void;
}
```

### Store sketch (Zustand)

```ts
// src/state/auth/store.ts
import { create } from 'zustand';
import { api } from '../../lib/api';
import { emit } from '../../lib/events';
import { mapAuthError, isBackendAuthErrorPayload } from './errors';
import { shouldRefreshOnVisibility } from './visibility';

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  status: 'idle',
  errorCode: undefined,
  errorMessage: undefined,
  lastFetched: undefined,
  bootstrapped: false,
  intendedPath: null,
  inFlight: false,

  setIntendedPath(p) { set({ intendedPath: p }); },
  clearError() {
    const { user, status } = get();
    set({ errorCode: undefined, errorMessage: undefined, status: status === 'error' ? (user ? 'authenticated' : 'idle') : status });
  },

  async withInFlight<T>(fn: () => Promise<T>): Promise<T> {
    const { inFlight } = get();
    if (inFlight) throw new Error('AUTH_IN_FLIGHT');
    set({ inFlight: true });
    try { return await fn(); } finally { set({ inFlight: false }); }
  },

  async refresh() {
    await get().withInFlight(async () => {
      set((s) => ({ status: s.status === 'idle' ? 'loading' : s.status }));
      try {
        const data = await api('/api/me', { method: 'GET', credentials: 'include' });
        const user = /* normalize */ (data as any)?.user ?? data ?? null;
        if (user) {
          set({ user, status: 'authenticated', lastFetched: Date.now(), errorCode: undefined, errorMessage: undefined });
          emit('auth:refresh', { user });
        } else {
          set({ user: null, status: 'idle' });
        }
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          // pre-bootstrap: treat as unauthenticated silently
          const { bootstrapped } = get();
          if (!bootstrapped) {
            set({ user: null, status: 'idle', errorCode: undefined, errorMessage: undefined });
          } else {
            let code: string | undefined; let fallback: string | undefined;
            if (e && typeof e === 'object' && 'message' in e) fallback = String((e as any).message);
            if (e && typeof e === 'object' && 'cause' in e && isBackendAuthErrorPayload((e as any).cause)) code = (e as any).cause?.error;
            const mapped = mapAuthError(code, fallback);
            set({ user: null, status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
          }
        }
      } finally {
        if (!get().bootstrapped) set({ bootstrapped: true });
      }
    });
  },

  async login(email, password) {
    return get().withInFlight(async () => {
      set({ status: 'loading', errorCode: undefined, errorMessage: undefined });
      try {
        const res = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), credentials: 'include' });
        const user = /* normalize */ (res as any)?.user ?? res ?? null;
        if (user) {
          set({ user, status: 'authenticated', lastFetched: Date.now() });
          emit('auth:login', { user });
          return true;
        }
        await get().refresh();
        return true;
      } catch (e) {
        let code: string | undefined; let fallback: string | undefined;
        if (e && typeof e === 'object') {
          if ('message' in e) fallback = String((e as any).message);
          if ('cause' in e && isBackendAuthErrorPayload((e as any).cause)) code = (e as any).cause?.error;
        }
        const mapped = mapAuthError(code || 'BAD_CREDENTIALS', fallback);
        set({ status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
        return false;
      }
    });
  },

  async register(email, password) {
    return get().withInFlight(async () => {
      set({ status: 'loading', errorCode: undefined, errorMessage: undefined });
      try {
        const res = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }), credentials: 'include' });
        const user = /* normalize */ (res as any)?.user ?? res ?? null;
        if (user) {
          set({ user, status: 'authenticated', lastFetched: Date.now() });
          return true;
        }
        await get().refresh();
        return true;
      } catch (e) {
        let code: string | undefined; let fallback: string | undefined;
        if (e && typeof e === 'object') {
          if ('message' in e) fallback = String((e as any).message);
          if ('cause' in e && isBackendAuthErrorPayload((e as any).cause)) code = (e as any).cause?.error;
        }
        const mapped = mapAuthError(code || 'UNKNOWN', fallback);
        set({ status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
        return false;
      }
    });
  },

  async logout() {
    await get().withInFlight(async () => {
      set({ status: 'loading', errorCode: undefined, errorMessage: undefined });
      try { await api('/api/auth/logout', { method: 'POST', credentials: 'include' }); } finally {
        set({ user: null, status: 'idle', lastFetched: undefined, intendedPath: null });
        emit('auth:logout');
      }
    });
  },
}));
```

### Side-effects (bootstrap & visibility)

```tsx
// src/state/auth/effects.tsx
import { useEffect } from 'react';
import { useAuthStore } from './store';
import { shouldRefreshOnVisibility } from './visibility';

export function AuthEffects() {
  const refresh = useAuthStore((s) => s.refresh);
  const lastFetched = useAuthStore((s) => s.lastFetched);
  const inFlight = useAuthStore((s) => s.inFlight);

  // bootstrap exactly once per load (module flag or guarded ref outside component)
  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const onVisibility = () => {
      const ok = shouldRefreshOnVisibility({
        visible: document.visibilityState === 'visible',
        inFlight,
        lastFetched,
        now: Date.now(),
        cooldownMs: 30_000,
      });
      if (ok) refresh();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refresh, inFlight, lastFetched]);

  return null;
}
```

### Adapter hook

```ts
// src/state/auth/useAuth.ts
import { useAuthStore } from './store';
export function useAuth() { return useAuthStore(); }
```

## Migration plan

1. Create `store.ts`, `useAuth.ts`, and `effects.tsx` as above.
2. Mount `<AuthEffects />` once near the root (where the current provider lives), keeping the existing context temporarily or removing it if no longer used.
3. Ensure `useAuth` returns the exact shape/types expected by existing components and tests.
4. Run the full test suite and fix any parity issues.
5. PR on a feature branch with clear commit breakdown; no behavioral changes expected.

## Testing strategy

- Reuse current unit/integration tests; they should pass unchanged.
- Add 1–2 store-focused tests if helpful (e.g., withInFlight guard behavior, lastFetched updates on successful refresh/login).

## Risks and mitigations

- StrictMode remount: keep module-level bootstrap guard if needed; Effects component mounts once.
- Concurrency: retain withInFlight guard semantics; add a small action queue if necessary for future flows.
- Subtle state drift: rely on existing tests + new store unit tests; keep events emission for observability.

## Alternatives

- Keep Context-based store (status quo).
- Adopt React Query for server-state and keep a slim client-state store for UI concerns (bigger scope; not this RFC).
- Use XState for auth flow FSM (heavier; good for complex flows later).

## Rollout and timeline

- Week 5: implement store + adapter + effects; run tests; open PR.
- Week 6: stabilize, address feedback, and merge. No app-level behavior changes expected.

## Acceptance criteria

- All tests green without changes to consuming components.
- No changes to the `useAuth` consumer API.
- Console hygiene preserved; visibility cooldown behavior preserved.
