import { type CSSProperties } from 'react';
import { useProgress } from '../../data/store';

const FLOWERS = ['🌷', '🌸', '🌼', '🌻', '🌺', '🪻', '🌹'];
const MAX = 28;

/**
 * The living garden — competence made visible. The meadow blooms with more
 * flowers the more the child has actually practiced (sessions + earned stickers,
 * read from the reactive store, so it grows live). Honest progress, no decay, no
 * shame — just a garden that's a little fuller every time they come back.
 * Flower type/position are deterministic per index, so it only ever ADDS blooms.
 */
export function GardenMeadow({ learnerId }: { learnerId: string }) {
  const prog = useProgress(learnerId);
  const grown = prog.sessions * 5 + new Set(prog.earned).size;
  const blooms = Math.min(MAX, grown + 2); // +2 starter sprouts so it's never bare
  const toNext = grown === 0 ? 'Play a round to grow your first flowers! 🌱' : `${blooms >= MAX ? 'Your garden is bursting with blooms!' : 'Every sound you learn plants another flower. 🌷'}`;

  const items = Array.from({ length: blooms }, (_, i) => ({
    i,
    x: (i * 37 + 9) % 95,
    y: (i * 53 + 6) % 34,
    f: FLOWERS[(i * 7 + 3) % FLOWERS.length],
    s: 17 + ((i * 13) % 16),
  }));

  return (
    <div className="gd-meadow" role="img" aria-label={`Your garden has ${blooms} blooms`}>
      <div className="gd-meadow__field" aria-hidden="true">
        {items.map((it) => (
          <span
            key={it.i}
            className="gd-bloom"
            style={{ left: `${it.x}%`, bottom: `${it.y}%`, fontSize: `${it.s}px`, animationDelay: `${(it.i % 9) * 0.06}s` } as CSSProperties}
          >
            {it.f}
          </span>
        ))}
      </div>
      <p className="gd-meadow__label"><b>{blooms} blooms</b> · {toNext}</p>
    </div>
  );
}
