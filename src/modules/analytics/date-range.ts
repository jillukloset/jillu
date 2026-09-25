/**
 * Shared date-range handling for the admin business dashboard. Kept isolated from the
 * core marketplace modules — this is presentation/reporting plumbing, not domain logic.
 */

export const RANGE_PRESETS = ['7d', '30d', '90d'] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

const PRESET_DAYS: Record<RangePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

export type DateRange = {
  preset: RangePreset;
  days: number;
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

export function parseRangeParam(value: string | undefined): RangePreset {
  return (RANGE_PRESETS as readonly string[]).includes(value ?? '') ? (value as RangePreset) : '30d';
}

/** `end` is exclusive (start of "tomorrow"), so the range always covers whole days including today. */
export function resolveDateRange(preset: RangePreset): DateRange {
  const days = PRESET_DAYS[preset];
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const previousEnd = start;
  const previousStart = new Date(previousEnd.getTime() - days * 24 * 60 * 60 * 1000);
  return { preset, days, start, end, previousStart, previousEnd };
}

/** Percent change vs. the previous period, or null when there's no baseline to compare against. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export type DailyPoint = { date: string; value: number };

/**
 * Fills in zero-count days so a day-bucketed query result (which only returns rows for
 * days that had activity) becomes a continuous series a line chart can draw without gaps.
 */
export function zeroFillDaily(rows: { bucket: Date; count: number | bigint }[], range: DateRange): DailyPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.bucket.toISOString().slice(0, 10), Number(row.count));
  }
  const points: DailyPoint[] = [];
  for (let d = new Date(range.start); d < range.end; d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    const key = d.toISOString().slice(0, 10);
    points.push({ date: key, value: counts.get(key) ?? 0 });
  }
  return points;
}
