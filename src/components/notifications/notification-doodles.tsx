import type { SVGProps } from 'react';

/**
 * Hand-drawn editorial flourishes (hearts, sparkles, squiggles, tape) used to
 * give the notifications page its collage/magazine feel. Pure inline SVG — no
 * external assets.
 */

export function HeartDoodle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...props}>
      <path d="M12 20.5s-7.2-4.4-9.6-8.8C1 8.2 2.3 4.9 5.3 3.8c2.1-.7 4.2.2 5.4 2l1.3 1.9 1.3-1.9c1.2-1.8 3.3-2.7 5.4-2 3 1.1 4.3 4.4 2.9 7.9-2.4 4.4-9.6 8.8-9.6 8.8Z" />
    </svg>
  );
}

export function SparkleDoodle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...props}>
      <path d="M12 3c.7 4.5 2.2 6.4 6.8 7-4.6.7-6.1 2.6-6.8 7-.7-4.4-2.2-6.3-6.8-7 4.6-.6 6.1-2.5 6.8-7Z" />
    </svg>
  );
}

export function SquiggleArrowDoodle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" {...props}>
      <path d="M4 30c8 2 12-10 20-8s8 10 16 8 10-8 14-6" />
      <path d="M48 17l6 7-9 3" />
    </svg>
  );
}

/** A strip of translucent masking tape, rendered purely with CSS. */
export function TapeStrip({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-6 w-24 bg-plum/10 backdrop-blur-[1px] ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgb(var(--color-plum-rgb) / 0.04) 0 2px, transparent 2px 6px)',
      }}
    />
  );
}
