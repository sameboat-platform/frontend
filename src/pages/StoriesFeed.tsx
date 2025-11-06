import { useEffect, useState } from "react";
import { Container, Heading, Stack, Text, Button, VStack, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { listStories } from "../lib/stories";
import type { Story, StoriesResponse } from "../lib/stories";
import StoryCard from "../components/StoryCard";

export default function StoriesFeed() {
  const [items, setItems] = useState<Story[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: number; message: string } | null>(null);

  async function fetchPage(cursor?: string) {
    setLoading(true);
    setError(null);
    try {
      const res: StoriesResponse = await listStories({ cursor, limit: 10 });
      setItems((prev) => (cursor ? [...prev, ...res.items] : res.items));
      setNextCursor(res.nextCursor);
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const m = raw.match(/^(\d{3})\b/);
      setError({ code: m ? Number(m[1]) : undefined, message: raw });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    void fetchPage();
  }, []);

  return (
    <Container maxW="2xl" py={8}>
      <Stack spacing={6}>
        <Heading size="lg">Stories</Heading>
        <Button as={RouterLink} to="/stories/new" colorScheme="blue" alignSelf="flex-start">
          Create a Story
        </Button>

        {loading && items.length === 0 && (
          <Text opacity={0.7}>Loading…</Text>
        )}
        {error && (
          <Alert status={error.code && error.code >= 500 ? 'error' : error.code === 404 ? 'warning' : 'error'}>
            <AlertIcon />
            <Stack spacing={1}>
              <AlertTitle>
                {error.code === 404 && 'Stories are not available yet'}
                {error.code && error.code >= 500 && 'Server error'}
                {!error.code && 'Failed to load stories'}
              </AlertTitle>
              <AlertDescription>
                {error.code === 404 && (
                  <>
                    The stories service endpoint (GET /api/stories) wasn’t found. If you’re developing locally, start or implement the backend.
                    Otherwise, please check back soon.
                  </>
                )}
                {error.code && error.code >= 500 && (
                  <>
                    We hit a server error. Please try again. If it keeps happening, contact support.
                  </>
                )}
                {!error.code && (
                  <>An unexpected error occurred. </>
                )}
                <Text fontSize="xs" opacity={0.7} mt={1}>Details: {error.message}</Text>
              </AlertDescription>
            </Stack>
          </Alert>
        )}

        <VStack align="stretch" spacing={4}>
          {items.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </VStack>

        {!loading && items.length === 0 && !error && (
          <Text opacity={0.7}>No stories yet.</Text>
        )}

        {nextCursor && (
          <Button onClick={() => void fetchPage(nextCursor)} isLoading={loading} alignSelf="center">
            Load more
          </Button>
        )}
      </Stack>
    </Container>
  );
}
