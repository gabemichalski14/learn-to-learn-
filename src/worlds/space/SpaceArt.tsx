/** Space Patrol world art — backdrop + mascot. Stand-ins for a richer illustrated
 *  set; built as SVG/CSS so they animate and stay fully ours. */

const STAR_POS = [
  [8, 12], [22, 30], [40, 18], [62, 9], [78, 24], [90, 40], [14, 52], [86, 62], [50, 46],
  [30, 70], [70, 76], [18, 84], [60, 88], [4, 38], [46, 6], [94, 14],
];

export function SpaceBackdrop() {
  return (
    <div aria-hidden="true">
      <span className="sg-neb sg-neb--1" />
      <span className="sg-neb sg-neb--2" />
      <span className="sg-neb sg-neb--3" />
      <div className="sg-stars">
        {STAR_POS.map(([l, t], i) => (
          <i key={i} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${(i % 6) * 0.5}s` }} />
        ))}
      </div>
      <div className="sg-vig" />
    </div>
  );
}

/** Scout — the Level 2 mascot. A friendly drone: glowing eye, antenna, thruster. */
export function ScoutDrone({ size = 64 }: { size?: number }) {
  return (
    <span className="sg-drone">
      <svg width={size} height={size * 0.94} viewBox="0 0 64 60" role="img" aria-label="Scout, your patrol drone">
        <ellipse cx="32" cy="56" rx="16" ry="3" fill="rgba(0,0,0,.35)" />
        <line x1="32" y1="6" x2="32" y2="14" stroke="#7fd6e0" strokeWidth="2" />
        <circle cx="32" cy="5" r="3" fill="#5ef0c8" />
        <rect x="14" y="14" width="36" height="30" rx="14" fill="#173d4c" stroke="#5ef0c8" strokeOpacity=".5" />
        <rect x="20" y="22" width="24" height="14" rx="7" fill="#0a1c24" />
        <circle cx="32" cy="29" r="5.5" fill="#5ef0c8">
          <animate attributeName="r" values="5.5;4;5.5" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="33.5" cy="27.5" r="1.6" fill="#eafcff" />
        <path d="M14 28 Q4 26 4 34" stroke="#173d4c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50 28 Q60 26 60 34" stroke="#173d4c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="48" rx="9" ry="4" fill="#5ef0c8" opacity=".5">
          <animate attributeName="opacity" values=".25;.6;.25" dur="1.6s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </span>
  );
}
