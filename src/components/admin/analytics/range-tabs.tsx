import Link from 'next/link';
import clsx from 'clsx';
import { RANGE_PRESETS, type RangePreset } from '@/modules/analytics/date-range';

const LABELS: Record<RangePreset, string> = { '7d': '7 days', '30d': '30 days', '90d': '90 days' };

/** Plain <Link>s carrying the range in the query string — no client state needed. */
export function RangeTabs({ basePath, active }: { basePath: string; active: RangePreset }) {
  return (
    <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-1" role="tablist" aria-label="Date range">
      {RANGE_PRESETS.map((preset) => (
        <Link
          key={preset}
          href={`${basePath}?range=${preset}`}
          role="tab"
          aria-selected={preset === active}
          className={clsx(
            'rounded px-3 py-1.5 text-xs font-semibold transition-colors',
            preset === active ? 'bg-ink text-paper' : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          {LABELS[preset]}
        </Link>
      ))}
    </div>
  );
}
