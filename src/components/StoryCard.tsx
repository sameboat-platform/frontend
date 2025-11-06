import { useState } from "react";
import type { Story } from "../lib/stories";
import { Box, Heading, Text, Stack, HStack, Badge, Button } from "@chakra-ui/react";

export interface StoryCardProps {
  story: Story;
}

// Renders a single story with a simple content shield when triggers are present.
// TODO: Copy review and a11y pass (aria-hidden for hidden content, sr-only labels).
export default function StoryCard({ story }: StoryCardProps) {
  const [revealed, setRevealed] = useState(false);
  const hasTriggers = story.triggers.length > 0;

  return (
    <Box borderWidth="1px" borderRadius="md" p={4} bg="blackAlpha.300">
      <Stack spacing={3}>
        <Heading size="md">{story.title}</Heading>
        <HStack spacing={2} flexWrap="wrap">
          {hasTriggers && story.triggers.map((t) => (
            <Badge key={t} colorScheme="orange" textTransform="none">{t}</Badge>
          ))}
        </HStack>
        {!hasTriggers && (
          <Text fontSize="sm" opacity={0.7}>No content warnings</Text>
        )}

        {hasTriggers && !revealed ? (
          <Box>
            <Text mb={2}>This story contains sensitive content.</Text>
            <Button size="sm" colorScheme="orange" onClick={() => setRevealed(true)}>
              Reveal story content
            </Button>
          </Box>
        ) : (
          <Text whiteSpace="pre-wrap">{story.content}</Text>
        )}

        <Text fontSize="xs" opacity={0.6}>
          by {story.authorName ?? "Anonymous"} • {new Date(story.createdAt).toLocaleString()}
        </Text>
      </Stack>
    </Box>
  );
}
