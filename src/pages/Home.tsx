import { useEffect, useState } from "react";
import { API_BASE, api } from "../lib/api";

type HealthResponse = { status?: string } | Record<string, unknown>;

export default function Home() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // Expect your Spring Boot app to expose GET /health (or /actuator/health)
        // If you're using Actuator default, change to '/actuator/health'
        const data = await api<HealthResponse>("/api/actuator/health");
        if (ignore) return;
        setStatus("ok");
        // try to surface a friendly message if available
        setMessage(
          (data as any)?.status
            ? `status: ${(data as any).status}`
            : "Backend responded ✔"
        );
      } catch (e: any) {
        if (ignore) return;
        setStatus("error");
        setMessage(e?.message ?? "Failed to reach backend");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold mb-2">Hello, SameBoat 👋</h1>
      <p className="text-sm opacity-80 mb-6">
        Frontend is running. Backend base URL:&nbsp;
        <code className="px-1 py-0.5 rounded bg-black/5">
          {API_BASE}
        </code>
      </p>

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Backend Health Check</h2>
        {status === "idle" && <p>Checking…</p>}
        {status === "ok" && (
          <p>
            ✅ <strong>OK</strong> — {message}
          </p>
        )}
        {status === "error" && (
          <p>
            ❌ <strong>Error</strong> — {message}
          </p>
        )}
        <p className="mt-3 text-xs opacity-70">
          If this fails in dev, ensure the backend is running and CORS allows{" "}
          <code>http://localhost:5173</code>. If you use Actuator defaults,
          switch the fetch path to <code>/actuator/health</code>.
        </p>
      </section>
    </main>
  );
}