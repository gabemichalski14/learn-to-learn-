import { Art } from '../../art/Art';

/**
 * Sound Garden world art (Level 1) — the illustrated meadow backdrop (PNG), used
 * by every Level-1 game AND the hub. The hand-coded CSS meadow (clouds/hills/
 * butterflies) was retired once the illustration landed.
 */
export function GardenBackdrop() {
  return (
    <div className="gd-bg" aria-hidden="true">
      <Art imageKey="hub:garden:bg" emoji="" alt="" className="hub-bg-art" />
    </div>
  );
}

/** Sprout — the friendly Level 1 guide mascot. `mood` lets the game make Sprout
 *  cheer on a correct answer or give a gentle wobble on a miss. */
export function SproutGuide({ size = 64, mood = null }: { size?: number; mood?: 'cheer' | 'wobble' | null }) {
  return (
    <span className={`gd-sproutmascot${mood ? ` gd-sproutmascot--${mood}` : ''}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Sprout, your garden guide">
        <ellipse cx="32" cy="59" rx="15" ry="3" fill="rgba(0,0,0,.12)" />
        {/* soil mound */}
        <path d="M16 52 q16 -9 32 0 q0 6 -16 6 q-16 0 -16 -6z" fill="#9c6b43" />
        <path d="M16 52 q16 -9 32 0" fill="none" stroke="#7d5535" strokeWidth="1" />
        {/* stem */}
        <path d="M32 52 v-15" stroke="#4e9568" strokeWidth="4" strokeLinecap="round" className="gd-sproutmascot__sway" />
        {/* leaves */}
        <path d="M32 42 q-13 -3 -15 -16 q13 1 15 12z" fill="#6bae7f" />
        <path d="M32 38 q13 -3 15 -16 q-13 1 -15 12z" fill="#8ecf9f" />
        {/* bud face */}
        <circle cx="32" cy="30" r="7.5" fill="#6bae7f" />
        <g className="gd-sproutmascot__eyes">
          <circle cx="29.4" cy="29" r="1.4" fill="#173d2a" />
          <circle cx="34.6" cy="29" r="1.4" fill="#173d2a" />
        </g>
        <path d="M29 32.4 q3 2.6 6 0" stroke="#173d2a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="27.5" cy="31.5" r="1.2" fill="#ffb6b6" opacity=".7" />
        <circle cx="36.5" cy="31.5" r="1.2" fill="#ffb6b6" opacity=".7" />
      </svg>
    </span>
  );
}
