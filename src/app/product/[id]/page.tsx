'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  Share2,
  Check,
  Ruler,
} from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import { useStore } from '@/context/store-context';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const product = PRODUCTS.find((p) => p.id === id);

  const { addToCart, toggleWishlist, isInWishlist, addToast } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping' | 'sizing'>('details');

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080807] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="font-serif text-3xl text-brand-cream">Product Not Found</h2>
        <Link href="/shop" className="text-xs text-brand-gold hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const currentSize = selectedSize || product.sizes[0];
  const currentColor = selectedColor || product.colors[0]?.name;
  const currentImage = product.images[selectedImageIndex] || product.image;

  const handleAddToCart = () => {
    addToCart(product, currentSize, currentColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, currentSize, currentColor, quantity);
    router.push('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link Copied', 'Product link copied to your clipboard', 'info');
    }
  };

  // Related products from same category or brand
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand)
  ).slice(0, 4);

  return (
    <div className="bg-[#080807] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between text-xs text-brand-muted font-mono">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Curation</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span>Home</span> / <span>Shop</span> / <span className="capitalize">{product.category}</span> /{' '}
            <span className="text-brand-cream">{product.name}</span>
          </div>
        </div>

        {/* Main Product Layout: Gallery + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Gallery Column (7 cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails list */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 sm:w-20 aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-brand-gold shadow-glow'
                      : 'border-brand-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Featured Photo */}
            <div className="flex-1 relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#141311] border border-brand-border group">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-brand-cream border border-white/20">
                  {product.badge}
                </span>
              )}

              <button
                onClick={handleShare}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-brand-cream hover:text-brand-gold transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Purchase Column (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Brand and Title */}
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-brand-gold font-mono font-semibold">
                  {product.brand}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-brand-cream font-normal mt-1 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-4 py-2 border-y border-brand-border/60">
                <span className="font-mono text-2xl font-bold text-brand-cream">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-sm text-brand-muted line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <div className="flex items-center gap-1 text-brand-gold text-xs font-mono ml-auto">
                  <Star className="w-4 h-4 fill-brand-gold" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-brand-muted">({product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-light">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-brand-cream uppercase tracking-wider">
                      Color: <span className="text-brand-gold font-normal">{currentColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                          currentColor === color.name
                            ? 'border-brand-gold scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: color.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-brand-cream uppercase tracking-wider">
                    Select Size
                  </span>
                  <button
                    onClick={() => setActiveTab('sizing')}
                    className="text-brand-gold hover:underline flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 py-2 px-3 rounded-lg text-xs font-mono transition-all ${
                        currentSize === size
                          ? 'bg-brand-gold-light text-brand-dark font-bold shadow-luxury'
                          : 'bg-white/5 text-brand-cream border border-brand-border hover:border-brand-gold/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-semibold text-brand-cream uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-brand-border rounded-lg bg-[#141311]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-brand-muted hover:text-brand-cream transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-mono text-brand-cream font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-brand-muted hover:text-brand-cream transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-6 border-t border-brand-border/60">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 shadow-luxury"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className="p-3.5 rounded-full border border-brand-border hover:border-brand-gold text-brand-cream transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-brand-gold text-brand-gold' : 'text-brand-cream'
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/15 text-brand-cream border border-brand-border font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300"
              >
                BUY IT NOW
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px] text-brand-muted">
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-brand-border/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                  <span>100% Authentic</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-brand-border/40">
                  <Truck className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5 border border-brand-border/40">
                  <RotateCcw className="w-3.5 h-3.5 text-brand-gold" />
                  <span>7-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specifications & Guides */}
        <div className="pt-10 border-t border-brand-border">
          <div className="flex items-center gap-6 border-b border-brand-border pb-3 overflow-x-auto scrollbar-none text-xs font-semibold uppercase tracking-wider">
            {[
              { id: 'details', label: 'Product Details' },
              { id: 'materials', label: 'Materials & Care' },
              { id: 'shipping', label: 'Shipping & Delivery' },
              { id: 'sizing', label: 'Size Guide' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-1 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-brand-gold border-b-2 border-brand-gold'
                    : 'text-brand-muted hover:text-brand-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6 text-xs text-brand-muted leading-relaxed max-w-3xl space-y-4">
            {activeTab === 'details' && (
              <ul className="space-y-2 list-disc list-inside">
                {product.details ? (
                  product.details.map((d, i) => <li key={i}>{d}</li>)
                ) : (
                  <>
                    <li>Mastercrafted with precision tailoring and ergonomic seams.</li>
                    <li>Designed to elevate daily uniform styling and formal occasions.</li>
                    <li>Bespoke hardware and luxury fabric weight.</li>
                  </>
                )}
              </ul>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-2">
                <p>
                  <strong>Composition:</strong> {product.materials || '100% Fine Grade Natural Fabric'}.
                </p>
                <p>
                  <strong>Care Instructions:</strong> We recommend dry cleaning or delicate cold wash inside out. Lay flat to dry away from direct heat to preserve fabric structure and deep color saturation.
                </p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-2">
                <p>
                  <strong>Complimentary Express Delivery:</strong> All orders above ₹5,000 qualify for complimentary insured courier dispatch via premium air cargo (2–4 business days delivery).
                </p>
                <p>
                  <strong>Discreet Luxury Packaging:</strong> Each garment arrives packaged in our archival dust cover and branded collector box.
                </p>
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-3">
                <p>
                  This piece fits true to regular tailored sizing. For a relaxed, draped streetwear silhouette, we suggest selecting one size above your usual fit.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-brand-border">
                    <thead className="bg-white/5 text-brand-cream font-mono">
                      <tr>
                        <th className="p-2 border-b border-brand-border">Size</th>
                        <th className="p-2 border-b border-brand-border">Chest (in)</th>
                        <th className="p-2 border-b border-brand-border">Shoulder (in)</th>
                        <th className="p-2 border-b border-brand-border">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-brand-muted">
                      <tr>
                        <td className="p-2 border-b border-brand-border">S</td>
                        <td className="p-2 border-b border-brand-border">38 - 40</td>
                        <td className="p-2 border-b border-brand-border">18.0</td>
                        <td className="p-2 border-b border-brand-border">27.5</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-brand-border">M</td>
                        <td className="p-2 border-b border-brand-border">40 - 42</td>
                        <td className="p-2 border-b border-brand-border">19.0</td>
                        <td className="p-2 border-b border-brand-border">28.5</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-b border-brand-border">L</td>
                        <td className="p-2 border-b border-brand-border">42 - 44</td>
                        <td className="p-2 border-b border-brand-border">20.0</td>
                        <td className="p-2 border-b border-brand-border">29.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-brand-border space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl text-brand-cream font-normal">
                You May Also Admire
              </h3>
              <Link href="/shop" className="text-xs text-brand-gold hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
