export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading user analytics">
      <div className="h-16 animate-pulse rounded-md bg-slate-100" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-md bg-slate-100" />
    </div>
  );
}
