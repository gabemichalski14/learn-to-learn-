interface Leaf { x: number; y: number; rot: number; t: number; }
interface Blossom { x: number; y: number; t: number; }

/** Leaves splay up the stem into a canopy; each unfurls once progress passes `t`. */
const LEAVES: Leaf[] = [
  { x: 60, y: 86, rot: -58, t: 0.05 },
  { x: 60, y: 86, rot: 58, t: 0.11 },
  { x: 60, y: 78, rot: -54, t: 0.18 },
  { x: 60, y: 78, rot: 54, t: 0.25 },
  { x: 60, y: 70, rot: -50, t: 0.33 },
  { x: 60, y: 70, rot: 50, t: 0.40 },
  { x: 60, y: 62, rot: -45, t: 0.48 },
  { x: 60, y: 62, rot: 45, t: 0.55 },
  { x: 60, y: 54, rot: -40, t: 0.62 },
  { x: 60, y: 54, rot: 40, t: 0.69 },
  { x: 60, y: 46, rot: -32, t: 0.76 },
  { x: 60, y: 46, rot: 32, t: 0.82 },
  { x: 60, y: 38, rot: -22, t: 0.88 },
  { x: 60, y: 38, rot: 22, t: 0.93 },
];

/** Blossoms appear in the final stretch as a reward for finishing. */
const BLOSSOMS: Blossom[] = [
  { x: 51, y: 44, t: 0.84 },
  { x: 69, y: 48, t: 0.90 },
  { x: 60, y: 30, t: 0.97 },
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
 * the game's progress meter. As the child sorts correctly, the stem draws upward,
 * leaves unfurl into a canopy, and blossoms open near the end. At progress=1 it's
 * the full brand logo.
 */
export function BookTree({ progress, bloom = false, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const reveal = 0.08 + 0.92 * p; // a small sprout is always visible

  return (
    <svg className={className} viewBox="0 0 120 132" role="img" aria-label="A tree growing from a book">
      <g className={bloom ? 'tree--bloom' : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        <path
          className="tree__stem"
          d="M60,98 C 56,78 64,52 60,20"
          fill="none"
          stroke="var(--teal-deep)"
          strokeWidth="3.6"
          strokeLinecap="round"
          pathLength={100}
          style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - reveal) }}
        />

        {LEAVES.map((lf, i) => {
          const shown = p >= lf.t;
          return (
            <g key={i} transform={`translate(${lf.x} ${lf.y}) rotate(${lf.rot})`}>
              <g className="tree__leaf" style={{ opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.01)' }}>
                <path
                  d="M0,0 C 7,-3 8,-15 0,-22 C -8,-15 -7,-3 0,0 Z"
                  fill="var(--teal)"
                  stroke="var(--teal-deep)"
                  strokeWidth="1.4"
                />
                <path d="M0,-3 L0,-17" stroke="var(--teal-deep)" strokeWidth="1" fill="none" />
              </g>
            </g>
          );
        })}

        {BLOSSOMS.map((b, i) => {
          const shown = p >= b.t;
          return (
            <g key={`b${i}`} transform={`translate(${b.x} ${b.y})`}>
              <g className="tree__leaf" style={{ opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.01)' }}>
                <circle r="3.4" fill="#ffffff" stroke="var(--teal-deep)" strokeWidth="1.3" />
                <circle r="1.5" fill="var(--teal-deep)" />
              </g>
            </g>
          );
        })}

        {/* open book in front of the stem base */}
        <g stroke="var(--teal-deep)" strokeWidth="2" strokeLinejoin="round">
          <path d="M60,96 C 46,92 30,94 20,100 L20,111 C 32,106 47,104 60,108 Z" fill="#ffffff" />
          <path d="M60,96 C 74,92 90,94 100,100 L100,111 C 88,106 73,104 60,108 Z" fill="#ffffff" />
          <line x1="60" y1="96" x2="60" y2="108" />
        </g>
      </g>
    </svg>
  );
}
