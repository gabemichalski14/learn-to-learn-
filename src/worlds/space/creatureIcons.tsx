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

  // ── everyday objects — /b/ ────────────────────────────────
  bear: (
    <g>
      {/* round ears */}
      <circle cx="14" cy="14" r="5.5" fill="#8b5e3c" />
      <circle cx="34" cy="14" r="5.5" fill="#8b5e3c" />
      <circle cx="14" cy="14" r="3" fill="#a87050" />
      <circle cx="34" cy="14" r="3" fill="#a87050" />
      {/* head */}
      <circle cx="24" cy="26" r="14" fill="#a87050" />
      {/* muzzle */}
      <ellipse cx="24" cy="31" rx="7" ry="5" fill="#c49070" />
      {/* nose */}
      <ellipse cx="24" cy="27.5" rx="3" ry="2" fill="#3a1f10" />
      {/* eyes */}
      <circle cx="18" cy="22" r="2" fill="#2b1a10" />
      <circle cx="30" cy="22" r="2" fill="#2b1a10" />
      {/* mouth */}
      <path d="M21 32 q3 2 6 0" stroke="#3a1f10" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  ball: (
    <g>
      {/* white ball */}
      <circle cx="24" cy="24" r="15" fill="#f5f5f5" />
      {/* black pentagon patches — soccer style */}
      <circle cx="24" cy="24" r="15" fill="none" stroke="#2b2f36" strokeWidth="1.2" />
      {/* center pentagon */}
      <polygon points="24,17 29,21 27,27 21,27 19,21" fill="#2b2f36" />
      {/* surrounding patches */}
      <polygon points="24,9 27,14 24,17 21,14" fill="#2b2f36" />
      <polygon points="33,15 34,20 29,21 27,14" fill="#2b2f36" />
      <polygon points="31,31 27,31 27,27 29,21 34,20" fill="none" />
      <polygon points="15,15 21,14 24,17 19,21 14,20" fill="#2b2f36" />
      <polygon points="13,31 19,27 21,27 17,31" fill="#2b2f36" />
      <polygon points="31,33 27,31 27,27 33,28" fill="#2b2f36" />
    </g>
  ),
  banana: (
    <g>
      {/* curved banana body */}
      <path d="M12 36 q4-18 18-22 q6-2 8 1 q-2 2-6 2 q-12 2-14 20 z" fill="#f7c948" stroke="#d9a820" strokeWidth="1.2" strokeLinejoin="round" />
      {/* tip ends */}
      <path d="M12 36 q-1 2 1 3" stroke="#b8861a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M38 15 q2-1 1 2" stroke="#b8861a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  ),
  bee: (
    <g>
      {/* wings */}
      <ellipse cx="16" cy="17" rx="8" ry="5" fill="rgba(190,235,244,0.7)" stroke="#9aa6b2" strokeWidth="1" />
      <ellipse cx="32" cy="17" rx="8" ry="5" fill="rgba(190,235,244,0.7)" stroke="#9aa6b2" strokeWidth="1" />
      {/* body — yellow oval */}
      <ellipse cx="24" cy="27" rx="10" ry="13" fill="#f7c948" />
      {/* black stripes */}
      <rect x="14" y="22" width="20" height="4" rx="1" fill="#2b2f36" />
      <rect x="14" y="29" width="20" height="4" rx="1" fill="#2b2f36" />
      <rect x="14" y="36" width="20" height="3" rx="1" fill="#2b2f36" />
      {/* head */}
      <circle cx="24" cy="13" r="5" fill="#2b2f36" />
      {/* antennae */}
      <path d="M21 9 l-4-5 M27 9 l4-5" stroke="#2b2f36" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="17" cy="4" r="1.5" fill="#2b2f36" />
      <circle cx="31" cy="4" r="1.5" fill="#2b2f36" />
      {/* eyes */}
      <circle cx="21.5" cy="13" r="1.2" fill="#f7c948" />
      <circle cx="26.5" cy="13" r="1.2" fill="#f7c948" />
    </g>
  ),
  book: (
    <g>
      {/* open book — left page */}
      <path d="M24 13 q-2-2-12 0 v22 q10-2 12 0 z" fill="#f3e6c8" stroke="#c8a86e" strokeWidth="1.2" />
      {/* right page */}
      <path d="M24 13 q2-2 12 0 v22 q-10-2-12 0 z" fill="#f3e6c8" stroke="#c8a86e" strokeWidth="1.2" />
      {/* spine */}
      <rect x="22.5" y="13" width="3" height="22" fill="#c8a86e" />
      {/* lines on left page */}
      <path d="M14 20 h8 M14 24 h8 M14 28 h8" stroke="#b8a06a" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* lines on right page */}
      <path d="M26 20 h8 M26 24 h8 M26 28 h8" stroke="#b8a06a" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  ),

  // ── everyday objects — /s/ ────────────────────────────────
  seal: (
    <g>
      {/* body */}
      <ellipse cx="22" cy="30" rx="14" ry="10" fill="#8a98a1" />
      {/* head */}
      <circle cx="34" cy="20" r="8" fill="#9aa6b2" />
      {/* eye */}
      <circle cx="36" cy="18" r="1.8" fill="#2b2f36" />
      <circle cx="36.5" cy="17.5" r="0.6" fill="#ffffff" />
      {/* nose */}
      <ellipse cx="40" cy="20" rx="2" ry="1.2" fill="#3a3a3a" />
      {/* whiskers */}
      <path d="M40 19 l5-2 M40 20 l5 0 M40 21 l5 2" stroke="#2b2f36" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* front flipper */}
      <path d="M27 27 q-3 2-10 6 q5 1 14-3z" fill="#7a8890" />
      {/* tail flippers */}
      <path d="M10 33 q-4 4-2 8 l4-2 q2 3 4 4 l2-5" fill="#7a8890" />
    </g>
  ),
  soap: (
    <g>
      {/* bar of soap */}
      <rect x="10" y="19" width="26" height="16" rx="5" fill="#d4a8e8" />
      <ellipse cx="23" cy="23" rx="7" ry="3" fill="rgba(255,255,255,0.35)" />
      {/* bubbles */}
      <circle cx="34" cy="13" r="3.5" fill="none" stroke="#b07acc" strokeWidth="1.4" />
      <circle cx="40" cy="18" r="2.5" fill="none" stroke="#b07acc" strokeWidth="1.2" />
      <circle cx="38" cy="8" r="2" fill="none" stroke="#b07acc" strokeWidth="1.1" />
    </g>
  ),
  sandwich: (
    <g>
      {/* top bread slice — triangle shape */}
      <path d="M8 18 l16-8 16 8 z" fill="#d9a861" />
      <path d="M8 18 l16 6 16-6" stroke="#c08f45" strokeWidth="1" fill="none" />
      {/* lettuce layer */}
      <path d="M8 22 q6 3 8 1 q4 4 8 1 q4 4 8 1 l4-1 v3 H8 z" fill="#6bc06b" />
      {/* cheese */}
      <rect x="8" y="25" width="32" height="3" fill="#f0c040" />
      {/* meat */}
      <rect x="8" y="28" width="32" height="3" fill="#c05a3a" />
      {/* bottom bread */}
      <path d="M8 31 h32 v4 q0 3-4 3 H12 q-4 0-4-3 z" fill="#d9a861" />
    </g>
  ),
  sailboat: (
    <g>
      {/* white triangular sail */}
      <path d="M24 8 L24 34 L8 34 Z" fill="#ffffff" stroke="#cdd6dd" strokeWidth="1.2" />
      {/* second sail */}
      <path d="M26 14 L26 34 L38 28 Z" fill="#e0683f" stroke="#c05030" strokeWidth="1" />
      {/* mast */}
      <line x1="24" y1="8" x2="24" y2="36" stroke="#8a6a4a" strokeWidth="2" strokeLinecap="round" />
      {/* hull */}
      <path d="M6 35 h36 l-4 6 H10 z" fill="#2f6fbf" />
      {/* waterline */}
      <path d="M5 41 h38" stroke="#3aa0b4" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  // ── everyday objects — /m/ ────────────────────────────────
  moon: (
    <g>
      {/* crescent: full circle minus offset circle clip via path */}
      <path d="M36 12 a16 16 0 1 0 0 24 a12 12 0 1 1 0-24 z" fill="#f7c948" />
      {/* stars */}
      <circle cx="10" cy="12" r="1.2" fill="#f7e898" />
      <circle cx="16" cy="8" r="1.5" fill="#f7e898" />
      <circle cx="8" cy="22" r="1" fill="#f7e898" />
    </g>
  ),
  mouse: (
    <g>
      {/* big round ears — key differentiator */}
      <circle cx="14" cy="16" r="8" fill="#c8b4b4" />
      <circle cx="34" cy="16" r="8" fill="#c8b4b4" />
      <circle cx="14" cy="16" r="5" fill="#e8d0d0" />
      <circle cx="34" cy="16" r="5" fill="#e8d0d0" />
      {/* body */}
      <ellipse cx="24" cy="31" rx="12" ry="10" fill="#c8b4b4" />
      {/* head */}
      <circle cx="24" cy="22" r="9" fill="#d4c0c0" />
      {/* eyes */}
      <circle cx="20" cy="20" r="1.8" fill="#2b1a2a" />
      <circle cx="28" cy="20" r="1.8" fill="#2b1a2a" />
      {/* nose */}
      <ellipse cx="24" cy="25" rx="2.5" ry="1.5" fill="#e07090" />
      {/* tail */}
      <path d="M36 35 q8 0 8 5 q0 4-8 4" stroke="#b8a0a0" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* whiskers */}
      <path d="M10 24 h8 M10 26 h8 M30 24 h8 M30 26 h8" stroke="#9a8888" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </g>
  ),
  mango: (
    <g>
      {/* leaf */}
      <path d="M24 8 q3-5 7-4 q-1 5-7 6 z" fill="#5a9a3a" />
      {/* stem */}
      <line x1="24" y1="12" x2="24" y2="15" stroke="#6b4a28" strokeWidth="1.8" strokeLinecap="round" />
      {/* mango body — plump teardrop */}
      <path d="M24 15 q-12 2-12 14 q0 11 12 13 q12-2 12-13 q0-12-12-14 z" fill="#f0a030" />
      {/* blush / highlight */}
      <path d="M24 18 q6 2 8 10 q-2-6-8-7 z" fill="#e8703a" fillOpacity="0.6" />
      <ellipse cx="19" cy="22" rx="3" ry="4" fill="#f7c040" fillOpacity="0.5" />
    </g>
  ),
  monkey: (
    <g>
      {/* ears */}
      <circle cx="11" cy="22" r="6" fill="#b07040" />
      <circle cx="11" cy="22" r="3.5" fill="#e8b888" />
      <circle cx="37" cy="22" r="6" fill="#b07040" />
      <circle cx="37" cy="22" r="3.5" fill="#e8b888" />
      {/* head */}
      <circle cx="24" cy="21" r="13" fill="#b07040" />
      {/* big muzzle — key differentiator from bear/cat */}
      <ellipse cx="24" cy="28" rx="9" ry="7" fill="#e8b888" />
      {/* eyes */}
      <circle cx="19" cy="18" r="2.2" fill="#2b1a10" />
      <circle cx="29" cy="18" r="2.2" fill="#2b1a10" />
      <circle cx="19.7" cy="17.3" r="0.7" fill="#ffffff" />
      <circle cx="29.7" cy="17.3" r="0.7" fill="#ffffff" />
      {/* nostrils */}
      <circle cx="21.5" cy="26" r="1.2" fill="#7a5030" />
      <circle cx="26.5" cy="26" r="1.2" fill="#7a5030" />
      {/* smile */}
      <path d="M19 30 q5 3 10 0" stroke="#7a5030" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  ),

  // ── everyday objects — /t/ ────────────────────────────────
  tiger: (
    <g>
      {/* ears */}
      <path d="M11 12 l5 8 -8 0 z" fill="#f0882a" />
      <path d="M37 12 l-5 8 8 0 z" fill="#f0882a" />
      <path d="M13 14 l3 5 -5 0 z" fill="#ffffff" />
      <path d="M35 14 l-3 5 5 0 z" fill="#ffffff" />
      {/* head */}
      <circle cx="24" cy="26" r="14" fill="#f0882a" />
      {/* white face */}
      <ellipse cx="24" cy="30" rx="9" ry="7" fill="#fdf0e0" />
      {/* black stripes on forehead — key differentiator */}
      <path d="M20 14 l-1 6" stroke="#2b1a10" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 12 l0 6" stroke="#2b1a10" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 14 l1 6" stroke="#2b1a10" strokeWidth="2" strokeLinecap="round" />
      {/* side stripes */}
      <path d="M11 22 l4 2 M11 27 l4 2 M37 22 l-4 2 M37 27 l-4 2" stroke="#2b1a10" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* eyes */}
      <circle cx="19" cy="23" r="2.2" fill="#2b1a10" />
      <circle cx="29" cy="23" r="2.2" fill="#2b1a10" />
      <circle cx="19.7" cy="22.3" r="0.7" fill="#ffffff" />
      <circle cx="29.7" cy="22.3" r="0.7" fill="#ffffff" />
      {/* nose */}
      <ellipse cx="24" cy="28" rx="2.5" ry="1.5" fill="#2b1a10" />
      {/* whisker dots */}
      <circle cx="18" cy="31" r="0.9" fill="#d07020" />
      <circle cx="21" cy="32" r="0.9" fill="#d07020" />
      <circle cx="30" cy="31" r="0.9" fill="#d07020" />
      <circle cx="27" cy="32" r="0.9" fill="#d07020" />
    </g>
  ),
  tent: (
    <g>
      {/* main triangular body */}
      <path d="M6 38 L24 10 L42 38 Z" fill="#3aa0b4" />
      {/* shading fold */}
      <path d="M24 10 L32 38" stroke="#2b8294" strokeWidth="1.5" fill="none" />
      {/* door opening */}
      <path d="M18 38 L24 22 L30 38 Z" fill="#e8c87a" />
      {/* ground line */}
      <line x1="5" y1="38" x2="43" y2="38" stroke="#7a8890" strokeWidth="2" strokeLinecap="round" />
      {/* tent stake lines */}
      <line x1="6" y1="38" x2="2" y2="44" stroke="#9aa6b2" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="42" y1="38" x2="46" y2="44" stroke="#9aa6b2" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  ),
  turtle: (
    <g>
      {/* shell */}
      <ellipse cx="24" cy="26" rx="16" ry="12" fill="#4a9a3a" />
      {/* shell pattern */}
      <ellipse cx="24" cy="26" rx="10" ry="7" fill="#3a7a2a" />
      <path d="M14 22 q5-3 10-1 q5-2 10 1" stroke="#2a5a1a" strokeWidth="1.2" fill="none" />
      <path d="M14 30 q5 3 10 1 q5 2 10-1" stroke="#2a5a1a" strokeWidth="1.2" fill="none" />
      <line x1="24" y1="14" x2="24" y2="38" stroke="#2a5a1a" strokeWidth="1.2" />
      {/* head */}
      <circle cx="38" cy="22" r="6" fill="#5ab040" />
      <circle cx="40" cy="20" r="1.4" fill="#2b2f36" />
      {/* legs */}
      <ellipse cx="13" cy="17" rx="4" ry="2.5" fill="#5ab040" transform="rotate(-30 13 17)" />
      <ellipse cx="13" cy="35" rx="4" ry="2.5" fill="#5ab040" transform="rotate(30 13 35)" />
      <ellipse cx="35" cy="35" rx="4" ry="2.5" fill="#5ab040" transform="rotate(-30 35 35)" />
      {/* tail */}
      <path d="M8 27 q-4 1-5 4" stroke="#5ab040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  ),
  taxi: (
    <g>
      {/* body */}
      <rect x="6" y="22" width="36" height="14" rx="3" fill="#f7c948" />
      {/* roof */}
      <path d="M12 22 l4-9 h16 l4 9 z" fill="#f7c948" />
      {/* windows */}
      <rect x="14" y="15" width="8" height="7" rx="1.2" fill="#bfe9f0" />
      <rect x="24" y="15" width="8" height="7" rx="1.2" fill="#bfe9f0" />
      {/* taxi checker stripe */}
      <path d="M6 28 h36" stroke="#2b2f36" strokeWidth="3.5" />
      <path d="M8 28 h4 v3 h-4 z M16 28 h4 v3 h-4 z M24 28 h4 v3 h-4 z M32 28 h4 v3 h-4 z" fill="#f7c948" />
      {/* wheels */}
      <circle cx="14" cy="37" r="4" fill="#2b2f36" />
      <circle cx="34" cy="37" r="4" fill="#2b2f36" />
      <circle cx="14" cy="37" r="1.8" fill="#9aa6b2" />
      <circle cx="34" cy="37" r="1.8" fill="#9aa6b2" />
    </g>
  ),
  taco: (
    <g>
      {/* shell outer — U-shape */}
      <path d="M8 18 q0 20 16 22 q16-2 16-22" fill="#e8c060" stroke="#c8a040" strokeWidth="1.4" strokeLinejoin="round" />
      {/* filling layers */}
      <path d="M10 22 h28" stroke="#c05a3a" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 27 h28" stroke="#5a9a3a" strokeWidth="3" strokeLinecap="round" />
      <path d="M10 31 h28" stroke="#e8e060" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  ),
  tooth: (
    <g>
      {/* molar shape: rounded rectangle top, two roots below */}
      <rect x="13" y="11" width="22" height="18" rx="6" fill="#f5f5f5" stroke="#d0ccc8" strokeWidth="1.2" />
      {/* middle groove */}
      <line x1="24" y1="11" x2="24" y2="29" stroke="#d0ccc8" strokeWidth="1.4" />
      {/* left root */}
      <path d="M16 29 q-2 8 0 12" stroke="#f5f5f5" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M16 29 q-2 8 0 12" stroke="#d0ccc8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* right root */}
      <path d="M32 29 q2 8 0 12" stroke="#f5f5f5" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M32 29 q2 8 0 12" stroke="#d0ccc8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </g>
  ),

  // ── everyday endings — /t/ ────────────────────────────────
  goat: (
    <g>
      {/* horns — key differentiator */}
      <path d="M16 12 q-4-8-2-10 q4 2 4 8 z" fill="#c8b090" />
      <path d="M32 12 q4-8 2-10 q-4 2-4 8 z" fill="#c8b090" />
      {/* head */}
      <ellipse cx="24" cy="22" rx="12" ry="11" fill="#d4c8a8" />
      {/* beard — key differentiator from sheep */}
      <path d="M24 33 q-3 8 0 10 q3-2 0-10 z" fill="#c8b090" />
      {/* ears */}
      <path d="M12 18 q-6 0-5 6 q3-1 7-3z" fill="#d4c8a8" />
      <path d="M36 18 q6 0 5 6 q-3-1-7-3z" fill="#d4c8a8" />
      {/* eyes */}
      <ellipse cx="19" cy="20" rx="2" ry="1.5" fill="#3a3020" />
      <ellipse cx="29" cy="20" rx="2" ry="1.5" fill="#3a3020" />
      {/* nose */}
      <ellipse cx="24" cy="28" rx="4" ry="2.5" fill="#c0a888" />
      <circle cx="22.5" cy="28" r="1" fill="#7a5840" />
      <circle cx="25.5" cy="28" r="1" fill="#7a5840" />
    </g>
  ),
  boat: (
    <g>
      {/* hull only — no sail, distinct from sailboat */}
      <path d="M6 28 h36 l-4 10 H10 z" fill="#2f6fbf" />
      {/* hull top rail */}
      <rect x="6" y="25" width="36" height="4" rx="2" fill="#4a8ad6" />
      {/* cabin box */}
      <rect x="14" y="16" width="16" height="10" rx="2" fill="#f5f0e0" />
      {/* cabin window */}
      <rect x="18" y="18" width="6" height="5" rx="1" fill="#bfe9f0" />
      {/* waterline */}
      <path d="M4 38 h40" stroke="#3aa0b4" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  kite: (
    <g>
      {/* diamond kite body (sized to keep the tail within the 48 viewBox) */}
      <path d="M24 5 L37 21 L24 33 L11 21 Z" fill="#e0473b" />
      {/* kite cross */}
      <line x1="24" y1="5" x2="24" y2="33" stroke="#c03028" strokeWidth="1.4" />
      <line x1="11" y1="21" x2="37" y2="21" stroke="#c03028" strokeWidth="1.4" />
      {/* quarter colour */}
      <path d="M24 5 L37 21 L24 21 Z" fill="#f2a83a" />
      <path d="M24 33 L11 21 L24 21 Z" fill="#f2a83a" />
      {/* tail */}
      <path d="M24 33 q3 2.5 1 5 q-3 2.5 1 5 q3 2 1 4" fill="none" stroke="#e0473b" strokeWidth="1.7" strokeLinecap="round" />
      {/* bows on tail */}
      <path d="M24.5 37 l2.6 1.6 -2.6 1.6 M25 44 l2.6 1.6 -2.6 1.6" fill="none" stroke="#f2a83a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  foot: (
    <g>
      {/* heel + arch + ball */}
      <path d="M14 18 q-3 0-3 8 q0 12 4 14 h18 q4 0 5-3 v-4 q0-2-2-2 h-2 q-1-2 0-4 v-4 q0-3-3-3 h-3 q-1-3-2-5 q-1-4-5-4 q-7 0-7 7 z" fill="#f0c8a0" />
      {/* toes */}
      <circle cx="32" cy="16" r="3.5" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      <circle cx="37" cy="19" r="3" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      <circle cx="40" cy="24" r="2.8" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      <circle cx="40" cy="30" r="2.5" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      <circle cx="38" cy="35" r="2.2" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      {/* toenails */}
      <path d="M31 14 q1.5-1 3 0" stroke="#e0b088" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M35.5 17 q1.2-1 2.4 0" stroke="#e0b088" strokeWidth="1" fill="none" strokeLinecap="round" />
    </g>
  ),

  // ── everyday endings — /n/ ────────────────────────────────
  crown: (
    <g>
      {/* gold crown body */}
      <path d="M8 36 V20 l8 8 8-12 8 12 8-8 v16 z" fill="#f7c948" stroke="#d9a820" strokeWidth="1.2" strokeLinejoin="round" />
      {/* jewels */}
      <circle cx="24" cy="30" r="3" fill="#e0473b" />
      <circle cx="14" cy="33" r="2" fill="#3aa0b4" />
      <circle cx="34" cy="33" r="2" fill="#3aa0b4" />
      {/* base band */}
      <rect x="8" y="33" width="32" height="4" rx="1" fill="#e6b820" />
    </g>
  ),
  lion: (
    <g>
      {/* mane — key differentiator — ring of triangles/petals */}
      <circle cx="24" cy="26" r="18" fill="#e8a030" />
      {/* mane texture */}
      <circle cx="24" cy="26" r="14" fill="#d08020" />
      {/* face */}
      <circle cx="24" cy="26" r="11" fill="#f0b860" />
      {/* muzzle */}
      <ellipse cx="24" cy="31" rx="6" ry="4" fill="#f0d090" />
      {/* eyes */}
      <circle cx="19.5" cy="23.5" r="2.2" fill="#2b1a10" />
      <circle cx="28.5" cy="23.5" r="2.2" fill="#2b1a10" />
      <circle cx="20.2" cy="22.8" r="0.7" fill="#ffffff" />
      <circle cx="29.2" cy="22.8" r="0.7" fill="#ffffff" />
      {/* nose */}
      <ellipse cx="24" cy="28.5" rx="2.5" ry="1.5" fill="#2b1a10" />
      {/* whisker dots */}
      <circle cx="18" cy="31" r="0.8" fill="#c08040" />
      <circle cx="21" cy="32.5" r="0.8" fill="#c08040" />
      <circle cx="30" cy="31" r="0.8" fill="#c08040" />
      <circle cx="27" cy="32.5" r="0.8" fill="#c08040" />
    </g>
  ),
  corn: (
    <g>
      {/* husk leaves */}
      <path d="M18 14 q-6-4-8 4 q4 2 12 2 z" fill="#5a9a3a" />
      <path d="M30 14 q6-4 8 4 q-4 2-12 2 z" fill="#5a9a3a" />
      <path d="M24 10 q-2-6 4-8 q2 6-2 10 z" fill="#5a9a3a" />
      {/* cob */}
      <rect x="16" y="15" width="16" height="24" rx="8" fill="#f0c040" />
      {/* kernel rows */}
      <path d="M17 20 q7-2 14 0 M17 25 q7-2 14 0 M17 30 q7-2 14 0 M17 35 q7-2 14 0" stroke="#d4a820" strokeWidth="1.4" fill="none" />
      {/* kernel dots */}
      <circle cx="20" cy="22" r="1" fill="#e8b030" />
      <circle cx="24" cy="22" r="1" fill="#e8b030" />
      <circle cx="28" cy="22" r="1" fill="#e8b030" />
      <circle cx="20" cy="27" r="1" fill="#e8b030" />
      <circle cx="24" cy="27" r="1" fill="#e8b030" />
      <circle cx="28" cy="27" r="1" fill="#e8b030" />
    </g>
  ),
  train: (
    <g>
      {/* engine body */}
      <rect x="6" y="22" width="22" height="14" rx="3" fill="#e0473b" />
      {/* cabin */}
      <rect x="28" y="26" width="14" height="10" rx="2" fill="#c03028" />
      {/* window */}
      <rect x="10" y="25" width="8" height="6" rx="1.2" fill="#bfe9f0" />
      <rect x="31" y="28" width="8" height="5" rx="1" fill="#bfe9f0" />
      {/* funnel / chimney */}
      <rect x="9" y="16" width="5" height="7" rx="2" fill="#2b2f36" />
      {/* smoke puff */}
      <circle cx="11.5" cy="13" r="3" fill="#d0d8de" fillOpacity="0.8" />
      <circle cx="16" cy="11" r="2.2" fill="#d0d8de" fillOpacity="0.6" />
      {/* wheels */}
      <circle cx="14" cy="37" r="4" fill="#2b2f36" />
      <circle cx="26" cy="37" r="4" fill="#2b2f36" />
      <circle cx="36" cy="37" r="3.5" fill="#2b2f36" />
      <circle cx="14" cy="37" r="1.8" fill="#9aa6b2" />
      <circle cx="26" cy="37" r="1.8" fill="#9aa6b2" />
      <circle cx="36" cy="37" r="1.5" fill="#9aa6b2" />
      {/* track */}
      <line x1="4" y1="41" x2="44" y2="41" stroke="#9aa6b2" strokeWidth="2" />
    </g>
  ),

  // ── everyday endings — /p/ ────────────────────────────────
  ship: (
    <g>
      {/* big hull */}
      <path d="M4 30 h40 l-5 10 H9 z" fill="#2f6fbf" />
      {/* superstructure */}
      <rect x="10" y="20" width="28" height="11" rx="2" fill="#d0d8de" />
      {/* portholes */}
      <circle cx="17" cy="25" r="2.5" fill="#bfe9f0" stroke="#9aa6b2" strokeWidth="1" />
      <circle cx="24" cy="25" r="2.5" fill="#bfe9f0" stroke="#9aa6b2" strokeWidth="1" />
      <circle cx="31" cy="25" r="2.5" fill="#bfe9f0" stroke="#9aa6b2" strokeWidth="1" />
      {/* funnels */}
      <rect x="16" y="10" width="6" height="11" rx="2" fill="#e0473b" />
      <rect x="26" y="13" width="5" height="8" rx="2" fill="#e0473b" />
      {/* smoke */}
      <circle cx="19" cy="8" r="3" fill="#9aa6b2" fillOpacity="0.7" />
      <circle cx="28.5" cy="11" r="2.5" fill="#9aa6b2" fillOpacity="0.6" />
      {/* waterline */}
      <path d="M3 40 h42" stroke="#3aa0b4" strokeWidth="2" strokeLinecap="round" />
    </g>
  ),
  sheep: (
    <g>
      {/* fluffy white body — cloud-like bumps, key differentiator */}
      <circle cx="16" cy="27" r="9" fill="#eef3f6" />
      <circle cx="24" cy="24" r="10" fill="#eef3f6" />
      <circle cx="32" cy="27" r="9" fill="#eef3f6" />
      <circle cx="20" cy="32" r="8" fill="#eef3f6" />
      <circle cx="28" cy="32" r="8" fill="#eef3f6" />
      {/* face — small, dark, distinct from white wool */}
      <ellipse cx="36" cy="22" rx="6" ry="7" fill="#c8b090" />
      <circle cx="37" cy="20" r="1.4" fill="#2b1a10" />
      {/* legs */}
      <rect x="15" y="38" width="3" height="6" rx="1.5" fill="#c8b090" />
      <rect x="20" y="39" width="3" height="5" rx="1.5" fill="#c8b090" />
      <rect x="25" y="39" width="3" height="5" rx="1.5" fill="#c8b090" />
      <rect x="30" y="38" width="3" height="6" rx="1.5" fill="#c8b090" />
      {/* ear */}
      <path d="M33 16 q2-5 6-3 q-1 4-5 5 z" fill="#c8b090" />
    </g>
  ),
  mop: (
    <g>
      {/* handle */}
      <rect x="22" y="6" width="4" height="28" rx="2" fill="#9aa6b2" />
      {/* mop head — shaggy strings */}
      <path d="M13 34 q11-4 22 0" fill="#cfe6ee" stroke="#aab8c2" strokeWidth="1" />
      <path d="M13 34 q-2 4-2 8 q2 1 4 0 q0-4 2-7z" fill="#cfe6ee" />
      <path d="M17 34 q-1 5-0 8 q2 1 3 0 q0-4 1-7z" fill="#bcd3dd" />
      <path d="M21 34 q0 5 0 8 q2 1 3-1 q0-4 0-7z" fill="#cfe6ee" />
      <path d="M25 34 q1 5 1 8 q2 0 3-1 q-1-4-0-7z" fill="#bcd3dd" />
      <path d="M29 34 q2 4 2 7 q2 1 3 0 q0-4-1-7z" fill="#cfe6ee" />
      <path d="M33 34 q2 4 2 7 q2 0 2-1 q-1-4-2-7z" fill="#bcd3dd" />
    </g>
  ),
  cap: (
    <g>
      {/* brim */}
      <ellipse cx="24" cy="30" rx="20" ry="4" fill="#2f6fbf" />
      {/* dome */}
      <path d="M6 30 q0-16 18-16 q18 0 18 16 z" fill="#3a80d6" />
      {/* crown seam */}
      <path d="M24 14 v16" stroke="#2f6fbf" strokeWidth="1" fill="none" />
      {/* button on top */}
      <circle cx="24" cy="14" r="2.5" fill="#2b2f36" />
      {/* front brim extension */}
      <path d="M4 30 q8 5 20 4 q-14-1-20-4z" fill="#2560ab" />
      {/* panel stitch lines */}
      <path d="M24 14 q-10 4-18 16 M24 14 q10 4 18 16" stroke="#2f6fbf" strokeWidth="0.8" fill="none" />
    </g>
  ),

  // ── everyday endings — /m/ ────────────────────────────────
  drum: (
    <g>
      {/* drum cylinder */}
      <ellipse cx="24" cy="34" rx="16" ry="5" fill="#c83a30" />
      <rect x="8" y="18" width="32" height="16" fill="#e0473b" />
      {/* top head */}
      <ellipse cx="24" cy="18" rx="16" ry="5" fill="#f5f0e0" stroke="#d0c8b0" strokeWidth="1.2" />
      {/* rope zigzag */}
      <path d="M8 22 l4-4 4 4 4-4 4 4 4-4 4 4 4-4" stroke="#f5f0e0" strokeWidth="1.2" fill="none" />
      {/* drumsticks */}
      <path d="M10 8 L18 20" stroke="#8a6a4a" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="10" cy="8" r="3.5" fill="#c8923f" />
      <path d="M38 8 L30 20" stroke="#8a6a4a" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="38" cy="8" r="3.5" fill="#c8923f" />
    </g>
  ),
  ham: (
    <g>
      {/* bone */}
      <rect x="32" y="10" width="6" height="30" rx="3" fill="#f5f0e0" stroke="#d0ccc8" strokeWidth="1" />
      <circle cx="35" cy="10" r="5" fill="#f5f0e0" stroke="#d0ccc8" strokeWidth="1" />
      <circle cx="35" cy="40" r="5" fill="#f5f0e0" stroke="#d0ccc8" strokeWidth="1" />
      {/* meat */}
      <ellipse cx="22" cy="25" rx="14" ry="16" fill="#c85a3a" />
      {/* fat layer */}
      <path d="M10 18 q2-8 12-8 q10 0 12 8 q-2-4-12-4 q-10 0-12 4 z" fill="#f5f0d0" />
      {/* glossy highlight */}
      <ellipse cx="18" cy="22" rx="4" ry="5" fill="#d87050" fillOpacity="0.5" />
    </g>
  ),
  worm: (
    <g>
      {/* segmented worm body */}
      <circle cx="12" cy="30" r="5" fill="#e07090" />
      <circle cx="20" cy="26" r="5.5" fill="#d06080" />
      <circle cx="28" cy="24" r="5.5" fill="#e07090" />
      <circle cx="36" cy="26" r="5" fill="#d06080" />
      {/* head */}
      <circle cx="40" cy="20" r="6" fill="#c8a040" />
      {/* eyes */}
      <circle cx="38" cy="18" r="1.4" fill="#2b1a10" />
      <circle cx="43" cy="19" r="1.4" fill="#2b1a10" />
      {/* antenna */}
      <path d="M40 14 q-2-4 0-6 M40 14 q2-4 4-6" stroke="#c8a040" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="8" r="1.5" fill="#c8a040" />
      <circle cx="44" cy="8" r="1.5" fill="#c8a040" />
    </g>
  ),
  gem: (
    <g>
      {/* diamond gem */}
      <path d="M14 20 h20 l-10 22 z" fill="#3aa0b4" />
      <path d="M14 20 h20 l-10 22 z" fill="none" stroke="#2b8294" strokeWidth="0.8" />
      {/* top facets */}
      <path d="M10 16 l4 4 h20 l4-4 z" fill="#5ac0d4" />
      {/* top split */}
      <path d="M24 8 l-14 8 h28 z" fill="#7adce8" />
      {/* inner lines */}
      <path d="M24 8 l-10 12 M24 8 l10 12 M24 8 v34 M14 20 l10 22 M34 20 l-10 22 M10 16 l14 26 M38 16 l-14 26" stroke="#2b8294" strokeWidth="0.7" fill="none" />
    </g>
  ),
  arm: (
    <g>
      {/* upper arm */}
      <path d="M12 30 q0-14 8-16 q10-2 12 6 q-4-6-10-4 q-6 2-6 14 z" fill="#f0c8a0" />
      {/* bicep bulge — flexed */}
      <ellipse cx="20" cy="18" rx="9" ry="11" fill="#f0c8a0" />
      {/* forearm */}
      <path d="M29 24 q8 4 10 12 q-2 2-4 1 q-2-8-10-10 z" fill="#f0c8a0" />
      {/* hand / fist */}
      <ellipse cx="38" cy="38" rx="6" ry="5" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      {/* shirt sleeve cuff */}
      <path d="M10 32 q2-4 6-3 q-2 0-6 3 z" fill="#3a80d6" />
      <rect x="10" y="29" width="8" height="4" rx="2" fill="#3a80d6" />
    </g>
  ),
  thumb: (
    <g>
      {/* hand base / palm */}
      <rect x="10" y="26" width="22" height="16" rx="5" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      {/* thumb pointing up */}
      <path d="M12 26 q0-18 8-18 q6 0 6 8 v10 z" fill="#f0c8a0" stroke="#d4a880" strokeWidth="1" />
      {/* knuckle crease on thumb */}
      <path d="M14 16 q3-1 6 0" stroke="#d4a880" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M14 20 q3-1 6 0" stroke="#d4a880" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* finger bumps along top of fist */}
      <path d="M18 26 q4-3 8 0 q4-3 6 0" stroke="#d4a880" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* fingernail on thumb */}
      <path d="M16 11 q3-2 6 0 q-1 3-3 4 q-2-1-3-4 z" fill="#e8d0b8" />
    </g>
  ),
};

/**
 * A draggable "specimen": the word's object icon floating in a glowing
 * holo-capsule with a tilted orbit ring. Decorative-only (aria-hidden) — the
 * enclosing button carries the word's accessible label. Falls back to the
 * emoji for any word that doesn't have a bespoke icon yet.
 */
export function SpaceSpecimen({ id, label, emoji }: { id: string; label: string; emoji: string }) {
  const icon = CREATURE_ICONS[id] ?? CREATURE_ICONS[label.toLowerCase()];
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
