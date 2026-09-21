'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const REASONS: { value: string; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'COUNTERFEIT', label: 'Counterfeit item' },
  { value: 'PROHIBITED_ITEM', label: 'Prohibited item' },
  { value: 'MISLEADING', label: 'Misleading listing' },
  { value: 'SCAM', label: 'Scam attempt' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'OTHER', label: 'Other' },
];

export function ReportDialog({
  targetType,
  targetId,
  triggerLabel,
  triggerClassName,
  isLoggedIn,
}: {
  targetType: 'LISTING' | 'USER';
  targetId: string;
  triggerLabel: string;
  triggerClassName?: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState('SPAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const open = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setState('idle');
    setReason('SPAM');
    setDetails('');
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const url = targetType === 'LISTING' ? `/api/listings/${targetId}/report` : `/api/users/${targetId}/report`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, details: details.trim() || undefined }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok || !json.success) {
      setState('error');
      setErrorMessage(json.error?.message ?? 'Something went wrong. Please try again.');
      return;
    }
    setState('success');
  };

  return (
    <>
      <button type="button" onClick={open} className={triggerClassName ?? 'text-xs font-semibold text-muted underline hover:text-danger'}>
        {triggerLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="w-full max-w-sm rounded-lg border border-border bg-surface p-0 text-ink backdrop:bg-ink/40"
      >
        {state === 'success' ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="font-display text-xl">Thanks for letting us know</p>
            <p className="text-sm text-muted">Our team will review this report.</p>
            <Button type="button" onClick={close} variant="secondary" className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4 p-6">
            <h2 className="font-display text-xl">Report {targetType === 'LISTING' ? 'this listing' : 'this user'}</h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-reason" className="text-sm font-semibold">
                Reason
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-md border border-border bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="report-details" className="text-sm font-semibold">
                Details (optional)
              </label>
              <textarea
                id="report-details"
                rows={3}
                maxLength={1000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="rounded-md border border-border bg-paper px-3 py-2 text-sm focus:border-ink focus:outline-none"
              />
            </div>

            {state === 'error' ? <p className="text-xs text-danger">{errorMessage}</p> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Submit report
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
