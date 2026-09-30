'use client';

import { useQuery } from '@tanstack/react-query';

const DEFAULT_POLL_INTERVAL_MS = 15000;

export function NavBadge({
  queryKey,
  apiUrl,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: {
  queryKey: string;
  apiUrl: string;
  pollIntervalMs?: number;
}) {
  const { data } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await fetch(apiUrl);
      if (!res.ok) return { count: 0 };
      const json = await res.json();
      return json.data as { count: number };
    },
    refetchInterval: pollIntervalMs,
  });

  const count = data?.count ?? 0;
  if (count <= 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold leading-none text-accent-ink">
      {count > 99 ? '99+' : count}
    </span>
  );
}
