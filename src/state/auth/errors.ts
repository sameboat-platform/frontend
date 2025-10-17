// Central mapping of backend auth error codes to friendly user-facing messages.
// Keeps UI components dumb; they just display errorMessage.
import type { AuthErrorCode } from './types';

/**
 * Maps backend error codes to user-friendly messages.
 */
const FRIENDLY: Record<AuthErrorCode, string> = {
    BAD_CREDENTIALS: 'Email or password is incorrect.',
    ACCOUNT_LOCKED: 'Your account is locked. Check your email and/or contact support.',
    USER_DISABLED: 'Your account is disabled. Please contact support.',
    RATE_LIMITED: 'Too many attempts. Please wait and try again.',
    NETWORK: 'Network error. Check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again in a moment.',
    UNKNOWN: 'Unexpected error. Please retry.',
};

/**
 * Normalizes arbitrary backend error identifiers/messages into a stable `AuthErrorCode`.
 * Strategy (in priority order):
 *  1) Canonicalize: uppercase, trim, collapse non-alphanumerics to underscores.
 *  2) Exact phrase matches (e.g., "NETWORK_DISABLED"), then HTTP status codes.
 *  3) Token/word-boundary matches via regex or token set (avoids substring collisions).
 *  4) Conservative substring fallback.
 *  5) Default to "UNKNOWN".
 * Rationale:
 *  Backends may emit heterogeneous codes/messages (e.g., "bad_credentials",
 *  "401 Unauthorized", "internal server error", "network_disabled"). Ordering and
 *  boundary-aware checks prevent false positives like "NETWORK_DISABLED" matching both
 *  NETWORK and USER_DISABLED.
 */
export interface BackendAuthErrorPayload {
    error: string;
    message?: string;
}

/**
 * Type guard for BackendAuthErrorPayload.
 *
 * @param v The value to check.
 * @returns True if the value is a BackendAuthErrorPayload, false otherwise.
 */
export function isBackendAuthErrorPayload(
    v: unknown
): v is BackendAuthErrorPayload {
    return !!v && typeof v === "object" && "error" in v;
}

/**
 * Maps a backend auth error code to a user-friendly message.
 *
 * @param code The backend error code to map.
 * @param fallback A fallback message to use if the code is unknown.
 * @returns An object containing the mapped error code and message.
 */
export function mapAuthError(
    code: string | undefined,
    fallback?: string
): { code?: AuthErrorCode; message: string } {
    if (!code) return { code: undefined, message: fallback || 'Authentication error' };
    const normalized = normalizeCode(code);
    return { code: normalized, message: FRIENDLY[normalized] || fallback || code };
}

/**
 * Normalizes arbitrary backend error identifiers/messages into a stable `AuthErrorCode`.
 *
 * Strategy (in priority order):
 *  1) Canonicalize: uppercase, trim, collapse non-alphanumerics to underscores.
 *  2) Exact phrase matches (e.g., "NETWORK_DISABLED"), then HTTP status codes.
 *  3) Token/word-boundary matches via regex or token set (avoids substring collisions).
 *  4) Conservative substring fallback.
 *  5) Default to "UNKNOWN".
 *
 * Rationale:
 *  Backends may emit heterogeneous codes/messages (e.g., "bad_credentials",
 *  "401 Unauthorized", "internal server error", "network_disabled"). Ordering and
 *  boundary-aware checks prevent false positives like "NETWORK_DISABLED" matching both
 *  NETWORK and USER_DISABLED.
 */
export function normalizeCode(raw?: string): AuthErrorCode {
  if (!raw) return "UNKNOWN";

  // 1) Canonicalize
  const up = raw.toUpperCase().trim().replace(/[^A-Z0-9]+/g, "_"); // spaces/hyphens → underscores
  const tokens = new Set(up.split(/_/).filter(Boolean));

  // 2) Exact phrase matches (highest priority)
  const exactMap: Record<string, AuthErrorCode> = {
    "BAD_CREDENTIALS": "BAD_CREDENTIALS",
    "INVALID_PASSWORD": "BAD_CREDENTIALS",
    "UNAUTHORIZED": "BAD_CREDENTIALS", // we treat 401-like auth failures as bad credentials for UX
    "FORBIDDEN": "BAD_CREDENTIALS",    // keep consistent UX unless you want a distinct message
    "ACCOUNT_LOCKED": "ACCOUNT_LOCKED",
    "USER_DISABLED": "USER_DISABLED",
    "NETWORK_DISABLED": "NETWORK",     // disambiguates the example flagged in review
    "OFFLINE": "NETWORK",
    "TOO_MANY_REQUESTS": "RATE_LIMITED",
  };
  if (exactMap[up]) return exactMap[up];

  // 2b) HTTP status codes (exact)
  if (/^401$/.test(up)) return "BAD_CREDENTIALS";
  if (/^403$/.test(up)) return "BAD_CREDENTIALS"; // or map to a separate "FORBIDDEN" if desired
  if (/^429$/.test(up)) return "RATE_LIMITED";
  if (/^5\d\d$/.test(up)) return "SERVER_ERROR";

  // 3) Boundary-aware token checks
  // Prefer tokens over substring includes to avoid collisions
  if (tokens.has("LOCK") || tokens.has("LOCKED")) return "ACCOUNT_LOCKED";
  if (tokens.has("DISABLED") && !tokens.has("NETWORK")) return "USER_DISABLED"; // avoid "NETWORK_DISABLED" collision
  if (tokens.has("RATE") || tokens.has("THROTTLE") || (tokens.has("TOO") && tokens.has("MANY"))) {
    return "RATE_LIMITED";
  }
  if (tokens.has("NETWORK") || tokens.has("OFFLINE") || tokens.has("FETCH")) return "NETWORK";
  if (tokens.has("SERVER") || tokens.has("INTERNAL")) return "SERVER_ERROR";

  // 4) Conservative substring fallback (ordered)
  // Only if none of the above matched, and keep these minimal.
  if (/\bBAD[_ ]?CRED/i.test(raw)) return "BAD_CREDENTIALS";
  if (/\bLOCK/i.test(raw)) return "ACCOUNT_LOCKED";
  if (/\bDISABLED\b/i.test(raw) && !/\bNETWORK\b/i.test(raw)) return "USER_DISABLED";
  if (/\bRATE|THROTTL|TOO MANY/i.test(raw)) return "RATE_LIMITED";
  if (/\bNETWORK|OFFLINE|FETCH FAILED/i.test(raw)) return "NETWORK";
  if (/\bSERVER|INTERNAL|^5\d{2}\b/i.test(raw)) return "SERVER_ERROR";

  // 5) Fallback
  return "UNKNOWN";
}
