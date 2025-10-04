import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../state/auth/auth-context';
import Me from '../pages/Me';

// Verifies that authenticated bootstrap sets user and renders protected content

describe('Auth bootstrap (happy path)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith('/api/me')) {
        return new Response(JSON.stringify({ id: 'u1', email: 'user@example.com' }), { status: 200, headers: { 'Content-Type': 'application/json' } }) as unknown as Response;
      }
      return new Response('not found', { status: 404 }) as unknown as Response;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('renders ME page after bootstrap without redirect', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/me' }]}>        
          <Routes>
            <Route path="/me" element={<Me />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText(/My Account/i)).toBeInTheDocument();
  });
});
