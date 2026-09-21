import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppError } from '@/lib/api-result';
import { getConversationDetail, getConversationMessages } from '@/modules/messaging/service';
import { findBlock, isBlockedEitherWay } from '@/modules/social/block-repository';
import { ConversationView } from '@/components/messaging/conversation-view';

export const metadata: Metadata = { title: 'Conversation — Jillu Kloset' };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/messages/${conversationId}`);

  const viewerId = session.user.id;

  let conversation;
  try {
    conversation = await getConversationDetail(conversationId, viewerId);
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }

  const isViewerBuyer = conversation.buyerId === viewerId;
  const otherUser = isViewerBuyer ? conversation.seller : conversation.buyer;
  const otherProfile = otherUser.profile;

  const [{ items: messages }, blockedEitherWay, iBlockedThem] = await Promise.all([
    getConversationMessages(conversationId, viewerId),
    isBlockedEitherWay(viewerId, otherUser.id),
    findBlock(viewerId, otherUser.id),
  ]);

  return (
    <ConversationView
      conversationId={conversationId}
      viewerId={viewerId}
      otherUser={{
        id: otherUser.id,
        username: otherProfile?.username ?? 'unknown',
        displayName: otherProfile?.displayName ?? 'Deleted user',
        avatarUrl: otherProfile?.avatarUrl ?? null,
      }}
      listing={{
        id: conversation.listing.id,
        title: conversation.listing.title,
        price: conversation.listing.price,
        currency: conversation.listing.currency,
        primaryImageUrl: conversation.listing.images[0]?.url ?? null,
      }}
      initialMessages={messages}
      canMessage={!blockedEitherWay}
      iBlockedThem={Boolean(iBlockedThem)}
    />
  );
}
