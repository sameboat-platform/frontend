import { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../lib/api';
import { useAuth } from '../state/auth/useAuth';

interface NetProbe {
  path: string;
  status: number | 'ERR' | null;
  ok?: boolean;
  ts: number;
}

// Simple dev-only floating panel with auth + network info.
export default function RuntimeDebugPanel() {
  const { user, status, errorCode, errorMessage, bootstrapped, lastFetched, refresh } = useAuth();
  const [renderTs, setRenderTs] = useState(Date.now());
  // Update timestamp only when meaningful auth-related values change to avoid infinite loop
  useEffect(() => {
    setRenderTs(Date.now());
  }, [user, status, errorCode, errorMessage, bootstrapped, lastFetched]);
  const [probes, setProbes] = useState<NetProbe[]>([]);
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (!bootstrapped) return; // wait until bootstrap completes to avoid early 401 noise
    const targets = ['/actuator/health', '/api/me'];
    let cancelled = false;
    const run = async () => {
      const results: NetProbe[] = [];
      for (const t of targets) {
        try {
          const res = await fetch(t, { credentials: 'include' });
          results.push({ path: t, status: res.status, ok: res.ok, ts: Date.now() });
        } catch {
          results.push({ path: t, status: 'ERR', ts: Date.now() });
        }
      }
      if (!cancelled && mounted.current) setProbes(results);
    };
    run();
    const id = setInterval(run, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [bootstrapped]);

  const panel = (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }} className="shadow-lg rounded-md border bg-white/90 backdrop-blur p-3 space-y-2 max-w-sm">
        <div className="flex justify-between items-center gap-2">
          <strong>Runtime Debug</strong>
          <div className="flex gap-2">
            <button onClick={() => refresh()} className="text-xs underline">refresh()</button>
            {!bootstrapped && <button onClick={() => { (window as any).__AUTH__?.refresh?.(); }} className="text-xs underline">force refresh()</button>}
            {/* Dev escape hatch: manual mark bootstrapped by calling internal setter if exposed */}
            {!bootstrapped && <button onClick={() => {
              const store = (window as any).__AUTH__;
              if (store && store.refresh) {
                // schedule a microtask refresh attempt then rely on provider fail-safe
                Promise.resolve().then(() => store.refresh());
              }
            }} className="text-xs underline">re-attempt</button>}
          </div>
        </div>
        <div>
          <div><span className="opacity-60">API_BASE:</span> <code>{API_BASE}</code></div>
          <div><span className="opacity-60">bootstrapped:</span> {String(bootstrapped)}</div>
          <div><span className="opacity-60">render:</span> {new Date(renderTs).toLocaleTimeString()}</div>
          <div><span className="opacity-60">status:</span> {status}</div>
          <div><span className="opacity-60">user:</span> {user ? user.email : 'null'}</div>
          {lastFetched && <div><span className="opacity-60">lastFetched:</span> {new Date(lastFetched).toLocaleTimeString()}</div>}
          {errorCode && <div className="text-red-600">error: {errorCode} {errorMessage && `(${errorMessage})`}</div>}
        </div>
        <div>
          <div className="font-semibold mb-1">Probes</div>
          <ul className="space-y-0.5">
            {probes.map(p => (
              <li key={p.path} className="flex justify-between">
                <code>{p.path}</code>
                <span className={p.status === 200 ? 'text-green-600' : p.status === 401 ? 'text-amber-600' : 'text-red-600'}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-[10px] opacity-60">Panel auto-refreshes every 15s. Remove in production.</div>
      </div>
    </div>
  );
  if (import.meta.env.PROD) return null; // dev only
  return panel;
}
