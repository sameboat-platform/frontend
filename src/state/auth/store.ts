import { create } from 'zustand';
import type { AuthStore } from './types';
import { isBackendAuthErrorPayload, mapAuthError } from './errors';
import { AUTH_IN_FLIGHT_ERROR } from './constants';
import { api } from '../../lib/api';
import { emit } from '../../lib/events';

// Endpoint paths (centralized so migrations are single-touch)
const LOGIN_PATH = '/api/auth/login';
const REGISTER_PATH = '/api/auth/register';
const ME_PATH = '/api/me';
const LOGOUT_PATH = '/api/auth/logout';

type RawUser = {
  id: string;
  email: string;
  roles?: string[];
  displayName?: string | null;
};

const isString = (v: unknown): v is string => typeof v === 'string';

const asStringArray = (v: unknown): string[] | undefined => {
  if (Array.isArray(v)) return (v as unknown[]).filter(isString) as string[];
  if (isString(v)) return [v];
  return undefined;
};

const normalizeRoles = (u: { roles?: unknown; role?: unknown }): string[] | undefined =>
  asStringArray(u.roles) ?? (isString(u.role) ? [u.role] : undefined);

const resolveDisplayName = (u: { displayName?: unknown; name?: unknown }): string | null =>
  (isString(u.displayName) ? u.displayName : isString(u.name) ? u.name : null);

const isRawUser = (v: unknown): v is RawUser => {
  if (!v || typeof v !== 'object') return false;
  const obj = v as Record<string, unknown>;
  return isString(obj.id) && isString(obj.email);
};

function normalizeUser(u: {
  id: unknown; email: unknown; roles?: unknown; role?: unknown; displayName?: unknown; name?: unknown;
}): RawUser {
  return {
    id: String(u.id),
    email: String(u.email),
    roles: normalizeRoles(u),
    displayName: resolveDisplayName(u),
  };
}

function extractRawUser(v: unknown): RawUser | undefined {
  if (isRawUser(v)) return normalizeUser(v);
  if (v && typeof v === 'object' && 'user' in (v as Record<string, unknown>)) {
    const inner = (v as Record<string, unknown>).user as unknown;
    if (isRawUser(inner)) return normalizeUser(inner);
  }
  return undefined;
}

type BackendAuthError = Error & { cause?: { error: string } };

function getAuthErrorCode(e: unknown): string | undefined {
  if (e && typeof e === 'object') {
    const err = e as Partial<BackendAuthError>;
    if (err.cause && isBackendAuthErrorPayload(err.cause)) {
      return err.cause.error;
    }
  }
  return undefined;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // state
  user: null,
  status: 'idle',
  errorCode: undefined,
  errorMessage: undefined,
  lastFetched: undefined,
  bootstrapped: false,
  intendedPath: null,
  inFlight: false,

  // actions
  setIntendedPath(p: string | null) { set({ intendedPath: p }); },

  clearError() {
    const { user, status } = get();
    let newStatus = status;
    if (status === 'error') {
      newStatus = user ? 'authenticated' : 'idle';
    }
    set({ errorCode: undefined, errorMessage: undefined, status: newStatus });
  },

  async refresh() {
    // simple guard to avoid overlaps
    if (get().inFlight) throw new Error(AUTH_IN_FLIGHT_ERROR);
    set((s) => ({ inFlight: true, status: s.status === 'idle' ? 'loading' : s.status }));
    try {
      const data = await api<unknown>(ME_PATH, { method: 'GET', credentials: 'include' });
      const u = extractRawUser(data);
      if (u) {
        set({ user: u, status: 'authenticated', lastFetched: Date.now(), errorCode: undefined, errorMessage: undefined });
        emit('auth:refresh', { user: u });
      } else {
        set({ user: null, status: 'idle' });
      }
    } catch (e) {
      // treat as unauthenticated on first run, error thereafter
      const { bootstrapped } = get();
      if (!bootstrapped) {
        set({ user: null, status: 'idle', errorCode: undefined, errorMessage: undefined });
      } else {
        let code: string | undefined;
        let fallback: string | undefined;
        if (e && typeof e === 'object') {
          if ('message' in e) fallback = String((e as { message?: unknown }).message);
          code = getAuthErrorCode(e);
        }
        const mapped = mapAuthError(code, fallback);
        set({ user: null, status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
      }
    } finally {
      set({ inFlight: false, bootstrapped: true });
    }
  },

  async login(email: string, password: string) {
    if (get().inFlight) throw new Error(AUTH_IN_FLIGHT_ERROR);
    set({ inFlight: true, status: 'loading', errorCode: undefined, errorMessage: undefined });
    try {
      const res = await api<unknown>(LOGIN_PATH, { method: 'POST', body: JSON.stringify({ email, password }), credentials: 'include' });
      const u = extractRawUser(res);
      if (u) {
        set({ user: u, status: 'authenticated', lastFetched: Date.now() });
        emit('auth:login', { user: u });
        return true;
      }
      await get().refresh();
      return true;
    } catch (e) {
      let code: string | undefined;
      let fallback: string | undefined;
      if (e && typeof e === 'object') {
        if ('message' in e) fallback = String((e as { message?: unknown }).message);
        code = getAuthErrorCode(e);
      }
      const mapped = mapAuthError(code || 'BAD_CREDENTIALS', fallback);
      set({ status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
      return false;
    } finally {
      set({ inFlight: false });
    }
  },

  async register(email: string, password: string) {
    if (get().inFlight) throw new Error(AUTH_IN_FLIGHT_ERROR);
    set({ inFlight: true, status: 'loading', errorCode: undefined, errorMessage: undefined });
    try {
      const res = await api<unknown>(REGISTER_PATH, { method: 'POST', body: JSON.stringify({ email, password }), credentials: 'include' });
      const u = extractRawUser(res);
      if (u) {
        set({ user: u, status: 'authenticated', lastFetched: Date.now() });
        return true;
      }
      await get().refresh();
      return true;
    } catch (e) {
      let code: string | undefined;
      let fallback: string | undefined;
      if (e && typeof e === 'object') {
        if ('message' in e) fallback = String((e as { message?: unknown }).message);
        code = getAuthErrorCode(e);
      }
      const mapped = mapAuthError(code || 'UNKNOWN', fallback);
      set({ status: 'error', errorCode: mapped.code, errorMessage: mapped.message });
      return false;
    } finally {
      set({ inFlight: false });
    }
  },

  async logout() {
    if (get().inFlight) throw new Error(AUTH_IN_FLIGHT_ERROR);
    set({ inFlight: true, status: 'loading', errorCode: undefined, errorMessage: undefined });
    try {
      await api(LOGOUT_PATH, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    } finally {
      set({ user: null, status: 'idle', lastFetched: undefined, intendedPath: null, inFlight: false });
      emit('auth:logout');
    }
  },
}));
