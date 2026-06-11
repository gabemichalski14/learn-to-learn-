import { useState } from 'react';
import './icon.css';

/**
 * A UI icon: the painted PNG at `/images/ui/<name>.png` when present, with a
 * graceful EMOJI fallback so nothing breaks before (or without) the asset —
 * the same pattern as WordPicture. Sized to 1em by default, so wherever it
 * replaces an inline emoji it inherits that spot's font-size (a 34px emoji
 * becomes a 34px icon); pass a sizing className to override.
 *
 * Decorative by default (aria-hidden). Pass `label` for a standalone meaningful
 * icon (e.g. a button whose only content is the icon).
 */
export function Icon({ name, emoji, className = '', label }: {
  /** file stem under /images/ui, e.g. "ico-hear". */
  name: string;
  emoji: string;
  className?: string;
  label?: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored || !name) {
    return (
      <span className={`uicon uicon--emoji ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>{emoji}</span>
    );
  }
  return (
    <img
      className={`uicon ${className}`}
      src={`/images/ui/${name}.png`}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}
