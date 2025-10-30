import { useEffect, useRef } from 'react';
import { useAuthStore } from './store';
import { shouldRefreshOnVisibility } from './visibility';

/**
 * Module-level flag to ensure we only attempt initial bootstrap once,
 * even if React StrictMode remounts this component multiple times.
 * StrictMode intentionally double-mounts components to help detect side effects,
 * which can cause duplicate calls to refresh() if not guarded.
 * This flag is safe because AuthEffects is only ever mounted once per SPA session,
 * and we do not rely on SSR or concurrent rendering for this effect.
 * See original rationale in auth-context.tsx for details.
 */
let didInitialBootstrapAttempt = false;

export function AuthEffects() {
  const refresh = useAuthStore((s) => s.refresh);
  const inFlight = useAuthStore((s) => s.inFlight);
  const lastFetched = useAuthStore((s) => s.lastFetched);

  // Track mounted state to avoid setting state after unmount in fail-safe
  const mountedRef = useRef(false);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Bootstrap exactly once on first mount
  useEffect(() => {
    if (!didInitialBootstrapAttempt) {
      didInitialBootstrapAttempt = true;
      refresh();
    }
    // Safety fallback: ensure bootstrapped flips after 5s even if refresh hangs
    const failSafe = setTimeout(() => {
      if (mountedRef.current) {
        useAuthStore.setState((s) => ({ bootstrapped: s.bootstrapped ?? true, status: s.status === 'loading' ? 'idle' : s.status }));
      }
    }, 5000);
    return () => clearTimeout(failSafe);
  }, [refresh]);

  // Visibility-based refresh with 30s cooldown
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibility = () => {
      try {
        const visible = document.visibilityState === 'visible';
        const ok = shouldRefreshOnVisibility({
          visible,
          inFlight: !!inFlight,
          lastFetched,
          now: Date.now(),
          cooldownMs: 30_000,
        });
        if (ok) refresh();
      } catch {
        /* noop */
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refresh, inFlight, lastFetched]);

  return null;
}
