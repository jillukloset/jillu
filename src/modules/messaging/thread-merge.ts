export type OrderedMessage = { id: string; createdAt: string | Date };

export function compareMessageOrder(a: OrderedMessage, b: OrderedMessage): number {
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  if (timeA !== timeB) return timeA - timeB;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/** Dedupes by id and sorts by (createdAt, id) so poll/send/history merges stay chronological. */
export function mergeThreadMessages<T extends OrderedMessage>(existing: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return existing;
  const byId = new Map<string, T>();
  for (const message of existing) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(compareMessageOrder);
}
