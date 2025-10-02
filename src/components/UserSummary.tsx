import { useAuth } from '../state/auth/useAuth';

// Lightweight user info panel shown on Home when authenticated.
export default function UserSummary() {
  const { user, lastFetched } = useAuth();
  if (!user) return null;
  return (
    <section className="rounded-2xl border p-4 space-y-2" aria-label="Signed in user information">
      <h2 className="font-semibold">Session</h2>
      <div className="text-sm grid gap-1">
        <div><span className="opacity-70">Email:</span> <code>{user.email}</code></div>
        {user.displayName && (
          <div><span className="opacity-70">Display Name:</span> {user.displayName}</div>
        )}
        <div><span className="opacity-70">User ID:</span> <code>{user.id}</code></div>
        {user.roles && user.roles.length > 0 && (
          <div><span className="opacity-70">Roles:</span> {user.roles.join(', ')}</div>
        )}
        {lastFetched && (
          <div><span className="opacity-70">Last Sync:</span> {new Date(lastFetched).toLocaleTimeString()}</div>
        )}
      </div>
    </section>
  );
}
