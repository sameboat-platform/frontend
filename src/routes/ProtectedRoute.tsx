import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../state/auth/useAuth";

/**
 * ProtectedRoute that redirects to /login when user is not authenticated.
 * Includes bootstrapped guard to avoid flash redirects before initial refresh finishes.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, status, bootstrapped, errorCode, errorMessage } = useAuth();
  const loc = useLocation();

  const loading = status === "loading" || !bootstrapped;
  if (loading) {
    return <div className="p-6 text-sm opacity-70">Checking session…</div>;
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
