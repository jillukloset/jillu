'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X, Check } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { ProductCategory } from '@/types/store';
import { ProductCard } from '@/components/products/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialBadge = searchParams.get('badge') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available brands list
  const allBrands = useMemo(() => {
    return Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();
  }, []);

  // Available sizes
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34', '38', '40', 'UK 7', 'UK 8', 'UK 9', 'UK 10'];

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedPriceRange('all');
    setSelectedSize('all');
    setInStockOnly(false);
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Initial search query
    if (initialQuery.trim()) {
      const q = initialQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Initial badge
    if (initialBadge) {
      result = result.filter((p) => p.badge === initialBadge);
    }

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Price range
    if (selectedPriceRange !== 'all') {
      switch (selectedPriceRange) {
        case 'under-5000':
          result = result.filter((p) => p.price < 5000);
          break;
        case '5000-10000':
          result = result.filter((p) => p.price >= 5000 && p.price <= 10000);
          break;
        case '10000-50000':
          result = result.filter((p) => p.price > 10000 && p.price <= 50000);
          break;
        case 'above-50000':
          result = result.filter((p) => p.price > 50000);
          break;
      }
    }

    // Size
    if (selectedSize !== 'all') {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // In Stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.badge === 'NEW' ? 1 : -1));
        break;
      default:
        break;
    }

    return result;
  }, [
    initialQuery,
    initialBadge,
    selectedCategory,
    selectedBrands,
    selectedPriceRange,
    selectedSize,
    inStockOnly,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  return (
    <div className="bg-[#080807] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Title & Breadcrumb */}
        <div className="space-y-2">
          <div className="text-xs text-brand-muted tracking-wider uppercase font-mono">
            Home / Shop {selectedCategory !== 'all' ? `/ ${selectedCategory.toUpperCase()}` : ''}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-cream tracking-tight">
            Curated Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl font-light">
            Explore our permanent luxury curation spanning artisanal tailoring, street silhouettes, fine denim, and footwear.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-brand-border/60">
          {[
            { id: 'all', label: 'All Pieces' },
            { id: 'men', label: 'Men' },
            { id: 'women', label: 'Women' },
            { id: 'footwear', label: 'Footwear' },
            { id: 'accessories', label: 'Accessories' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-brand-gold-light text-brand-dark font-bold shadow-luxury'
                  : 'bg-white/5 text-brand-cream hover:bg-white/10 border border-brand-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort & Mobile Filter Toggle Bar */}
        <div className="flex items-center justify-between gap-4 py-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-[#181715] border border-brand-border text-xs text-brand-cream"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-gold" />
            <span>Filters ({activeFiltersCount})</span>
          </button>

          <span className="hidden lg:block text-xs text-brand-muted font-mono">
            Showing <strong className="text-brand-cream">{filteredProducts.length}</strong> pieces
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-brand-muted hidden sm:inline">Sort by:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#181715] text-brand-cream text-xs px-4 py-2 pr-8 rounded-full border border-brand-border focus:border-brand-gold focus:outline-none appearance-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-brand-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-brand-muted mr-1">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-brand-cream border border-brand-border">
                Category: {selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-brand-gold"
                  onClick={() => setSelectedCategory('all')}
                />
              </span>
            )}
            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-brand-cream border border-brand-border"
              >
                {b}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-brand-gold"
                  onClick={() => toggleBrand(b)}
                />
              </span>
            ))}
            {selectedPriceRange !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-brand-cream border border-brand-border">
                Price: {selectedPriceRange}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-brand-gold"
                  onClick={() => setSelectedPriceRange('all')}
                />
              </span>
            )}
            {selectedSize !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-brand-cream border border-brand-border">
                Size: {selectedSize}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-brand-gold"
                  onClick={() => setSelectedSize('all')}
                />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-gold hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Layout: Sidebar Filters + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 p-6 rounded-2xl bg-[#141311] border border-brand-border space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-cream flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                Refine Pieces
              </span>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="text-[11px] text-brand-gold hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-cream">
                Price Range
              </h4>
              <div className="space-y-1.5 text-xs text-brand-muted">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-5000', label: 'Under ₹5,000' },
                  { id: '5000-10000', label: '₹5,000 – ₹10,000' },
                  { id: '10000-50000', label: '₹10,000 – ₹50,000' },
                  { id: 'above-50000', label: 'Above ₹50,000' },
                ].map((range) => (
                  <label key={range.id} className="flex items-center gap-2.5 cursor-pointer hover:text-brand-cream">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPriceRange === range.id}
                      onChange={() => setSelectedPriceRange(range.id)}
                      className="accent-brand-gold"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5 pt-3 border-t border-brand-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-cream">
                Designers & Brands
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs text-brand-muted pr-1">
                {allBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2.5 cursor-pointer hover:text-brand-cream">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="accent-brand-gold rounded"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2.5 pt-3 border-t border-brand-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-cream">
                Size
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                    selectedSize === 'all'
                      ? 'bg-brand-gold-light text-brand-dark font-bold'
                      : 'bg-white/5 text-brand-cream border border-brand-border'
                  }`}
                >
                  All
                </button>
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                      selectedSize === size
                        ? 'bg-brand-gold-light text-brand-dark font-bold'
                        : 'bg-white/5 text-brand-cream border border-brand-border hover:border-brand-gold/60'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-3 border-t border-brand-border">
              <label className="flex items-center gap-2.5 text-xs text-brand-cream cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-brand-gold rounded"
                />
                <span>In Stock Pieces Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-4">
                <p className="font-serif text-xl text-brand-cream">No matching pieces found</p>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Try adjusting your filters or search terms to explore other luxury pieces in our collection.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs font-bold uppercase tracking-wider"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-brand-secondary border-l border-brand-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <span className="text-sm font-bold uppercase tracking-widest text-brand-cream">
                  Filters
                </span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-brand-muted hover:text-brand-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Price */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-brand-cream">Price</h4>
                <div className="space-y-2 text-xs text-brand-muted">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-5000', label: 'Under ₹5,000' },
                    { id: '5000-10000', label: '₹5,000 – ₹10,000' },
                    { id: '10000-50000', label: '₹10,000 – ₹50,000' },
                    { id: 'above-50000', label: 'Above ₹50,000' },
                  ].map((range) => (
                    <label key={range.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="mobilePrice"
                        checked={selectedPriceRange === range.id}
                        onChange={() => setSelectedPriceRange(range.id)}
                        className="accent-brand-gold"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Brands */}
              <div className="space-y-2 pt-4 border-t border-brand-border">
                <h4 className="text-xs font-semibold uppercase text-brand-cream">Brands</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto text-xs text-brand-muted">
                  {allBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => toggleBrand(b)}
                        className="accent-brand-gold rounded"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-border flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 rounded-full border border-brand-border text-xs text-brand-cream"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-brand-gold-light text-brand-dark font-bold text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080807] flex items-center justify-center text-brand-gold font-mono text-sm">Loading curation...</div>}>
      <ShopContent />
    </Suspense>
  );
}
