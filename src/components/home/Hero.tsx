'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  title: string;
  scriptText: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  quote: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'NEW SEASON',
    title: 'Style speaks',
    scriptText: 'Louder',
    description: 'Premium fashion for the ones who choose confidence over trends.',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop?category=men',
    image: '/images/hero_male_model.jpg',
    quote: 'More\nThan Just\nClothes',
  },
  {
    id: 2,
    tag: 'AUTUMN EDIT',
    title: 'Silent luxury',
    scriptText: 'Redefined',
    description: 'Understated tailoring and tactile textures sculpted for modern silhouettes.',
    ctaText: 'EXPLORE EDIT',
    ctaLink: '/collections/new-season',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=1200',
    quote: 'Crafted\nFor The\nBold',
  },
  {
    id: 3,
    tag: 'LIMITED DROP',
    title: 'Artisanal grace',
    scriptText: 'Enduring',
    description: 'Rare Egyptian cotton, lambskin leather, and archival denim made to last.',
    ctaText: 'VIEW PIECES',
    ctaLink: '/shop?badge=PREMIUM',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=85&w=1200',
    quote: 'Wear\nYour True\nStory',
  },
  {
    id: 4,
    tag: 'FOOTWEAR CAPSULE',
    title: 'Step into',
    scriptText: 'Elegance',
    description: 'Goodyear-welted Italian leather footwear and archival heritage trainers.',
    ctaText: 'DISCOVER SOLES',
    ctaLink: '/shop?category=footwear',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=85&w=1200',
    quote: 'Walk\nWith\nDistinction',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[currentSlide] ?? SLIDES[0]!;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[580px] lg:min-h-[660px] bg-[#080807] overflow-hidden border-b border-brand-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Typography & Content */}
          <div className="lg:col-span-6 z-10 space-y-6">
            <div className="inline-block">
              <span className="text-xs uppercase tracking-[0.3em] text-brand-muted font-sans font-semibold">
                {slide.tag}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-brand-cream leading-[1.1]">
                {slide.title}
              </h1>
              <div className="relative">
                <span className="font-script text-5xl sm:text-6xl lg:text-7xl text-brand-gold tracking-wide leading-none block -mt-2">
                  {slide.scriptText}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-brand-muted max-w-md leading-relaxed font-sans font-light">
              {slide.description}
            </p>

            <div className="pt-2">
              <Link
                href={slide.ctaLink}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-105 shadow-luxury"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Horizontal Slide Indicators */}
            <div className="flex items-center gap-2 pt-6">
              {SLIDES.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    currentSlide === index ? 'w-8 bg-brand-gold' : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Editorial Fashion Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Main Image Frame with subtle luxury rounded card border */}
              <div className="relative aspect-[4/5] sm:aspect-[4/5] rounded-2xl overflow-hidden border border-brand-border shadow-luxury group">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Handwritten Floating Text ("More Than Just Clothes") */}
                <div className="absolute top-6 right-6 z-10 text-right">
                  <p className="font-script text-2xl sm:text-3xl text-brand-gold leading-tight drop-shadow-md whitespace-pre-line rotate-[-6deg]">
                    {slide.quote}
                  </p>
                  <div className="w-12 h-[1px] bg-brand-gold/60 ml-auto mt-1 rotate-[-6deg]" />
                </div>
              </div>

              {/* Vertical Slide Navigator on right edge */}
              <div className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 bg-[#141311]/90 backdrop-blur-md py-3 px-2 rounded-full border border-brand-border shadow-luxury z-20">
                <button
                  onClick={handlePrev}
                  className="p-1 text-brand-muted hover:text-brand-gold transition-colors"
                  aria-label="Previous Slide"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <div className="text-[10px] tracking-widest text-brand-cream font-mono py-1">
                  0{currentSlide + 1}/0{SLIDES.length}
                </div>
                <div className="w-3 h-[1px] bg-brand-border" />
                <button
                  onClick={handleNext}
                  className="p-1 text-brand-muted hover:text-brand-gold transition-colors"
                  aria-label="Next Slide"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
