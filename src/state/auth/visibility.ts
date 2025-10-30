export function shouldRefreshOnVisibility(params: {
  visible: boolean;
  inFlight: boolean;
  lastFetched?: number;
  now: number;
  cooldownMs?: number;
}): boolean {
  const { visible, inFlight, lastFetched, now, cooldownMs = 30_000 } = params;
  if (!visible) return false;
  if (inFlight) return false;
  const last = lastFetched ?? 0;
  return now - last >= cooldownMs;
}
