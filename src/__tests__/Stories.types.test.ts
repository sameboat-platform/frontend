import { describe, expect, it, vi } from 'vitest';
import { isStory, isStoriesResponse, type Story, listStories } from '../lib/stories';

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 's1',
    authorId: 'u1',
    authorName: 'A',
    title: 'Hello',
    content: 'x'.repeat(60),
    triggers: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('stories guards', () => {
  it('validates a Story', () => {
    const s = makeStory();
    expect(isStory(s)).toBe(true);
  });

  it('rejects invalid Story shapes', () => {
    const bad1 = { ...makeStory(), id: 123 } as unknown;
    const bad2 = { ...makeStory(), triggers: ['not-a-trigger'] } as unknown;
    expect(isStory(bad1)).toBe(false);
    expect(isStory(bad2)).toBe(false);
  });

  it('validates a StoriesResponse', () => {
    const res = { items: [makeStory()], nextCursor: 'abc' };
    expect(isStoriesResponse(res)).toBe(true);
  });
});

describe('listStories', () => {
  it('throws on invalid payload', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ foo: 'bar' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }) as unknown as Response
    );
    await expect(listStories()).rejects.toThrow('Invalid stories list payload');
    fetchSpy.mockRestore();
  });
});
