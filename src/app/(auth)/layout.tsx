import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-gutter py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-3xl tracking-tight text-ink">
          JILLU
        </Link>
        <div className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-8">{children}</div>
      </div>
    </div>
  );
}
