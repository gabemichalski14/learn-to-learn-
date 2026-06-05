import { navigate } from './router';
import { findLevel } from './games';
import { levelCurriculum, lessonSounds } from './curriculum';

/** Sub-menu for one Barton level: its lessons (the curriculum) + its games. */
export function LevelPage({ level }: { level: number }) {
  const lvl = findLevel(level);
  const curriculum = levelCurriculum(level);

  if (!lvl) {
    return (
      <main className="site site--page">
        <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
        <h1 className="site__title">Level not found</h1>
      </main>
    );
  }

  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <p className="level-page__eyebrow">Level {lvl.num}</p>
      <h1 className="site__title">{lvl.title}</h1>
      <p className="page__lead">{lvl.focus}</p>

      {curriculum && curriculum.lessons.length > 0 && (
        <section className="site__section" aria-labelledby="lessons-h">
          <h2 id="lessons-h" className="site__h2">
            Lessons{curriculum.oral ? ' (oral)' : ''}
          </h2>
          <ol className="lesson-list">
            {curriculum.lessons.map((les) => (
              <li key={les.n} className="lesson-row">
                <span className="lesson-row__n">{les.n}</span>
                <div className="lesson-row__body">
                  <span className="lesson-row__title">{les.title}</span>
                  {lessonSounds(les) && <span className="lesson-row__sounds">{lessonSounds(les)}</span>}
                </div>
              </li>
            ))}
          </ol>
          {curriculum.lessonFlow && (
            <p className="lesson-flow">Each lesson: {curriculum.lessonFlow.join(' → ')}</p>
          )}
          {curriculum.sections?.includes('Posttest') && (
            <p className="lesson-flow lesson-flow--test">✓ Level ends with a posttest (mastery check)</p>
          )}
          {curriculum.partial && (
            <p className="lesson-flow">More lessons exist — full list pending a capture of the contents page.</p>
          )}
        </section>
      )}

      <h2 className="site__h2">Games</h2>
      <div className="tile-grid">
        {lvl.games.map((g) => {
          const available = g.status === 'available';
          return (
            <button
              key={g.id}
              type="button"
              className={`tile${available ? '' : ' tile--soon'}`}
              onClick={() => available && g.route && navigate(g.route)}
              disabled={!available}
              aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
            >
              <span className="tile__emoji" aria-hidden="true">{g.emoji}</span>
              <span className="tile__title">{g.title}</span>
              <span className="tile__tagline">{g.tagline}</span>
              <span className="tile__foot">
                <span className="tile__ref">Level {lvl.num}</span>
                <span className={`tile__badge${available ? ' tile__badge--go' : ''}`}>
                  {available ? 'Play ▸' : 'Soon'}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
