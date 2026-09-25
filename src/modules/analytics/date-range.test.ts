import { describe, it, expect } from 'vitest';
import { percentChange, resolveDateRange, zeroFillDaily } from './date-range';

describe('percentChange', () => {
  it('computes a normal percentage change', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it('returns 0 when both current and previous are zero (no change, not undefined)', () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it('returns null when there is no baseline to compare against (division by zero)', () => {
    expect(percentChange(10, 0)).toBeNull();
  });
});

describe('resolveDateRange', () => {
  it('produces a start/end window matching the requested day count', () => {
    const range = resolveDateRange('30d');
    const spanDays = (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000);
    expect(spanDays).toBe(30);
  });

  it('the previous period immediately precedes the current one with no gap or overlap', () => {
    const range = resolveDateRange('7d');
    expect(range.previousEnd.getTime()).toBe(range.start.getTime());
    const prevSpanDays = (range.previousEnd.getTime() - range.previousStart.getTime()) / (24 * 60 * 60 * 1000);
    expect(prevSpanDays).toBe(7);
  });
});

describe('zeroFillDaily', () => {
  it('fills in zero-count days so the series has no gaps for a line chart', () => {
    const range = resolveDateRange('7d');
    const onlyDay3 = new Date(range.start.getTime() + 3 * 24 * 60 * 60 * 1000);
    const points = zeroFillDaily([{ bucket: onlyDay3, count: 5 }], range);

    expect(points).toHaveLength(7);
    expect(points.filter((p) => p.value === 0)).toHaveLength(6);
    expect(points.find((p) => p.value === 5)).toBeTruthy();
  });

  it('handles bigint counts from raw SQL queries', () => {
    const range = resolveDateRange('7d');
    const points = zeroFillDaily([{ bucket: range.start, count: BigInt(3) }], range);
    expect(points[0]?.value).toBe(3);
  });

  it('returns an all-zero series when there are no rows', () => {
    const range = resolveDateRange('7d');
    const points = zeroFillDaily([], range);
    expect(points).toHaveLength(7);
    expect(points.every((p) => p.value === 0)).toBe(true);
  });
});
