import clsx from 'clsx';

export function KpiCard({
  label,
  value,
  trendLabel,
  trendDirection,
  hint,
}: {
  label: string;
  value: number | string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <p className="text-2xl font-semibold text-slate-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
      {trendLabel ? (
        <p
          className={clsx(
            'mt-1.5 text-xs font-medium',
            trendDirection === 'up' && 'text-emerald-700',
            trendDirection === 'down' && 'text-red-700',
            (!trendDirection || trendDirection === 'flat') && 'text-slate-500',
          )}
        >
          {trendDirection === 'up' ? '↑ ' : trendDirection === 'down' ? '↓ ' : ''}
          {trendLabel}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
