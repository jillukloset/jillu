import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = { title: 'Help Center — Jillu Kloset' };

const FAQS = [
  {
    q: 'How does buying on Jillu Kloset work?',
    a: 'Browse listings, like or save the ones you want to keep an eye on, and message the seller directly from the listing page to ask questions, negotiate, and arrange payment and shipping. Jillu Kloset is a discovery and messaging platform — we connect buyers and sellers, but the transaction itself happens directly between you and the other person.',
  },
  {
    q: 'How do I sell something?',
    a: 'Tap "Sell" to create a listing: add at least 4 photos, a title, description, category, size, condition, and price. Once published, buyers can find it through search, explore, and your closet, and message you to buy.',
  },
  {
    q: 'How do payments work?',
    a: "Jillu Kloset doesn't process payments on your behalf in this version of the app. Buyers and sellers agree on a payment method directly through messaging. Use trusted, trackable payment methods and avoid sending money before agreeing on the details.",
  },
  {
    q: 'What if an item doesn\'t match its listing?',
    a: "Message the seller first — most issues get sorted out directly. If that doesn't resolve things, see our Returns Policy, and you can report a listing or a user from the listing or profile page if something seems wrong.",
  },
  {
    q: 'How do I report a user or listing?',
    a: 'Use the "Report" option on a listing, profile, or conversation. Our team reviews every report.',
  },
  {
    q: 'I\'m not receiving messages or notifications — what do I check?',
    a: 'Make sure notifications are enabled in Settings, and check that you haven\'t accidentally blocked the other user. If messages still aren\'t coming through, contact us at support@jillukloset.shop.',
  },
];

export default function HelpCenterPage() {
  return (
    <PolicyPage title="Help Center" updated="October 2026">
      <p>
        Find answers to common questions below. Can&apos;t find what you&apos;re looking for? Reach us at{' '}
        <a href="mailto:support@jillukloset.shop" className="font-semibold underline">
          support@jillukloset.shop
        </a>
        .
      </p>
      {FAQS.map((item) => (
        <section key={item.q}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}
    </PolicyPage>
  );
}
