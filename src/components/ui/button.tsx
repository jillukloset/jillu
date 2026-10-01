import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export function buttonClassName(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-[transform,box-shadow] duration-fast disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none',
    {
      'bg-ink text-paper shadow-card hover:scale-[1.02] hover:shadow-raised active:scale-[0.98]': variant === 'primary',
      'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper hover:shadow-card': variant === 'secondary',
      'bg-transparent text-ink hover:bg-surface': variant === 'ghost',
      'bg-danger text-white shadow-card hover:scale-[1.02] hover:shadow-raised active:scale-[0.98]': variant === 'danger',
    },
    {
      'px-4 py-2 text-sm': size === 'sm',
      'px-6 py-3 text-sm': size === 'md',
      'px-8 py-4 text-base': size === 'lg',
    },
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={buttonClassName(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
