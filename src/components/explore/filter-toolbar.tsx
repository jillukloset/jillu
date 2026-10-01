import Link from 'next/link';
import { ChevronDownIcon, SlidersIcon } from '@/components/icons';

type Taxonomy = { id: string; name: string; slug: string }[];
type CurrentFilters = Record<string, string | undefined>;
type Option = { value: string; label: string };

const CONDITIONS = ['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'VISIBLE_WEAR'];
const GENDERS = ['WOMEN', 'MEN', 'UNISEX'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLORS = ['Black', 'White', 'Grey', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Beige', 'Multicolor'];
const SORTS: Option[] = [
  { value: 'newest', label: 'Recently added' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function titleCase(value: string) {
  return value[0]?.toUpperCase() + value.slice(1).toLowerCase();
}

function conditionLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildHref(action: string, current: CurrentFilters, overrides: CurrentFilters) {
  const params = new URLSearchParams();
  Object.entries({ ...current, ...overrides }).forEach(([key, value]) => {
    if (key === 'cursor') return;
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `${action}?${qs}` : action;
}

function hiddenInputsExcept(current: CurrentFilters, exclude: string[]) {
  return Object.entries(current)
    .filter(([key, value]) => value && key !== 'cursor' && !exclude.includes(key))
    .map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />);
}

const pillClass = (active: boolean) =>
  `inline-flex shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors ${
    active ? 'border-ink bg-ink text-paper' : 'border-border bg-surface text-ink hover:border-ink'
  }`;

const panelClass =
  'absolute left-0 top-full z-20 mt-2 max-h-72 min-w-[200px] overflow-y-auto rounded-lg border border-border bg-surface p-2 shadow-raised';

const optionClass = (active: boolean) =>
  `block rounded-md px-3 py-2 text-sm transition-colors ${active ? 'bg-ink text-paper' : 'text-ink hover:bg-paper'}`;

function SelectPill({
  label,
  field,
  options,
  current,
  action,
}: {
  label: string;
  field: string;
  options: Option[];
  current: CurrentFilters;
  action: string;
}) {
  const value = current[field];
  const selected = options.find((o) => o.value === value);

  return (
    <details className="group relative shrink-0">
      <summary className={pillClass(Boolean(value))}>
        {selected?.label ?? label}
        <ChevronDownIcon width={14} height={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className={panelClass}>
        <Link href={buildHref(action, current, { [field]: undefined })} className={optionClass(!value)}>
          Any {label}
        </Link>
        {options.map((option) => (
          <Link
            key={option.value}
            href={buildHref(action, current, { [field]: option.value })}
            className={optionClass(value === option.value)}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

function PricePill({ current, action }: { current: CurrentFilters; action: string }) {
  const hasValue = Boolean(current.minPrice || current.maxPrice);
  const label = hasValue ? `₹${current.minPrice ?? '0'} – ₹${current.maxPrice ?? '∞'}` : 'Price';

  return (
    <details className="group relative shrink-0">
      <summary className={pillClass(hasValue)}>
        {label}
        <ChevronDownIcon width={14} height={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <form method="GET" action={action} className={`${panelClass} w-60`}>
        {hiddenInputsExcept(current, ['minPrice', 'maxPrice'])}
        <div className="flex gap-2 p-1">
          <input
            type="number"
            name="minPrice"
            placeholder="Min"
            min={0}
            defaultValue={current.minPrice ?? ''}
            className="w-1/2 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max"
            min={0}
            defaultValue={current.maxPrice ?? ''}
            className="w-1/2 rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </div>
        <button type="submit" className="mt-2 w-full rounded-pill bg-ink px-3 py-2 text-xs font-semibold text-paper">
          Apply
        </button>
      </form>
    </details>
  );
}

function MoreFiltersPill({
  categories,
  current,
  action,
}: {
  categories: Taxonomy;
  current: CurrentFilters;
  action: string;
}) {
  const active = Boolean(current.category || current.location);

  return (
    <details className="group relative shrink-0">
      <summary
        className={`inline-flex h-[38px] shrink-0 cursor-pointer select-none items-center justify-center rounded-pill border px-3 transition-colors ${
          active ? 'border-ink bg-ink text-paper' : 'border-border bg-surface text-ink hover:border-ink'
        }`}
        aria-label="More filters"
      >
        <SlidersIcon width={18} height={18} />
      </summary>
      <form method="GET" action={action} className={`${panelClass} w-64`}>
        {hiddenInputsExcept(current, ['category', 'location'])}
        <label className="flex flex-col gap-1 px-1 py-1.5 text-xs font-semibold text-muted">
          Category
          <select
            name="category"
            defaultValue={current.category ?? ''}
            className="rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 px-1 py-1.5 text-xs font-semibold text-muted">
          Location
          <input
            name="location"
            placeholder="City"
            defaultValue={current.location ?? ''}
            className="rounded-md border border-border bg-paper px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          />
        </label>
        <button type="submit" className="mt-1 w-full rounded-pill bg-ink px-3 py-2 text-xs font-semibold text-paper">
          Apply
        </button>
      </form>
    </details>
  );
}

function SortPill({ current, action }: { current: CurrentFilters; action: string }) {
  const value = current.sort || 'newest';
  const selected = SORTS.find((s) => s.value === value) ?? SORTS[0]!;

  return (
    <details className="group relative shrink-0">
      <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 text-sm text-ink">
        <span className="text-muted">Sort by:</span>
        <span className="font-semibold">{selected.label}</span>
        <ChevronDownIcon width={14} height={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <div className={`${panelClass} right-0 left-auto`}>
        {SORTS.map((option) => (
          <Link
            key={option.value}
            href={buildHref(action, current, { sort: option.value })}
            className={optionClass(value === option.value)}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export function FilterToolbar({
  categories,
  brands,
  current,
  action = '/explore',
  resultsCount,
}: {
  categories: Taxonomy;
  brands: Taxonomy;
  current: CurrentFilters;
  action?: string;
  resultsCount: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <MoreFiltersPill categories={categories} current={current} action={action} />
        <SelectPill
          label="Gender"
          field="gender"
          options={GENDERS.map((g) => ({ value: g, label: titleCase(g) }))}
          current={current}
          action={action}
        />
        <SelectPill
          label="Brand"
          field="brand"
          options={brands.map((b) => ({ value: b.slug, label: b.name }))}
          current={current}
          action={action}
        />
        <SelectPill
          label="Size"
          field="size"
          options={SIZES.map((s) => ({ value: s, label: s }))}
          current={current}
          action={action}
        />
        <SelectPill
          label="Color"
          field="color"
          options={COLORS.map((c) => ({ value: c, label: c }))}
          current={current}
          action={action}
        />
        <SelectPill
          label="Condition"
          field="condition"
          options={CONDITIONS.map((c) => ({ value: c, label: conditionLabel(c) }))}
          current={current}
          action={action}
        />
        <PricePill current={current} action={action} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted">
          Results: <span className="font-semibold text-ink">{resultsCount}</span> item
          {resultsCount === 1 ? '' : 's'}
        </p>
        <SortPill current={current} action={action} />
      </div>
    </div>
  );
}
