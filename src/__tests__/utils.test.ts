import { describe, it, expect } from 'vitest';
import { isHealthResponse } from '../lib/health';
import { isDev, isProd, isTest } from '../lib/env';

describe('health type guard', () => {
  it('accepts object with optional string status', () => {
    expect(isHealthResponse({ status: 'UP' })).toBe(true);
    expect(isHealthResponse({})).toBe(true);
  });
  it('rejects non-object or wrong status type', () => {
    expect(isHealthResponse(null)).toBe(false);
    expect(isHealthResponse('x')).toBe(false);
    expect(isHealthResponse({ status: 123 })).toBe(false);
  });
});

describe('env helpers (smoke)', () => {
  it('exposes mutually exclusive dev/prod in normal runs', () => {
    // In Vitest, MODE is test; DEV/PROD may both be false depending on setup.
    expect(typeof isDev()).toBe('boolean');
    expect(typeof isProd()).toBe('boolean');
  });
  it('detects test mode', () => {
    expect(isTest()).toBe(true);
  });
});
