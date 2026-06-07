import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import './living-world.css';

/**
 * App-wide ambient backdrop — ROAD B "characterful flat" (see DESIGN.md style guide
 * + memory `barton-games-art-direction-rethink.md`). Deliberately ABSTRACT and
 * cohesive, NOT a literal painted scene: soft layered brand-gradient bands, a few
 * large rounded hills (one consistent shape language), gentle drifting light, and a
 * clean "growth" motif — a row of simple sprouts whose count rises with real
 * practice (competence made visible), never a literal meadow.
 *
 * Guardrails: fixed z-index:-1; transform/opacity-only motion; positions seeded once
 * (useMemo) so no thrash; a subset animates; prefers-reduced-motion freezes drift.
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

export function LivingWorld({ tier, lush }: { tier: number; lush: number; score?: number }) {
  const L = Math.max(0, Math.min(1, lush));
  // Time-of-day tint by the device clock: warm day, cooler calm evening.
  const evening = useMemo(() => { const h = new Date().getHours(); return h < 7 || h >= 19; }, []);
  const [waking, setWaking] = useState(true);
  useEffect(() => { const id = window.setTimeout(() => setWaking(false), 1200); return () => window.clearTimeout(id); }, []);

  const scene = useMemo(() => {
    const rnd = mulberry32(0x5eed + (tier | 0) * 131);
    // growth motif: a row of simple sprouts, count rises gently with practice
    const sproutN = lerp(5, 26, L);
    const sprouts = Array.from({ length: sproutN }, (_, i) => ({
      left: (i / sproutN) * 100 + rnd() * (100 / sproutN) * 0.6,
      h: 18 + rnd() * 26,                 // height
      hue: ['#6bae7f', '#7cb86a', '#8fce8c', '#a8d5a0'][Math.floor(rnd() * 4)],
      sway: i % 3 === 0,
      delay: rnd() * 5,
    }));
    // a few soft floating motes
    const motes = Array.from({ length: lerp(3, 9, L) }, () => ({
      left: rnd() * 98, bottom: 8 + rnd() * 60, dur: 14 + rnd() * 12, delay: rnd() * 12, drift: -14 + rnd() * 28,
    }));
    return { sprouts, motes };
  }, [tier, L]);

  return (
    <div className={`lw${evening ? ' lw--eve' : ''}${waking ? ' lw--wake' : ''}`} aria-hidden="true">
      {/* far rounded hills — one consistent soft shape, atmospheric depth */}
      <span className="lw-hill lw-hill--far" />
      <span className="lw-hill lw-hill--mid" />
      <span className="lw-hill lw-hill--near" />
      {/* gentle drifting light (dappled, opacity/transform only) */}
      <span className="lw-glow" />
      {/* soft floating motes */}
      {scene.motes.map((m, i) => (
        <span key={`m${i}`} className="lw-mote" style={{ left: `${m.left}%`, bottom: `${m.bottom}%`, '--dur': `${m.dur}s`, '--delay': `${m.delay}s`, '--drift': `${m.drift}px` } as CSSProperties} />
      ))}
      {/* growth motif: a clean sprout row along the base */}
      <div className="lw-grow">
        {scene.sprouts.map((s, i) => (
          <span key={`s${i}`} className={`lw-sprout${s.sway ? ' lw-sprout--sway' : ''}`} style={{ left: `${s.left}%`, '--delay': `${s.delay}s` } as CSSProperties}>
            <svg width={Math.round(s.h * 0.7)} height={s.h} viewBox="0 0 20 28">
              <path d="M10 28 V10" stroke="#5f9a58" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M10 16 q-7 -1 -8 -7 q6 -1 8 5z" fill={s.hue} />
              <path d="M10 12 q7 -1 8 -7 q-6 -1 -8 5z" fill={s.hue} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
