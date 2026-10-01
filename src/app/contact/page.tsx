import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = { title: 'Contact Us — Jillu Kloset' };

export default function ContactPage() {
  return (
    <PolicyPage title="Contact Us" updated="October 2026">
      <p>Got a question, found a bug, or just want to say hello? We&apos;d love to hear from you.</p>

      <section>
        <h2>General support</h2>
        <p>
          For help with your account, a listing, or an order, email us at{' '}
          <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
            support@jillukloset.shop
          </a>
          . We typically reply within 1–2 business days.
        </p>
      </section>

      <section>
        <h2>Before you write in</h2>
        <p>
          For most questions about buying or selling, our{' '}
          <a href="/help" className="font-semibold underline">
            Help Center
          </a>{' '}
          has quick answers. If your question is about a specific conversation or listing, message the other
          person directly first — most things sort themselves out that way.
        </p>
      </section>

      <section>
        <h2>Partnerships &amp; press</h2>
        <p>
          Interested in partnering with us? See our{' '}
          <a href="/partner" className="font-semibold underline">
            Partner Up
          </a>{' '}
          page.
        </p>
      </section>
    </PolicyPage>
  );
}
