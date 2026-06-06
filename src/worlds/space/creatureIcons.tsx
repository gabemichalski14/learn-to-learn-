import type { ReactElement } from 'react';

/**
 * Space Patrol "specimens" — one custom SVG per Level 2 short-vowel word.
 *
 * Each icon is a bold, flat-colour drawing of the REAL object (cat, sun, jet…)
 * so a child can instantly recognise the word and find its middle vowel — the
 * phonics task must never depend on decoding stylised art. The space feel comes
 * from the surrounding holo-capsule (see SpaceSpecimen + .sg-spec), not from
 * distorting the object. These replace the placeholder emoji in shortVowelWords.
 *
 * All icons are authored in a 48×48 viewBox, centred so they sit inside the
 * round capsule without clipping. Keyed by the word `id` from the content pack.
 */
const CREATURE_ICONS: Record<string, ReactElement> = {
  // ── short a ──────────────────────────────────────────────
  cat: (
    <g>
      <path d="M13 16 L11 6 L21 13 Z" fill="#9aa6b2" />
      <path d="M35 16 L37 6 L27 13 Z" fill="#9aa6b2" />
      <circle cx="24" cy="26" r="13" fill="#aeb8c2" />
      <circle cx="19" cy="24" r="2" fill="#22303a" />
      <circle cx="29" cy="24" r="2" fill="#22303a" />
      <path d="M24 28 l-2.4 2.2 h4.8 z" fill="#f2a0a0" />
      <path d="M24 30 v3" stroke="#22303a" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 26 h6 M9 29 h6 M33 26 h6 M33 29 h6" stroke="#e7eef3" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </g>
  ),
  hat: (
    <g>
      <rect x="7" y="32" width="34" height="5" rx="2.5" fill="#2b2f36" />
      <path d="M16 14 q0-3 3-3 h10 q3 0 3 3 v18 h-16 z" fill="#3a4049" />
      <rect x="16" y="25" width="16" height="4" fill="#e85d6b" />
    </g>
  ),
  bag: (
    <g>
      <rect x="13" y="16" width="22" height="24" rx="7" fill="#3aa0b4" />
      <path d="M19 17 q5-7 10 0" fill="none" stroke="#bfeef4" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="18" y="26" width="12" height="12" rx="3" fill="#2b8294" />
      <circle cx="24" cy="32" r="2" fill="#cdeef2" />
    </g>
  ),
  map: (
    <g>
      <path d="M10 14 l9-3 10 3 9-3 v22 l-9 3-10-3-9 3 z" fill="#e7d9a8" stroke="#b8a85f" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M19 11 v22 M29 14 v22" stroke="#b8a85f" strokeWidth="1.1" fill="none" />
      <path d="M15 28 q5-6 10-3 t8-3" fill="none" stroke="#c0533f" strokeWidth="1.6" strokeDasharray="2 2" strokeLinecap="round" />
      <circle cx="33" cy="20" r="2.4" fill="#c0533f" />
    </g>
  ),
  van: (
    <g>
      <path d="M8 20 h20 l8 5 v7 q0 2-2 2 H10 q-2 0-2-2 z" fill="#e0683f" />
      <rect x="11" y="22" width="9" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="22" y="22.5" width="8" height="5.5" rx="1.2" fill="#bfe9f0" />
      <circle cx="15" cy="35" r="3.2" fill="#2b2f36" />
      <circle cx="31" cy="35" r="3.2" fill="#2b2f36" />
      <circle cx="15" cy="35" r="1.3" fill="#9aa6b2" />
      <circle cx="31" cy="35" r="1.3" fill="#9aa6b2" />
    </g>
  ),
  jam: (
    <g>
      <rect x="15" y="13" width="18" height="5" rx="1.5" fill="#8a5a2b" />
      <path d="M15 18 h18 v15 q0 4-4 4 H19 q-4 0-4-4 z" fill="#d34b5e" />
      <rect x="18" y="23" width="12" height="9" rx="1.2" fill="#f3e6c8" />
      <path d="M21 28 q3-2.4 6 0" stroke="#d34b5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  ),

  // ── short e ──────────────────────────────────────────────
  hen: (
    <g>
      <path d="M30 19 q8 1 7 11 q-1 8-13 8 q-12 0-13-9 q-1-8 8-9 q5-1 7 0z" fill="#f3ede4" />
      <circle cx="31" cy="16" r="5.5" fill="#f3ede4" />
      <path d="M29 11 q1.5-3 3 0 q1.5-3 3 0 q1.5-3 2 2" fill="#e0473b" />
      <path d="M36 16 l6 1.5 -6 2 z" fill="#f2a83a" />
      <circle cx="32" cy="15" r="1.1" fill="#22303a" />
      <path d="M12 21 q-6-1-7 5 q6 2 9-2z" fill="#d9cdbb" />
      <path d="M20 37 v3 M27 37 v3" stroke="#f2a83a" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  bed: (
    <g>
      <rect x="8" y="20" width="6" height="17" rx="1.5" fill="#8a6a4a" />
      <rect x="8" y="28" width="32" height="8" rx="2.5" fill="#bcd3dd" />
      <rect x="34" y="29" width="6" height="8" rx="1.5" fill="#8a6a4a" />
      <rect x="14" y="23" width="11" height="6" rx="2.5" fill="#ffffff" />
      <path d="M10 37 v3 M38 37 v3" stroke="#6b4f37" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),
  net: (
    <g>
      <path d="M19 29 L9 39" stroke="#9c6b3f" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M17.5 17 q2.5 15 9.5 17 q7 -2 9.5 -17 z" fill="rgba(190,235,244,.16)" stroke="#aeb8c0" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M21 19 q3 12 6 14 M27 18.5 V34 M33 19 q-3 12 -6 14 M18.5 23 h17 M20 29 h14" stroke="#9fb0b8" strokeWidth="0.8" fill="none" />
      <ellipse cx="27" cy="17" rx="10" ry="4.5" fill="none" stroke="#dfe8ec" strokeWidth="2.6" />
    </g>
  ),
  pen: (
    <g>
      <path d="M33 9 l6 6 -3.5 3.5 -6 -6 z" fill="#cdd6dd" />
      <path d="M34.6 12 l1.7 1.7 -1 4.2 -1.7 -1.7 z" fill="#9aa6b2" />
      <path d="M29.5 12.5 l6 6 -14 14 -6 -6 z" fill="#2f6fbf" />
      <path d="M31 15 l2.4 2.4 -12 12 -2.4 -2.4 z" fill="#4f93e0" />
      <path d="M21.5 20.5 l6 6 -2 2 -6 -6 z" fill="#234d85" />
      <path d="M15.5 26.5 l6 6 -4 4 -6 -6 z" fill="#c7d0d8" />
      <path d="M14.5 30 l3.5 3.5" stroke="#7f8b95" strokeWidth="0.9" />
      <path d="M11.5 30.5 l4 4 -2.5 2.5 -3.5 -3.5 z" fill="#15366b" />
    </g>
  ),
  web: (
    <g stroke="#cfe0e8" strokeWidth="1.3" fill="none">
      <path d="M24 9 v30 M9 24 h30 M14 14 l20 20 M34 14 l-20 20" />
      <circle cx="24" cy="24" r="4" />
      <circle cx="24" cy="24" r="9" />
      <circle cx="24" cy="24" r="14" />
    </g>
  ),
  jet: (
    <g>
      <path d="M24 6 L27.5 22 L27 35 L24 32 L21 35 L20.5 22 Z" fill="#d6dee2" />
      <path d="M25 21 L40 31 L40 33 L25 27.5 Z" fill="#9aa6b2" />
      <path d="M23 21 L8 31 L8 33 L23 27.5 Z" fill="#9aa6b2" />
      <path d="M25 32 L31 37 L31 38.5 L25 35.5 Z" fill="#9aa6b2" />
      <path d="M23 32 L17 37 L17 38.5 L23 35.5 Z" fill="#9aa6b2" />
      <path d="M22 35 h4 l-2 5.5 z" fill="#f2a83a" />
      <ellipse cx="24" cy="14" rx="1.9" ry="3.2" fill="#2b6f8a" />
    </g>
  ),

  // ── short i ──────────────────────────────────────────────
  pig: (
    <g>
      <path d="M14 13 q-2 5 4 6 z" fill="#e98aa9" />
      <path d="M34 13 q2 5 -4 6 z" fill="#e98aa9" />
      <circle cx="24" cy="25" r="13" fill="#f2a7c0" />
      <ellipse cx="24" cy="28" rx="7" ry="5" fill="#e98aa9" />
      <circle cx="22" cy="28" r="1.4" fill="#7a3a52" />
      <circle cx="26" cy="28" r="1.4" fill="#7a3a52" />
      <circle cx="19" cy="20" r="1.7" fill="#5a2b3c" />
      <circle cx="29" cy="20" r="1.7" fill="#5a2b3c" />
    </g>
  ),
  pin: (
    <g>
      <ellipse cx="24" cy="16" rx="9" ry="6" fill="#e0473b" />
      <ellipse cx="20.5" cy="14" rx="3" ry="1.8" fill="#f2b3ad" />
      <path d="M24 21 l-2 15 2 1 2 -1 z" fill="#9aa6b2" />
      <rect x="17" y="20" width="14" height="3" rx="1.5" fill="#c83a30" />
    </g>
  ),
  lips: (
    <g>
      <path d="M9 24 q7-7 15-2 q8-5 15 2 q-7 8-15 8 q-8 0-15-8z" fill="#e0455f" />
      <path d="M9 24 q15 4 30 0" stroke="#7a1f30" strokeWidth="1.6" fill="none" />
      <path d="M18 22 q6-3 12 0" stroke="#f2a0ae" strokeWidth="1" fill="none" />
    </g>
  ),
  fish: (
    <g>
      <path d="M8 24 q6-9 18-8 q11 1 13 8 q-2 7-13 8 q-12 1-18-8z" fill="#3aa0b4" />
      <path d="M38 24 l7 -6 0 12 z" fill="#2b8294" />
      <path d="M22 17 l3 5 -6 1 z" fill="#2b8294" />
      <circle cx="15" cy="22" r="1.9" fill="#08222e" />
    </g>
  ),
  six: (
    <g>
      <text x="24" y="35" textAnchor="middle" fontSize="32" fontWeight="900" fontFamily="system-ui, Arial, sans-serif" fill="#5ef0c8">6</text>
    </g>
  ),
  milk: (
    <g>
      <path d="M16 18 l8 -5 8 5 v18 q0 2-2 2 H18 q-2 0-2-2 z" fill="#eef3f6" />
      <path d="M16 18 l8 -5 8 5 -8 3 z" fill="#cfe6ee" />
      <rect x="19" y="26" width="10" height="9" rx="1.2" fill="#3aa0b4" />
      <path d="M21 31 q3-2 6 0" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="22" r="1.4" fill="#bcd3dd" />
    </g>
  ),

  // ── short o ──────────────────────────────────────────────
  dog: (
    <g>
      <ellipse cx="12.5" cy="25" rx="4.5" ry="9" transform="rotate(-14 12.5 25)" fill="#7c5226" />
      <ellipse cx="35.5" cy="25" rx="4.5" ry="9" transform="rotate(14 35.5 25)" fill="#7c5226" />
      <path d="M24 11 q11 0 11 12 q0 8-6 11 q-5 3-10 0 q-6-3-6-11 q0-12 11-12z" fill="#b07d49" />
      <ellipse cx="24" cy="30" rx="7.5" ry="6" fill="#e9d6bd" />
      <ellipse cx="24" cy="27.5" rx="2.7" ry="2.1" fill="#2b2f36" />
      <path d="M24 29.5 v3" stroke="#5a4632" strokeWidth="1.1" />
      <path d="M24 32.5 q-3.5 1-4.5-1.5 M24 32.5 q3.5 1 4.5-1.5" stroke="#5a4632" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M22.5 33 q1.5 3 3 0 z" fill="#e07d8a" />
      <circle cx="19" cy="21" r="2" fill="#2b2f36" />
      <circle cx="29" cy="21" r="2" fill="#2b2f36" />
      <circle cx="19.7" cy="20.3" r="0.7" fill="#ffffff" />
      <circle cx="29.7" cy="20.3" r="0.7" fill="#ffffff" />
    </g>
  ),
  box: (
    <g>
      <path d="M10 20 l14 -5 14 5 -14 5 z" fill="#d9a861" />
      <path d="M10 20 v14 l14 5 V25 z" fill="#c08f45" />
      <path d="M38 20 v14 l-14 5 V25 z" fill="#b3823c" />
      <path d="M24 15 v10" stroke="#efd6a8" strokeWidth="2.6" />
      <path d="M10 20 l14 5 14 -5" stroke="#8a6128" strokeWidth="0.8" fill="none" />
    </g>
  ),
  fox: (
    <g>
      <path d="M12 13 l5 11 -7 -2 z" fill="#e0683f" />
      <path d="M36 13 l-5 11 7 -2 z" fill="#e0683f" />
      <path d="M24 14 q11 2 11 12 q0 8-11 12 q-11-4-11-12 q0-10 11-12z" fill="#ec7f4f" />
      <path d="M24 30 q-6 2 -8 -3 q4 1 4 -4 q4 4 8 0 q0 5 4 4 q-2 5 -8 3z" fill="#fdf0e6" />
      <circle cx="19" cy="23" r="1.6" fill="#3a1f10" />
      <circle cx="29" cy="23" r="1.6" fill="#3a1f10" />
      <path d="M24 29 l-2.2 -2.4 h4.4 z" fill="#2b1a10" />
    </g>
  ),
  pot: (
    <g>
      <path d="M13 26 q-4 0 -4 3 q0 3 4 3" fill="none" stroke="#7c8a93" strokeWidth="2.6" />
      <path d="M35 26 q4 0 4 3 q0 3 -4 3" fill="none" stroke="#7c8a93" strokeWidth="2.6" />
      <rect x="13" y="22" width="22" height="14" rx="3" fill="#8a98a1" />
      <rect x="11" y="18" width="26" height="4.5" rx="2.2" fill="#9aa6b2" />
      <rect x="22" y="13" width="4" height="5" rx="2" fill="#9aa6b2" />
    </g>
  ),
  top: (
    <g>
      <path d="M14 22 q10-6 20 0 l-10 13 z" fill="#e0683f" />
      <path d="M16 23 h16" stroke="#c0533f" strokeWidth="1.6" />
      <ellipse cx="24" cy="22" rx="10" ry="3.4" fill="#f2a83a" />
      <rect x="22.4" y="11" width="3.2" height="9" rx="1.6" fill="#9aa6b2" />
    </g>
  ),
  sock: (
    <g>
      <path d="M19 12 h9 v15 l8 7 q3 3 0 6 l-2 2 q-3 3-6 0 l-9 -8 q-3 -3 -3 -7 z" fill="#3aa0b4" />
      <rect x="19" y="12" width="9" height="4" fill="#e85d6b" />
      <path d="M19 19 h9 M19 22 h9" stroke="#bfeef4" strokeWidth="1.2" />
    </g>
  ),

  // ── short u ──────────────────────────────────────────────
  sun: (
    <g>
      <circle cx="24" cy="24" r="9" fill="#f7c948" />
      <g stroke="#f7c948" strokeWidth="3" strokeLinecap="round">
        <path d="M24 6 v5 M24 37 v5 M6 24 h5 M37 24 h5 M11 11 l3.6 3.6 M33.4 33.4 l3.6 3.6 M37 11 l-3.6 3.6 M14.6 33.4 l-3.6 3.6" />
      </g>
    </g>
  ),
  bug: (
    <g>
      <path d="M22 13 l-3 -4 M26 13 l3 -4" stroke="#2b2f36" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="24" cy="26" rx="12" ry="10" fill="#e0473b" />
      <path d="M12 23 q12-5 24 0" stroke="#2b1a14" strokeWidth="1.4" fill="none" />
      <path d="M24 16 v20" stroke="#2b1a14" strokeWidth="2" />
      <circle cx="24" cy="16" r="5" fill="#2b2f36" />
      <circle cx="18" cy="25" r="2" fill="#2b1a14" />
      <circle cx="30" cy="25" r="2" fill="#2b1a14" />
      <circle cx="19" cy="31" r="1.6" fill="#2b1a14" />
      <circle cx="29" cy="31" r="1.6" fill="#2b1a14" />
    </g>
  ),
  cup: (
    <g>
      <path d="M19 11 q-1 3 1 4 M24 11 q-1 3 1 4" stroke="#bcd3dd" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M30 21 q6 0 6 5.5 q0 5.5-6 5.5" fill="none" stroke="#dfe8ec" strokeWidth="3" />
      <path d="M14 18 h16 v12 q0 5-5 5 h-6 q-5 0-5-5 z" fill="#eef3f6" />
      <rect x="14" y="18" width="16" height="4" fill="#3aa0b4" />
    </g>
  ),
  bus: (
    <g>
      <rect x="8" y="16" width="32" height="18" rx="4" fill="#f2b53a" />
      <rect x="11" y="20" width="6" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="19" y="20" width="6" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="27" y="20" width="6" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="35" y="20" width="3.5" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="9" y="29" width="30" height="2" fill="#d99a23" />
      <circle cx="16" cy="35" r="3" fill="#2b2f36" />
      <circle cx="32" cy="35" r="3" fill="#2b2f36" />
    </g>
  ),
  nut: (
    <g>
      <path d="M24 13 v-3" stroke="#6b4a28" strokeWidth="2" strokeLinecap="round" />
      <path d="M15 22 q0-8 9-8 t9 8 q0 2-9 2 t-9 -2z" fill="#9c6b3f" />
      <path d="M16 22 h16 q0 12-8 16 q-8-4-8-16z" fill="#c8923f" />
      <path d="M16 22 h16" stroke="#7a5430" strokeWidth="1" />
    </g>
  ),
  duck: (
    <g>
      <path d="M12 29 q-4 3 0 7 q5 0 8 -5z" fill="#e6b02f" />
      <ellipse cx="22" cy="30" rx="13" ry="9" fill="#f7c948" />
      <circle cx="33" cy="20" r="6.5" fill="#f7c948" />
      <path d="M38 20 l7 2 -7 2 q-2-2 0-4z" fill="#f2832f" />
      <circle cx="34" cy="18.5" r="1.4" fill="#2b1a14" />
    </g>
  ),
};

/**
 * A draggable "specimen": the word's object icon floating in a glowing
 * holo-capsule with a tilted orbit ring. Decorative-only (aria-hidden) — the
 * enclosing button carries the word's accessible label. Falls back to the
 * emoji for any word that doesn't have a bespoke icon yet.
 */
export function SpaceSpecimen({ id, emoji }: { id: string; emoji: string }) {
  const icon = CREATURE_ICONS[id];
  return (
    <span className="sg-spec" aria-hidden="true">
      <span className="sg-spec__orbit" />
      {icon ? (
        <svg viewBox="0 0 48 48" className="sg-spec__art">{icon}</svg>
      ) : (
        <span className="sg-spec__emoji">{emoji}</span>
      )}
    </span>
  );
}
