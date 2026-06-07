import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Flower, Butterfly } from '../worlds/garden/GardenFlora';
import './living-world.css';

/**
 * The app-wide Living World backdrop. A fixed, decorative layer that sits BEHIND
 * page content (z-index:-1) and grows richer with the learner's tier (0..5):
 * each tier ADDS a layer — ground flora, then butterflies, fireflies at dusk,
 * birds & falling blossom, finally a full meadow with a shooting star. It never
 * removes what an earlier tier added, so the world only ever opens up.
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

const FLORA_BY_TIER = [4, 8, 13, 18, 24, 30];
const FIREFLY_BY_TIER = [0, 0, 0, 5, 6, 8];

interface FloraBit { left: number; bottom: number; size: number; type: number; sway: boolean; delay: number; }
interface Drifter { top: number; size: number; dur: number; delay: number; dir: 1 | -1; }

function Firefly({ style }: { style: CSSProperties }) {
  return <span className="lw-firefly" style={style} aria-hidden="true" />;
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
    const floraN = FLORA_BY_TIER[t];
    const flora: FloraBit[] = Array.from({ length: floraN }, (_, i) => {
      const bottom = rnd() * 15; // 0..15% — a band with depth
      const depth = 1 - bottom / 22; // higher up the hill = a touch smaller
      return {
        left: rnd() * 98,
        bottom,
        size: Math.round((26 + rnd() * 26) * depth),
        type: Math.floor(rnd() * 6),
        sway: i % 4 === 0, // only a quarter sway at once — a breeze, not a wiggle
        delay: rnd() * 6,
      };
    });

    const butterflyN = t >= 2 ? Math.min(t - 1, 3) : 0;
    const butterflies: Drifter[] = Array.from({ length: butterflyN }, () => ({
      top: 18 + rnd() * 44,
      size: 22 + rnd() * 10,
      dur: 22 + rnd() * 16,
      delay: rnd() * 12,
      dir: rnd() < 0.5 ? 1 : -1,
    }));

    const fireflies = Array.from({ length: FIREFLY_BY_TIER[t] }, () => ({
      left: rnd() * 96,
      top: 30 + rnd() * 50,
      dur: 4 + rnd() * 4,
      delay: rnd() * 6,
    }));

    const birds: Drifter[] = t >= 4
      ? Array.from({ length: 2 }, () => ({ top: 8 + rnd() * 20, size: 30, dur: 26 + rnd() * 14, delay: rnd() * 16, dir: rnd() < 0.5 ? 1 : -1 }))
      : [];

    const petals = t >= 4
      ? Array.from({ length: 6 }, () => ({ left: rnd() * 96, dur: 9 + rnd() * 7, delay: rnd() * 10, drift: -20 + rnd() * 40 }))
      : [];

    return { flora, butterflies, fireflies, birds, petals };
  }, [t]);

  return (
    <div className={`living-world living-world--t${t}${waking ? ' living-world--waking' : ''}`} aria-hidden="true">
      {/* sky / land wash escalates with tier via the tier class in CSS */}
      <div className="lw-hills" />
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
      {scene.petals.map((p, i) => (
        <Petal key={`pt-${i}`} style={{ left: `${p.left}%`, '--dur': `${p.dur}s`, '--delay': `${p.delay}s`, '--drift': `${p.drift}px` } as CSSProperties} />
      ))}

      <div className="lw-ground">
        {scene.flora.map((f, i) => (
          <span key={`fl-${i}`} className={`lw-flora${f.sway ? ' lw-flora--sway' : ''}`} style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, '--delay': `${f.delay}s` } as CSSProperties}>
            <Flower type={f.type} size={f.size} />
          </span>
        ))}
      </div>
    </div>
  );
}
