// Central mapping of backend auth error codes to friendly user-facing messages.
// Keeps UI components dumb; they just display errorMessage.

const FRIENDLY: Record<string, string> = {
    BAD_CREDENTIALS: "Email or password is incorrect.",
    EMAIL_EXISTS: "An account with this email already exists.",
    SESSION_EXPIRED: "Your session expired. Please sign in again.",
    UNAUTHORIZED: "You are not authorized. Please sign in.",
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
): { code?: string; message: string } {
    if (!code)
        return { code: undefined, message: fallback || "Authentication error" };
    return { code, message: FRIENDLY[code] || fallback || code };
}
