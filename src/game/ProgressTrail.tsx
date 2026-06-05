import type { CSSProperties } from 'react';

interface Props {
  /** How many pages (stones) are in the session. */
  total: number;
  /** Current page, 0-based. */
  current: number;
  /** 0..1 — overall session progress (drives the fill + travelling marker). */
  progress: number;
  /** The current page is complete (all items sorted). */
  roundDone: boolean;
  /** The whole session is finished (reached the goal). */
  finished: boolean;
  className?: string;
}

/**
 * A kid-readable "journey to the goal": stepping stones (one per page) lead to a
 * star at the end. A marker travels along with every correct answer so the
 * finish always feels in sight; completed stones light up with a check, and the
 * goal star lights up at the end. Shown for the kid themes (Playful / L2L).
 */
export function ProgressTrail({ total, current, progress, roundDone, finished, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const stones = Array.from({ length: total }, (_, k) => k);

  const caption = finished
    ? 'You reached the goal! 🎉'
    : roundDone
      ? 'Page done — tap Next!'
      : `Page ${current + 1} of ${total}${current === total - 1 ? ' — last one!' : ''}`;

  return (
    <div
      className={`trail${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={finished ? 'You reached the goal' : `Page ${current + 1} of ${total}`}
    >
      <div className="trail__rail" aria-hidden="true">
        <div className="trail__line" />
        <div className="trail__fill" style={{ width: `${p * 100}%` }} />

        {stones.map((k) => {
          const done = p >= (k + 1) / total - 1e-6;
          const state = done ? 'done' : k === current ? 'current' : 'upcoming';
          return (
            <div
              key={k}
              className={`trail__stone trail__stone--${state}`}
              style={{ left: `${(k / total) * 100}%` }}
            >
              {done && <span className="trail__check">✓</span>}
            </div>
          );
        })}

        <div className={`trail__goal${finished ? ' trail__goal--reached' : ''}`} style={{ left: '100%' }}>
          ★
        </div>

        <div className="trail__marker" style={{ left: `${p * 100}%` } as CSSProperties} />
      </div>

      <p className="trail__caption">{caption}</p>
    </div>
  );
}
