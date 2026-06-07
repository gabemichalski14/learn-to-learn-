import { goBack, navigate } from '../../router';
import { findLevel } from '../../games';
import { levelCurriculum, lessonSounds } from '../../curriculum';
import { GardenBackdrop, SproutGuide } from './GardenArt';
import { GardenMeadow } from './GardenMeadow';
import './garden.css';

/** Immersive Sound Garden hub for Level 1 — a living meadow that flows straight
 *  into the games, with the child's garden growing as they learn. Rendered
 *  drawer-free by App for level 1 (matches the Level 2 space hub). */
export function GardenLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  const lvl = findLevel(level);
  const curriculum = levelCurriculum(level);
  if (!lvl) {
    return (
      <main className="gd gd-hub">
        <GardenBackdrop />
        <div className="gd-hud"><button type="button" className="gd-back" onClick={() => goBack('#/')}>← Home</button></div>
        <div className="gd-stage"><h1 className="gd-hub__title">Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className="gd gd-hub">
      <GardenBackdrop />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/')}>← Home</button>
        <span className="gd-badge">🌱 Sound Garden · Level {lvl.num}</span>
      </div>

      <div className="gd-stage gd-hub__stage">
        <h1 className="gd-hub__title">{lvl.title}</h1>
        <p className="gd-hub__lead">{lvl.focus}</p>

        <GardenMeadow learnerId={learnerId} />

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

        {curriculum && curriculum.lessons.length > 0 && (
          <section className="gd-hub__lessons" aria-label="Lessons">
            <h2>Garden Journal{curriculum.oral ? ' (oral)' : ''}</h2>
            {curriculum.lessons.map((les) => (
              <div key={les.n} className="gd-hub__lesson">
                <b>{les.n}</b>
                <span>{les.title}{lessonSounds(les) ? ` · ${lessonSounds(les)}` : ''}</span>
              </div>
            ))}
          </section>
        )}
      </div>

      <div className="gd-scout gd-hub__scout">
        <SproutGuide size={72} />
      </div>
    </main>
  );
}
