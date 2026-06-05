import { navigate } from './router';
import { LEVELS, availableCount } from './games';
import { levelCurriculum } from './curriculum';

/** "Levels information" page — an index of all 10 Barton levels + their curriculum. */
export function LevelsPage() {
  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Levels</h1>
      <p className="page__lead">The Barton Reading &amp; Spelling scope &amp; sequence — ten levels, each a step from hearing sounds to spelling multisyllable words.</p>

      <div className="level-grid">
        {LEVELS.map((lvl) => {
          const cur = levelCurriculum(lvl.num);
          const lessons = cur?.lessons.length ?? 0;
          const games = availableCount(lvl);
          const ready = games > 0;
          return (
            <button
              key={lvl.num}
              type="button"
              className={`level-card${ready ? ' level-card--ready' : ''}`}
              onClick={() => navigate(`#/level/${lvl.num}`)}
              aria-label={`Level ${lvl.num}: ${lvl.title}`}
            >
              <span className="level-card__num">Level {lvl.num}</span>
              <span className="level-card__title">{lvl.title}</span>
              <span className="level-card__focus">{lvl.focus}</span>
              <span className="level-card__foot">
                {lessons > 0
                  ? `${lessons} lesson${lessons === 1 ? '' : 's'}${cur?.partial ? '+' : ''}`
                  : 'Curriculum pending'}
                {ready ? ` · ${games} game${games === 1 ? '' : 's'} ▸` : ''}
              </span>
            </button>
          );
        })}
      </div>
      <p className="page__note">Lesson titles and rules are captured directly from the books; Levels 8–10 fill in as their books are added.</p>
    </main>
  );
}
