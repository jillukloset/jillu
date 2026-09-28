'use client';

import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export function BrandPromise() {
  const promises = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-brand-gold" />,
      title: '100% Authentic Products',
    },
    {
      icon: <Truck className="w-5 h-5 text-brand-gold" />,
      title: 'Fast & Reliable Shipping',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-brand-gold" />,
      title: 'Easy Returns',
    },
    {
      icon: <Headphones className="w-5 h-5 text-brand-gold" />,
      title: 'Dedicated Support',
    },
  ];

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden border-b border-brand-border">
      {/* Background Image: Mountain & Editorial Mood */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000"
          alt="Cinematic Mountains"
          className="w-full h-full object-cover object-center opacity-30"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080807] via-[#080807]/90 to-[#080807]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-brand-muted font-semibold">
              OUR PROMISE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-cream tracking-tight">
              Quality. Style. You.
            </h2>
            <p className="text-sm text-brand-muted max-w-md leading-relaxed font-light">
              Curated pieces. Premium quality. Designed for modern lives.
            </p>
          </div>

          {/* Right: 4 Features */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 lg:pt-0">
            {promises.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-brand-gold/60 group-hover:bg-brand-gold/10">
                  {item.icon}
                </div>
                <h4 className="text-xs font-medium text-brand-cream group-hover:text-brand-gold transition-colors leading-tight">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
