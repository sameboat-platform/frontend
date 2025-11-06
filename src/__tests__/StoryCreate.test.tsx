import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoryCreate from '../pages/StoryCreate';

// Mock navigate by mocking react-router-dom's useNavigate
vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: () => vi.fn(),
  };
});

// Mock createStory API
vi.mock('../lib/stories', async () => {
  const mod = await vi.importActual<typeof import('../lib/stories')>('../lib/stories');
  return {
    ...mod,
    createStory: vi.fn().mockResolvedValue({ id: 'new1' }),
  };
});

describe('StoryCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits form and calls createStory', async () => {
    const { createStory } = await import('../lib/stories');

    render(
      <MemoryRouter initialEntries={[{ pathname: '/stories/new' }]}>        
        <StoryCreate />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Hello' } });
    fireEvent.change(screen.getByRole('textbox', { name: /content/i }), { target: { value: 'World' } });
    fireEvent.click(screen.getByRole('button', { name: /publish/i }));

    await waitFor(() => {
      expect(createStory).toHaveBeenCalledWith({ title: 'Hello', content: 'World', triggers: [] });
    });
  });
});
