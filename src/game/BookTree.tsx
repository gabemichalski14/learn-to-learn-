interface Leaf { x: number; y: number; rot: number; t: number; }

/** Leaves splay up the stem; each appears once progress passes its threshold `t`. */
const LEAVES: Leaf[] = [
  { x: 59, y: 72, rot: -52, t: 0.12 },
  { x: 61, y: 70, rot: 52, t: 0.26 },
  { x: 58, y: 58, rot: -54, t: 0.42 },
  { x: 62, y: 56, rot: 54, t: 0.58 },
  { x: 59, y: 45, rot: -46, t: 0.72 },
  { x: 61, y: 44, rot: 46, t: 0.84 },
  { x: 60, y: 33, rot: 0, t: 0.95 },
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
 * the game's progress meter. As the child sorts correctly, the stem draws upward
 * and leaves unfurl. At progress=1 it's the full brand logo.
 */
export function BookTree({ progress, bloom = false, className }: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const reveal = 0.1 + 0.9 * p; // a small sprout is always visible

  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label="A tree growing from a book">
      <g
        className={bloom ? 'tree--bloom' : undefined}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <path
          className="tree__stem"
          d="M60,88 C 57,72 63,52 60,30"
          fill="none"
          stroke="var(--teal-deep)"
          strokeWidth="3.4"
          strokeLinecap="round"
          pathLength={100}
          style={{ strokeDasharray: 100, strokeDashoffset: 100 * (1 - reveal) }}
        />

        {LEAVES.map((lf, i) => {
          const shown = p >= lf.t;
          return (
            <g key={i} transform={`translate(${lf.x} ${lf.y}) rotate(${lf.rot})`}>
              <g
                className="tree__leaf"
                style={{ opacity: shown ? 1 : 0, transform: shown ? 'scale(1)' : 'scale(0.01)' }}
              >
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

        {/* open book in front of the stem base */}
        <g stroke="var(--teal-deep)" strokeWidth="2" strokeLinejoin="round">
          <path d="M60,86 C 46,82 30,84 20,90 L20,101 C 32,96 47,94 60,98 Z" fill="#ffffff" />
          <path d="M60,86 C 74,82 90,84 100,90 L100,101 C 88,96 73,94 60,98 Z" fill="#ffffff" />
          <line x1="60" y1="86" x2="60" y2="98" />
        </g>
      </g>
    </svg>
  );
}
