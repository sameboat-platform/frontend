// Lightweight dev-time checks for common environment variables.
// Intentionally minimal: warn (do not throw) to avoid blocking local iteration.

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function runEnvGuard(): void {
  if (!import.meta.env.DEV) return;

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
  if (apiBase) {
    if (!isHttpUrl(apiBase)) {
      console.warn('[env] VITE_API_BASE_URL is set but not a valid http(s) URL:', apiBase);
    }
  }

  const refreshRaw = import.meta.env.VITE_HEALTH_REFRESH_MS as string | undefined;
  if (refreshRaw) {
    const n = parseInt(refreshRaw, 10);
    if (!Number.isFinite(n) || n <= 1000) {
      console.warn('[env] VITE_HEALTH_REFRESH_MS should be > 1000 (ms). Current:', refreshRaw);
    }
  }

  const feedback = import.meta.env.VITE_FEEDBACK_URL as string | undefined;
  if (feedback && !isHttpUrl(feedback)) {
    console.warn('[env] VITE_FEEDBACK_URL should be an http(s) URL. Current:', feedback);
  }
}
