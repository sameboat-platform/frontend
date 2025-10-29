import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from '../state/auth/auth-context';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { useAuth } from '../state/auth/useAuth';

function ProtectedWithLogout() {
  const { logout, user } = useAuth();
  return (
    <ProtectedRoute>
      <div>
        <div data-testid="me-content">{user ? user.email : 'no-user'}</div>
        <button onClick={() => logout()} data-testid="logout-btn">Logout</button>
      </div>
    </ProtectedRoute>
  );
}

function LoginStub() {
  const navigate = useNavigate();
  return (
    <div>
      <div data-testid="login-page">LOGIN</div>
      <button onClick={() => navigate('/me')} data-testid="goto-me">Go to /me</button>
    </div>
  );
}

describe('logout race', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    let loggedOut = false;
    global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = (init?.method || 'GET').toUpperCase();
      if (url.endsWith('/api/me')) {
        if (!loggedOut) {
          return new Response(
            JSON.stringify({ id: 'u1', email: 'user@example.com' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          ) as unknown as Response;
        }
        return new Response('unauthorized', { status: 401, statusText: 'Unauthorized' }) as unknown as Response;
      }
      if (url.endsWith('/api/auth/logout') && method === 'POST') {
        loggedOut = true;
        return new Response('ok', { status: 200 }) as unknown as Response;
      }
      return new Response('not found', { status: 404 }) as unknown as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('stays logged out after logout when /api/me later returns 401', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/me' }]}>        
          <Routes>
            <Route path="/login" element={<LoginStub />} />
            <Route path="/me" element={<ProtectedWithLogout />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Initially authenticated and viewing protected content
    await waitFor(() => expect(screen.getByTestId('me-content')).toHaveTextContent('user@example.com'));

    // Trigger logout
    const user = userEvent.setup();
    await user.click(screen.getByTestId('logout-btn'));

    // Redirected to login and remains there
    await waitFor(() => expect(screen.getByTestId('login-page')).toBeInTheDocument());

    // Try navigating back to /me; ProtectedRoute should redirect back to /login (me remains protected)
    await user.click(screen.getByTestId('goto-me'));
    await waitFor(() => expect(screen.getByTestId('login-page')).toBeInTheDocument());
  });
});
