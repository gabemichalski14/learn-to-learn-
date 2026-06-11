import { goBack, navigate } from '../../router';
import { findLevel } from '../../games';
import { useDataVersion } from '../../data/store';
import { isLevelReady, isLevelPassed } from '../../mastery/levelGate';
import { GardenBackdrop, SproutGuide } from './GardenArt';
import { Art } from '../../art/Art';
import './garden.css';

/** Calm launcher for Level 1's Sound Garden games. The cozy reward space — your
 *  friends, your bloomed sound-flowers, tips — lives in the Village now (one
 *  tap away), so this page stays focused and uncluttered: a painted meadow, the
 *  level's focus, and its games. Rendered drawer-free by App for level 1. */
export function GardenLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion();
  const lvl = findLevel(level);
  if (!lvl) {
    return (
      <main className="gd gd-hub">
        <GardenBackdrop />
        <div className="gd-hud"><button type="button" className="gd-back" onClick={() => goBack('#/levels')}>← Levels</button></div>
        <div className="gd-stage"><h1 className="gd-hub__title">Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className="gd gd-hub">
      <GardenBackdrop />
      <Art imageKey="hub:garden:bg" emoji="" alt="" className="hub-bg-art" />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/levels')}>← Levels</button>
        <span className="gd-badge">🌱 Sound Garden · Level {lvl.num}</span>
      </div>

      <div className="gd-stage gd-hub__stage">
        <h1 className="gd-hub__title">{lvl.title}</h1>
        <p className="gd-hub__lead">{lvl.focus}</p>

        <div className="gd-missions">
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className="gd-mission"
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                <span className="gd-mission__emoji" aria-hidden="true">{g.emoji}</span>
                <span className="gd-mission__title">{g.title}</span>
                <span className="gd-mission__tag">{g.tagline}</span>
                <span className={`gd-mission__foot ${available ? 'gd-mission__go' : 'gd-mission__soon'}`}>
                  {available ? 'Play ▸' : 'Soon'}
                </span>
              </button>
            );
          })}
        </div>

        {isLevelPassed(learnerId, level) ? (
          <button type="button" className="gd-hub__check gd-hub__check--done" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✓ Level {level} passed — retake the checkpoint
          </button>
        ) : isLevelReady(learnerId, level) ? (
          <button type="button" className="gd-hub__check" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✨ Take the Checkpoint — show what you learned!
          </button>
        ) : null}

        <button type="button" className="gd-hub__village" onClick={() => navigate('#/village')}>
          🏡 Visit your Village
        </button>
      </div>

      <div className="gd-scout gd-hub__scout">
        <SproutGuide size={72} />
      </div>
    </main>
  );
}
