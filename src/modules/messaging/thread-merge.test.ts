import { describe, it, expect } from 'vitest';
import { mergeThreadMessages } from './thread-merge';

function msg(id: string, createdAt: string) {
  return { id, createdAt };
}

describe('mergeThreadMessages', () => {
  it('dedupes by id when the same message arrives twice (duplicate polling responses)', () => {
    const existing = [msg('a', '2026-01-01T00:00:00.000Z')];
    const incoming = [msg('a', '2026-01-01T00:00:00.000Z'), msg('b', '2026-01-01T00:00:01.000Z')];

    const merged = mergeThreadMessages(existing, incoming);

    expect(merged.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('orders same-timestamp messages by id so the sort is stable and deterministic', () => {
    const t = '2026-01-01T00:00:00.000Z';
    const merged = mergeThreadMessages([], [msg('b', t), msg('a', t), msg('c', t)]);

    expect(merged.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps chronological order after merging out-of-order polled messages', () => {
    const existing = [msg('a', '2026-01-01T00:00:00.000Z'), msg('c', '2026-01-01T00:00:02.000Z')];
    const incoming = [msg('b', '2026-01-01T00:00:01.000Z')];

    const merged = mergeThreadMessages(existing, incoming);

    expect(merged.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns the existing list unchanged when there is nothing new (empty since)', () => {
    const existing = [msg('a', '2026-01-01T00:00:00.000Z')];
    const merged = mergeThreadMessages(existing, []);

    expect(merged).toBe(existing);
  });

  it('handles the first-message race: an empty thread receiving its first message', () => {
    const merged = mergeThreadMessages([], [msg('first', '2026-01-01T00:00:00.000Z')]);

    expect(merged.map((m) => m.id)).toEqual(['first']);
  });

  it('never loses or duplicates messages when older history is prepended', () => {
    const recent = [msg('c', '2026-01-01T00:00:02.000Z'), msg('d', '2026-01-01T00:00:03.000Z')];
    const older = [msg('a', '2026-01-01T00:00:00.000Z'), msg('b', '2026-01-01T00:00:01.000Z')];

    const merged = mergeThreadMessages(recent, older);

    expect(merged.map((m) => m.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(new Set(merged.map((m) => m.id)).size).toBe(4);
  });
});
