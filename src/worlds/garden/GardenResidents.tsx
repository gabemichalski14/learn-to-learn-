import { useState } from 'react';
import { useDataVersion } from '../../data/store';
import { loadMastery } from '../../mastery/mastery';
import { gardenResidents, storytimeScene, type LevelCharacter } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { Storytime } from '../../world/lore/Storytime';

/**
 * The cozy heart of the garden: the friends who now LIVE here. A character moves
 * in once their whole level is complete (every scattered hum recovered), shown
 * whole + glowing (heal = 1). Tap one to sit down for a little storytime — a
 * memory-aware scene they tell you, page by page, read aloud.
 */
export function GardenResidents({ learnerId }: { learnerId: string }) {
  useDataVersion(); // refresh when mastery/lore changes
  const mastery = loadMastery(learnerId);
  const residents = gardenResidents(mastery);
  const [open, setOpen] = useState<{ character: LevelCharacter; lines: string[] } | null>(null);

  if (residents.length === 0) return null;

  return (
    <section className="gd-residents" aria-label="Friends who live in your garden">
      <h2 className="gd-residents__h">Friends who live here 🌿</h2>
      <ul className="gd-residents__row">
        {residents.map((c) => (
          <li key={c.id} className="gd-resident">
            <button
              type="button"
              className="gd-resident__btn"
              onClick={() => setOpen({ character: c, lines: storytimeScene(c, mastery) })}
              aria-label={`${c.name} — tap to hear a little story`}
            >
              <CharacterArt emoji={c.emoji} heal={1} size={76} art={c.art} label={c.name} />
              <span className="gd-resident__name">{c.name}</span>
              <span className="gd-resident__cue">tap for a story 🌙</span>
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <Storytime character={open.character} lines={open.lines} onClose={() => setOpen(null)} />
      )}
    </section>
  );
}
