'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { PRODUCTS } from '@/data/products';

export function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const results = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (url: string) => {
    setIsSearchOpen(false);
    setQuery('');
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#141311] border border-brand-border rounded-2xl shadow-luxury-hover overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center p-4 border-b border-brand-border">
          <Search className="w-5 h-5 text-brand-muted ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, product name, or category..."
            autoFocus
            className="w-full bg-transparent text-sm text-brand-cream placeholder-brand-muted/60 px-4 py-2 focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-brand-muted hover:text-brand-cream rounded-full hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results or Suggested Searches */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-brand-gold" />
                  Trending Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Armani Shirt', 'Essentials Hoodie', 'Leather Jacket', "Levi's 501", 'New Balance 550', 'Trench Coat'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 text-brand-cream border border-brand-border transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-widest block mb-2.5">
                  Explore Categories
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Men', href: '/shop?category=men' },
                    { label: 'Women', href: '/shop?category=women' },
                    { label: 'Footwear', href: '/shop?category=footwear' },
                    { label: 'Accessories', href: '/shop?category=accessories' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleSelect(cat.href)}
                      className="p-2.5 rounded-xl bg-black/40 border border-brand-border hover:border-brand-gold/50 text-xs text-brand-cream text-center font-medium transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-widest block mb-1">
                Products ({results.length})
              </span>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(`/product/${product.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-brand-border transition-colors text-left group"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-14 object-cover rounded-lg bg-[#181715] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brand-muted font-mono">{product.brand}</p>
                    <h4 className="text-sm font-serif text-brand-cream group-hover:text-brand-gold transition-colors truncate">
                      {product.name}
                    </h4>
                    <span className="text-xs font-semibold text-brand-cream font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-gold transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-brand-muted text-xs">
              No products found matching "{query}". Try searching for hoodies, shirts, or jackets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
