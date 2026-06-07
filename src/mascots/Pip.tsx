import { useId, type CSSProperties } from 'react';

export type PipExpression = 'happy' | 'excited' | 'curious' | 'wink' | 'thinking' | 'caring';

/**
 * Pip — the universal "Learn to Learn" buddy. A curious little sprout-creature
 * built on baby-schema (Kindchenschema) cuteness: oversized head, huge low-set
 * eyes with double catchlights, round blush cheeks, tiny nose, soft body, a
 * springy leaf-antenna. The face is modular (eyes + mouth swap per `expression`)
 * so Pip can actually emote — the lesson from Duolingo's Duo. When `alive`, Pip
 * breathes, blinks, and his antenna sways (Disney's secondary action).
 */
export function Pip({
  size = 120,
  expression = 'happy',
  alive = true,
  className = '',
}: {
  size?: number;
  expression?: PipExpression;
  alive?: boolean;
  className?: string;
}) {
  const uid = useId();
  const g = `pipg-${uid.replace(/[:]/g, '')}`;
  // Stagger blink/breath so a crowd of Pips never moves in lockstep.
  const style = { '--pip-delay': `${(Math.abs(hash(uid)) % 1900) / 1000}s` } as CSSProperties;

  return (
    <span
      className={`pip${alive ? ' pip--alive' : ''} ${className}`}
      style={style}
      role="img"
      aria-label="Pip"
    >
      <svg viewBox="0 0 200 224" width={size} height={size * 1.12} aria-hidden="true">
        <defs>
          <radialGradient id={g} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#c4f0d1" />
            <stop offset="55%" stopColor="#7bc492" />
            <stop offset="100%" stopColor="#4d9a68" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="208" rx="50" ry="9" fill="rgba(0,0,0,.13)" />
        {/* antenna (sways) */}
        <g className="pip__antenna" style={{ transformOrigin: '100px 60px' }}>
          <path d="M100 60 q-10 -26 6 -42" fill="none" stroke="#4f9d6b" strokeWidth="6" strokeLinecap="round" />
          <path d="M106 18 q18 -7 21 8 q-18 7 -21 -8z" fill="#8ed6a3" />
          <path d="M106 18 q-15 -9 -24 4 q16 10 24 -4z" fill="#6bae7f" />
        </g>
        {/* stubby arms + feet */}
        <path d="M40 150 q-16 2 -16 22" fill="none" stroke="#5fa776" strokeWidth="11" strokeLinecap="round" />
        <path d="M160 150 q16 2 16 22" fill="none" stroke="#5fa776" strokeWidth="11" strokeLinecap="round" />
        <ellipse cx="80" cy="202" rx="13" ry="8" fill="#4f9d6b" />
        <ellipse cx="120" cy="202" rx="13" ry="8" fill="#4f9d6b" />
        {/* body */}
        <path d="M100 50 C152 50 170 92 170 130 C170 180 140 202 100 202 C60 202 30 180 30 130 C30 92 48 50 100 50 Z" fill={`url(#${g})`} />
        <ellipse cx="100" cy="150" rx="36" ry="40" fill="#eafaef" opacity=".62" />
        <ellipse cx="74" cy="92" rx="16" ry="11" fill="#fff" opacity=".34" transform="rotate(-20 74 92)" />
        {/* face */}
        <Face expression={expression} />
      </svg>
    </span>
  );
}

function Face({ expression }: { expression: PipExpression }) {
  const cheeks = (
    <>
      <ellipse cx="52" cy="150" rx="11" ry="7" fill="#ff9ec4" opacity=".58" />
      <ellipse cx="148" cy="150" rx="11" ry="7" fill="#ff9ec4" opacity=".58" />
    </>
  );
  const nose = <ellipse cx="100" cy="149" rx="3" ry="2.2" fill="#3c6b4e" />;

  switch (expression) {
    case 'excited':
      return (
        <g>
          <g className="pip__eyes">
            <path d="M76 110 l4.5 10 10 4.5 -10 4.5 -4.5 10 -4.5 -10 -10 -4.5 10 -4.5z" fill="#ffd45e" />
            <path d="M124 110 l4.5 10 10 4.5 -10 4.5 -4.5 10 -4.5 -10 -10 -4.5 10 -4.5z" fill="#ffd45e" />
          </g>
          {cheeks}
          <path d="M84 152 Q100 180 116 152 Q100 168 84 152z" fill="#21402d" />
          <path d="M95 164 Q100 170 105 164z" fill="#ff7a9c" />
        </g>
      );
    case 'curious':
      return (
        <g>
          <g className="pip__eyes">
            <circle cx="76" cy="124" r="20" fill="#fff" />
            <circle cx="124" cy="124" r="20" fill="#fff" />
            <circle cx="80" cy="119" r="11" fill="#21402d" />
            <circle cx="128" cy="119" r="11" fill="#21402d" />
            <circle cx="76" cy="115" r="4.6" fill="#fff" />
            <circle cx="124" cy="115" r="4.6" fill="#fff" />
          </g>
          {cheeks}
          {nose}
          <circle cx="100" cy="160" r="5.5" fill="none" stroke="#21402d" strokeWidth="3.2" />
        </g>
      );
    case 'wink':
      return (
        <g>
          <g className="pip__eyes">
            <circle cx="76" cy="126" r="20" fill="#fff" />
            <circle cx="79" cy="130" r="11" fill="#21402d" />
            <circle cx="74" cy="125" r="5" fill="#fff" />
            <path d="M114 124 q10 6 20 0" fill="none" stroke="#21402d" strokeWidth="4" strokeLinecap="round" />
          </g>
          {cheeks}
          <path d="M90 156 q12 12 26 2" fill="none" stroke="#21402d" strokeWidth="4" strokeLinecap="round" />
          <path d="M108 162 q6 5 10 -1" fill="#ff7a9c" />
        </g>
      );
    case 'thinking':
      return (
        <g>
          <g className="pip__eyes">
            <circle cx="76" cy="124" r="20" fill="#fff" />
            <circle cx="124" cy="124" r="20" fill="#fff" />
            <circle cx="71" cy="120" r="10.5" fill="#21402d" />
            <circle cx="119" cy="120" r="10.5" fill="#21402d" />
            <circle cx="67" cy="116" r="4.4" fill="#fff" />
            <circle cx="115" cy="116" r="4.4" fill="#fff" />
          </g>
          {cheeks}
          <path d="M90 160 q10 -3 20 0" fill="none" stroke="#21402d" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      );
    case 'caring':
      return (
        <g>
          <path d="M60 122 q14 -8 28 2" fill="none" stroke="#21402d" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 124 q14 -10 28 -2" fill="none" stroke="#21402d" strokeWidth="3" strokeLinecap="round" />
          <g className="pip__eyes">
            <circle cx="76" cy="132" r="14" fill="#fff" />
            <circle cx="124" cy="132" r="14" fill="#fff" />
            <circle cx="77" cy="135" r="7.5" fill="#21402d" />
            <circle cx="123" cy="135" r="7.5" fill="#21402d" />
            <circle cx="74" cy="132" r="3.2" fill="#fff" />
            <circle cx="120" cy="132" r="3.2" fill="#fff" />
          </g>
          {cheeks}
          <path d="M90 162 q10 6 20 0" fill="none" stroke="#21402d" strokeWidth="3.4" strokeLinecap="round" />
        </g>
      );
    case 'happy':
    default:
      return (
        <g>
          <g className="pip__eyes">
            <circle cx="76" cy="126" r="21" fill="#fff" />
            <circle cx="124" cy="126" r="21" fill="#fff" />
            <circle cx="79" cy="130" r="11.5" fill="#21402d" />
            <circle cx="121" cy="130" r="11.5" fill="#21402d" />
            <circle cx="74" cy="125" r="5.2" fill="#fff" />
            <circle cx="116" cy="125" r="5.2" fill="#fff" />
            <circle cx="83" cy="134" r="2.4" fill="#fff" opacity=".85" />
            <circle cx="125" cy="134" r="2.4" fill="#fff" opacity=".85" />
          </g>
          {cheeks}
          {nose}
          <path d="M86 157 Q100 176 114 157 Z" fill="#21402d" />
          <path d="M94 166 Q100 171 106 166 Z" fill="#ff7a9c" />
        </g>
      );
  }
}

/** tiny stable string hash → for staggering idle timing per instance */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
