import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Flower, GrassTuft, Butterfly } from '../worlds/garden/GardenFlora';
import './living-world.css';

/**
 * The app-wide Living World backdrop. A fixed, decorative layer that sits BEHIND
 * page content (z-index:-1). Even at tier 0 it is a real, calm meadow — a grass
 * floor, trees on the horizon, drifting clouds, pollen on the breeze, a
 * butterfly. Higher tiers (0..5) ADD density and life on top: more flora, more
 * butterflies, fireflies at dusk, birds, falling blossom, and finally a shooting
 * star. Growth is felt as *more life*, never as "empty → full".
 *
 * Performance + accessibility guardrails (hard-won — see project history):
 *  - Positions are seeded ONCE per tier (useMemo), never reshuffled per render,
 *    so there's zero layout thrash and no render loop.
 *  - Motion is transform/opacity only (never filter/backdrop-filter), staggered,
 *    and only a subset of elements animates at a time.
 *  - Element counts are capped per tier.
 *  - prefers-reduced-motion freezes all drift (handled in CSS).
 */

// Deterministic PRNG (mulberry32) so the scene is varied but stable per tier.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A lush baseline even at tier 0 — growth adds more on top.
const FLORA_BY_TIER = [20, 28, 36, 46, 56, 68];
const FIREFLY_BY_TIER = [0, 0, 2, 6, 9, 12];
const TREES_BY_TIER = [2, 3, 3, 4, 4, 5];

interface FloraBit { left: number; bottom: number; size: number; type: number; sway: boolean; delay: number; }
interface Drifter { top: number; size: number; dur: number; delay: number; dir: 1 | -1; }
interface TreeBit { left: number; size: number; depth: number; }

function Tree({ left, size, depth }: TreeBit) {
  // Farther trees are smaller, paler, and sit a touch higher on the hill.
  return (
    <span className="lw-tree" style={{ left: `${left}%`, bottom: `${6 + (1 - depth) * 12}%`, opacity: 0.4 + depth * 0.5 } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 60 82" width={size} height={size * 1.36}>
        <path d="M30 82 V50" stroke="#9c6b43" strokeWidth="5" strokeLinecap="round" />
        <circle cx="30" cy="32" r="20" fill="#7cb86a" />
        <circle cx="16" cy="42" r="14" fill="#6aa85f" />
        <circle cx="45" cy="42" r="14" fill="#86c074" />
        <circle cx="30" cy="46" r="16" fill="#74b869" />
      </svg>
    </span>
  );
}

function Cloud({ style }: { style: CSSProperties }) {
  return (
    <span className="lw-cloud" style={style} aria-hidden="true">
      <svg viewBox="0 0 130 54" width="130" height="54">
        <g fill="#ffffff">
          <ellipse cx="42" cy="34" rx="32" ry="17" />
          <ellipse cx="70" cy="26" rx="28" ry="19" />
          <ellipse cx="92" cy="35" rx="24" ry="14" />
        </g>
      </svg>
    </span>
  );
}

function Firefly({ style }: { style: CSSProperties }) {
  return <span className="lw-firefly" style={style} aria-hidden="true" />;
}

function Mote({ style }: { style: CSSProperties }) {
  return <span className="lw-mote" style={style} aria-hidden="true" />;
}

function Bird({ style }: { style: CSSProperties }) {
  return (
    <span className="lw-bird" style={style} aria-hidden="true">
      <svg viewBox="0 0 36 16" width="34" height="15">
        <path className="lw-bird__wing lw-bird__wing--l" d="M18 9 q-9 -8 -16 -3" fill="none" stroke="#4a6b86" strokeWidth="2.4" strokeLinecap="round" />
        <path className="lw-bird__wing lw-bird__wing--r" d="M18 9 q9 -8 16 -3" fill="none" stroke="#4a6b86" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Petal({ style }: { style: CSSProperties }) {
  return (
    <span className="lw-petal" style={style} aria-hidden="true">
      <svg viewBox="0 0 16 16" width="13" height="13"><path d="M8 1 q6 4 0 14 q-6 -10 0 -14z" fill="#ffb6d4" /></svg>
    </span>
  );
}

export function LivingWorld({ tier }: { tier: number }) {
  const t = Math.max(0, Math.min(5, tier | 0));

  // One bloom-in when the layer first mounts this session: the world visibly
  // "wakes up / re-blooms" on every return. Recovery, never punishment.
  const [waking, setWaking] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setWaking(false), 1400);
    return () => window.clearTimeout(id);
  }, []);

  const scene = useMemo(() => {
    const rnd = mulberry32(0x5eed + t * 97);

    // Dense grass floor band — always present, so the bottom always reads as a
    // meadow even at tier 0.
    const grass = Array.from({ length: 14 }, (_, i) => ({
      left: (i / 14) * 100 + rnd() * 5,
      size: 26 + rnd() * 18,
      delay: rnd() * 6,
    }));

    const floraN = FLORA_BY_TIER[t];
    const flora: FloraBit[] = Array.from({ length: floraN }, (_, i) => {
      const bottom = rnd() * 17; // 0..17% — a band with depth
      const depth = 1 - bottom / 24;
      return {
        left: rnd() * 99,
        bottom,
        size: Math.round((26 + rnd() * 28) * depth),
        type: Math.floor(rnd() * 6),
        sway: i % 4 === 0, // only a quarter sway at once — a breeze, not a wiggle
        delay: rnd() * 6,
      };
    });

    const trees: TreeBit[] = Array.from({ length: TREES_BY_TIER[t] }, (_, i) => ({
      left: 4 + (i / TREES_BY_TIER[t]) * 92 + rnd() * 8,
      size: 64 + rnd() * 46,
      depth: rnd(), // 0 = far/pale/small, 1 = near
    }));

    const clouds = Array.from({ length: t >= 3 ? 3 : 2 }, () => ({
      top: 4 + rnd() * 22,
      dur: 60 + rnd() * 50,
      delay: -rnd() * 60,
      scale: 0.7 + rnd() * 0.7,
    }));

    const motes = Array.from({ length: 4 + t * 2 }, () => ({
      left: rnd() * 98,
      dur: 12 + rnd() * 12,
      delay: rnd() * 14,
      drift: -16 + rnd() * 32,
    }));

    // At least one butterfly even at tier 0, so a brand-new world feels alive.
    const butterflyN = Math.min(1 + t, 4);
    const butterflies: Drifter[] = Array.from({ length: butterflyN }, () => ({
      top: 20 + rnd() * 46,
      size: 22 + rnd() * 12,
      dur: 22 + rnd() * 16,
      delay: rnd() * 14,
      dir: rnd() < 0.5 ? 1 : -1,
    }));

    const fireflies = Array.from({ length: FIREFLY_BY_TIER[t] }, () => ({
      left: rnd() * 96,
      top: 30 + rnd() * 52,
      dur: 4 + rnd() * 4,
      delay: rnd() * 6,
    }));

    const birds: Drifter[] = t >= 4
      ? Array.from({ length: 2 }, () => ({ top: 6 + rnd() * 18, size: 30, dur: 26 + rnd() * 14, delay: rnd() * 16, dir: rnd() < 0.5 ? 1 : -1 }))
      : [];

    const petals = t >= 3
      ? Array.from({ length: t >= 5 ? 8 : 5 }, () => ({ left: rnd() * 96, dur: 9 + rnd() * 7, delay: rnd() * 10, drift: -20 + rnd() * 40 }))
      : [];

    return { grass, flora, trees, clouds, motes, butterflies, fireflies, birds, petals };
  }, [t]);

  return (
    <div className={`living-world living-world--t${t}${waking ? ' living-world--waking' : ''}`} aria-hidden="true">
      <div className="lw-hills" />
      <div className="lw-haze" />

      {/* far layer: trees on the horizon */}
      {scene.trees.map((tr, i) => <Tree key={`tr-${i}`} {...tr} />)}

      {/* sky life */}
      {scene.clouds.map((c, i) => (
        <Cloud key={`cl-${i}`} style={{ top: `${c.top}%`, '--dur': `${c.dur}s`, '--delay': `${c.delay}s`, '--scale': c.scale } as CSSProperties} />
      ))}
      {t >= 5 && <span className="lw-shooting-star" />}
      {scene.birds.map((b, i) => (
        <Bird key={`bird-${i}`} style={{ top: `${b.top}%`, '--dur': `${b.dur}s`, '--delay': `${b.delay}s`, '--dir': b.dir } as CSSProperties} />
      ))}
      {scene.butterflies.map((b, i) => (
        <span key={`bf-${i}`} className="lw-drift" style={{ top: `${b.top}%`, '--dur': `${b.dur}s`, '--delay': `${b.delay}s`, '--dir': b.dir } as CSSProperties}>
          <Butterfly size={b.size} />
        </span>
      ))}
      {scene.fireflies.map((f, i) => (
        <Firefly key={`ff-${i}`} style={{ left: `${f.left}%`, top: `${f.top}%`, '--dur': `${f.dur}s`, '--delay': `${f.delay}s` } as CSSProperties} />
      ))}
      {scene.motes.map((m, i) => (
        <Mote key={`mo-${i}`} style={{ left: `${m.left}%`, '--dur': `${m.dur}s`, '--delay': `${m.delay}s`, '--drift': `${m.drift}px` } as CSSProperties} />
      ))}
      {scene.petals.map((p, i) => (
        <Petal key={`pt-${i}`} style={{ left: `${p.left}%`, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--drift': `${p.drift}px` } as CSSProperties} />
      ))}

      {/* near layer: meadow floor + flora */}
      <div className="lw-ground">
        {scene.grass.map((g, i) => (
          <span key={`gr-${i}`} className="lw-grass" style={{ left: `${g.left}%`, '--delay': `${g.delay}s` } as CSSProperties}>
            <GrassTuft size={g.size} />
          </span>
        ))}
        {scene.flora.map((f, i) => (
          <span key={`fl-${i}`} className={`lw-flora${f.sway ? ' lw-flora--sway' : ''}`} style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, '--delay': `${f.delay}s` } as CSSProperties}>
            <Flower type={f.type} size={f.size} />
          </span>
        ))}
      </div>
    </div>
  );
}
