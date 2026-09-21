import { SearchIcon } from '@/components/icons';

export function SearchBar({ defaultValue, className }: { defaultValue?: string; className?: string }) {
  return (
    <form action="/search" method="GET" className={className} role="search">
      <label htmlFor="site-search" className="sr-only">
        Search Jillu Kloset
      </label>
      <div className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-ink">
        <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
        <input
          id="site-search"
          type="text"
          autoComplete="off"
          name="q"
          defaultValue={defaultValue}
          placeholder="black oversized hoodie, Nike jacket, Y2K…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
    </form>
  );
}
