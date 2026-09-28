'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COLLECTIONS } from '@/data/collections';

export default function CollectionsPage() {
  return (
    <div className="bg-[#080807] min-h-screen py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-gold font-mono font-semibold">
            EDITORIAL LOOKBOOKS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-brand-cream tracking-tight">
            Curated Collections
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted font-light leading-relaxed">
            Thematic capsules designed to express individuality, architectural silhouettes, and permanent wardrobe essentials.
          </p>
        </div>

        {/* Collections Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative h-[440px] rounded-2xl overflow-hidden border border-brand-border bg-[#141311] shadow-luxury hover:shadow-luxury-hover hover:border-brand-gold/50 transition-all duration-500 flex flex-col justify-end p-8"
            >
              {/* Background Image */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 group-hover:from-black/95 transition-colors" />

              {/* Content */}
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">
                  {col.subtitle}
                </span>
                <h3 className="font-serif text-2xl text-brand-cream group-hover:text-brand-gold transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed line-clamp-2 font-light">
                  {col.description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cream group-hover:text-brand-gold transition-colors">
                    <span>EXPLORE CAPSULE</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-[11px] text-brand-muted font-mono">
                    {col.itemCount} PIECES
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
