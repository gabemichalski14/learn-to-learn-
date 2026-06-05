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

/** A little stage-based cheer so each page feels like forward motion. */
function encouragement(current: number, total: number): string {
  if (current === 0) return "let's go!";
  if (current >= total - 1) return 'last one!';
  if (current === total - 2) return 'almost done!';
  if (Math.abs(current - (total - 1) / 2) < 0.6) return 'halfway there!';
  return 'keep going!';
}

/**
 * A kid-readable "journey to the goal": stepping stones (one per page) lead to a
 * trophy at the end. A marker travels along with every correct answer so the
 * finish always feels in sight; each completed stone bounces + sparkles with a
 * check, and the trophy lights up at the end. Shown for the kid themes.
 */
export function ProgressTrail({ total, current, progress, roundDone, finished, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const stones = Array.from({ length: total }, (_, k) => k);

  const caption = finished
    ? 'You reached the goal! 🎉'
    : roundDone
      ? 'Nice! Tap Next →'
      : `Page ${current + 1} of ${total} — ${encouragement(current, total)}`;

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
          // The stone that just got completed is the current page's stone — only it
          // celebrates, so previously-done stones don't re-bounce on the next page.
          const justDone = done && k === current;
          const state = done ? 'done' : k === current ? 'current' : 'upcoming';
          return (
            <div
              key={k}
              className={`trail__stone trail__stone--${state}${justDone ? ' trail__stone--celebrate' : ''}`}
              style={{ left: `${(k / total) * 100}%` }}
            >
              {done && <span className="trail__check">✓</span>}
              {justDone && (
                <span className="trail__spark">
                  <i /><i /><i /><i />
                </span>
              )}
            </div>
          );
        })}

        <div className={`trail__goal${finished ? ' trail__goal--reached' : ''}`} style={{ left: '100%' }}>
          🏆
        </div>

        <div className="trail__marker" style={{ left: `${p * 100}%` }} />
      </div>

      <p className="trail__caption">{caption}</p>
    </div>
  );
}
