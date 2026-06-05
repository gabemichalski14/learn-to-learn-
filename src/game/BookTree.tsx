interface Puff { cx: number; cy: number; r: number; t: number }
interface Fruit { cx: number; cy: number; t: number; color: string }

/**
 * Canopy blobs that build a full, rounded crown. The first three (t = 0) are
 * always present so it reads as a real little tree from the very start; the
 * rest pop in as progress grows, filling the crown out lush.
 */
const CANOPY: Puff[] = [
  { cx: 60, cy: 50, r: 22, t: 0 },     // core
  { cx: 44, cy: 56, r: 15, t: 0 },     // lower-left
  { cx: 76, cy: 56, r: 15, t: 0 },     // lower-right
  { cx: 49, cy: 38, r: 16, t: 0.16 },  // upper-left
  { cx: 71, cy: 38, r: 16, t: 0.30 },  // upper-right
  { cx: 60, cy: 31, r: 15, t: 0.44 },  // top
  { cx: 37, cy: 60, r: 12, t: 0.54 },  // far lower-left
  { cx: 83, cy: 60, r: 12, t: 0.62 },  // far lower-right
  { cx: 52, cy: 63, r: 12, t: 0.72 },  // bottom fill
  { cx: 68, cy: 63, r: 12, t: 0.80 },  // bottom fill
  { cx: 46, cy: 28, r: 10, t: 0.88 },  // top-left tuft
  { cx: 74, cy: 28, r: 10, t: 0.94 },  // top-right tuft
];

/** Soft sunlit highlights on the upper-left of the crown for depth. */
const HIGHLIGHTS: Puff[] = [
  { cx: 52, cy: 43, r: 7, t: 0 },
  { cx: 45, cy: 50, r: 5, t: 0.16 },
];

/** Fruit appears in the final stretch (shown only in the Playful theme via CSS). */
const FRUIT: Fruit[] = [
  { cx: 50, cy: 48, t: 0.86, color: '#ff5d8f' },
  { cx: 68, cy: 46, t: 0.90, color: '#ffd23f' },
  { cx: 60, cy: 36, t: 0.94, color: '#ff8a3d' },
  { cx: 44, cy: 54, t: 0.97, color: '#8a6bff' },
  { cx: 74, cy: 52, t: 0.99, color: '#36c5ff' },
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
 * the game's progress meter. The trunk and branches are always there, and the
 * leafy crown fills out (then, in the Playful theme, fruits up) as progress
 * grows. Colors come from CSS vars so each age-band theme restyles it.
 */
export function BookTree({ progress, bloom = false, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));

  return (
    <svg className={className} viewBox="0 0 120 140" role="img" aria-label="A tree growing from a book">
      <g className={bloom ? 'tree--bloom' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* trunk + branches grow up from the book */}
        <g className="tree__trunk">
          <path
            d="M53,118 C 53,103 53,90 57,72 L63,72 C 67,90 67,103 67,118 Z"
            fill="var(--tree-trunk)"
          />
          <path d="M59,90 C 53,86 49,81 46,75" stroke="var(--tree-trunk)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M61,84 C 67,80 71,76 74,71" stroke="var(--tree-trunk)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
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

        {/* sunlit highlights */}
        {HIGHLIGHTS.map((h, i) => {
          const shown = p >= h.t;
          return (
            <circle
              key={`h${i}`}
              className="tree__leaf"
              cx={h.cx}
              cy={h.cy}
              r={h.r}
              fill="rgba(255,255,255,0.28)"
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
          <path d="M60,116 C 49,112 36,114 30,119 L30,128 C 39,124 50,122 60,125 Z" fill="#ffffff" />
          <path d="M60,116 C 71,112 84,114 90,119 L90,128 C 81,124 70,122 60,125 Z" fill="#ffffff" />
          <line x1="60" y1="116" x2="60" y2="125" />
        </g>
      </g>
    </svg>
  );
}
