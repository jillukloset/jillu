type Taxonomy = { id: string; name: string; slug: string }[];

const CONDITIONS = ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'VISIBLE_WEAR'];
const GENDERS = ['WOMEN', 'MEN', 'UNISEX'];

export function FilterDrawer({
  categories,
  brands,
  current,
  action = '/explore',
}: {
  categories: Taxonomy;
  brands: Taxonomy;
  current: Record<string, string | undefined>;
  action?: string;
}) {
  return (
    <details className="mb-6 rounded-lg border border-border bg-surface" open>
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-ink">Filters</summary>
      <form method="GET" action={action} className="grid grid-cols-2 gap-3 border-t border-border p-4 sm:grid-cols-3 lg:grid-cols-6">
        {current.q ? <input type="hidden" name="q" value={current.q} /> : null}
        {current.vibe ? <input type="hidden" name="vibe" value={current.vibe} /> : null}

        <Field label="Category">
          <select name="category" defaultValue={current.category ?? ''} className={selectClass}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Brand">
          <select name="brand" defaultValue={current.brand ?? ''} className={selectClass}>
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Size">
          <input name="size" defaultValue={current.size ?? ''} placeholder="e.g. M" className={selectClass} />
        </Field>

        <Field label="Condition">
          <select name="condition" defaultValue={current.condition ?? ''} className={selectClass}>
            <option value="">Any</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Gender">
          <select name="gender" defaultValue={current.gender ?? ''} className={selectClass}>
            <option value="">Any</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g[0]}
                {g.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location">
          <input name="location" defaultValue={current.location ?? ''} placeholder="City" className={selectClass} />
        </Field>

        <Field label="Min price">
          <input type="number" name="minPrice" defaultValue={current.minPrice ?? ''} className={selectClass} />
        </Field>

        <Field label="Max price">
          <input type="number" name="maxPrice" defaultValue={current.maxPrice ?? ''} className={selectClass} />
        </Field>

        <Field label="Sort">
          <select name="sort" defaultValue={current.sort ?? 'newest'} className={selectClass}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </Field>

        <div className="col-span-2 flex items-end gap-2 sm:col-span-3 lg:col-span-1">
          <button type="submit" className="w-full rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-paper">
            Apply
          </button>
        </div>
      </form>
    </details>
  );
}

const selectClass = 'rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
      {label}
      {children}
    </label>
  );
}
