import { Echo } from './Echo';

/**
 * A one-shot Echo sparkle for "a sound just happened" moments inside the games.
 * Pure CSS appear+fade (no effects/timers) — mount it with a changing `key` to
 * replay. Position it via `className` (consumer supplies an absolute spot).
 */
export function EchoTwinkle({ className = '' }: { className?: string }) {
  return (
    <span className={`echo-twinkle ${className}`} aria-hidden="true">
      <Echo size={46} alive={false} />
    </span>
  );
}
