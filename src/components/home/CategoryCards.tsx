'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, User, Shirt, Footprints, Watch } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';

export function CategoryCards() {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'men':
        return <Shirt className="w-5 h-5 text-brand-cream" />;
      case 'women':
        return <User className="w-5 h-5 text-brand-cream" />;
      case 'footwear':
        return <Footprints className="w-5 h-5 text-brand-cream" />;
      case 'accessories':
        return <Watch className="w-5 h-5 text-brand-cream" />;
      default:
        return <Shirt className="w-5 h-5 text-brand-cream" />;
    }
  };

  return (
    <section className="py-12 bg-[#080807] border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative h-48 sm:h-52 rounded-2xl overflow-hidden border border-brand-border bg-[#141311] transition-all duration-300 hover:border-brand-gold/50 hover:shadow-luxury"
            >
              {/* Background Image with Zoom on Hover */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/90 transition-colors" />

              {/* Content Positioned at Bottom Left */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                {/* Category Icon Badge */}
                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:border-brand-gold/60">
                  {getCategoryIcon(category.id)}
                </div>

                {/* Category Title & Arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-medium text-brand-cream group-hover:text-brand-gold transition-colors">
                      {category.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand-cream transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-gold" />
                  </div>
                  <span className="text-[10px] text-brand-muted font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    {category.itemCount}+ ITEMS
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
