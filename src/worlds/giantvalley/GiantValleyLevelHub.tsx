import { goBack, navigate } from '../../router';
import { findLevel } from '../../games';
import { useDataVersion } from '../../data/store';
import { isLevelReady, isLevelPassed } from '../../mastery/levelGate';
import { LevelStory } from '../space/LevelStory';
import { HubHeader } from '../../ui/HubHeader';
import '../workshop/workshop.css';
import './giantvalley.css';

/** Giant's Valley — the immersive launcher for Level 4, hosted by Bram (the
 *  big-picture chunker). Reuses the Workshop hub layout with a valley-green tint;
 *  the real backdrop arrives via the hub:l4:bg art key. */
export function GiantValleyLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion();
  const lvl = findLevel(level);
  if (!lvl) {
    return (
      <main className="wk wk-hub gv">
        <div className="wk-hud"><button type="button" className="wk-back" onClick={() => goBack('#/levels')}>← Levels</button></div>
        <div className="wk-stage"><h1 className="wk-hub__title">Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className="wk wk-hub gv">
      <div className="gv-deco" aria-hidden="true"><span>🏔️</span><span>🌲</span><span>🦕</span><span>🌄</span><span>🪨</span></div>
      <HubHeader
        prefix="wk"
        back={{ label: '← Levels', onClick: () => goBack('#/levels') }}
        badge={<>🦕 Giant's Valley · Level {lvl.num}</>}
      />

      <div className="wk-stage wk-hub__stage">
        <h1 className="wk-hub__title">{lvl.title}</h1>
        <p className="wk-hub__lead">{lvl.focus}</p>

        <LevelStory learnerId={learnerId} level={lvl.num} />

        <div className="wk-missions">
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className="wk-mission"
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                <span className="wk-mission__emoji" aria-hidden="true">{g.emoji}</span>
                <span className="wk-mission__title">{g.title}</span>
                <span className="wk-mission__tag">{g.tagline}</span>
                <span className={`wk-mission__foot ${available ? 'wk-mission__go' : 'wk-mission__soon'}`}>{available ? 'Climb ▸' : 'Soon'}</span>
              </button>
            );
          })}
        </div>

        {isLevelPassed(learnerId, level) ? (
          <button type="button" className="wk-check wk-check--done" onClick={() => navigate(`#/checkpoint/${level}`)}>✓ Level {level} passed — retake the checkpoint</button>
        ) : isLevelReady(learnerId, level) ? (
          <button type="button" className="wk-check" onClick={() => navigate(`#/checkpoint/${level}`)}>✨ Take the Checkpoint — show what you learned!</button>
        ) : null}

        <button type="button" className="wk-village" onClick={() => navigate('#/village')}>🏡 Visit your Village</button>
      </div>
    </main>
  );
}
