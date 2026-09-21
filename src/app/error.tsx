'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buttonClassName } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log client-side for our own visibility; never render error.message to the user —
    // it may carry internal details we don't control the origin of (e.g. thrown in a
    // Client Component), unlike server errors which Next.js already redacts in production.
    console.error('Unhandled error', error.digest ?? error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-gutter text-center">
      <p className="font-display text-3xl">Something went wrong</p>
      <p className="text-sm text-muted">
        That&rsquo;s on us. Please try again{error.digest ? ` (ref: ${error.digest})` : ''}.
      </p>
      <div className="mt-2 flex gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Link href="/" className={buttonClassName('secondary', 'md')}>
          Go home
        </Link>
      </div>
    </div>
  );
}
