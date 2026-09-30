export type TimeIdCursor = { at: Date; id: string };

/** Exclusive lower bound used to poll an empty thread without an empty `since` param. */
export const MESSAGE_POLL_ORIGIN: TimeIdCursor = { at: new Date(0), id: '' };

export function encodeTimeIdCursor(at: Date | string, id: string): string {
  const iso = typeof at === 'string' ? new Date(at).toISOString() : at.toISOString();
  return Buffer.from(JSON.stringify({ at: iso, id }), 'utf8').toString('base64url');
}

export function encodeMessagePollOrigin(): string {
  return encodeTimeIdCursor(MESSAGE_POLL_ORIGIN.at, MESSAGE_POLL_ORIGIN.id);
}

export function decodeTimeIdCursor(raw: string): TimeIdCursor | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as { at?: unknown; id?: unknown };
    if (typeof parsed?.at !== 'string' || typeof parsed?.id !== 'string') return null;
    const at = new Date(parsed.at);
    if (Number.isNaN(at.getTime())) return null;
    return { at, id: parsed.id };
  } catch {
    return null;
  }
}
