import { useState } from 'react';
import { goBack, navigate } from './router';
import { useDataVersion } from './data/store';
import { loadMastery } from './mastery/mastery';
import { gardenResidents, storytimeScene, type LevelCharacter } from './world/lore/cast';
import { CharacterArt } from './world/lore/CharacterArt';
import { Storytime } from './world/lore/Storytime';
import { Pip } from './mascots/Pip';
import './village.css';

type Scene = { character: LevelCharacter; lines: string[]; title?: string };

/**
 * The Sound Garden Village — the cozy home where the friends you've helped all
 * the way home come to LIVE. Pip hosts. Visit any time: hear a friend's storytime
 * or sit for their little lesson (their dyslexic strength + the structured-literacy
 * way, in their own voice). A friend appears here only once their whole level is
 * fully recovered (>95% on every hum), so the village fills with real progress.
 */
export function VillagePage({ learnerId }: { learnerId: string }) {
  useDataVersion(); // refresh when mastery changes
  const residents = gardenResidents(loadMastery(learnerId));
  const [scene, setScene] = useState<Scene | null>(null);

  return (
    <main className="vil">
      <div className="vil-sky" aria-hidden="true">
        <span className="vil-sun" />
        <span className="vil-cloud vil-cloud--1" />
        <span className="vil-cloud vil-cloud--2" />
      </div>
      <div className="vil-decor" aria-hidden="true">
        <img className="vil-decor__sign" src="/characters/village/signpost.png" alt="" />
        <img className="vil-decor__lantern" src="/characters/village/lantern.png" alt="" />
      </div>

      <header className="vil-hud">
        <button type="button" className="vil-back" onClick={() => goBack('#/')}>← Home</button>
        <span className="vil-badge">🏡 Sound Garden Village</span>
      </header>

      <section className="vil-host">
        <Pip size={92} expression="happy" />
        <div className="vil-host__say" role="status">
          {residents.length === 0 ? (
            <>
              <p className="vil-host__hi">Welcome to the Village! 🌿</p>
              <p>No one lives here yet — but help a friend <b>all the way home</b> and they'll move right in. Then you can visit them any time.</p>
              <button type="button" className="vil-cta" onClick={() => navigate('#/levels')}>Go help a friend →</button>
            </>
          ) : (
            <>
              <p className="vil-host__hi">Look who lives here now! 🌷</p>
              <p>Tap a friend for a <b>story</b>, or sit for a little <b>lesson</b> — they each have their own way of seeing things.</p>
            </>
          )}
        </div>
      </section>

      {residents.length > 0 && (
        <ul className="vil-row">
          {residents.map((c) => (
            <li key={c.id} className="vil-home">
              <div className="vil-home__scene">
                <img className="vil-home__house" src={c.house ?? '/characters/village/cottage.png'} alt="" aria-hidden="true" />
                <span className="vil-home__art">
                  <CharacterArt emoji={c.emoji} heal={1} size={78} art={c.art} label={c.name} />
                </span>
              </div>
              <div className="vil-home__card">
              <p className="vil-home__name">{c.name}</p>
              <p className="vil-home__strength">{c.strength}</p>
              <div className="vil-home__acts">
                <button
                  type="button"
                  className="vil-btn vil-btn--story"
                  onClick={() => setScene({ character: c, lines: storytimeScene(c, loadMastery(learnerId)) })}
                >
                  📖 Storytime
                </button>
                {c.teaching && (
                  <button
                    type="button"
                    className="vil-btn vil-btn--learn"
                    onClick={() => setScene({ character: c, lines: c.teaching!.lines, title: c.teaching!.title })}
                  >
                    ✨ Learn from {c.name}
                  </button>
                )}
              </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {scene && (
        <Storytime
          character={scene.character}
          lines={scene.lines}
          title={scene.title}
          onClose={() => setScene(null)}
        />
      )}
    </main>
  );
}
