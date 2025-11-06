import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoriesFeed from '../pages/StoriesFeed';

vi.mock('../lib/stories', async () => {
  const mod = await vi.importActual<typeof import('../lib/stories')>('../lib/stories');
  return {
    ...mod,
    listStories: vi.fn().mockResolvedValue({
      items: [
        {
          id: 's1',
          authorId: 'u1',
          authorName: 'Bob',
          title: 'Flagged',
          content: 'Body',
          triggers: ['violence'],
          createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
        },
      ],
      nextCursor: undefined,
    }),
  };
});

describe('StoriesFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a story card with shield when triggers present', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/stories' }]}>
        <StoriesFeed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Flagged')).toBeInTheDocument();
    });
  // Chakra's Button as Link renders as an anchor element
  expect(screen.getByRole('link', { name: /create a story/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reveal story content/i })).toBeInTheDocument();
  });

  it('shows a friendly message for 404 not found', async () => {
    const { listStories } = await import('../lib/stories');
    (listStories as unknown as { mockRejectedValueOnce: (e: unknown) => unknown }).mockRejectedValueOnce(
      new Error('404 Not Found')
    );

    render(
      <MemoryRouter initialEntries={[{ pathname: '/stories' }]}> 
        <StoriesFeed />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/stories are not available yet/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/GET \/api\/stories/i, { exact: false })).toBeInTheDocument();
  });
});
