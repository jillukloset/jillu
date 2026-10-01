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
    <section className="bg-surface px-gutter py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="flex max-w-md flex-col items-start gap-9 text-left">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex gap-4">
              <span className="font-display text-sm text-accent-text">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p className="font-display text-2xl tracking-tight text-ink sm:text-3xl">{step.label}</p>
                <p className="mt-1 max-w-xs text-base text-muted">{step.description}</p>
              </div>
            </div>
          ))}

          <Link href={closetHref} className={buttonClassName('primary', 'lg', 'ml-9')}>
            OPEN YOUR CLOSET
          </Link>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-sm shrink-0 overflow-hidden rounded-lg bg-paper shadow-raised">
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
