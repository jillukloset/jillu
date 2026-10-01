import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = {
  title: 'How Jillu Kloset Works?',
  description: 'From creating your closet to listing, discovery, and messaging a buyer or seller directly — here’s the full Jillu Kloset flow.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  {
    title: '1. Create your closet',
    body: 'Sign up and set up your profile — a username, a photo, and a closet that\'s all yours. This is where everything you list will live.',
  },
  {
    title: '2. List what you\'re ready to let go',
    body: 'Add photos, a description, condition, size, and a price. The more honest and detailed your listing, the faster it finds the right buyer.',
  },
  {
    title: '3. Get discovered',
    body: 'Your listing shows up in search, explore, and vibe collections — wherever buyers are already looking for something like it.',
  },
  {
    title: '4. Message directly',
    body: 'Buyers message you right from the listing to ask questions, negotiate, and agree on how to pay and ship. No middleman, no waiting.',
  },
  {
    title: '5. Close the deal',
    body: 'Once you\'ve agreed on the details, arrange payment and shipping (or a local meetup) directly with the other person, and mark the listing sold.',
  },
];

export default function HowItWorksPage() {
  return (
    <PolicyPage title="How Jillu Kloset Works?" updated="October 2026">
      <p>
        Jillu Kloset connects people who have pieces to let go of with people looking for exactly that. Here&apos;s
        the whole flow, start to finish.
      </p>
      {STEPS.map((step) => (
        <section key={step.title}>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
        </section>
      ))}
      <p>
        Have more questions? Check our{' '}
        <a href="/help" className="font-semibold underline">
          Help Center
        </a>{' '}
        or{' '}
        <a href="/contact" className="font-semibold underline">
          get in touch
        </a>
        .
      </p>
    </PolicyPage>
  );
}
