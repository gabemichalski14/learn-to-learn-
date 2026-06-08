import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pip } from '../mascots/Pip';
import { sfx } from '../audio/sfx';
import './living-world.css';

/**
 * Rare, delightful surprises on every chrome page — a mascot peek, a tappable
 * four-leaf clover, a butterfly, a sparkle. Frequency and variety scale gently
 * with the learner's world tier ("rewards thorough play"), but even a brand-new
 * learner gets the occasional Pip peek, so the mascot truly shows up everywhere.
 *
 * Clippy-proofed: surprises are rare, never block, auto-dismiss, and the one
 * interactive egg (clover) is opt-in (you tap it, it doesn't tap you). Driven by
 * a single self-rescheduling timer — never a render loop. prefers-reduced-motion
 * limits it to the calm, static clover.
 */
type EggType = 'peek' | 'clover' | 'butterfly' | 'star' | 'motif';

interface Egg { type: EggType; key: number; left: number; top: number; side: 1 | -1; caught: boolean; glyph?: string; }

const rnd = (n: number) => Math.floor(Math.random() * n);

function eligibleTypes(tier: number, reduce: boolean): EggType[] {
  if (reduce) return ['clover']; // calm, static, opt-in only
  const pool: EggType[] = ['peek'];
  if (tier >= 1) pool.push('clover');
  if (tier >= 2) pool.push('butterfly');
  if (tier >= 3) pool.push('star');
  return pool;
}

const LIFETIME: Record<EggType, number> = { peek: 4200, clover: 9000, butterfly: 7200, star: 1600, motif: 5200 };

/**
 * @param motifs friend symbols to occasionally drift past (from worldMotifs)
 * @param boost  extra spawn chance while a friend is being helped / is home
 */
export function EasterEggs({ tier, motifs = [], boost = 0 }: { tier: number; motifs?: string[]; boost?: number }) {
  const [egg, setEgg] = useState<Egg | null>(null);
  const lastType = useRef<EggType | null>(null);
  const timers = useRef<number[]>([]);
  const push = (id: number) => { timers.current.push(id); };
  const motifsKey = motifs.join(''); // stable dep for the effect

  useEffect(() => {
    const t = Math.max(0, Math.min(5, tier | 0));
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pool = eligibleTypes(t, reduce);
    // A friend's symbol drifts by while you're helping them / after they're home
    // (skipped under reduced-motion — it gently floats). Weighted so it's common.
    if (motifs.length && !reduce) { pool.push('motif', 'motif'); }
    let alive = true;

    const spawn = (type: EggType) => {
      setEgg({
        type, key: Date.now(),
        left: 8 + rnd(80), top: 22 + rnd(54),
        side: rnd(2) === 0 ? 1 : -1, caught: false,
        glyph: type === 'motif' ? motifs[rnd(motifs.length)] : undefined,
      });
      push(window.setTimeout(() => { if (alive) setEgg(null); }, LIFETIME[type]));
    };

    const schedule = () => {
      const wait = 16000 + Math.random() * 20000; // 16–36s, jittered
      const id = window.setTimeout(() => {
        if (!alive) return;
        const chance = Math.min(0.95, 0.32 + t * 0.1 + boost); // boosted when a friend is in play
        if (Math.random() < chance) {
          let type = pool[rnd(pool.length)];
          for (let i = 0; i < 5 && type === lastType.current && pool.length > 1; i++) type = pool[rnd(pool.length)];
          lastType.current = type;
          spawn(type);
        }
        schedule();
      }, wait);
      push(id);
    };

    push(window.setTimeout(schedule, 6000)); // let the page settle first
    return () => { alive = false; timers.current.forEach(window.clearTimeout); timers.current = []; };
    // motifs read via the stable motifsKey so the timer isn't rescheduled every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, motifsKey, boost]);

  if (!egg) return null;

  const catchClover = () => {
    if (egg.caught) return;
    sfx.correct();
    setEgg({ ...egg, caught: true });
    push(window.setTimeout(() => setEgg(null), 650));
  };

  const pos = { left: `${egg.left}%`, top: `${egg.top}%` } as CSSProperties;

  if (egg.type === 'peek') {
    const fromRight = egg.side === 1;
    return (
      <div className={`egg egg--peek ${fromRight ? 'egg--right' : 'egg--left'}`} style={{ top: `${egg.top}%` }} aria-hidden="true">
        <Pip size={92} expression="wink" />
      </div>
    );
  }
  if (egg.type === 'butterfly') {
    return (
      <div className="egg egg--bfly" style={{ top: `${egg.top}%`, '--dir': egg.side } as CSSProperties} aria-hidden="true">
        <svg viewBox="0 0 40 34" width="30" height="26">
          <ellipse cx="20" cy="17" rx="2" ry="8" fill="#5a4633" />
          <path d="M19 14 q-15 -12 -17 2 q3 9 17 5z" fill="#b9e08a" />
          <path d="M21 14 q15 -12 17 2 q-3 9 -17 5z" fill="#cdeaa0" />
        </svg>
      </div>
    );
  }
  if (egg.type === 'star') {
    return <span className="egg egg--star" style={pos} aria-hidden="true" />;
  }
  if (egg.type === 'motif') {
    return <span className="egg egg--motif" style={{ left: `${egg.left}%`, top: `${egg.top}%`, '--dir': egg.side } as CSSProperties} aria-hidden="true">{egg.glyph}</span>;
  }
  // clover — the one tappable, opt-in surprise
  return (
    <button
      type="button"
      className={`egg egg--clover${egg.caught ? ' egg--caught' : ''}`}
      style={pos}
      onClick={catchClover}
      aria-label="A lucky four-leaf clover — tap it!"
    >
      <svg viewBox="0 0 32 32" width="30" height="30">
        <g fill="#5fae5a">
          <path d="M16 16 q-9 -9 -3 -12 q6 -2 3 12z" />
          <path d="M16 16 q9 -9 3 -12 q-6 -2 -3 12z" />
          <path d="M16 16 q-9 9 -12 3 q-2 -6 12 -3z" />
          <path d="M16 16 q9 9 12 3 q2 -6 -12 -3z" />
        </g>
        <path d="M16 16 q-1 8 -3 12" stroke="#3f7a55" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );
}
