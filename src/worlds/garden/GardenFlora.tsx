import { type CSSProperties } from 'react';

/** Hand-made meadow flora — flat-with-soft-shading SVG (cottagecore), so the
 *  garden reads as a real meadow instead of a row of emoji. Six species + grass
 *  give natural variety; depth comes from size (smaller = farther up the hill).
 *  Motion is deliberately restrained (see mascots/garden CSS): only a subset
 *  sways at a time, slowly — a breeze, not a wiggle. */
export const FLOWER_TYPES = 6;

const STEM = '#5f9a58';
const LEAF = '#7cb86a';

function art(type: number) {
  switch (type % FLOWER_TYPES) {
    case 1: // tulip
      return (
        <>
          <path d="M22 62 V32" stroke={STEM} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M22 50 q11 -1 13 -11 q-11 0 -13 9z" fill={LEAF} />
          <path d="M12 24 q0 -15 10 -19 q10 4 10 19 q-10 6 -20 0z" fill="#e8657f" />
          <path d="M22 6 q-6 4 -6 18 q6 2 6 2z" fill="#d2566e" />
          <path d="M12 24 q5 4 10 4 q5 0 10 -4" fill="none" stroke="#c44a62" strokeWidth="1" />
        </>
      );
    case 2: // poppy
      return (
        <>
          <path d="M22 62 V30" stroke={STEM} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx="22" cy="11" rx="6.6" ry="9.5" fill="#e8553f" transform={`rotate(${i * 72} 22 22)`} />)}
          <circle cx="22" cy="22" r="4.6" fill="#3a2418" />
          <circle cx="20.6" cy="20.6" r="1.3" fill="#6a4630" />
        </>
      );
    case 3: // bluebells
      return (
        <>
          <path d="M22 62 q-3 -22 0 -42" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M13 19 q-3 8 3 12 q6 -4 3 -12 q-3 -3 -6 0z" fill="#7d8ff0" />
          <path d="M25 13 q-3 8 3 12 q6 -4 3 -12 q-3 -3 -6 0z" fill="#9aa8f7" />
          <path d="M19 28 q-3 7 3 11 q6 -4 3 -11 q-3 -3 -6 0z" fill="#6173da" />
        </>
      );
    case 4: // buttercup
      return (
        <>
          <path d="M22 62 V34" stroke={STEM} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M22 50 q-9 -1 -11 -8 q9 0 11 7z" fill={LEAF} />
          {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx="22" cy="14" r="5" fill="#ffd34d" transform={`rotate(${i * 72} 22 24)`} />)}
          <circle cx="22" cy="24" r="3.3" fill="#f5a800" />
        </>
      );
    case 5: // clover greenery (filler)
      return (
        <>
          <path d="M22 62 V30" stroke={STEM} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <circle cx="22" cy="17" r="7" fill="#6fb262" />
          <circle cx="13" cy="24" r="6.4" fill={LEAF} />
          <circle cx="31" cy="24" r="6.4" fill={LEAF} />
        </>
      );
    default: // daisy
      return (
        <>
          <path d="M22 62 V28" stroke={STEM} strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M22 46 q-10 -1 -12 -10 q10 0 12 8z" fill={LEAF} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <ellipse key={i} cx="22" cy="9" rx="3.6" ry="8" fill="#ffffff" stroke="#e9efe7" strokeWidth=".5" transform={`rotate(${i * 45} 22 22)`} />)}
          <circle cx="22" cy="22" r="6" fill="#ffce44" />
          <circle cx="22" cy="22" r="6" fill="none" stroke="#e2a82c" strokeWidth="1.3" />
          <circle cx="20" cy="20" r="1.3" fill="#fff" opacity=".6" />
        </>
      );
  }
}

export function Flower({ type, size = 36, sway = false, style }: { type: number; size?: number; sway?: boolean; style?: CSSProperties }) {
  return (
    <span className={`gd-flora${sway ? ' gd-flora--sway' : ''}`} style={style} aria-hidden="true">
      <svg viewBox="0 0 44 64" width={size} height={size * 1.45}>{art(type)}</svg>
    </span>
  );
}

/** A little tuft of grass blades for natural ground cover. */
export function GrassTuft({ size = 30, style }: { size?: number; style?: CSSProperties }) {
  return (
    <span className="gd-flora" style={style} aria-hidden="true">
      <svg viewBox="0 0 40 30" width={size} height={size * 0.75}>
        <g fill="none" stroke="#6aa85f" strokeWidth="2.4" strokeLinecap="round">
          <path d="M20 30 q-6 -16 -11 -22" />
          <path d="M20 30 q-2 -18 -3 -26" />
          <path d="M20 30 q3 -17 8 -23" />
          <path d="M20 30 q7 -14 13 -19" />
        </g>
      </svg>
    </span>
  );
}

/** SVG butterfly (replaces the 🦋 emoji) — wings flutter gently. */
export function Butterfly({ size = 26 }: { size?: number }) {
  return (
    <svg className="gd-bug" viewBox="0 0 40 34" width={size} height={size * 0.85} aria-hidden="true">
      <ellipse cx="20" cy="17" rx="2" ry="8" fill="#5a4633" />
      <g className="gd-bug__wing gd-bug__wing--l">
        <path d="M19 14 q-15 -12 -17 2 q3 9 17 5z" fill="#ff9ec4" />
        <path d="M19 18 q-13 8 -14 -1 q4 -4 14 -3z" fill="#f77aa8" />
      </g>
      <g className="gd-bug__wing gd-bug__wing--r">
        <path d="M21 14 q15 -12 17 2 q-3 9 -17 5z" fill="#ffb6d4" />
        <path d="M21 18 q13 8 14 -1 q-4 -4 -14 -3z" fill="#f77aa8" />
      </g>
      <path d="M20 10 q-3 -5 -6 -6 M20 10 q3 -5 6 -6" stroke="#5a4633" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** SVG bee (replaces the 🐝 emoji) — wings shimmer. */
export function Bee({ size = 24 }: { size?: number }) {
  return (
    <svg className="gd-bug" viewBox="0 0 40 30" width={size} height={size * 0.75} aria-hidden="true">
      <g className="gd-bug__wing gd-bug__wing--l"><ellipse cx="16" cy="9" rx="7" ry="4.5" fill="#eaf6ff" opacity=".85" /></g>
      <g className="gd-bug__wing gd-bug__wing--r"><ellipse cx="24" cy="9" rx="7" ry="4.5" fill="#eaf6ff" opacity=".85" /></g>
      <ellipse cx="20" cy="18" rx="11" ry="8" fill="#f5c84c" />
      <path d="M14 12 q3 12 0 12 M20 11 q0 14 0 14 M26 12 q-3 12 0 12" stroke="#3a2c12" strokeWidth="2.4" fill="none" />
      <ellipse cx="20" cy="18" rx="11" ry="8" fill="none" stroke="#e2a82c" strokeWidth="1" />
      <circle cx="11" cy="16" r="1.4" fill="#222" />
    </svg>
  );
}
