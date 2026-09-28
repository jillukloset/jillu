'use client';

import React from 'react';
import { X, CheckCircle, ShoppingBag, Info } from 'lucide-react';
import { useStore } from '@/context/store-context';

export function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-[#181715]/95 backdrop-blur-md border border-brand-border shadow-luxury animate-fade-in text-brand-cream"
        >
          {toast.type === 'cart' ? (
            <div className="p-1 rounded-full bg-brand-gold/20 text-brand-gold flex-shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
          ) : toast.type === 'success' ? (
            <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-semibold text-brand-cream">{toast.title}</h5>
            {toast.message && (
              <p className="text-[11px] text-brand-muted mt-0.5 leading-snug">{toast.message}</p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-brand-muted hover:text-brand-cream p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
