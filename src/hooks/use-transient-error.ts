import { useEffect, useState } from 'react';

export function useTransientError(durationMs = 3000) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), durationMs);
    return () => clearTimeout(timer);
  }, [error, durationMs]);

  return [error, setError] as const;
}
