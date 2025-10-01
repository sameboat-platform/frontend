import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../state/auth/useAuth";
import type { FormEvent, ChangeEvent } from "react";
import { FormField } from "../components/FormField";
import { Alert } from "../components/Alert";

export default function Login() {
  const { login, status, errorMessage, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const loading = status === 'loading';

  function validate(): boolean {
    if (!email) { setClientError('Email is required'); return false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setClientError('Enter a valid email'); return false; }
    if (password.length < 6) { setClientError('Password must be at least 6 characters'); return false; }
    setClientError(null); return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await login(email, password);
    if (ok) {
      const from = (location.state as any)?.from?.pathname ?? '/me';
      navigate(from, { replace: true });
    }
  };

  const handleFieldChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (clientError) setClientError(null);
    if (errorMessage) clearError();
  };

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
      <p className="text-sm mb-4 opacity-80">Access your SameBoat account.</p>
      {(clientError || errorMessage) && (
        <Alert kind="error">{clientError || errorMessage}</Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          value={email}
          onChange={handleFieldChange(setEmail)}
          onFocus={() => { if (errorMessage) clearError(); if (clientError) setClientError(null); }}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
            required
          value={password}
          onChange={handleFieldChange(setPassword)}
          onFocus={() => { if (errorMessage) clearError(); if (clientError) setClientError(null); }}
          autoComplete="current-password"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Need an account? <Link to="/register" className="underline">Create one</Link>
      </p>
    </main>
  );
}
