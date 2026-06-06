import { LEVELS, availableCount } from './games';
import { navigate } from './router';
import { loadProgress } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { NowPlaying } from './NowPlaying';

interface Props {
  learnerId: string;
  onChooseLearner?: (id: string) => void;
}

/** Platform home: the 10-level curriculum + progress entries. */
export function Home({ learnerId, onChooseLearner }: Props) {
  const { earned, sessions } = loadProgress(learnerId);

  return (
    <main className="site">
      <NowPlaying onChange={onChooseLearner} />
      <section className="site__section" aria-labelledby="levels-h">
        <h2 id="levels-h" className="site__h2">Curriculum · Levels 1–10</h2>
        <div className="level-grid">
          {LEVELS.map((lvl) => {
            const ready = availableCount(lvl);
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
                  {ready ? `${ready} game${ready === 1 ? '' : 's'} ▸` : 'Coming soon'}
                </span>
              </button>
            );
          })}
        </div>
        <p className="page__note">Level focus and games are placeholders — the final lineup follows the Barton scope &amp; sequence.</p>
      </section>

      <section className="site__section" aria-labelledby="more-h">
        <h2 id="more-h" className="site__h2">Progress</h2>
        <div className="panel-grid">
          <button type="button" className="panel-card" onClick={() => navigate('#/leaderboard')}>
            <span className="panel-card__emoji" aria-hidden="true">🏆</span>
            <span className="panel-card__title">Leaderboard</span>
            <span className="panel-card__sub">{new Set(earned).size} of {ACHIEVEMENTS.length} stickers earned</span>
          </button>
          <button type="button" className="panel-card" onClick={() => navigate('#/tutor')}>
            <span className="panel-card__emoji" aria-hidden="true">📊</span>
            <span className="panel-card__title">Tutor Dashboard</span>
            <span className="panel-card__sub">{sessions} session{sessions === 1 ? '' : 's'} logged</span>
          </button>
        </div>
      </section>

      <footer className="site__footer">
        Learn to Learn Tutoring Solutions
        <button type="button" className="link-btn" onClick={() => navigate('#/account')} style={{ marginLeft: 10 }}>
          Tutor sign-in
        </button>
      </footer>
    </main>
  );
}
