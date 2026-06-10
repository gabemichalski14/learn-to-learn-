import { useState } from 'react';
import { goBack, navigate } from './router';
import { useDataVersion } from './data/store';
import { loadMastery } from './mastery/mastery';
import { gardenResidents, storytimeScene, type LevelCharacter } from './world/lore/cast';
import { CharacterArt } from './world/lore/CharacterArt';
import { Storytime } from './world/lore/Storytime';
import { GardenPlantings } from './worlds/garden/GardenPlantings';
import { PipArt } from './mascots/PipArt';
import { RiveMascot } from './mascots/RiveMascot';
import { pickTip, tipLabel } from './world/tips';
import './village.css';

type Scene = { character: LevelCharacter; lines: string[]; title?: string };

/**
 * The Sound Garden Village — the app's calm, cozy HOME (not a level). The friends
 * you've helped live here in their cottages, your mastered sounds bloom as named
 * flowers, Pip shares a little tip, and you can sit for a friend's storytime or
 * lesson. Deliberately low-density + spacious for a dyslexia-friendly, restful feel.
 * Games launch from Levels/Games — this place is just for belonging + encouragement.
 */
export function VillagePage({ learnerId }: { learnerId: string }) {
  useDataVersion(); // refresh when mastery changes
  const residents = gardenResidents(loadMastery(learnerId));
  const [scene, setScene] = useState<Scene | null>(null);
  const [tip] = useState(() => pickTip(Math.floor(Math.random() * 1e6)));

  return (
    <main className="vil">
      <header className="vil-hud">
        <button type="button" className="vil-back" onClick={() => goBack('#/')}>← Home</button>
        <span className="vil-badge">🏡 Sound Garden Village</span>
      </header>

      {/* the village illustration as a bounded hero that melts into the page */}
      <div className="vil-hero" role="img" aria-label="The Sound Garden Village">
        <h1 className="vil-hero__title">Sound Garden Village</h1>
      </div>

      <div className="vil-scroll">
        <section className="vil-host">
          <RiveMascot
            src="/rive/pip-host.riv"
            stateMachines="State Machine 1"
            size={112}
            fallback={<PipArt size={104} expression="happy" className="vil-host__pip" />}
          />
          <div className="vil-host__say" role="status">
            {residents.length === 0 ? (
              <>
                <p className="vil-host__hi">Welcome to your Village! 🌿</p>
                <p>Help a friend all the way home and they'll move right in — then you can visit any time.</p>
                <button type="button" className="vil-cta" onClick={() => navigate('#/levels')}>Go help a friend →</button>
              </>
            ) : (
              <>
                <p className="vil-host__hi">Welcome back! 🌷</p>
                <p>Tap a friend for a story or a little lesson.</p>
              </>
            )}
          </div>
        </section>

        {/* Pip's rotating tip — confidence, a trick, or a fun fact */}
        <section className={`vil-tip vil-tip--${tip.kind}`} aria-label="A tip from Pip">
          <span className="vil-tip__label">💡 {tipLabel(tip.kind)}</span>
          <p className="vil-tip__text">{tip.text}</p>
        </section>

        {residents.length > 0 && (
          <section className="vil-section" aria-label="Friends who live here">
            <h2 className="vil-section__h">Friends who live here</h2>
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
          </section>
        )}

        {/* Your mastered sounds, blooming as named flowers */}
        <section className="vil-section vil-flowers" aria-label="Your sound flowers">
          <GardenPlantings learnerId={learnerId} />
        </section>
      </div>

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
