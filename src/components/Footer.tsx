import { useAuth } from '../state/auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const { user, logout, status } = useAuth();
  const navigate = useNavigate();
  const busy = status === 'loading';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <footer className="mt-16 border-t py-6 text-xs text-center opacity-80 flex flex-col items-center gap-3">
      <div>
        Built by <strong><a href="mailto:nick@nickhanson.me" className="underline">Nick Hanson</a> ·&nbsp;</strong>
        <a href="https://nickhanson.me" className="underline" target="_blank" rel="noreferrer">Showcase</a>
      </div>
      {user && (
        <button
          onClick={handleLogout}
          disabled={busy}
          className="rounded bg-black text-white px-3 py-1 disabled:opacity-50"
        >
          {busy ? 'Signing out…' : 'Logout'}
        </button>
      )}
    </footer>
  );
}
