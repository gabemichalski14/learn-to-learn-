/** Themed, animated emblem for a level card. Level 2 = bespoke space scene;
 *  other levels = a curriculum-themed glyph. Decorative (aria-hidden). */
const LEVEL_EMOJI: Record<number, string> = {
  1: '👂', 3: '🧱', 4: '✂️', 5: '➕', 6: '🤫', 7: '👑', 8: '🧩', 9: '🌍', 10: '🏛️',
};

export function LevelEmblem({ level }: { level: number }) {
  if (level === 2) {
    return (
      <span className="level-emblem level-emblem--space" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="30" height="30">
          <circle className="le-star" cx="9" cy="10" r="1.6" fill="#ffffff" />
          <circle className="le-star le-star--2" cx="40" cy="13" r="1.2" fill="#bfeef4" />
          <circle className="le-star le-star--3" cx="13" cy="40" r="1.1" fill="#bfeef4" />
          {/* planet + ring (lower-left) */}
          <circle cx="17" cy="31" r="8" fill="#6f8ad6" />
          <circle cx="14.5" cy="28.5" r="2.4" fill="#8aa0e0" opacity="0.7" />
          <ellipse cx="17" cy="31" rx="12.5" ry="3.6" fill="none" stroke="#bfe9f0" strokeWidth="1.3" transform="rotate(-22 17 31)" />
          {/* rocket (upper-right) */}
          <g className="le-rocket">
            <path d="M33 15 q3 0 3 6 v7 h-6 v-7 q0-6 3-6z" fill="#eaf6f8" />
            <circle cx="33" cy="21" r="1.7" fill="#2b6f8a" />
            <path d="M30 27 l-2.6 4 2.6 -1 z" fill="#22c1d6" />
            <path d="M36 27 l2.6 4 -2.6 -1 z" fill="#22c1d6" />
            <path d="M31 28 h4 l-2 5 z" className="le-flame" fill="#ffb24a" />
          </g>
        </svg>
      </span>
    );
  }
  return <span className="level-emblem" aria-hidden="true">{LEVEL_EMOJI[level] ?? '⭐'}</span>;
}
