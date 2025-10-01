import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AuthStore, AuthUser } from './types';
import { api } from '../../lib/api';
import { isBackendAuthErrorPayload, mapAuthError } from './errors';

// Endpoint paths (centralized so migrations are single-touch)
const LOGIN_PATH = '/api/auth/login';
const REGISTER_PATH = '/api/auth/register';
const ME_PATH = '/api/auth/me';
const LOGOUT_PATH = '/api/auth/logout';

interface RawUser { id: string; email: string; roles?: string[] }
function isRawUser(v: unknown): v is RawUser {
  return !!v && typeof v === 'object' && 'id' in v && 'email' in v;
}

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStore['status']>('idle');
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [lastFetched, setLastFetched] = useState<number | undefined>();
  const [bootstrapped, setBootstrapped] = useState(false);

  const bootstrappedRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Normalize & record error state
  const recordError = useCallback((code: string | undefined, fallback?: string) => {
    const mapped = mapAuthError(code, fallback);
    if (!mountedRef.current) return;
    setErrorCode(mapped.code);
    setErrorMessage(mapped.message);
    setStatus('error');
  }, []);

  const clearError = useCallback(() => {
    if (!mountedRef.current) return;
    setErrorCode(undefined);
    setErrorMessage(undefined);
    if (status === 'error') setStatus(user ? 'authenticated' : 'idle');
  }, [status, user]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    try {
      setStatus(prev => (prev === 'idle' ? 'loading' : prev));
      const data = await api<unknown>(ME_PATH, { method: 'GET', credentials: 'include', signal: controller.signal });
      if (!mountedRef.current) return;
      if (isRawUser(data)) {
        setUser({ id: data.id, email: data.email, roles: data.roles });
        setStatus('authenticated');
        setLastFetched(Date.now());
        clearError();
      } else {
        setUser(null);
        setStatus('idle');
      }
    } catch (e) {
      if (!mountedRef.current || (e instanceof DOMException && e.name === 'AbortError')) return;
      setUser(null);
      if (!bootstrappedRef.current) {
        setStatus('idle');
        clearError();
      } else {
        recordError('UNAUTHORIZED');
      }
    } finally {
      bootstrappedRef.current = true;
      if (mountedRef.current) setBootstrapped(true);
    }
  }, [clearError, recordError]);

  const login = useCallback<AuthStore['login']>(async (email, password) => {
    const controller = new AbortController();
    setStatus('loading');
    clearError();
    try {
      const res = await api<unknown>(LOGIN_PATH, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal
      });
      if (!mountedRef.current) return false;
      if (isRawUser(res)) {
        setUser({ id: res.id, email: res.email, roles: res.roles });
        setStatus('authenticated');
        setLastFetched(Date.now());
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      if (!mountedRef.current || (e instanceof DOMException && e.name === 'AbortError')) return false;
      let code: string | undefined; let fallback: string | undefined;
      if (e && typeof e === 'object' && 'message' in e) fallback = String((e as any).message);
      if (isBackendAuthErrorPayload((e as any).cause)) code = (e as any).cause.error;
      recordError(code || 'BAD_CREDENTIALS', fallback);
      return false;
    }
  }, [clearError, recordError, refresh]);

  const register = useCallback<AuthStore['register']>(async (email, password) => {
    const controller = new AbortController();
    setStatus('loading');
    clearError();
    try {
      const res = await api<unknown>(REGISTER_PATH, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal
      });
      if (!mountedRef.current) return false;
      if (isRawUser(res)) {
        setUser({ id: res.id, email: res.email, roles: res.roles });
        setStatus('authenticated');
        setLastFetched(Date.now());
      } else {
        await refresh();
      }
      return true;
    } catch (e) {
      if (!mountedRef.current || (e instanceof DOMException && e.name === 'AbortError')) return false;
      let code: string | undefined; let fallback: string | undefined;
      if (e && typeof e === 'object' && 'message' in e) fallback = String((e as any).message);
      recordError(code || 'EMAIL_EXISTS', fallback);
      return false;
    }
  }, [clearError, recordError, refresh]);

  const logout = useCallback<AuthStore['logout']>(async () => {
    const controller = new AbortController();
    setStatus('loading');
    clearError();
    try {
      await api(LOGOUT_PATH, { method: 'POST', credentials: 'include', signal: controller.signal });
    } catch {
      // Ignore errors
    } finally {
      if (!mountedRef.current) return;
      setUser(null);
      setStatus('idle');
      setLastFetched(undefined);
    }
  }, [clearError]);

  // Bootstrap exactly once on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: AuthStore = useMemo(() => ({
    user,
    status,
    errorCode,
    errorMessage,
    lastFetched,
    bootstrapped,
    login,
    register,
    refresh,
    logout,
    clearError,
  }), [user, status, errorCode, errorMessage, lastFetched, bootstrapped, login, register, refresh, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}
