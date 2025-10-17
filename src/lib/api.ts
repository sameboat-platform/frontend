// Base API URL
// Priority: explicit VITE_API_BASE_URL > (prod) same-origin via Netlify proxy > (dev) localhost
const DEV_FALLBACK = "http://localhost:8080";

export const API_BASE =
  // if you explicitly set VITE_API_BASE_URL, we’ll use it as-is
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  // otherwise, in production use same-origin (Netlify redirects will proxy to Render)
  (!import.meta.env.DEV ? "" : DEV_FALLBACK);

// If the backend already exposes /api/*, callers should pass paths WITH /api/*.
// To avoid accidental double '/api/api', we collapse duplicate segments.
function normalizeJoin(base: string, rel: string): string {
    const b = base.replace(/\/$/, "");
    const r = rel.startsWith("/") ? rel : `/${rel}`;
    // Collapse any repeated '/api' boundary: e.g. '.../api' + '/api/auth/login'
    return (b + r).replace(/\/api(?:\/api)+/g, "/api");
}

export function buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path; // already absolute
    return normalizeJoin(API_BASE, path);
}

interface ErrorPayload {
    error?: string;
    message?: string;
}
function tryParseErrorPayload(text: string): ErrorPayload | undefined {
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

// Generic API fetch wrapper with JSON handling and error wrapping.
// Always sends cookies (credentials: 'include') for session auth.
// Throws on HTTP errors with augmented Error.message and optional .cause.
// Returns parsed JSON or text response. Caller must type-assert T as needed.
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = buildUrl(path);
    if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG_AUTH) {
        // concise dev log (avoid dumping the whole body as an object wrapper)
        console.debug(url);
    }
    const res = await fetch(url, {
        credentials: "include", // ensure cookies (SBSESSION) are sent
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
    });
    if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG_AUTH) {
        // concise dev log (avoid dumping the whole body as an object wrapper)
        console.log(`[api] ${init.method || "GET"} ${url} -> ${res.status}`);
    }
    const isJson = (res.headers.get("content-type") || "").includes(
        "application/json"
    );
    if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG_AUTH) {
        console.debug("[api] request:", { url, init });
    }
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const payload = tryParseErrorPayload(text);
        const err = new Error(
            `${res.status} ${res.statusText}` +
                (payload?.message ? ` — ${payload.message}` : "")
        );
        if (payload) {
            // augment error with structured cause without using `any`
            (err as Error & { cause?: unknown }).cause = payload;
        }
        throw err;
    }
    if (res.status === 204) {
        return undefined as unknown as T;
    }
    if (!isJson) {
        const text = await res.text().catch(() => "");
        return text as unknown as T;
    }
    try {
        if (import.meta.env.DEV && import.meta.env.VITE_API_DEBUG_AUTH) {
            console.debug("[api] response JSON:");
        }
        return (await res.json()) as T;
    } catch {
        // Fallback to text parse if JSON parsing fails unexpectedly
        const txt = await res.text().catch(() => "");
        return (
            txt ? tryParseErrorPayload(txt) ?? (txt as unknown) : undefined
        ) as T;
    }
}
