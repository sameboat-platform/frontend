import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../state/auth/useAuth';
import { Center, Spinner } from '@chakra-ui/react';

/**
 * ProtectedRoute that redirects to /login when user is not authenticated.
 * Includes bootstrapped guard to avoid flash redirects before initial refresh finishes.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, status, bootstrapped, errorCode, errorMessage } = useAuth();
  const loc = useLocation();

  const loading = status === "loading" || !bootstrapped;
  if (loading) {
    return (
      <Center py={16}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: loc, authMsg: errorMessage, authCode: errorCode }}
        replace
      />
    );
  }
  return <>{children}</>;
}
