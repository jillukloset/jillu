import type { SVGProps } from 'react';

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 20.5s-7.5-4.6-10-9.2C.5 8 1.8 4.5 5 3.4c2.2-.8 4.4.1 5.6 1.9l1.4 2 1.4-2c1.2-1.8 3.4-2.7 5.6-1.9 3.2 1.1 4.5 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2Z" />
    </svg>
  );
}

export function HeartFilledIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ ...props, fill: 'currentColor', stroke: 'none' })}>
      <path d="M12 20.5s-7.5-4.6-10-9.2C.5 8 1.8 4.5 5 3.4c2.2-.8 4.4.1 5.6 1.9l1.4 2 1.4-2c1.2-1.8 3.4-2.7 5.6-1.9 3.2 1.1 4.5 4.6 3 7.9-2.5 4.6-10 9.2-10 9.2Z" />
    </svg>
  );
}

export function MessageIcon({ width = 24, height = 24, className }: SVGProps<SVGSVGElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/message-icon.png" alt="" width={Number(width)} height={Number(height)} className={className} />
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.6-3.6 4.8-5.5 8-5.5s6.4 1.9 8 5.5" />
    </svg>
  );
}

export function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
    </svg>
  );
}

export function GridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function PlusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h10M18 6h2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12h2M10 12h10" />
      <circle cx="8" cy="12" r="2" />
      <path d="M4 18h10M18 18h2" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SavedBagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ ...props, stroke: '#1a1a1a', strokeWidth: 1.1 })}>
      <path d="M8 8V6.5a4 4 0 0 1 8 0V8" fill="none" stroke="#1a1a1a" strokeWidth="3.4" />
      <path d="M8 8V6.5a4 4 0 0 1 8 0V8" fill="none" stroke="#ff4fa0" strokeWidth="1.6" />
      <path d="M4.2 8.2h15.6l1.2 12a.9.9 0 0 1-.9 1H3.9a.9.9 0 0 1-.9-1l1.2-12Z" fill="#c2185b" />
      <path d="m12 10.5 3 2.2v6.6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6.6l3-2.2Z" fill="#ff4fa0" />
      <path d="M12 18.2s-2-1.2-2-2.6a1.1 1.1 0 0 1 2-.6 1.1 1.1 0 0 1 2 .6c0 1.4-2 2.6-2 2.6Z" fill="#f8b6d6" strokeWidth="0.6" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5L19.5 7" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 3.5h7.6a2 2 0 0 1 1.4.6l7.5 7.5a2 2 0 0 1 0 2.8l-5.7 5.7a2 2 0 0 1-2.8 0L4 12.6a2 2 0 0 1-.6-1.4V3.5Z" />
      <circle cx="8.3" cy="8.3" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
