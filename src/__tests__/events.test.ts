import { describe, it, expect, vi } from 'vitest';
import { onEvent, emit } from '../lib/events';

describe('event bus', () => {
  it('invokes handler on emit and supports unsubscription', () => {
    const handler = vi.fn();
    const off = onEvent(handler);

    emit('auth:login', { id: 'u1' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toMatchObject({ type: 'auth:login', payload: { id: 'u1' } });

    off();
    emit('auth:logout');
    expect(handler).toHaveBeenCalledTimes(1); // no additional calls after off
  });
});
