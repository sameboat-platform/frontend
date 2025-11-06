import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../state/auth/auth-context';
import Register from '../pages/Register';

describe.skip('Register flow – success without auto-login', () => {
  it('treats 201 with no body as success and navigates without showing error', async () => {
  const g = globalThis as unknown as { fetch: typeof fetch };
  const originalFetch = g.fetch;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = (init?.method || 'GET').toString().toUpperCase();
      if (url.toString().endsWith('/api/auth/register') && method === 'POST') {
        // Backend creates the user but does not start a session nor return a body
        return new Response('', { status: 201, statusText: 'Created' }) as unknown as Response;
      }
      // /api/me should not be called by register() in this scenario, but return 401 if probed
      if (url.toString().endsWith('/api/me')) {
        return new Response('unauthorized', { status: 401, statusText: 'Unauthorized' }) as unknown as Response;
      }
      return new Response('not found', { status: 404, statusText: 'Not Found' }) as unknown as Response;
    }) as unknown as typeof fetch;
  g.fetch = fetchMock;

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/register' }] }>
          <Routes>
            <Route path="/" element={<div data-testid="home">HOME</div>} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'email2@email.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    // We should navigate to "/" (fallback) and not see an error alert
    await waitFor(() => expect(screen.getByTestId('home')).toBeInTheDocument());
    expect(screen.queryByRole('alert')).toBeNull();

    // restore
  g.fetch = originalFetch;
  });
});
