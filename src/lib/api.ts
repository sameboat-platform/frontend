// Base API URL
// Priority: explicit VITE_API_BASE_URL > production default > local dev fallback
const PROD_DEFAULT = "https://api-sameboat.onrender.com";
const DEV_FALLBACK = "http://localhost:8080";

export const API_BASE =
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? DEV_FALLBACK : PROD_DEFAULT);

function buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path; // already absolute
    const base = API_BASE.replace(/\/$/, "");
    const rel = path.startsWith("/") ? path : `/${path}`;
    return base + rel;
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

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = buildUrl(path);
    const res = await fetch(url, {
        credentials: "include", // ensure cookies (SBSESSION) are sent
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
    });
    const isJson = (res.headers.get("content-type") || "").includes(
        "application/json"
    );
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const payload = tryParseErrorPayload(text);
        const err = new Error(
            `${res.status} ${res.statusText}` +
                (payload?.message ? ` — ${payload.message}` : "")
        );
        if (payload) (err as any).cause = payload; // surface structured error to callers
        throw err;
    }
    if (res.status === 204) {
        return undefined as unknown as T;
    }
    if (!isJson) {
        const text = await res.text().catch(() => "");
        return text as unknown as T;
    }
    const text = await res.text().catch(() => "");
    if (!text) {
        return undefined as unknown as T;
    }
    return JSON.parse(text) as T;
}
