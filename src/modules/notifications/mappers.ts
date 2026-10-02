type NotificationRow = {
  id: string;
  type: string;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
};

export type DisplayNotification = {
  id: string;
  type: string;
  message: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  /** Actor who triggered the notification (follower, liker, saver, sender). */
  actorId: string | null;
  actorUsername: string | null;
  /** Related listing, when the notification concerns one. */
  listingId: string | null;
  listingTitle: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function toDisplayNotification(row: NotificationRow): DisplayNotification {
  const payload = asRecord(row.payload);
  const base = {
    id: row.id,
    type: row.type,
    readAt: row.readAt,
    createdAt: row.createdAt,
    actorId: null,
    actorUsername: null,
    listingId: (payload.listingId as string | undefined) ?? null,
    listingTitle: (payload.listingTitle as string | undefined) ?? null,
  };

  switch (row.type) {
    case 'NEW_FOLLOWER': {
      const username = payload.followerUsername as string | null;
      return {
        ...base,
        actorId: (payload.followerId as string | undefined) ?? null,
        actorUsername: username,
        message: username ? `@${username} started following you` : 'Someone started following you',
        href: username ? `/closet/${username}` : null,
      };
    }
    case 'LISTING_LIKED': {
      const username = payload.likedByUsername as string | null;
      const title = payload.listingTitle as string | undefined;
      return {
        ...base,
        actorId: (payload.likedBy as string | undefined) ?? null,
        actorUsername: username,
        message: `${username ? `@${username}` : 'Someone'} liked your listing${title ? ` "${title}"` : ''}`,
        href: payload.listingId ? `/listing/${payload.listingId}` : null,
      };
    }
    case 'LISTING_SAVED': {
      const username = payload.savedByUsername as string | null;
      const title = payload.listingTitle as string | undefined;
      return {
        ...base,
        actorId: (payload.savedBy as string | undefined) ?? null,
        actorUsername: username,
        message: `${username ? `@${username}` : 'Someone'} saved your listing${title ? ` "${title}"` : ''}`,
        href: payload.listingId ? `/listing/${payload.listingId}` : null,
      };
    }
    case 'NEW_MESSAGE': {
      const username = payload.senderUsername as string | null;
      const preview = payload.preview as string | undefined;
      return {
        ...base,
        actorId: (payload.senderId as string | undefined) ?? null,
        actorUsername: username,
        message: `${username ? `@${username}` : 'Someone'}${preview ? `: ${preview}` : ' sent you a message'}`,
        href: payload.conversationId ? `/messages/${payload.conversationId}` : null,
      };
    }
    case 'LISTING_MARKED_SOLD': {
      const title = payload.listingTitle as string | undefined;
      return {
        ...base,
        message: `${title ? `"${title}"` : 'A listing'} you liked or saved was marked as sold`,
        href: payload.listingId ? `/listing/${payload.listingId}` : null,
      };
    }
    default:
      return { ...base, message: 'You have a new notification', href: null };
  }
}
