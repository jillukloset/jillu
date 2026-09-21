'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MessageComposer({
  disabled,
  disabledReason,
  onSend,
}: {
  disabled?: boolean;
  disabledReason?: string;
  onSend: (body: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const body = value.trim();
    if (!body) return;
    // Clear immediately (not after the round trip) so a message typed while this one is
    // still sending is never wiped out by this call's own completion.
    setValue('');
    setSending(true);
    setError(null);
    const ok = await onSend(body);
    setSending(false);
    if (!ok) {
      setValue((current) => current || body);
      setError("Couldn't send. Try again.");
    }
  };

  if (disabled) {
    return (
      <div className="sticky bottom-16 z-20 border-t border-border bg-paper px-gutter py-4 text-center text-sm text-muted md:bottom-0">
        {disabledReason ?? 'Messaging is unavailable in this conversation.'}
      </div>
    );
  }

  return (
    <div className="sticky bottom-16 z-20 border-t border-border bg-paper px-gutter py-3 md:bottom-0">
      {error ? <p role="alert" className="mb-2 text-xs text-danger">{error}</p> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Type a message…"
          aria-label="Type a message"
          className="max-h-32 flex-1 resize-none rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <Button type="submit" loading={sending} disabled={!value.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
