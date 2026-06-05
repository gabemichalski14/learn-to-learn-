interface Props {
  className?: string;
}

/** Leaf cluster forming the canopy — (x, y, rotation, tone 0=dark 1=mid 2=light). */
const LEAVES: [number, number, number, 0 | 1 | 2][] = [
  [60, 32, 0, 1],
  [52, 35, -26, 0],
  [68, 35, 26, 0],
  [57, 37, -12, 2],
  [63, 37, 12, 2],
  [46, 41, -50, 1],
  [74, 41, 50, 1],
  [50, 45, -34, 2],
  [70, 45, 34, 2],
  [44, 50, -66, 0],
  [76, 50, 66, 0],
  [60, 43, 0, 0],
  [54, 47, -20, 1],
  [66, 47, 20, 1],
  [52, 53, -30, 2],
  [68, 53, 30, 2],
];

const TONES = ['#4e9568', '#6bae7f', '#a8d5c2'];

/**
 * Learn to Learn brand mark — a tree growing from an open book: navy trunk and
 * branches, a layered green canopy, on a teal-edged open book. Used in the site
 * header and submark contexts (the in-game BookTree is the separate growing meter).
 */
export function LogoMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" role="img" aria-label="Learn to Learn">
      {/* trunk + branches */}
      <g stroke="var(--ink)" strokeWidth="3.4" strokeLinecap="round" fill="none">
        <path d="M60,86 C 59,72 59,58 60,44" />
        <path d="M60,64 C 54,60 50,54 47,49" />
        <path d="M60,58 C 66,54 70,49 73,45" />
        <path d="M60,52 C 55,49 53,45 52,41" />
        <path d="M60,50 C 65,47 67,44 68,40" />
      </g>

      {/* canopy */}
      {LEAVES.map(([x, y, rot, tone], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d="M0,0 C 4.4,-5 4.4,-13 0,-17.5 C -4.4,-13 -4.4,-5 0,0 Z" fill={TONES[tone]} />
          <path d="M0,-2 L0,-14" stroke="rgba(13,27,42,0.18)" strokeWidth="0.9" fill="none" />
        </g>
      ))}

      {/* open book */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M60,84 C 45,77 27,79 17,86 L17,100 C 29,94 46,92 60,98 Z" fill="#ffffff" stroke="var(--ink)" strokeWidth="2.2" />
        <path d="M60,84 C 75,77 93,79 103,86 L103,100 C 91,94 74,92 60,98 Z" fill="#ffffff" stroke="var(--ink)" strokeWidth="2.2" />
        <line x1="60" y1="84" x2="60" y2="98" stroke="var(--ink)" strokeWidth="2.2" />
        {/* page lines */}
        <g stroke="var(--teal)" strokeWidth="1.3" fill="none" opacity="0.9">
          <path d="M24,88 C 35,84 47,85 56,89" />
          <path d="M24,93 C 35,89 47,90 56,94" />
          <path d="M96,88 C 85,84 73,85 64,89" />
          <path d="M96,93 C 85,89 73,90 64,94" />
        </g>
        {/* teal book base */}
        <path d="M15,99 C 33,108 87,108 105,99" stroke="var(--teal)" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
