import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../state/auth/useAuth';
import { Center, Spinner } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * ProtectedRoute that redirects to /login when user is not authenticated.
 * Includes bootstrapped guard to avoid flash redirects before initial refresh finishes.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, status, bootstrapped, errorCode, errorMessage } = useAuth();
  const loc = useLocation();

  const loading = status === "loading" || !bootstrapped;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="auth-loading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <Center py={16}>
            <Spinner size="lg" />
          </Center>
        </motion.div>
      )}
      {!loading && !user && (
        <motion.div
          key="auth-redirect"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Navigate
            to="/login"
            state={{ from: loc, authMsg: errorMessage, authCode: errorCode }}
            replace
          />
        </motion.div>
      )}
      {!loading && user && (
        <motion.div
          key="auth-children"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
