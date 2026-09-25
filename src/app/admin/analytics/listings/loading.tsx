export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading listing analytics">
      <div className="h-10 w-64 animate-pulse rounded-md bg-slate-100" />
      <div className="h-40 animate-pulse rounded-md bg-slate-100" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
