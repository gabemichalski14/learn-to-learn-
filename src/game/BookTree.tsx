interface Puff { cx: number; cy: number; r: number; t: number }
interface Fruit { cx: number; cy: number; t: number; color: string }

/** Canopy puffs pop in to build a round, bushy crown as progress grows. */
const CANOPY: Puff[] = [
  { cx: 60, cy: 48, r: 21, t: 0.24 },
  { cx: 44, cy: 54, r: 15, t: 0.34 },
  { cx: 76, cy: 54, r: 15, t: 0.44 },
  { cx: 50, cy: 37, r: 14, t: 0.56 },
  { cx: 70, cy: 37, r: 14, t: 0.66 },
  { cx: 60, cy: 30, r: 13, t: 0.76 },
  { cx: 47, cy: 62, r: 12, t: 0.84 },
  { cx: 73, cy: 62, r: 12, t: 0.88 },
];

/** Fruit appears in the final stretch (shown only in the Playful theme via CSS). */
const FRUIT: Fruit[] = [
  { cx: 52, cy: 46, t: 0.86, color: '#ff5d8f' },
  { cx: 68, cy: 50, t: 0.90, color: '#ffd23f' },
  { cx: 60, cy: 38, t: 0.94, color: '#ff8a3d' },
  { cx: 46, cy: 57, t: 0.97, color: '#8a6bff' },
  { cx: 74, cy: 45, t: 0.99, color: '#36c5ff' },
];

interface Props {
  /** 0..1 — how grown the tree is. */
  progress: number;
  /** Brief celebratory bounce when the round is finished. */
  bloom?: boolean;
  className?: string;
}

/**
 * The Learn to Learn mark — a tree growing out of an open book — that doubles as
 * the game's progress meter: the trunk rises, a leafy canopy fills in, and (in
 * the Playful theme) colorful fruit pops near the end. Colors come from CSS vars
 * so each age-band theme restyles it; at progress=1 it's the full brand logo.
 */
export function BookTree({ progress, bloom = false, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const trunkScale = Math.min(1, 0.12 + p / 0.22); // small stub at the start, full by ~22%

  return (
    <svg className={className} viewBox="0 0 120 140" role="img" aria-label="A tree growing from a book">
      <g className={bloom ? 'tree--bloom' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* trunk + branches grow up from the book */}
        <g className="tree__trunk" style={{ transform: `scaleY(${trunkScale})` }}>
          <path d="M55,114 C 54,98 54,84 57,70 L63,70 C 66,84 66,98 65,114 Z" fill="var(--tree-trunk)" />
          <path d="M60,86 L48,74" stroke="var(--tree-trunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M60,80 L72,68" stroke="var(--tree-trunk)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>

        {/* leafy canopy */}
        {CANOPY.map((c, i) => {
          const shown = p >= c.t;
          return (
            <circle
              key={i}
              className="tree__leaf tree__puff"
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill="var(--tree-canopy)"
              stroke="var(--tree-canopy-edge)"
              strokeWidth="2"
              style={{ transformBox: 'fill-box', transformOrigin: 'center', opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.01)' }}
            />
          );
        })}

        {/* fruit (Playful only — gated in CSS) */}
        {FRUIT.map((f, i) => {
          const shown = p >= f.t;
          return (
            <circle
              key={`f${i}`}
              className="tree__leaf tree__fruit"
              cx={f.cx}
              cy={f.cy}
              r="3.6"
              fill={f.color}
              style={{ transformBox: 'fill-box', transformOrigin: 'center', opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.01)' }}
            />
          );
        })}

        {/* open book at the base */}
        <g stroke="var(--teal-deep)" strokeWidth="2" strokeLinejoin="round">
          <path d="M60,112 C 46,108 30,110 20,116 L20,127 C 32,122 47,120 60,124 Z" fill="#ffffff" />
          <path d="M60,112 C 74,108 90,110 100,116 L100,127 C 88,122 73,120 60,124 Z" fill="#ffffff" />
          <line x1="60" y1="112" x2="60" y2="124" />
        </g>
      </g>
    </svg>
  );
}
