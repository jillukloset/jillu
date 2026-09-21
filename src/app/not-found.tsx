import Link from 'next/link';
import { buttonClassName } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-gutter text-center">
      <p className="font-display text-3xl">Nothing here</p>
      <p className="text-sm text-muted">
        This piece may have sold, been taken down, or the link isn&rsquo;t quite right.
      </p>
      <Link href="/explore" className={buttonClassName('primary', 'md', 'mt-2')}>
        Explore Jillu
      </Link>
    </div>
  );
}
