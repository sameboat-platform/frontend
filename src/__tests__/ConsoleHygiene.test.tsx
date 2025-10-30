import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../state/auth/auth-context';

function App() {
  return <div>App</div>;
}

describe('console hygiene (happy path)', () => {
  const originalFetch = global.fetch;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(global, 'fetch').mockImplementation(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith('/api/me')) {
        return new Response(JSON.stringify({ id: 'u1', email: 'u@example.com' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }) as unknown as Response;
      }
      return new Response('not found', { status: 404 }) as unknown as Response;
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('does not emit console.error/warn during happy bootstrap', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    // Let microtasks settle to allow refresh to complete
    await Promise.resolve();
    await Promise.resolve();
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
