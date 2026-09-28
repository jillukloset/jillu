'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Package, Heart, MapPin, Settings, LogOut, CheckCircle, Clock } from 'lucide-react';
import { useStore } from '@/context/store-context';

export default function AccountPage() {
  const { wishlistCount, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'settings'>('orders');

  const orders = [
    {
      id: 'JL-94821',
      date: '24 Sep 2026',
      status: 'In Transit',
      total: 100000,
      itemCount: 1,
      items: ["Armani Men's Black Shirt"],
    },
    {
      id: 'JL-83190',
      date: '12 Sep 2026',
      status: 'Delivered',
      total: 13500,
      itemCount: 2,
      items: ['Essentials Hoodie', "Levi's 501 Jeans"],
    },
  ];

  const handleLogout = () => {
    addToast('Logged Out', 'You have been safely signed out.', 'info');
  };

  return (
    <div className="bg-[#080807] min-h-screen py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Profile summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#141311] border border-brand-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold-light text-brand-dark flex items-center justify-center font-serif text-2xl font-bold">
              J
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold">
                VIP CLIENT TIER
              </span>
              <h1 className="font-serif text-2xl text-brand-cream font-normal">
                Julian Alexander
              </h1>
              <p className="text-xs text-brand-muted font-mono">julian.a@jillu.vip</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-brand-border text-center">
              <span className="text-brand-muted block text-[10px]">SAVED PIECES</span>
              <span className="text-brand-cream font-bold">{wishlistCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-brand-border text-center">
              <span className="text-brand-muted block text-[10px]">ORDERS</span>
              <span className="text-brand-cream font-bold">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-1 p-2 rounded-2xl bg-[#141311] border border-brand-border">
            {[
              { id: 'orders', label: 'Order History', icon: <Package className="w-4 h-4" /> },
              { id: 'profile', label: 'Personal Profile', icon: <User className="w-4 h-4" /> },
              { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
              { id: 'settings', label: 'Preferences', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-brand-gold-light text-brand-dark font-bold'
                    : 'text-brand-muted hover:text-brand-cream hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}

            <Link
              href="/wishlist"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-brand-muted hover:text-brand-cream hover:bg-white/5 transition-all"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistCount})</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all text-left pt-2 border-t border-brand-border/60"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Tab Content (9 cols) */}
          <div className="lg:col-span-9 p-6 sm:p-8 rounded-2xl bg-[#141311] border border-brand-border space-y-6">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                  <h3 className="font-serif text-xl text-brand-cream">Recent Orders</h3>
                  <span className="text-xs text-brand-muted font-mono">{orders.length} total</span>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-xl border border-brand-border bg-black/40 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-brand-gold">{order.id}</span>
                          <span className="text-brand-muted">Placed {order.date}</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            order.status === 'In Transit'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs text-brand-cream font-medium">
                        {order.items.join(', ')}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-brand-border/60 text-xs">
                        <span className="text-brand-muted">
                          Total Amount:{' '}
                          <strong className="text-brand-cream font-mono">
                            ₹{order.total.toLocaleString('en-IN')}
                          </strong>
                        </span>
                        <button className="text-brand-gold hover:underline">
                          View Order Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-brand-cream pb-3 border-b border-brand-border">
                  Client Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-brand-muted block mb-1">First Name</label>
                    <input
                      type="text"
                      defaultValue="Julian"
                      className="w-full bg-black/40 border border-brand-border rounded-xl p-3 text-brand-cream"
                    />
                  </div>
                  <div>
                    <label className="text-brand-muted block mb-1">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Alexander"
                      className="w-full bg-black/40 border border-brand-border rounded-xl p-3 text-brand-cream"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-brand-muted block mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="julian.a@jillu.vip"
                      className="w-full bg-black/40 border border-brand-border rounded-xl p-3 text-brand-cream"
                    />
                  </div>
                </div>
                <button className="px-6 py-2.5 rounded-full bg-brand-gold-light text-brand-dark font-bold text-xs uppercase tracking-wider">
                  Save Changes
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-brand-cream pb-3 border-b border-brand-border">
                  Primary Delivery Address
                </h3>
                <div className="p-5 rounded-xl border border-brand-gold/40 bg-black/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-cream">Home Residence</span>
                    <span className="text-[10px] font-mono uppercase bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded">
                      Default
                    </span>
                  </div>
                  <p className="text-brand-muted">
                    74 Alipore Road, Landmark Residence, Suite 14B
                    <br />
                    Kolkata, West Bengal 700027, India
                  </p>
                  <p className="text-brand-muted font-mono">+91 98300 12345</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 text-xs text-brand-cream">
                <h3 className="font-serif text-xl text-brand-cream pb-3 border-b border-brand-border">
                  Preferences & Privacy
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-brand-gold" />
                    <span>Receive SMS notifications for VIP lookbook private previews</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-brand-gold" />
                    <span>Enable dark luxury aesthetic on all devices</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
