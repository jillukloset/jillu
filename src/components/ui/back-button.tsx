'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/icons';

export function BackButton({
  fallbackHref = '/',
  label = 'Back',
  className = '',
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        // A listing (or any drill-down page) can be reached from search, explore, a closet, a
        // shared link, or a vibe collection — going back through actual history (when there is
        // any in this tab) returns to wherever that was, instead of always landing on one fixed page.
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink ${className}`}
    >
      <ArrowLeftIcon width={16} height={16} />
      {label}
    </button>
  );
}
