'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/store-context';
import { PRODUCTS } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useStore();

  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bg-[#080807] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 border-b border-brand-border/60 pb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-brand-gold">
            SAVED PIECES
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-cream font-normal">
            Your Wishlist
          </h1>
          <p className="text-xs text-brand-muted font-light">
            Keep track of the bespoke garments, outerwear, and accessories you cherish.
          </p>
        </div>

        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 p-8 rounded-2xl bg-[#141311] border border-brand-border max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-brand-border flex items-center justify-center mx-auto text-brand-gold">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-brand-cream">Wishlist is Empty</h3>
              <p className="text-xs text-brand-muted leading-relaxed font-light">
                Tap the heart icon on any piece while exploring our curation to save it here for later.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all shadow-luxury"
            >
              <span>EXPLORE PIECES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
