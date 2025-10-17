import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../state/auth/auth-context';
import Login from '../pages/Login';
import { ProtectedRoute } from '../routes/ProtectedRoute';

function LocationEcho() {
  const loc = useLocation();
  return <div data-testid="loc-echo">{`${loc.pathname}${loc.search}${loc.hash}`}</div>;
}

describe('intendedPath redirect', () => {

  const ME_PATH = '/me';
  const LOGIN_PATH = '/login';
  const FOO_QUERY = '?foo=1';
  const HASH_TOP = '#top';

  const USER_EMAIL_EXAMPLE = 'user@example.com';
  const USER_PASSWORD_EXAMPLE = 'abcdef';

  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock fetch: unauthenticated on /api/me; successful login returns user body
    // so that ProtectedRoute can render authenticated content immediately after login.
    global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = (init?.method || 'GET').toUpperCase();
      if (url.endsWith('/api/me')) {
        return new Response('unauthorized', { status: 401, statusText: 'Unauthorized' }) as unknown as Response;
      }
      if (url.endsWith('/api/auth/login') && method === 'POST') {
        return new Response(
          JSON.stringify({ id: 'u1', email: 'user@example.com' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ) as unknown as Response;
      }
      return new Response('not found', { status: 404 }) as unknown as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('preserves full path (pathname+search+hash) and navigates to it after login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: ME_PATH, search: FOO_QUERY, hash: HASH_TOP }]}>
          <Routes>
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={ME_PATH} element={<ProtectedRoute><LocationEcho /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // We should be redirected to /login first (unauthenticated)
    const email = await screen.findByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /sign in/i });

    // Enter valid credentials and submit
    fireEvent.change(email, { target: { value: USER_EMAIL_EXAMPLE } });
    fireEvent.change(password, { target: { value: USER_PASSWORD_EXAMPLE } });
    fireEvent.click(submit);

    // After login resolves, we should land back on the intended path including query + hash
    await waitFor(() => {
      expect(screen.getByTestId('loc-echo')).toHaveTextContent(`${ME_PATH}${FOO_QUERY}${HASH_TOP}`);
    });
  });
});
