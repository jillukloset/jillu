'use client';

import { useRef, useState } from 'react';
import { SearchIcon } from '@/components/icons';

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const iconButton =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:text-black/70';

export function SearchBar({ defaultValue, className }: { defaultValue?: string; className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [listening, setListening] = useState(false);

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = (window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    });
    const Recognition = Ctor.SpeechRecognition ?? Ctor.webkitSpeechRecognition;
    if (!Recognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript && inputRef.current) {
        inputRef.current.value = transcript;
        formRef.current?.requestSubmit();
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  return (
    <form ref={formRef} action="/search" method="GET" className={className} role="search">
      <label htmlFor="site-search" className="sr-only">
        Search Jillu Kloset
      </label>
      <div className="flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-ink">
        <SearchIcon width={18} height={18} className="shrink-0 text-muted" />
        <input
          ref={inputRef}
          id="site-search"
          type="text"
          autoComplete="off"
          name="q"
          defaultValue={defaultValue}
          placeholder="black oversized hoodie, Nike jacket, Y2K…"
          className="min-w-0 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" />
        <button type="button" aria-label="Search with camera" onClick={() => cameraRef.current?.click()} className={iconButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={listening ? 'Stop voice search' : 'Search with voice'}
          aria-pressed={listening}
          onClick={toggleVoice}
          className={`${iconButton} ${listening ? 'animate-pulse' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
