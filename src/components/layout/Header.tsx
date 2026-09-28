'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, User, ShoppingBag, Menu, X, Crown } from 'lucide-react';
import { useStore } from '@/context/store-context';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlistCount, isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      router.push(`/shop?q=${encodeURIComponent(localSearch.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
  ];

  if (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password') {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#080807]/95 backdrop-blur-md border-b border-brand-border py-3 shadow-luxury'
            : 'bg-[#080807] border-b border-brand-border/60 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Left: Brand Logo & Tagline */}
            <Link href="/" className="flex flex-col items-start group flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-brand-gold fill-brand-gold/20 transition-transform group-hover:scale-110" />
                <span className="font-serif tracking-[0.2em] text-lg sm:text-xl font-bold text-brand-cream uppercase group-hover:text-brand-gold transition-colors">
                  JILLU KLOSET
                </span>
              </div>
              <span className="text-[9px] tracking-[0.35em] text-brand-muted uppercase font-sans pl-5 -mt-0.5">
                WEAR YOUR STORY
              </span>
            </Link>

            {/* Navigation links (Desktop) */}
            <nav className="hidden md:flex items-center space-x-7 text-sm font-sans tracking-wide">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 transition-colors hover:text-brand-cream ${
                      isActive ? 'text-brand-cream font-medium' : 'text-brand-muted'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-brand-gold rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Center/Right: Large Rounded Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-md mx-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-4 h-4 text-brand-muted pointer-events-none" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search for brands, styles or categories..."
                    className="w-full bg-[#181715] text-xs text-brand-cream placeholder-brand-muted/70 pl-10 pr-4 py-2.5 rounded-full border border-brand-border focus:border-brand-gold/60 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Right: Actions Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search Toggle for Mobile/Tablet */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-brand-muted hover:text-brand-cream transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="relative p-2 text-brand-muted hover:text-brand-cream transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-dark">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account / User Icon */}
              <Link
                href="/account"
                className="p-2 text-brand-muted hover:text-brand-cream transition-colors"
                aria-label="My Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Shopping Bag / Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-brand-muted hover:text-brand-cream transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-dark">
                  {cartCount}
                </span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-brand-muted hover:text-brand-cream transition-colors"
                aria-label="Open Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-brand-secondary border-l border-brand-border p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-brand-gold" />
                  <span className="font-serif tracking-widest text-sm font-bold text-brand-cream uppercase">
                    JILLU KLOSET
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-brand-muted hover:text-brand-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Input */}
              <form
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-brand-muted" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search styles, brands..."
                    className="w-full bg-brand-card text-xs text-brand-cream placeholder-brand-muted/70 pl-9 pr-4 py-2.5 rounded-full border border-brand-border focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-4 pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-base font-medium py-1.5 transition-colors ${
                      pathname === link.href ? 'text-brand-gold' : 'text-brand-cream hover:text-brand-gold'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Category Quick Links */}
              <div className="pt-4 border-t border-brand-border">
                <p className="text-[11px] uppercase tracking-widest text-brand-muted mb-3 font-semibold">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/shop?category=men"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md bg-brand-card text-brand-cream hover:border-brand-gold border border-brand-border"
                  >
                    Men
                  </Link>
                  <Link
                    href="/shop?category=women"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md bg-brand-card text-brand-cream hover:border-brand-gold border border-brand-border"
                  >
                    Women
                  </Link>
                  <Link
                    href="/shop?category=footwear"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md bg-brand-card text-brand-cream hover:border-brand-gold border border-brand-border"
                  >
                    Footwear
                  </Link>
                  <Link
                    href="/shop?category=accessories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md bg-brand-card text-brand-cream hover:border-brand-gold border border-brand-border"
                  >
                    Accessories
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-brand-border space-y-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-brand-cream hover:text-brand-gold"
              >
                <User className="w-4 h-4 text-brand-gold" />
                <span>My Account</span>
              </Link>
              <div className="text-[11px] text-brand-muted tracking-wider">
                WEAR YOUR STORY · LUXURY APPAREL
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
