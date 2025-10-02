import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, api } from "../lib/api";
import { isHealthResponse } from "../lib/health";
import { useAuth } from "../state/auth/useAuth";
import UserSummary from "../components/UserSummary";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const { user, bootstrapped } = useAuth();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // Use /actuator/health so we don't rely on prefixed /api in dev; buildUrl will handle base.
        const data = await api<unknown>("/actuator/health");
        if (ignore) return;
        setStatus("ok");
        if (isHealthResponse(data) && typeof data.status === "string" && data.status.length > 0) {
          setMessage(`status: ${data.status}`);
        } else {
          setMessage("Backend responded ✔");
        }
      } catch (e) {
        const err = e instanceof Error ? e : undefined;
        if (ignore) return;
        setStatus("error");
        setMessage(err?.message ?? "Failed to reach backend");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">Hello, SameBoat 👋</h1>
        <p className="text-sm opacity-80 mb-4">
          Frontend is running. Backend base URL:&nbsp;
          <code className="px-1 py-0.5 rounded bg-black/5">{API_BASE}</code>
        </p>
        <nav className="flex gap-3 text-sm flex-wrap">
          {!user && (
            <>
              {!bootstrapped && (
                <span className="opacity-60">Loading session…</span>
              )}
              {bootstrapped && (
                <>
                  <p className="opacity-60">Not signed in.</p>
                  <div className="flex gap-2">
                    <div><Link className="underline" to="/login">Login</Link></div>
                    <div><Link className="underline" to="/register">Register</Link></div>
                  </div>
                </>
              )}

            </>
          )}
          {user && (
            <>
              <span className="opacity-80">Signed in as <strong>{user.email}</strong></span>
              <div>
                <Link className="underline" to="/me">My Account</Link>
              </div>
            </>
          )}
        </nav>
      </header>

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
          If this fails in dev, ensure the backend is running and CORS allows <code>http://localhost:5173</code>. If you use Actuator defaults, switch the fetch path to <code>/actuator/health</code>.
        </p>
      </section>

      {user && <UserSummary />}
    </main>
  );
}