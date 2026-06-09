import { useState } from 'react';
import './wordPicture.css';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * A word's picture: the painted illustration when we have one
 * (`public/images/words/<word>.png`), with a graceful emoji fallback so every
 * word always shows something. Replaces the old emoji-only pictures AND the
 * generic SVG creature icons. Keyed by the spoken word (label) — matching the
 * recorded audio clips — so the same word reuses one image across packs.
 */
export function WordPicture({ label, emoji, className = '' }: {
  /** unused; kept so call sites can pass it harmlessly */ id?: string;
  label: string;
  emoji: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored || !label) {
    return <span className={`wpic wpic--emoji ${className}`} role="img" aria-label="">{emoji}</span>;
  }
  return (
    <img
      className={`wpic ${className}`}
      src={`/images/words/${slug(label)}.png`}
      alt=""
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
