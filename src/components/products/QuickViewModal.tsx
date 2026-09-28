'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Heart, ShoppingBag, Star, Check, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/store-context';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isWishlisted = isInWishlist(product.id);
  const currentSize = selectedSize || product.sizes[0];
  const currentColor = selectedColor || product.colors[0]?.name;

  const handleAddToCart = () => {
    addToCart(product, currentSize, currentColor, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#141311] border border-brand-border rounded-2xl shadow-luxury-hover overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-brand-muted hover:text-brand-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Column */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative bg-[#181715] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-brand-cream border border-white/15">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-muted font-mono">
              {product.brand}
            </span>
            <h2 className="font-serif text-2xl text-brand-cream font-normal">
              {product.name}
            </h2>

            {/* Price & Rating */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-xl font-bold text-brand-cream">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-sm text-brand-muted line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <div className="flex items-center gap-1 text-brand-gold text-xs font-mono ml-auto">
                <Star className="w-3.5 h-3.5 fill-brand-gold" />
                <span>{product.rating}</span>
                <span className="text-brand-muted">({product.reviewsCount})</span>
              </div>
            </div>

            <p className="text-xs text-brand-muted leading-relaxed font-light line-clamp-3">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-medium text-brand-cream">Select Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                      currentSize === size
                        ? 'bg-brand-gold-light text-brand-dark font-bold'
                        : 'bg-white/5 text-brand-cream border border-brand-border hover:border-brand-gold/60'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-medium text-brand-cream">Quantity</span>
              <div className="flex items-center border border-brand-border rounded-lg bg-black/40">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-brand-muted hover:text-brand-cream"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-mono text-brand-cream">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-brand-muted hover:text-brand-cream"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-brand-border">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="p-3 rounded-full border border-brand-border hover:border-brand-gold text-brand-cream transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-cream'
                  }`}
                />
              </button>
            </div>

            <Link
              href={`/product/${product.id}`}
              onClick={() => setQuickViewProduct(null)}
              className="w-full text-center block text-xs text-brand-muted hover:text-brand-gold transition-colors pt-1"
            >
              View Full Product Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
