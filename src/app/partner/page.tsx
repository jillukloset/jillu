import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = {
  title: 'Partner Up',
  description: 'Partner with Jillu Kloset — for boutiques, thrift stores, creators, and brands supporting circular fashion.',
  alternates: { canonical: '/partner' },
};

export default function PartnerPage() {
  return (
    <PolicyPage title="Partner Up" updated="October 2026">
      <p>
        We&apos;re always open to working with people and businesses who care about giving fashion a second
        life. If that sounds like you, let&apos;s talk.
      </p>

      <section>
        <h2>Boutiques &amp; thrift stores</h2>
        <p>
          Already curating pre-loved pieces offline? We&apos;d love to help you reach a wider audience by
          bringing your closet online.
        </p>
      </section>

      <section>
        <h2>Creators &amp; stylists</h2>
        <p>
          If you build an audience around thrifting, styling, or sustainable fashion, we&apos;re interested in
          collaborations that go beyond a one-off post.
        </p>
      </section>

      <section>
        <h2>Brands</h2>
        <p>
          Looking to support circular fashion or run a resale/take-back program? Let&apos;s explore what that
          could look like on Jillu Kloset.
        </p>
      </section>

      <section>
        <h2>Get in touch</h2>
        <p>
          Email us at{' '}
          <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
            support@jillukloset.shop
          </a>{' '}
          with a bit about who you are and what you have in mind, and we&apos;ll get back to you.
        </p>
      </section>
    </PolicyPage>
  );
}
