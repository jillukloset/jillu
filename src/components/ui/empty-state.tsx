import Link from 'next/link';

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-2 rounded-pill bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-transform hover:scale-[1.02]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
