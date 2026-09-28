'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types/store';
import { useStore } from '@/context/store-context';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist, addToCart, setQuickViewProduct } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative rounded-2xl bg-[#141311] border border-brand-border hover:border-brand-gold/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-luxury hover:shadow-luxury-hover">
      {/* Image Area with Actions */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#181715]">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-brand-cream hover:text-brand-gold transition-transform duration-200 hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-cream'
            }`}
          />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 py-2 rounded-full bg-[#181715]/90 backdrop-blur-md border border-brand-border text-xs text-brand-cream font-medium hover:border-brand-gold hover:text-brand-gold flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="p-2 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark transition-all duration-200 hover:scale-105"
            aria-label="Quick Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Details (Bottom) */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3 bg-[#141311]">
        <div>
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-serif text-sm sm:text-base font-normal text-brand-cream group-hover:text-brand-gold transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs sm:text-sm font-semibold text-brand-cream font-mono">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-brand-muted line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Badge tag (e.g. PREMIUM, TRENDING, BESTSELLER) */}
        {product.badge && (
          <div className="pt-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold tracking-widest uppercase border border-white/10 bg-white/5 text-brand-muted">
              {product.badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
