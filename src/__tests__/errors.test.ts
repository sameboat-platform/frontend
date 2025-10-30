import { describe, it, expect } from 'vitest';
import { mapAuthError } from '../state/auth/errors';

// Covers friendly copy and normalization of backend codes to AuthErrorCode union

describe('auth error mapper', () => {
  it('maps known codes to friendly messages', () => {
    expect(mapAuthError('BAD_CREDENTIALS')).toEqual({ code: 'BAD_CREDENTIALS', message: 'Email or password is incorrect.' });
    expect(mapAuthError('ACCOUNT_LOCKED')).toEqual({ code: 'ACCOUNT_LOCKED', message: 'Your account is locked. Check your email and/or contact support.' });
    expect(mapAuthError('USER_DISABLED')).toEqual({ code: 'USER_DISABLED', message: 'Your account is disabled. Please contact support.' });
    expect(mapAuthError('RATE_LIMITED')).toEqual({ code: 'RATE_LIMITED', message: 'Too many attempts. Please wait and try again.' });
    expect(mapAuthError('NETWORK')).toEqual({ code: 'NETWORK', message: 'Something went wrong. Please try again.' });
    expect(mapAuthError('SERVER_ERROR')).toEqual({ code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' });
  });

  it('normalizes variant backend strings to union codes', () => {
    // Unauthorized/Forbidden treated as bad credentials UX-wise
    expect(mapAuthError('UNAUTHORIZED')).toEqual({ code: 'BAD_CREDENTIALS', message: 'Email or password is incorrect.' });
    expect(mapAuthError('Forbidden')).toEqual({ code: 'BAD_CREDENTIALS', message: 'Email or password is incorrect.' });

    // Internal/5xx → server error
    expect(mapAuthError('Internal_Server_Error')).toEqual({ code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' });
    expect(mapAuthError('503')).toEqual({ code: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' });

    // Networkish strings → network
    expect(mapAuthError('fetch_failed')).toEqual({ code: 'NETWORK', message: 'Something went wrong. Please try again.' });
  });

  it('falls back to UNKNOWN for unrecognized codes', () => {
    const result = mapAuthError('WEIRD_AND_NEW');
    expect(result.code).toBe('UNKNOWN');
    expect(result.message).toBe('Unexpected error. Please retry.');
  });

  it('uses fallback message when code is undefined', () => {
    const result = mapAuthError(undefined, 'Authentication error');
    expect(result).toEqual({ code: undefined, message: 'Authentication error' });
  });
});
