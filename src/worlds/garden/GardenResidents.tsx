import { useState } from 'react';
import { useDataVersion } from '../../data/store';
import { loadMastery } from '../../mastery/mastery';
import { gardenResidents, beatFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';

/**
 * The cozy heart of the garden: the friends who now LIVE here. A character moves
 * in once their whole level is complete (every scattered hum recovered). Tap one
 * for a little storytime — their resident line. Whole + glowing (heal = 1).
 */
export function GardenResidents({ learnerId }: { learnerId: string }) {
  useDataVersion(); // refresh when mastery/lore changes
  const residents = gardenResidents(loadMastery(learnerId));
  const [seed] = useState(() => Math.random());
  const [speaking, setSpeaking] = useState<string | null>(null);

  if (residents.length === 0) return null;

  return (
    <section className="gd-residents" aria-label="Friends who live in your garden">
      <h2 className="gd-residents__h">Friends who live here 🌿</h2>
      <ul className="gd-residents__row">
        {residents.map((c) => {
          const open = speaking === c.id;
          return (
            <li key={c.id} className="gd-resident">
              <button
                type="button"
                className="gd-resident__btn"
                onClick={() => setSpeaking(open ? null : c.id)}
                aria-expanded={open}
                aria-label={`${c.name} — tap for a little story`}
              >
                <CharacterArt emoji={c.emoji} heal={1} size={76} art={c.art} label={c.name} />
                <span className="gd-resident__name">{c.name}</span>
              </button>
              {open && <p className="gd-resident__say" role="status">{beatFor(c, 'resident', () => seed)}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
