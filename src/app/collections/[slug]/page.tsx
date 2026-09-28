'use client';

import React from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { COLLECTIONS } from '@/data/collections';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const collection = COLLECTIONS.find((c) => c.slug === slug);

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#080807] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="font-serif text-3xl text-brand-cream">Collection Not Found</h2>
        <Link href="/collections" className="text-xs text-brand-gold hover:underline">
          ← Back to All Collections
        </Link>
      </div>
    );
  }

  // Filter products by collection or category
  const collectionProducts = PRODUCTS.filter(
    (p) => p.collection === collection.slug || p.collection === slug
  );

  const displayProducts = collectionProducts.length > 0 ? collectionProducts : PRODUCTS.slice(0, 6);

  return (
    <div className="bg-[#080807] min-h-screen pb-20">
      {/* Editorial Header Banner */}
      <div className="relative h-[380px] sm:h-[450px] w-full overflow-hidden border-b border-brand-border">
        <img
          src={collection.image}
          alt={collection.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/70 to-black/40" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 z-10 space-y-3">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs text-brand-muted hover:text-brand-cream uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Collections</span>
          </Link>
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand-gold">
            {collection.subtitle}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-brand-cream tracking-tight">
            {collection.title}
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl font-light leading-relaxed">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
          <span className="text-xs uppercase tracking-widest text-brand-cream font-mono">
            Pieces in this Capsule ({displayProducts.length})
          </span>
          <Link href="/shop" className="text-xs text-brand-gold hover:underline">
            View All Store Pieces →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
