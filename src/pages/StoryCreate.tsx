import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Button,
  HStack,
  Text,
} from "@chakra-ui/react";
import { createStory, TRIGGER_OPTIONS } from "../lib/stories";
import type { Trigger } from "../lib/stories";

export default function StoryCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTrigger = (t: Trigger) => {
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createStory({ title, content, triggers });
      navigate("/stories");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create story");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting;

  return (
    <Container maxW="2xl" py={8}>
      <form onSubmit={onSubmit}>
        <Stack spacing={6}>
          <Heading size="lg">Create a Story</Heading>

          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Content</FormLabel>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
          </FormControl>

          <FormControl>
            <FormLabel>Content warnings (optional)</FormLabel>
            <HStack spacing={4} wrap="wrap">
              {TRIGGER_OPTIONS.map((t) => (
                <Checkbox key={t} isChecked={triggers.includes(t)} onChange={() => toggleTrigger(t)}>
                  {t}
                </Checkbox>
              ))}
            </HStack>
            {/* TODO: Copy and a11y enhancements: help text about why tags help readers. */}
          </FormControl>

          {error && <Text color="red.300">{error}</Text>}

          <HStack>
            <Button type="submit" colorScheme="blue" isDisabled={!canSubmit} isLoading={submitting}>
              Publish
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </HStack>
        </Stack>
      </form>
    </Container>
  );
}
