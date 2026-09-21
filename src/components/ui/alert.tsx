import clsx from 'clsx';

export function Alert({ tone = 'danger', children }: { tone?: 'danger' | 'success'; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={clsx(
        'rounded-md border px-4 py-3 text-sm',
        tone === 'danger' && 'border-danger/30 bg-danger/10 text-danger',
        tone === 'success' && 'border-success/30 bg-success/10 text-success',
      )}
    >
      {children}
    </div>
  );
}
