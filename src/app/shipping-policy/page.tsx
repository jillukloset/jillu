import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'How shipping and local pickup work on Jillu Kloset — arranged directly between buyer and seller.',
  alternates: { canonical: '/shipping-policy' },
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy" updated="October 2026">
      <p>
        Jillu Kloset doesn&apos;t handle shipping or logistics directly. Buyers and sellers arrange shipping
        (or local pickup) themselves once they&apos;ve agreed on a sale through messaging.
      </p>

      <section>
        <h2>For sellers</h2>
        <ul>
          <li>Agree on a shipping method, carrier, and cost with the buyer before marking an item as reserved.</li>
          <li>Pack items securely and ship within the timeframe you agreed on.</li>
          <li>Share tracking information with the buyer as soon as it&apos;s available.</li>
          <li>List your general location accurately so buyers know roughly where an item is shipping from.</li>
        </ul>
      </section>

      <section>
        <h2>For buyers</h2>
        <ul>
          <li>Confirm the shipping cost and estimated timeline with the seller before paying.</li>
          <li>Provide an accurate shipping address.</li>
          <li>Message the seller if a tracked item hasn&apos;t arrived within the expected window.</li>
        </ul>
      </section>

      <section>
        <h2>Local pickup &amp; meetups</h2>
        <p>
          Some sellers offer local pickup. If you arrange to meet in person, choose a public place and let
          someone know your plans, same as with any online marketplace.
        </p>
      </section>

      <p>
        Since shipping happens directly between buyer and seller, Jillu Kloset can&apos;t track packages or
        guarantee delivery — if a shipment goes wrong, start with the seller, and report the listing if it
        can&apos;t be resolved.
      </p>
    </PolicyPage>
  );
}
