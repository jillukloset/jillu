import Image from 'next/image';
import Link from 'next/link';
import { buttonClassName } from '@/components/ui/button';

const STEPS = [
  { label: 'CREATE', description: 'Build your own closet.' },
  { label: 'LIST', description: "Drop the pieces you're ready to let go." },
  { label: 'SELL', description: "Someone else's dream fit could be sitting in your wardrobe." },
];

export function OpenClosetSection({ closetHref }: { closetHref: string }) {
  return (
    <section className="px-gutter py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-md flex-col items-start gap-8 text-left">
          {STEPS.map((step) => (
            <div key={step.label}>
              <p className="font-display text-2xl tracking-tight text-ink sm:text-3xl">{step.label}</p>
              <p className="mt-1 text-base text-muted">{step.description}</p>
            </div>
          ))}

          <Link href={closetHref} className={buttonClassName('primary', 'lg')}>
            OPEN YOUR CLOSET
          </Link>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-sm shrink-0 overflow-hidden rounded-lg bg-surface">
          <Image
            src="/sell.png"
            alt="Open your closet"
            fill
            sizes="(min-width: 1024px) 384px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
