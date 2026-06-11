import { Art } from '../../art/Art';

/** Space Patrol world art — the illustrated starfield backdrop (PNG) + the Scout
 *  mascot. The hand-coded CSS cosmos was retired once the illustration landed. */
export function SpaceBackdrop() {
  return (
    <div className="sg-bg" aria-hidden="true">
      <Art imageKey="hub:space:bg" emoji="" alt="" className="hub-bg-art" />
    </div>
  );
}

/** Scout — the Level 2 mascot. A friendly drone: glowing eye, antenna, thruster.
 *  `mood` lets the game make Scout cheer on a correct answer or wobble on a miss. */
export function ScoutDrone({ size = 64, mood = null }: { size?: number; mood?: 'cheer' | 'wobble' | null }) {
  return (
    <span className={`sg-drone${mood ? ` sg-drone--${mood}` : ''}`}>
      <svg width={size} height={size * 0.94} viewBox="0 0 64 60" role="img" aria-label="Scout, your patrol drone">
        <ellipse cx="32" cy="56" rx="16" ry="3" fill="rgba(0,0,0,.35)" />
        <line x1="32" y1="6" x2="32" y2="14" stroke="#7fd6e0" strokeWidth="2" />
        <circle cx="32" cy="5" r="3" fill="#5ef0c8" />
        <rect x="14" y="14" width="36" height="30" rx="14" fill="#173d4c" stroke="#5ef0c8" strokeOpacity=".5" />
        <rect x="20" y="22" width="24" height="14" rx="7" fill="#0a1c24" />
        <g className="sg-drone__eye">
          <circle cx="32" cy="29" r="5.5" fill="#5ef0c8">
            <animate attributeName="r" values="5.5;4;5.5" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="33.5" cy="27.5" r="1.6" fill="#eafcff" />
        </g>
        <path d="M14 28 Q4 26 4 34" stroke="#173d4c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M50 28 Q60 26 60 34" stroke="#173d4c" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="32" cy="48" rx="9" ry="4" fill="#5ef0c8" opacity=".5">
          <animate attributeName="opacity" values=".25;.6;.25" dur="1.6s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    </span>
  );
}
