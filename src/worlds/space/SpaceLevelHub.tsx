import { navigate } from '../../router';
import { findLevel } from '../../games';
import { levelCurriculum, lessonSounds } from '../../curriculum';
import { useDataVersion } from '../../data/store';
import { isLevelReady, isLevelPassed } from '../../mastery/levelGate';
import { SpaceBackdrop } from './SpaceArt';
import { LevelStory } from './LevelStory';
import { Art } from '../../art/Art';
import './space.css';

/** Immersive Space Patrol hub for Level 2 — a themed landing that flows straight
 *  into the space games. Rendered drawer-free by App for level 2. */
export function SpaceLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion();
  const lvl = findLevel(level);
  const curriculum = levelCurriculum(level);
  if (!lvl) {
    return (
      <main className="sg sg-hub">
        <SpaceBackdrop />
        <div className="sg-hud"><button type="button" className="sg-back" onClick={() => navigate('#/')}>← Home</button></div>
        <div className="sg-stage"><h1 className="sg-hub__title">Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className="sg sg-hub">
      <SpaceBackdrop />
      <Art imageKey="hub:space:bg" emoji="" alt="" className="hub-bg-art" />
      <div className="sg-hud">
        <button type="button" className="sg-back" onClick={() => navigate('#/')}>← Home</button>
        <span className="sg-badge"><span className="dot" /> Space Patrol · Level {lvl.num}</span>
      </div>
      <div className="sg-stage sg-hub__stage">
        <h1 className="sg-hub__title">{lvl.title}</h1>
        <p className="sg-hub__lead">{lvl.focus}</p>
        <LevelStory learnerId={learnerId} level={lvl.num} />
        <div className="sg-missions">
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className="sg-mission"
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                <span className="sg-mission__emoji" aria-hidden="true">{g.emoji}</span>
                <span className="sg-mission__title">{g.title}</span>
                <span className="sg-mission__tag">{g.tagline}</span>
                <span className={`sg-mission__foot ${available ? 'sg-mission__go' : 'sg-mission__soon'}`}>
                  {available ? 'Launch ▸' : 'Soon'}
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

        {curriculum && curriculum.lessons.length > 0 && (
          <section className="sg-hub__lessons" aria-label="Lessons">
            <h2>Mission Log{curriculum.oral ? ' (oral)' : ''}</h2>
            {curriculum.lessons.map((les) => (
              <div key={les.n} className="sg-hub__lesson">
                <b>{les.n}</b>
                <span>{les.title}{lessonSounds(les) ? ` · ${lessonSounds(les)}` : ''}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
