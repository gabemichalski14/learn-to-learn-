import { type CSSProperties } from 'react';
import { useProgress } from '../../data/store';
import { GARDEN_FLOWERS as FLOWERS, bloomCount } from './gardenGrowth';

/**
 * The living garden — a FULL-SCREEN backdrop layer. The more the child has
 * practiced, the more the whole meadow fills with flowers (rising up the hills,
 * spread across the width). It sits behind the hub content so the entire screen
 * "levels up" as they play. Deterministic placement → it only adds blooms.
 */
export function GardenMeadow({ learnerId }: { learnerId: string }) {
  const prog = useProgress(learnerId);
  const blooms = bloomCount(prog.sessions, new Set(prog.earned).size);
  const items = Array.from({ length: blooms }, (_, i) => ({
    i,
    x: (i * 61 + 7) % 100, // full width
    y: (i * 29 + 3) % 34, // bottom 0–34vh, rising up the hills
    f: FLOWERS[(i * 7 + 3) % FLOWERS.length],
    s: 16 + ((i * 13) % 24), // 16–40px, varied
  }));
  return (
    <div className="gd-growth" aria-hidden="true">
      {items.map((it) => (
        <span
          key={it.i}
          className="gd-bloom"
          style={{ left: `${it.x}%`, bottom: `${it.y}vh`, fontSize: `${it.s}px`, animationDelay: `${(it.i % 14) * 0.04}s` } as CSSProperties}
        >
          {it.f}
        </span>
      ))}
    </div>
  );
}
