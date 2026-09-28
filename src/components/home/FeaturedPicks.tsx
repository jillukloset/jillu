'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export function FeaturedPicks() {
  // Grab the 5 core featured products
  const featuredIds = [
    'armani-mens-black-shirt',
    'essentials-hoodie',
    'leather-jacket',
    'levis-501-jeans',
    'new-balance-550',
  ];

  const featuredProducts = featuredIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  return (
    <section className="py-16 bg-[#080807] border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-8">
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-brand-cream tracking-tight">
              Featured Picks
            </h2>
            <span className="text-xs sm:text-sm text-brand-muted font-sans font-light tracking-wide">
              — Handpicked for your style
            </span>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-brand-muted hover:text-brand-gold uppercase transition-colors group"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 5-Column Responsive Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
