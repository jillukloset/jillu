'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export function MessageSellerButton({ listingId, isLoggedIn }: { listingId: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setError(null);
    setLoading(true);
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok || !json.success) {
      setError(json.error?.message ?? 'Could not start a conversation. Please try again.');
      return;
    }

    router.push(`/messages/${json.data.id}`);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={start} loading={loading} className="w-full sm:w-auto">
        Message seller
      </Button>
      <Alert>{error}</Alert>
    </div>
  );
}
