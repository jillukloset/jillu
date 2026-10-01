import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = { title: 'Privacy Policy — Jillu Kloset' };

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="October 2026">
      <p>
        This Privacy Policy explains what information Jillu Kloset collects, how we use it, and the choices you
        have.
      </p>

      <section>
        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account information:</strong> email address, username, display name, and password (stored
            as a secure hash, never in plain text). If you sign in with Google, we receive your name and email
            from Google instead.
          </li>
          <li>
            <strong>Profile information:</strong> anything you add to your profile, such as a bio, avatar, and
            location.
          </li>
          <li>
            <strong>Listing &amp; activity data:</strong> listings you create, photos you upload, items you
            like, save, or follow, and messages you send to other users.
          </li>
          <li>
            <strong>Usage data:</strong> basic interactions like listing views, used to power features such as
            trending items.
          </li>
          <li>
            <strong>Reports:</strong> information you submit when reporting a listing, user, or message.
          </li>
        </ul>
      </section>

      <section>
        <h2>2. How we use your information</h2>
        <ul>
          <li>To operate core features: listings, search, messaging, notifications, and your profile/closet.</li>
          <li>To send account-related emails, such as email verification and password resets.</li>
          <li>To detect and act on fraud, abuse, and violations of our Terms of Use.</li>
          <li>To maintain the security and reliability of the Service.</li>
        </ul>
      </section>

      <section>
        <h2>3. What we don&apos;t do</h2>
        <p>
          We don&apos;t sell your personal information. We don&apos;t process payments on the platform, so we
          never see or store your payment details for transactions you arrange with other users.
        </p>
      </section>

      <section>
        <h2>4. Sharing</h2>
        <ul>
          <li>
            <strong>Other users:</strong> your username, profile, and listings are visible to other users by
            design. Messages are only visible to you and the person you&apos;re messaging.
          </li>
          <li>
            <strong>Service providers:</strong> we use third-party providers for things like email delivery and
            image storage, who process data on our behalf under their own confidentiality obligations.
          </li>
          <li>
            <strong>Legal reasons:</strong> we may disclose information if required by law or to protect the
            rights, safety, or property of Jillu Kloset or our users.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Your choices</h2>
        <ul>
          <li>You can edit or delete your profile information from Settings at any time.</li>
          <li>You can block another user to stop them from messaging you or seeing your activity toward them.</li>
          <li>You can request deletion of your account by contacting us.</li>
        </ul>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          We retain account and activity data for as long as your account is active, or as needed to comply
          with legal obligations, resolve disputes, and enforce our agreements.
        </p>
      </section>

      <section>
        <h2>7. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We&apos;ll update the &quot;last updated&quot;
          date above when we do.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Questions about this policy or your data? Reach us at{' '}
          <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
            support@jillukloset.shop
          </a>
          .
        </p>
      </section>
    </PolicyPage>
  );
}
