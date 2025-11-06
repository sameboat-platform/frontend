import { api } from "./api";

export type Trigger =
  | "suicide"
  | "abuse"
  | "violence"
  | "addiction"
  | "self-harm"
  | "harassment"
  | "other";

export interface Story {
  id: string;
  authorId: string;
  authorName?: string;
  title: string;
  content: string; // plain text v1
  triggers: Trigger[]; // empty means unflagged
  createdAt: string; // ISO timestamp
}

export interface StoriesResponse {
  items: Story[];
  nextCursor?: string;
}

// Exported list of trigger options for UI forms; keep in sync with Trigger union.
export const TRIGGER_OPTIONS: readonly Trigger[] = [
  "suicide",
  "abuse",
  "violence",
  "addiction",
  "self-harm",
  "harassment",
  "other",
] as const;

export function isTrigger(x: unknown): x is Trigger {
  return typeof x === "string" && (TRIGGER_OPTIONS as readonly string[]).includes(x);
}

function isString(x: unknown): x is string {
  return typeof x === "string" && x.length >= 0;
}

export function isStory(x: unknown): x is Story {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    isString(o.id) &&
    isString(o.authorId) &&
    (o.authorName === undefined || isString(o.authorName)) &&
    isString(o.title) &&
    isString(o.content) &&
    Array.isArray(o.triggers) &&
    o.triggers.every(isTrigger) &&
    isString(o.createdAt)
  );
}

export function isStoriesResponse(x: unknown): x is StoriesResponse {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  const items = (o.items as unknown) ?? null;
  if (!Array.isArray(items)) return false;
  if (!items.every(isStory)) return false;
  if (o.nextCursor !== undefined && !isString(o.nextCursor)) return false;
  return true;
}

function normalizeStory(raw: Story): Story {
  // Ensure triggers is always an array; backend may send null/undefined for none
  return { ...raw, triggers: Array.isArray(raw.triggers) ? raw.triggers : [] };
}

// --- Client helpers -------------------------------------------------------

export async function listStories(params: {
  limit?: number;
  cursor?: string;
} = {}): Promise<StoriesResponse> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.cursor) qs.set("cursor", params.cursor);
  const path = `/api/stories${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await api<unknown>(path);
  if (!isStoriesResponse(res)) {
    throw new Error("Invalid stories list payload");
  }
  return {
    items: res.items.map(normalizeStory),
    nextCursor: res.nextCursor,
  };
}

export interface CreateStoryInput {
  title: string;
  content: string;
  triggers?: Trigger[];
}

export async function createStory(
  input: CreateStoryInput
): Promise<{ id: string }> {
  const body = JSON.stringify({
    title: input.title,
    content: input.content,
    triggers: input.triggers ?? [],
  });
  return api<{ id: string }>("/api/stories", {
    method: "POST",
    body,
  });
}

export async function getStory(id: string): Promise<Story> {
  const res = await api<unknown>(`/api/stories/${encodeURIComponent(id)}`);
  if (!isStory(res)) throw new Error("Invalid story payload");
  return normalizeStory(res);
}
