import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/auth/useAuth";
import type { FormEvent, ChangeEvent } from "react";
import { FormField } from "../components/FormField";
import { Alert, AlertIcon, Button, VStack } from '@chakra-ui/react';
import { AuthForm } from '../components/AuthForm';

export default function Login() {
  const { login, errorMessage, clearError, intendedPath, setIntendedPath } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    if (!email) { setClientError('Email is required'); return false; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setClientError('Enter a valid email'); return false; }
    if (password.length < 6) { setClientError('Password must be at least 6 characters'); return false; }
    setClientError(null); return true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
  const ok = await login(email, password);
    if (ok) {
      // If we have an intendedPath (full path), prefer it, otherwise default to /me
      const fromFull = intendedPath;
      const fallback = '/me';
      const target = fromFull && fromFull !== '/login' ? fromFull : fallback;
      navigate(target, { replace: true });
      setIntendedPath(null);
      return;
    }
    setSubmitting(false);
  };

  const handleFieldChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (clientError) setClientError(null);
    if (errorMessage) clearError();
  };

  const disabled = submitting; // only disable during explicit submit

  return (
    <AuthForm
      title='Sign In'
      subtitle='Access your SameBoat account.'
      footer={<span>Need an account? <Link to="/register" className="underline">Create one</Link></span>}
    >
      <VStack as='form' onSubmit={handleSubmit} spacing={4} align='stretch' noValidate>
        {(clientError || errorMessage) && (
          <Alert status='error' variant='subtle'>
            <AlertIcon />
            {clientError || errorMessage}
          </Alert>
        )}
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
          disabled={disabled}
          error={clientError?.includes('Email') ? clientError : null}
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
          disabled={disabled}
          error={clientError?.toLowerCase().includes('password') ? clientError : null}
        />
        <Button type='submit' colorScheme='blue' isDisabled={disabled} isLoading={submitting} loadingText='Signing in…'>
          Sign In
        </Button>
      </VStack>
    </AuthForm>
  );
}
