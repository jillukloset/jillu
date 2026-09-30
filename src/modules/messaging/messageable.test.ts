import { describe, it, expect } from 'vitest';
import { isListingMessageable } from './messageable';

describe('isListingMessageable', () => {
  it('allows ACTIVE and RESERVED listings', () => {
    expect(isListingMessageable('ACTIVE')).toBe(true);
    expect(isListingMessageable('RESERVED')).toBe(true);
  });

  it('rejects DRAFT, SOLD, and ARCHIVED listings', () => {
    expect(isListingMessageable('DRAFT')).toBe(false);
    expect(isListingMessageable('SOLD')).toBe(false);
    expect(isListingMessageable('ARCHIVED')).toBe(false);
  });

  it('rejects unknown status values', () => {
    expect(isListingMessageable('WHATEVER')).toBe(false);
  });
});
