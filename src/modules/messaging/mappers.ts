type ConversationRow = {
  id: string;
  updatedAt: Date;
  buyerId: string;
  sellerId: string;
  buyer: { profile: { username: string; displayName: string; avatarUrl: string | null } | null };
  seller: { profile: { username: string; displayName: string; avatarUrl: string | null } | null };
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: { url: string }[];
  };
  messages: { body: string; createdAt: Date; senderId: string }[];
  unreadCount: number;
};

export function toConversationListItem(row: ConversationRow, viewerId: string) {
  const isViewerBuyer = row.buyerId === viewerId;
  const otherProfile = isViewerBuyer ? row.seller.profile : row.buyer.profile;
  const lastMessage = row.messages[0] ?? null;

  return {
    id: row.id,
    updatedAt: row.updatedAt,
    otherParticipant: otherProfile
      ? {
          username: otherProfile.username,
          displayName: otherProfile.displayName,
          avatarUrl: otherProfile.avatarUrl,
        }
      : null,
    listing: {
      id: row.listing.id,
      title: row.listing.title,
      price: row.listing.price,
      currency: row.listing.currency,
      primaryImageUrl: row.listing.images[0]?.url ?? null,
    },
    lastMessage: lastMessage
      ? { body: lastMessage.body, createdAt: lastMessage.createdAt, isMine: lastMessage.senderId === viewerId }
      : null,
    unreadCount: row.unreadCount,
  };
}
