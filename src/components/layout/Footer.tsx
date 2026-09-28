'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, ArrowRight, Check } from 'lucide-react';
import { useStore } from '@/context/store-context';

export function Footer() {
  const pathname = usePathname();
  const { addToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      addToast('Welcome to Jillu Kloset', 'You are now subscribed to exclusive drops and private previews.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#050505] border-t border-brand-border text-brand-muted pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-14 border-b border-brand-border/60">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-brand-gold fill-brand-gold/20" />
                <span className="font-serif tracking-[0.2em] text-lg font-bold text-brand-cream uppercase">
                  JILLU KLOSET
                </span>
              </div>
              <p className="text-[10px] tracking-[0.35em] text-brand-muted uppercase pl-5 -mt-0.5">
                WEAR YOUR STORY
              </p>
            </Link>
            <p className="text-xs text-brand-muted/80 leading-relaxed pt-2">
              Curated luxury fashion celebrating timeless silhouettes, artisanal tailoring, and personal expression.
            </p>
          </div>

          {/* Col 2: Shop Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-brand-cream uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/shop?category=men" className="hover:text-brand-gold transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="hover:text-brand-gold transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/shop?category=footwear" className="hover:text-brand-gold transition-colors">
                  Footwear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-brand-gold transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-brand-cream uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about#faqs" className="hover:text-brand-gold transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/about#shipping" className="hover:text-brand-gold transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/about#returns" className="hover:text-brand-gold transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-brand-gold transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: About */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-brand-cream uppercase tracking-wider">
              About
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-brand-gold transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#sustainability" className="hover:text-brand-gold transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/about#contact" className="hover:text-brand-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Newsletter & Social */}
          <div className="space-y-4 lg:col-span-1">
            <h4 className="text-xs font-semibold text-brand-cream uppercase tracking-wider">
              Stay Updated
            </h4>
            <p className="text-xs text-brand-muted">
              Get the latest drops & offers.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full bg-[#181715] text-xs text-brand-cream placeholder-brand-muted/70 pl-3.5 pr-10 py-2.5 rounded-full border border-brand-border focus:border-brand-gold focus:outline-none transition-all"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-brand-gold-light hover:bg-brand-gold text-brand-dark rounded-full flex items-center justify-center transition-all hover:scale-105"
              >
                {subscribed ? <Check className="w-3.5 h-3.5 text-brand-dark" /> : <ArrowRight className="w-3.5 h-3.5 text-brand-dark" />}
              </button>
            </form>

            {/* Social Icons matching screenshot */}
            <div className="flex items-center gap-4 pt-2">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-muted hover:text-brand-gold transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* X */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-muted hover:text-brand-gold transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-muted hover:text-brand-gold transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.12-2.48.02-3.55l.89-3.77s-.23-.45-.23-1.12c0-1.05.61-1.84 1.36-1.84.64 0 .95.48.95 1.06 0 .65-.41 1.62-.63 2.51-.18.75.38 1.37 1.12 1.37 1.34 0 2.38-1.42 2.38-3.46 0-1.81-1.3-3.08-3.16-3.08-2.15 0-3.41 1.61-3.41 3.28 0 .65.25 1.35.56 1.73.06.08.07.15.05.23l-.21.86c-.03.14-.11.17-.26.1-1-.46-1.63-1.92-1.63-3.09 0-2.52 1.83-4.83 5.28-4.83 2.77 0 4.93 1.98 4.93 4.62 0 2.76-1.74 4.97-4.15 4.97-.81 0-1.57-.42-1.83-.92l-.5 1.9c-.18.7-.67 1.57-1 2.1A12 12 0 1 0 12 0z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-muted hover:text-brand-gold transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Script Signature */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-brand-muted/70">
            © 2025 JILLU KLOSET. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="font-script text-2xl text-brand-gold tracking-wide">
              Style Lives Here
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
