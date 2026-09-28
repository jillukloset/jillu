'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, Heart, ArrowRight, ShieldCheck, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { useStore } from '@/context/store-context';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, discount, shipping, total, toggleWishlist, addToast, clearCart } =
    useStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'JILLU10') {
      setPromoApplied(true);
      addToast('Promo Applied', '10% private member discount applied to your order', 'success');
    } else {
      addToast('Invalid Code', 'Try using code JILLU10 for 10% off', 'info');
    }
  };

  const finalDiscount = promoApplied ? discount + Math.round(subtotal * 0.1) : discount;
  const finalTotal = Math.max(0, subtotal - finalDiscount + shipping);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 1500);
  };

  if (checkoutComplete) {
    return (
      <div className="bg-[#080807] min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#141311] border border-brand-border shadow-luxury space-y-5 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto">
            <Check className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl text-brand-cream">Order Confirmed</h2>
          <p className="text-xs text-brand-muted leading-relaxed font-light">
            Thank you for ordering with Jillu Kloset. Your bespoke luxury order has been received and is being prepared in our atelier.
          </p>
          <div className="p-3 bg-white/5 rounded-xl text-xs font-mono text-brand-gold">
            Order #JL-{Math.floor(100000 + Math.random() * 900000)}
          </div>
          <Link
            href="/shop"
            className="inline-block w-full py-3 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all"
          >
            CONTINUE EXPLORING
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#080807] min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 sm:p-12 rounded-2xl bg-[#141311] border border-brand-border shadow-luxury space-y-6">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-brand-border text-brand-muted flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-brand-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-brand-cream">Your Bag is Empty</h2>
            <p className="text-xs text-brand-muted leading-relaxed font-light">
              You haven't added any luxury pieces yet. Explore our latest drops, artisanal denim, and tailored outerwear.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all hover:scale-105 shadow-luxury"
          >
            <span>EXPLORE CURATION</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#080807] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-brand-cream font-normal">
              Shopping Bag
            </h1>
            <p className="text-xs text-brand-muted font-mono mt-1">
              {cart.reduce((s, i) => s + i.quantity, 0)} pieces selected
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs text-brand-muted hover:text-brand-gold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* 2-Column Cart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-[#141311] border border-brand-border hover:border-brand-border-light transition-all"
              >
                {/* Thumbnail */}
                <Link
                  href={`/product/${item.product.id}`}
                  className="w-20 sm:w-28 aspect-[4/5] rounded-xl overflow-hidden bg-[#181715] flex-shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">
                        {item.product.brand}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-brand-muted hover:text-rose-400 p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link href={`/product/${item.product.id}`}>
                      <h3 className="font-serif text-base text-brand-cream hover:text-brand-gold transition-colors truncate">
                        {item.product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-brand-muted font-mono pt-1">
                      <span>Size: <strong className="text-brand-cream">{item.selectedSize}</strong></span>
                      <span>·</span>
                      <span>Color: <strong className="text-brand-cream">{item.selectedColor}</strong></span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-brand-border/40">
                    <div className="flex items-center border border-brand-border rounded-lg bg-black/40">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)
                        }
                        className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-cream"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-mono font-bold text-brand-cream">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)
                        }
                        className="px-2.5 py-1 text-xs text-brand-muted hover:text-brand-cream"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm sm:text-base font-bold text-brand-cream">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Column (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-6 sticky top-28 shadow-luxury">
            <h2 className="font-serif text-xl text-brand-cream font-normal pb-3 border-b border-brand-border">
              Order Summary
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <span className="text-xs text-brand-muted">Private Member Code</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. JILLU10"
                  className="flex-1 bg-black/40 text-xs text-brand-cream placeholder-brand-muted/60 px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-gold focus:outline-none uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-brand-cream font-medium transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" /> JILLU10 applied (-10%)
                </p>
              )}
            </form>

            {/* Summary lines */}
            <div className="space-y-3 pt-3 border-t border-brand-border/60 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-mono text-brand-cream">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {finalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Savings & Discount</span>
                  <span className="font-mono">-₹{finalDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-muted">
                <span>Estimated Shipping</span>
                <span className="font-mono text-brand-cream">
                  {shipping === 0 ? 'Complimentary' : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-brand-cream pt-3 border-t border-brand-border">
                <span>Total</span>
                <span className="font-mono text-brand-gold">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-4 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50"
            >
              <span>{isCheckingOut ? 'PROCESSING ORDER...' : 'PROCEED TO CHECKOUT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-brand-muted pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Encrypted 256-Bit Luxury Checkout Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
