import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-gutter py-12">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="Jillu Kloset home" className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="Jillu Kloset" width={72} height={72} priority className="h-[72px] w-[72px] rounded-full object-cover" />
        </Link>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">{children}</div>
      </div>
    </div>
  );
}
