export function BarList({
  title,
  items,
  emptyLabel = 'No data yet',
  renderLabel,
}: {
  title: string;
  items: { id: string; label: string; count: number }[];
  emptyLabel?: string;
  renderLabel?: (item: { id: string; label: string; count: number }) => React.ReactNode;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-xs text-slate-600" title={item.label}>
                {renderLabel ? renderLabel(item) : item.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-slate-100">
                <div
                  className="h-full rounded-pill bg-slate-800"
                  style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold text-slate-900">{item.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
