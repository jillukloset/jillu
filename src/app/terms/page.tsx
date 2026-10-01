import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The terms that govern your use of Jillu Kloset.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Use" updated="October 2026">
      <p>
        These Terms of Use (&quot;Terms&quot;) govern your access to and use of Jillu Kloset (the
        &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms.
      </p>

      <section>
        <h2>1. The Service</h2>
        <p>
          Jillu Kloset is a platform for listing, discovering, and messaging about pre-loved fashion items.
          Jillu Kloset does not buy, sell, own, authenticate, inspect, process payment for, or ship any item
          listed on the Service. Transactions are arranged directly between buyers and sellers, who are solely
          responsible for the terms, payment, delivery, and quality of any item they exchange.
        </p>
      </section>

      <section>
        <h2>2. Accounts</h2>
        <ul>
          <li>You must provide accurate information when creating an account and keep it up to date.</li>
          <li>You&apos;re responsible for activity under your account and for keeping your credentials secure.</li>
          <li>You must be old enough to form a binding contract in your jurisdiction to use the Service.</li>
        </ul>
      </section>

      <section>
        <h2>3. Listings and conduct</h2>
        <ul>
          <li>Listings must accurately describe the item, including its condition and any defects.</li>
          <li>You may not list counterfeit, stolen, illegal, or prohibited items.</li>
          <li>You may not use the Service to harass, scam, or defraud other users.</li>
          <li>
            We may remove listings, suspend accounts, or take other action against content or conduct that
            violates these Terms or our other policies.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Transactions between users</h2>
        <p>
          Any agreement to buy or sell an item — including price, payment method, shipping, and returns — is
          solely between the buyer and seller. Jillu Kloset is not a party to that agreement and is not
          responsible for a user&apos;s failure to pay, ship, or deliver an item as described. See our{' '}
          <a href="/returns-policy" className="font-semibold underline">
            Returns Policy
          </a>{' '}
          and{' '}
          <a href="/shipping-policy" className="font-semibold underline">
            Shipping Policy
          </a>{' '}
          for more detail.
        </p>
      </section>

      <section>
        <h2>5. Content you post</h2>
        <p>
          You retain ownership of the photos, descriptions, and messages you post, but you grant Jillu Kloset a
          license to host and display that content as part of operating the Service. You&apos;re responsible
          for having the rights to anything you post.
        </p>
      </section>

      <section>
        <h2>6. Termination</h2>
        <p>
          We may suspend or terminate your account for violating these Terms, engaging in fraud or abuse, or at
          our discretion to protect the Service and its users.
        </p>
      </section>

      <section>
        <h2>7. Disclaimers &amp; limitation of liability</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. To the fullest extent
          permitted by law, Jillu Kloset is not liable for any disputes, losses, or damages arising from
          transactions between users or from items listed on the Service.
        </p>
      </section>

      <section>
        <h2>8. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continuing to use the Service after changes take effect
          means you accept the updated Terms.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Questions about these Terms? Reach us at{' '}
          <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
            support@jillukloset.shop
          </a>
          .
        </p>
      </section>
    </PolicyPage>
  );
}
