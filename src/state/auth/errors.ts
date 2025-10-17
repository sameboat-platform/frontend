// Central mapping of backend auth error codes to friendly user-facing messages.
// Keeps UI components dumb; they just display errorMessage.
import type { AuthErrorCode } from './types';

const FRIENDLY: Record<AuthErrorCode, string> = {
    BAD_CREDENTIALS: 'Email or password is incorrect.',
    ACCOUNT_LOCKED: 'Your account is locked. Check your email and/or contact support.',
    USER_DISABLED: 'Your account is disabled. Please contact support.',
    RATE_LIMITED: 'Too many attempts. Please wait and try again.',
    NETWORK: 'Network error. Check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again in a moment.',
    UNKNOWN: 'Unexpected error. Please retry.',
};

export interface BackendAuthErrorPayload {
    error: string;
    message?: string;
}

export function isBackendAuthErrorPayload(
    v: unknown
): v is BackendAuthErrorPayload {
    return !!v && typeof v === "object" && "error" in v;
}

export function mapAuthError(
    code: string | undefined,
    fallback?: string
): { code?: AuthErrorCode; message: string } {
    if (!code) return { code: undefined, message: fallback || 'Authentication error' };
    const normalized = normalizeCode(code);
    return { code: normalized, message: FRIENDLY[normalized] || fallback || code };
}

/**
 * Normalizes arbitrary backend error identifiers into a stable `AuthErrorCode` value.
 *
 * This function exists because backend services may return slightly different
 * error strings (e.g., "bad_credentials", "invalid_password", or "401_BAD_CREDENTIALS").
 * To ensure consistent UI messaging, we map these variants to a common union value.
 *
 * Strategy:
 * - Perform a lowercase substring match against known patterns.
 * - Return the corresponding `AuthErrorCode`.
 * - If no pattern matches, fall back to "UNKNOWN".
 *
 * @param raw - Raw error code or message from the backend or network layer.
 * @returns A normalized `AuthErrorCode` for display and analytics.
 */
function normalizeCode(c: string): AuthErrorCode {
  const up = c.toUpperCase();
  if (up.includes('BAD_CREDENTIAL') || up === 'UNAUTHORIZED' || up === 'FORBIDDEN') return 'BAD_CREDENTIALS';
  if (up.includes('LOCK')) return 'ACCOUNT_LOCKED';
  if (up.includes('DISABLED')) return 'USER_DISABLED';
  if (up.includes('RATE') || up.includes('THROTTLE') || up.includes('TOO_MANY')) return 'RATE_LIMITED';
  if (up.includes('NETWORK') || up.includes('FETCH') || up.includes('OFFLINE')) return 'NETWORK';
  if (up.includes('SERVER') || up.includes('INTERNAL') || up.startsWith('5')) return 'SERVER_ERROR';
  return 'UNKNOWN';
}
