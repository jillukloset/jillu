import type { Metadata } from 'next';
import { PolicyPage } from '@/components/legal/policy-page';

export const metadata: Metadata = { title: 'About Us — Jillu Kloset' };

export default function AboutPage() {
  return (
    <PolicyPage title="About Us" updated="October 2026">
      <p>
        Jillu Kloset started from a simple idea: the best piece in your wardrobe might be the one someone else
        is looking for right now. We&apos;re building a home for pre-loved fashion — a place to give clothes
        another story instead of letting them sit unworn.
      </p>

      <section>
        <h2>What we believe</h2>
        <p>
          Fashion shouldn&apos;t have to be disposable. Every piece that gets resold instead of thrown away is
          one less thing in a landfill, and one more story for someone new. We&apos;re building Jillu Kloset for
          people who care about their closet — what&apos;s in it, where it came from, and where it goes next.
        </p>
      </section>

      <section>
        <h2>What we&apos;re building</h2>
        <p>
          Jillu Kloset is a place to discover pieces with character, and a place to pass on the ones you&apos;ve
          outgrown — literally or otherwise. No clutter, no fast-fashion churn, just closets talking to closets.
        </p>
      </section>

      <section>
        <h2>Get in touch</h2>
        <p>
          We&apos;re early, and we&apos;d love to hear from you — whether that&apos;s feedback, a question, or
          just to say hi. Reach us on our{' '}
          <a href="/contact" className="font-semibold underline">
            Contact page
          </a>
          .
        </p>
      </section>
    </PolicyPage>
  );
}
