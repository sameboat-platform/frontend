import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StoryCard from '../components/StoryCard';
import type { Story } from '../lib/stories';

const base: Omit<Story, 'id' | 'authorId' | 'createdAt'> = {
  title: 'Test Title',
  content: 'Body text',
  triggers: [],
  authorName: 'Alice',
};

function make(id: string, overrides: Partial<Story> = {}): Story {
  return {
    id,
    authorId: 'u1',
    createdAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    ...base,
    ...overrides,
  };
}

describe('StoryCard', () => {
  it('renders body directly when no triggers', () => {
    render(<StoryCard story={make('s1', { triggers: [] })} />);
    expect(screen.getByText('Body text')).toBeInTheDocument();
    expect(screen.queryByText(/Reveal story content/i)).not.toBeInTheDocument();
  });

  it('shows shield and reveals content when triggers present', () => {
    render(<StoryCard story={make('s2', { triggers: ['self-harm'] })} />);
    const btn = screen.getByRole('button', { name: /reveal story content/i });
    expect(btn).toBeInTheDocument();
    expect(screen.queryByText('Body text')).not.toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });
});
