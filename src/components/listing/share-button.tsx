'use client';

import { useState } from 'react';
import { ShareIcon } from '@/components/icons';

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or unsupported — fall back to menu
      }
    }
    setOpen((o) => !o);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked (permissions, insecure context) — link stays visible via WhatsApp share as a fallback.
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        className="flex items-center gap-1.5 rounded-pill border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink"
      >
        <ShareIcon width={18} height={18} />
        Share
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-10 mt-2 flex w-44 flex-col gap-1 rounded-md border border-border bg-surface p-2 shadow-raised">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-2 text-left text-sm hover:bg-paper"
          >
            WhatsApp
          </a>
          <button type="button" onClick={copyLink} className="rounded-md px-3 py-2 text-left text-sm hover:bg-paper">
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
