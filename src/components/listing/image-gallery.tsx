'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export function ImageGallery({ images, title }: { images: { url: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface">
        {current ? (
          <Image src={current.url} alt={title} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActive(index)}
              className={clsx(
                'relative h-16 w-14 shrink-0 overflow-hidden rounded-md border-2',
                index === active ? 'border-ink' : 'border-transparent',
              )}
              aria-label={`View photo ${index + 1}`}
              aria-current={index === active}
            >
              <Image src={image.url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
