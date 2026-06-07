/**
 * Sound Garden world art (Level 1) — a calm meadow backdrop + the Sprout guide.
 * Built as CSS/SVG so it animates and stays entirely ours.
 */
export function GardenBackdrop() {
  return (
    <div className="gd-bg" aria-hidden="true">
      <span className="gd-sun" />
      <span className="gd-cloud gd-cloud--1" />
      <span className="gd-cloud gd-cloud--2" />
      <span className="gd-cloud gd-cloud--3" />
      <span className="gd-hill gd-hill--back" />
      <span className="gd-hill gd-hill--front" />
      <span className="gd-fly gd-fly--1">🦋</span>
      <span className="gd-fly gd-fly--2">🐝</span>
      <span className="gd-vig" />
    </div>
  );
}

/** Sprout — the friendly Level 1 guide mascot. */
export function SproutGuide({ size = 64 }: { size?: number }) {
  return (
    <span className="gd-sproutmascot">
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
        <circle cx="29.4" cy="29" r="1.4" fill="#173d2a" />
        <circle cx="34.6" cy="29" r="1.4" fill="#173d2a" />
        <path d="M29 32.4 q3 2.6 6 0" stroke="#173d2a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <circle cx="27.5" cy="31.5" r="1.2" fill="#ffb6b6" opacity=".7" />
        <circle cx="36.5" cy="31.5" r="1.2" fill="#ffb6b6" opacity=".7" />
      </svg>
    </span>
  );
}
