/* eslint-disable react-refresh/only-export-components */
import { Fragment } from 'react';
import type { AuthStore } from './types';
import { useAuthStore } from './store';
import { AuthEffects } from './effects';

// Thin wrapper to preserve test/provider usage while the store lives in Zustand.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <Fragment>
      <AuthEffects />
      {children}
    </Fragment>
  );
}

// Backward-compatible helper if anything still calls useAuthContext directly.
export function useAuthContext(): AuthStore {
  return useAuthStore();
}
