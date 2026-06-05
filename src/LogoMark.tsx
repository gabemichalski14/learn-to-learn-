interface Props {
  className?: string;
}

/** Leaf positions on the sprig — a symmetric leafy plant like the logo. */
const LEAVES = [
  { x: 60, y: 40, rot: 0 },
  { x: 60, y: 44, rot: -28 },
  { x: 60, y: 44, rot: 28 },
  { x: 60, y: 52, rot: -50 },
  { x: 60, y: 52, rot: 50 },
  { x: 60, y: 61, rot: -70 },
  { x: 60, y: 61, rot: 70 },
];

/**
 * Simplified Learn to Learn brand mark — a leafy sprig growing from an open
 * book, inside a soft ring. This is the static header logo; the in-game
 * BookTree is the separate growing-progress tree.
 */
export function LogoMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label="Learn to Learn">
      {/* badge ring */}
      <circle cx="60" cy="60" r="55" fill="none" stroke="var(--teal)" strokeWidth="4" />

      {/* stem */}
      <path d="M60,80 L60,34" stroke="var(--teal-deep)" strokeWidth="2.6" strokeLinecap="round" fill="none" />

      {/* leaves */}
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
          <path d="M0,2 Q 6,-12 0,-28 Q -6,-12 0,2 Z" fill="var(--teal)" stroke="var(--teal-deep)" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M0,-3 L0,-22" stroke="var(--teal-deep)" strokeWidth="1.1" fill="none" />
        </g>
      ))}

      {/* open book */}
      <g stroke="var(--teal-deep)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60,80 C 44,73 26,75 16,82 L16,98 C 28,92 45,90 60,96 Z" fill="#ffffff" />
        <path d="M60,80 C 76,73 94,75 104,82 L104,98 C 92,92 75,90 60,96 Z" fill="#ffffff" />
        <line x1="60" y1="80" x2="60" y2="96" />
      </g>

      {/* page lines */}
      <g stroke="var(--teal-deep)" strokeWidth="1.2" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M23,85 C 34,81 47,82 56,86" />
        <path d="M23,90 C 34,86 47,87 56,91" />
        <path d="M97,85 C 86,81 73,82 64,86" />
        <path d="M97,90 C 86,86 73,87 64,91" />
      </g>
    </svg>
  );
}
