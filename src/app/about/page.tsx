'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Crown, Sparkles, Feather, Globe, HelpCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-[#080807] min-h-screen">
      {/* Hero Banner */}
      <section className="relative py-24 sm:py-32 overflow-hidden border-b border-brand-border">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000"
            alt="Editorial Runway"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#080807]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-brand-gold">
            <Crown className="w-5 h-5 fill-brand-gold/20" />
            <span className="text-xs uppercase font-mono tracking-[0.3em]">
              THE JILLU MANIFESTO
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-brand-cream tracking-tight">
            Style speaks <span className="font-script text-brand-gold text-5xl sm:text-7xl">Louder</span>
          </h1>

          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto font-light leading-relaxed pt-2">
            We curate clothing for those who refuse conformity. Every garment carries an intention, a tactile presence, and a story waiting to unfold.
          </p>
        </div>
      </section>

      {/* Brand Story Column */}
      <section className="py-20 border-b border-brand-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand-gold">
                OUR PHILOSOPHY
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-brand-cream font-normal">
                Wear Your Story
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
                Founded on the belief that luxury is an attitude rather than a price tag, Jillu Kloset bridges timeless architectural tailoring with raw streetwear confidence.
              </p>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
                We reject seasonal disposability in favor of archival pieces: 480 GSM organic cotton fleece, full-grain Italian lambskin, Japanese selvedge denim, and precision Swiss movement horology.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-brand-gold hover:text-brand-cream transition-colors"
                >
                  <span>Explore The Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-brand-border shadow-luxury">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000"
                  alt="Fashion Craft"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="sustainability" className="py-20 border-b border-brand-border/60 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand-gold">
              FOUNDATIONAL PILLARS
            </span>
            <h2 className="font-serif text-3xl text-brand-cream">
              Artisanship & Responsibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-4">
              <Sparkles className="w-6 h-6 text-brand-gold" />
              <h3 className="font-serif text-xl text-brand-cream">Impeccable Sourcing</h3>
              <p className="text-xs text-brand-muted leading-relaxed font-light">
                We partner with historic European mills, ethical leather tanneries, and Japanese denim weavers to guarantee enduring tactile quality.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-4">
              <Feather className="w-6 h-6 text-brand-gold" />
              <h3 className="font-serif text-xl text-brand-cream">Conscious Permanence</h3>
              <p className="text-xs text-brand-muted leading-relaxed font-light">
                By investing in limited production runs and heavy natural fibers, our garments improve with age and resist microplastic shedding.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-4">
              <Globe className="w-6 h-6 text-brand-gold" />
              <h3 className="font-serif text-xl text-brand-cream">Carbon Neutral Dispatch</h3>
              <p className="text-xs text-brand-muted leading-relaxed font-light">
                Every delivery is packaged in biodegradable plant-based materials and 100% recycled cotton dust bags with carbon-offset logistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" className="py-20 border-b border-brand-border/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand-gold">
              SUPPORT & INQUIRIES
            </span>
            <h2 className="font-serif text-3xl text-brand-cream">
              Frequently Answered
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl bg-[#141311] border border-brand-border space-y-2">
              <h4 className="font-semibold text-brand-cream text-sm">
                How do I know the luxury pieces are authentic?
              </h4>
              <p className="text-brand-muted leading-relaxed font-light">
                Every luxury piece offered by Jillu Kloset undergoes rigorous authentication by our in-house specialists, checking stitch counts, hardware hallmark stamps, and provenance documents.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141311] border border-brand-border space-y-2">
              <h4 className="font-semibold text-brand-cream text-sm">
                What are your delivery timelines and shipping rates?
              </h4>
              <p className="text-brand-muted leading-relaxed font-light">
                We offer complimentary express shipping on all domestic orders above ₹5,000. Orders are dispatched within 24 hours and delivered in 2–4 business days via insured express transit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141311] border border-brand-border space-y-2">
              <h4 className="font-semibold text-brand-cream text-sm">
                What is your returns policy?
              </h4>
              <p className="text-brand-muted leading-relaxed font-light">
                We provide a 7-day complimentary return or exchange period for unworn garments with original luxury security tags intact. Simply initiate a return from your account portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 text-center space-y-6">
        <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand-gold">
          GET IN TOUCH
        </span>
        <h2 className="font-serif text-3xl text-brand-cream">
          Concierge & Private Stylists
        </h2>
        <p className="text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
          Need personalized sizing advice or private sourcing requests? Reach our private client team at{' '}
          <span className="text-brand-cream underline">concierge@jillukloset.shop</span>.
        </p>
      </section>
    </div>
  );
}
