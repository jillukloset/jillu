import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = {
  title: 'Returns Policy',
  description: 'How returns work on Jillu Kloset — arranged directly between buyer and seller.',
  alternates: { canonical: '/returns-policy' },
};

export default function ReturnsPolicyPage() {
  return (
    <PolicyPage title="Returns Policy" updated="October 2026">
      <p>
        Jillu Kloset is a platform for discovering listings and messaging sellers directly — we don&apos;t process
        payments, shipping, or returns on your behalf. Return terms for any item are set by agreement between
        the buyer and the seller.
      </p>

      <section>
        <h2>Before you buy</h2>
        <p>
          Ask the seller questions about condition, measurements, and any flaws before committing to buy, and
          agree on a return policy (if any) up front. Listings should accurately describe the item&apos;s
          condition — if something arrives significantly different from how it was described, that&apos;s
          something to raise with the seller first.
        </p>
      </section>

      <section>
        <h2>If an item isn&apos;t as described</h2>
        <ul>
          <li>Message the seller with photos and a description of the issue as soon as you notice it.</li>
          <li>Most sellers are happy to work out a fair resolution directly.</li>
          <li>
            If you can&apos;t reach an agreement, you can report the listing or the conversation using the
            &quot;Report&quot; option, and our team will take a look.
          </li>
        </ul>
      </section>

      <section>
        <h2>What Jillu Kloset does and doesn&apos;t do</h2>
        <p>
          We don&apos;t hold funds, issue refunds, or arrange return shipping. We do moderate listings and
          accounts, and may suspend sellers who repeatedly misrepresent items or fail to resolve legitimate
          disputes.
        </p>
      </section>

      <p>
        Questions about a specific order? Message the seller first, or reach us at{' '}
        <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
          support@jillukloset.shop
        </a>
        .
      </p>
    </PolicyPage>
  );
}
