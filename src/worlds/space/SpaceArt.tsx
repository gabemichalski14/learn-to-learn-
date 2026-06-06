/** Space Patrol world art — backdrop + mascot. Stand-ins for a richer illustrated
 *  set; built as SVG/CSS so they animate and stay fully ours. */

// [left%, top%, big?] — `big` stars get a brighter glow + sparkle.
const STAR_POS: [number, number, boolean][] = [
  [6, 10, true], [16, 22, false], [27, 14, false], [34, 30, false], [42, 9, true],
  [52, 20, false], [60, 12, false], [68, 26, false], [76, 8, false], [84, 20, true],
  [90, 36, false], [11, 40, false], [22, 52, false], [9, 64, true], [18, 78, false],
  [30, 70, false], [40, 84, false], [50, 60, false], [58, 88, false], [66, 72, false],
  [74, 84, true], [82, 60, false], [92, 76, false], [4, 30, false], [48, 44, false],
  [70, 50, false], [88, 50, true], [36, 58, false],
];

/** A rocket that cruises horizontally across the cosmos, nose-first. The flight
 *  (translateX) is on the outer span; the bob is on the inner ship, so the bob
 *  never knocks the rocket off its flight line. SVG points RIGHT = direction of
 *  travel, so it never looks like it's crabbing sideways. */
function Rocket() {
  return (
    <span className="sg-rocket">
      <span className="sg-rocket__ship">
        <svg width="72" height="36" viewBox="0 0 72 36" role="img" aria-label="rocket">
          {/* trailing flame (left) */}
          <g className="sg-rocket__flame">
            <path d="M15 18 q-9 -7 -15 0 q9 7 15 0Z" fill="#ffb24a" />
            <path d="M13 18 q-6 -4 -10 0 q6 4 10 0Z" fill="#ffe27a" />
          </g>
          {/* tail fins */}
          <path d="M24 9 L15 2 L27 11 Z" fill="#22c1d6" />
          <path d="M24 27 L15 34 L27 25 Z" fill="#22c1d6" />
          {/* body + nose cone (right) */}
          <path d="M20 8 L46 8 Q66 9 70 18 Q66 27 46 28 L20 28 Q14 24 14 18 Q14 12 20 8Z" fill="#dfeef2" />
          <path d="M46 8 Q66 9 70 18 Q66 27 46 28 Z" fill="#b9d3da" />
          {/* window */}
          <circle cx="34" cy="18" r="5.2" fill="#0a2230" />
          <circle cx="34" cy="18" r="5.2" fill="none" stroke="#5ef0c8" strokeWidth="1.6" />
          <circle cx="32.4" cy="16.4" r="1.4" fill="#9fe9f0" />
        </svg>
      </span>
    </span>
  );
}

export function SpaceBackdrop() {
  return (
    <div aria-hidden="true">
      {/* slowly hue-shifting, drifting nebula */}
      <div className="sg-cosmos">
        <span className="sg-neb sg-neb--1" />
        <span className="sg-neb sg-neb--2" />
        <span className="sg-neb sg-neb--3" />
      </div>
      {/* distant drifting planets */}
      <span className="sg-far sg-far--1">
        <span className="sg-far__body" style={{ background: 'radial-gradient(circle at 34% 30%, #6f8ad6, #1d2a5a)' }} />
      </span>
      <span className="sg-far sg-far--2">
        <span className="sg-far__body" style={{ background: 'radial-gradient(circle at 34% 30%, #2fb6a0, #0c5a52)' }} />
      </span>
      {/* twinkling + shining starfield */}
      <div className="sg-stars">
        {STAR_POS.map(([l, t, big], i) => (
          <i key={i} className={big ? 'big' : undefined} style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${(i % 7) * 0.45}s` }} />
        ))}
      </div>
      <span className="sg-shoot" />
      <Rocket />
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
