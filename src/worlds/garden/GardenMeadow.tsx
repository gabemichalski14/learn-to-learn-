import { type CSSProperties } from 'react';
import { useProgress } from '../../data/store';
import { Flower, GrassTuft, FLOWER_TYPES } from './GardenFlora';
import { bloomCount } from './gardenGrowth';

/**
 * The living garden — a FULL-SCREEN layer of hand-made SVG flora that fills in
 * as the child practices (sessions + stickers, read reactively; only ever adds).
 * Natural meadow: six flower species + grass tufts, depth via size (smaller =
 * farther up the hills), deterministic placement so it only grows. Motion is
 * restrained — only ~a quarter of the flora sways, slowly and staggered, like a
 * breeze passing through (calm, not a wiggle; also cheap).
 */
export function GardenMeadow({ learnerId }: { learnerId: string }) {
  const prog = useProgress(learnerId);
  const blooms = bloomCount(prog.sessions, new Set(prog.earned).size);
  const items = Array.from({ length: blooms }, (_, i) => {
    const y = (i * 29 + 3) % 34; // 0–34vh up the hills
    return {
      i,
      x: (i * 61 + 7) % 100,
      y,
      type: (i * 5 + 2) % FLOWER_TYPES,
      size: Math.max(20, 42 - Math.round(y * 0.6) + ((i * 7) % 8)), // depth: smaller higher
      sway: i % 4 === 0, // restrained — only a quarter drift in the breeze
      grass: i % 7 === 3,
    };
  });
  return (
    <div className="gd-growth" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.i}
          className="gd-flora-slot"
          style={{ left: `${it.x}%`, bottom: `${it.y}vh`, animationDelay: `${(it.i % 14) * 0.05}s`, '--swayd': `${(it.i % 9) * 0.7}s` } as CSSProperties}
        >
          {it.grass ? <GrassTuft size={Math.round(it.size * 0.8)} /> : <Flower type={it.type} size={it.size} sway={it.sway} />}
        </span>
      ))}
    </div>
  );
}
