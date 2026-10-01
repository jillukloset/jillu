export function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-gutter py-12">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      <p className="mt-2 text-xs text-muted">Last updated {updated}</p>
      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-ink [&_p]:text-ink/90 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-ink/90">
        {children}
      </div>
    </div>
  );
}
