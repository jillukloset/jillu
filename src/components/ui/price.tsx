const formatters: Record<string, Intl.NumberFormat> = {};

function formatterFor(currency: string) {
  if (!formatters[currency]) {
    formatters[currency] = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
  }
  return formatters[currency];
}

export function formatPrice(amount: number, currency = 'INR') {
  return formatterFor(currency).format(amount);
}

export function Price({ amount, currency = 'INR', className }: { amount: number; currency?: string; className?: string }) {
  return <span className={className}>{formatPrice(amount, currency)}</span>;
}
