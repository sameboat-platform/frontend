import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthCheckCard from '../components/HealthCheckCard';

// Simple smoke test: component mounts, shows initial state, then transitions to OK after mock fetch

describe('HealthCheckCard', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(
      JSON.stringify({ status: 'UP' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ) as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('mounts and displays health status', async () => {
    render(<HealthCheckCard intervalMs={60000} minSkeletonMs={0} />);
    expect(await screen.findByTestId('health-card')).toBeInTheDocument();
    expect(await screen.findByText(/Healthy/i)).toBeInTheDocument();
    expect(await screen.findByText(/status: UP/i)).toBeInTheDocument();
  });
});
