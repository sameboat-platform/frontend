import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import type { FormEvent, ChangeEvent } from "react";
import { useAuth } from "../state/auth/useAuth";
import { FormField } from "../components/FormField";
import { Alert, AlertIcon, Button, VStack } from '@chakra-ui/react';
import { AuthForm } from '../components/AuthForm';

export default function Register() {
  const { register, errorMessage, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    const ok = await register(email, password);
    if (ok) {
      const from = (location.state as any)?.from?.pathname;
      const target = from && from !== '/login' ? from : '/';
      navigate(target, { replace: true });
      return;
    }
    setSubmitting(false);
  };

  const handleFieldChange = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (clientError) setClientError(null);
    if (errorMessage) clearError();
  };

  const disabled = submitting;

  return (
    <AuthForm
      title='Create Account'
      subtitle='Join SameBoat.'
      footer={<span>Already have an account? <Link to="/login" className="underline">Sign in</Link></span>}
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
          autoComplete="new-password"
          disabled={disabled}
          error={clientError?.toLowerCase().includes('password') ? clientError : null}
        />
        <Button type='submit' colorScheme='blue' isDisabled={disabled} isLoading={submitting} loadingText='Creating account…'>
          Sign Up
        </Button>
      </VStack>
    </AuthForm>
  );
}
