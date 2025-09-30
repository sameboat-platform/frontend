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

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = buildUrl(path);
    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} — ${text}`);
    }
    return res.json() as Promise<T>;
}
