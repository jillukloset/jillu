import { describe, it, expect } from 'vitest';
import { decodeTimeIdCursor, encodeMessagePollOrigin, encodeTimeIdCursor, MESSAGE_POLL_ORIGIN } from './cursors';

describe('cursors', () => {
  it('round-trips a (createdAt, id) pair through encode/decode', () => {
    const at = new Date('2026-01-01T00:00:00.000Z');
    const encoded = encodeTimeIdCursor(at, 'msg_123');
    const decoded = decodeTimeIdCursor(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.at.toISOString()).toBe(at.toISOString());
    expect(decoded!.id).toBe('msg_123');
  });

  it('rejects garbage input instead of throwing', () => {
    expect(decodeTimeIdCursor('not-base64-json')).toBeNull();
    expect(decodeTimeIdCursor('')).toBeNull();
  });

  it('rejects a well-formed but structurally invalid payload', () => {
    const badShape = Buffer.from(JSON.stringify({ at: 123, id: 'x' }), 'utf8').toString('base64url');
    expect(decodeTimeIdCursor(badShape)).toBeNull();

    const missingId = Buffer.from(JSON.stringify({ at: new Date().toISOString() }), 'utf8').toString(
      'base64url',
    );
    expect(decodeTimeIdCursor(missingId)).toBeNull();
  });

  it('rejects an unparseable date', () => {
    const badDate = Buffer.from(JSON.stringify({ at: 'not-a-date', id: 'x' }), 'utf8').toString('base64url');
    expect(decodeTimeIdCursor(badDate)).toBeNull();
  });

  it('the poll origin decodes back to the sentinel used for an empty thread', () => {
    const decoded = decodeTimeIdCursor(encodeMessagePollOrigin());
    expect(decoded).toEqual(MESSAGE_POLL_ORIGIN);
  });
});
