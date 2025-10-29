import { describe, it, expect } from 'vitest';
import { shouldRefreshOnVisibility } from '../state/auth/visibility';

describe('visibility-based refresh with cooldown (pure logic)', () => {
  it('returns false when not visible', () => {
    expect(shouldRefreshOnVisibility({ visible: false, inFlight: false, lastFetched: 0, now: 60_000 })).toBe(false);
  });
  it('returns false when inFlight', () => {
    expect(shouldRefreshOnVisibility({ visible: true, inFlight: true, lastFetched: 0, now: 60_000 })).toBe(false);
  });
  it('returns false when cooldown not passed', () => {
    expect(shouldRefreshOnVisibility({ visible: true, inFlight: false, lastFetched: 50_000, now: 70_000, cooldownMs: 30_000 })).toBe(false);
  });
  it('returns true when cooldown passed', () => {
    expect(shouldRefreshOnVisibility({ visible: true, inFlight: false, lastFetched: 30_000, now: 61_000, cooldownMs: 30_000 })).toBe(true);
  });
});
