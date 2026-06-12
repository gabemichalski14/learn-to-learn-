import { useState, type CSSProperties } from 'react';
import { navigate } from '../../router';
import { plantingsFor, unacknowledgedPlantings, plantingId, PLANTING_FALLBACK_IMAGE } from '../../world/lore/plantings';
import { useLore, acknowledge } from '../../world/lore/loreStore';
import { plantingPraise } from '../../world/lore/characters';
import { masteryScore } from '../../mastery/mastery';
import { hideBrokenImg } from '../../ui/imgFallback';

/**
 * The garden that REMEMBERS you. Every sound mastered (in Space, where per-sound
 * skills are recorded) blooms here as a named, permanent flower — "the /m/
 * marigold" — that you can tap to hear how strong it's grown. A gentle one-time
 * "a new flower opened" beat celebrates each new bloom, then is acknowledged so
 * it never nags. Reads reactively via useLore; loop-safe (writes only on a tap).
 */
export function GardenPlantings({ learnerId }: { learnerId: string }) {
  const lore = useLore(learnerId);            // re-renders when a bloom is acknowledged
  const plantings = plantingsFor(learnerId);  // derived from mastery (fresh on mount)
  const fresh = unacknowledgedPlantings(plantings, lore);
  const [open, setOpen] = useState<string | null>(null);
  const newest = fresh[fresh.length - 1];

  return (
    <section className="gd-plantings" aria-label="Your sound flowers">
      {newest && (
        <div className="gd-bloombeat" role="status">
          <img className="gd-bloombeat__art" src={newest.species.image ?? PLANTING_FALLBACK_IMAGE} alt="" aria-hidden="true" onError={hideBrokenImg} />
          <p className="gd-bloombeat__text">A new flower opened — <b>{newest.name}</b>. You grew that. 🌱</p>
          <button
            type="button"
            className="gd-bloombeat__ok"
            onClick={() => fresh.forEach((p) => acknowledge(learnerId, plantingId(p)))}
          >
            Lovely ✓
          </button>
        </div>
      )}

      <h2 className="gd-plantings__h">Your sound flowers</h2>

      {plantings.length === 0 ? (
        <p className="gd-plantings__empty">
          No sound flowers yet. Master a sound in{' '}
          <button type="button" className="gd-plantings__link" onClick={() => navigate('#/level/2')}>Space Patrol</button>
          {' '}and it blooms here — named, and yours forever. 🌱
        </p>
      ) : (
        <ul className="gd-plantings__grid">
          {plantings.map((p) => {
            const isOpen = open === p.skillKey;
            return (
              <li key={p.skillKey}>
                <button
                  type="button"
                  className="gd-planting"
                  style={{ '--c': p.species.color } as CSSProperties}
                  onClick={() => setOpen(isOpen ? null : p.skillKey)}
                  aria-expanded={isOpen}
                >
                  <img className="gd-planting__img" src={p.species.image ?? PLANTING_FALLBACK_IMAGE} alt="" aria-hidden="true" onError={hideBrokenImg} />
                  <span className="gd-planting__name">{p.name}</span>
                </button>
                {isOpen && (
                  <p className="gd-planting__praise" role="status">{plantingPraise(p.name, masteryScore(learnerId, p.skillKey))}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
