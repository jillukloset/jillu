import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { AvatarUploader } from '@/components/closet/avatar-uploader';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Edit profile — Jillu Kloset' };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/settings/profile');

  const profile = await db.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect('/');

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-gutter py-12">
      <div>
        <h1 className="font-display text-2xl">Edit profile</h1>
        <p className="text-sm text-muted">This is what people see on your closet.</p>
      </div>

      <AvatarUploader currentAvatarUrl={profile.avatarUrl} displayName={profile.displayName} />

      <ProfileForm
        initial={{
          displayName: profile.displayName,
          bio: profile.bio ?? '',
          location: profile.location ?? '',
        }}
      />
    </div>
  );
}
