import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../state/auth/auth-context';
import Login from '../pages/Login';
import Register from '../pages/Register';

// NOTE: These tests focus on client validation logic without hitting a real backend.
// Backend integration/integration tests would require mocking fetch; for now we assert
// client-side constraints and loading disable state.

describe('Auth Forms', () => {
  it('prevents submit with short password on register', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/register' }]}>        
          <Routes>
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(email, { target: { value: 'user@example.com' } });
    fireEvent.change(password, { target: { value: '123' } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 6/i);
    });
  });

  it('shows validation error for invalid email on login', async () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[{ pathname: '/login' }]}>        
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(email, { target: { value: 'notanemail' } });
    fireEvent.change(password, { target: { value: '123456' } });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/valid email/i);
    });
  });
});
