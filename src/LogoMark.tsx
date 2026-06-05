interface Props {
  className?: string;
}

const TONES = ['#4e9568', '#6bae7f', '#a8d5c2'];
// canopy leaves: [x, y, rotation, tone]
const LEAVES: [number, number, number, number][] = [
  [100, 66, 0, 1],
  [89, 70, -26, 0],
  [111, 70, 26, 0],
  [96, 72, -12, 2],
  [104, 72, 12, 2],
  [80, 78, -50, 1],
  [120, 78, 50, 1],
  [84, 84, -34, 2],
  [116, 84, 34, 2],
  [100, 80, 0, 0],
];
const LEAF = 'M0,0 C5,-6 5,-16 0,-21 C-5,-16 -5,-6 0,0 Z';

/**
 * Learn to Learn circular badge — built to match the brand mark: a tree growing
 * from an open book (navy trunk, sage-green canopy, teal book) inside a navy
 * ring, with arched "LEARN TO LEARN" / "TUTORING SOLUTIONS" lettering.
 */
export function LogoMark({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label="Learn to Learn Tutoring Solutions">
      {/* badge */}
      <circle cx="100" cy="100" r="96" fill="#ffffff" />
      <circle cx="100" cy="100" r="95" fill="none" stroke="#0d1b2a" strokeWidth="3" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="#0d1b2a" strokeWidth="1.3" />

      {/* arched lettering */}
      <defs>
        <path id="ll-top" d="M 30.5,74.7 A 74,74 0 0 1 169.5,74.7" fill="none" />
        <path id="ll-bottom" d="M 30.5,125.3 A 74,74 0 0 0 169.5,125.3" fill="none" />
      </defs>
      <text fill="#0d1b2a" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="14" letterSpacing="2.2">
        <textPath href="#ll-top" startOffset="50%" textAnchor="middle">LEARN TO LEARN</textPath>
      </text>
      <text fill="#1b9aaa" fontFamily="'Poppins', sans-serif" fontWeight="600" fontSize="9.5" letterSpacing="2">
        <textPath href="#ll-bottom" startOffset="50%" textAnchor="middle">TUTORING SOLUTIONS</textPath>
      </text>

      {/* trunk + branches */}
      <g stroke="#0d1b2a" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M100,118 C99,106 99,96 100,84" />
        <path d="M100,102 C92,97 87,91 84,86" />
        <path d="M100,96 C108,91 113,86 116,82" />
        <path d="M100,90 C95,86 92,82 91,78" />
        <path d="M100,88 C105,84 108,81 109,77" />
      </g>

      {/* canopy */}
      {LEAVES.map(([x, y, rot, tone], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d={LEAF} fill={TONES[tone]} />
        </g>
      ))}

      {/* open book */}
      <path d="M100,116 C83,108 58,110 46,118 L46,132 C60,125 85,123 100,129 Z" fill="#ffffff" stroke="#0d1b2a" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M100,116 C117,108 142,110 154,118 L154,132 C140,125 115,123 100,129 Z" fill="#ffffff" stroke="#0d1b2a" strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="100" y1="116" x2="100" y2="129" stroke="#0d1b2a" strokeWidth="2.4" />
      <path d="M44,131 C60,140 140,140 156,131" fill="none" stroke="#1b9aaa" strokeWidth="5" strokeLinecap="round" />

      {/* small accents beside the bottom text */}
      <circle cx="40" cy="138" r="2.3" fill="#6bae7f" />
      <circle cx="160" cy="138" r="2.3" fill="#6bae7f" />
    </svg>
  );
}
