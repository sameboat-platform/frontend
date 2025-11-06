import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../state/auth/auth-context';
import Login from '../pages/Login';

describe.skip('Login fallback – recover when POST /login errors but /me succeeds', () => {
  it('logs in via /api/me after POST error and navigates to /me', async () => {
      const g = globalThis as unknown as { fetch: typeof fetch };
      const originalFetch = g.fetch;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = (init?.method || 'GET').toString().toUpperCase();
      if (url.toString().endsWith('/api/auth/login') && method === 'POST') {
        // Simulate proxy quirk: return 400 even though server actually created a session
        return new Response(JSON.stringify({ error: 'BAD_CREDENTIALS', message: 'proxy glitch' }), {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'content-type': 'application/json' },
        }) as unknown as Response;
      }
      if (url.toString().endsWith('/api/me')) {
        return new Response(JSON.stringify({ id: 'u1', email: 'alice@example.com' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }) as unknown as Response;
      }
      return new Response('not found', { status: 404, statusText: 'Not Found' }) as unknown as Response;
    }) as unknown as typeof fetch;
    g.fetch = fetchMock;

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/login' }] }>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/me" element={<div data-testid="me">ME</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByTestId('me')).toBeInTheDocument());

    g.fetch = originalFetch;
  });
});
