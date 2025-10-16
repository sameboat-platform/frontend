import { describe, it, expect, vi, afterEach } from 'vitest';
import { api, buildUrl } from '../lib/api';

describe('api wrapper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buildUrl passes through absolute URLs', () => {
    const url = 'https://example.com/x';
    expect(buildUrl(url)).toBe(url);
  });

  it('returns parsed JSON on success', async () => {
    const payload = { id: 'u1', email: 'a@b.com' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }) as unknown as Response
    );

    const data = await api<typeof payload>('/api/me');
    expect(data).toEqual(payload);
  });

  it('returns text when response is not JSON', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('plain-text', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      }) as unknown as Response
    );

    const data = await api<string>('/api/version');
    expect(data).toBe('plain-text');
  });

  it('throws with structured cause on error JSON', async () => {
    const errorPayload = { error: 'BAD_CREDENTIALS', message: 'Invalid login' };
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(errorPayload), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'Content-Type': 'application/json' },
      }) as unknown as Response
    );

    try {
      await api('/api/auth/login', { method: 'POST' });
      throw new Error('should have thrown');
    } catch (e) {
      const err = e as Error & { cause?: unknown };
      expect(err.message).toContain('401 Unauthorized');
      expect(err.cause).toMatchObject(errorPayload);
    }
  });
});
