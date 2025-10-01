import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../state/auth/auth-context';
import { ProtectedRoute } from '../routes/ProtectedRoute';

// Helper component to isolate /me route
function ProtectedMe() {
  return (
    <ProtectedRoute>
      <div data-testid="me-page">ME PAGE</div>
    </ProtectedRoute>
  );
}

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/me' }]}>        
          <Routes>
            <Route path="/login" element={<div data-testid="login-page">LOGIN</div>} />
            <Route path="/me" element={<ProtectedMe />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});
