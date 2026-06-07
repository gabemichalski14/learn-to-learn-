import { LEVELS, availableCount } from './games';
import { navigate } from './router';
import { NowPlaying } from './NowPlaying';
import { LevelEmblem } from './LevelEmblem';

interface Props {
  onChooseLearner?: (id: string) => void;
}

/** Platform home: the 10-level curriculum. Leaderboard, Tutor Dashboard, and
 *  tutor sign-in live in the left-side menu (NavDrawer), not on this page. */
export function Home({ onChooseLearner }: Props) {
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
                <LevelEmblem level={lvl.num} />
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
      </section>
    </main>
  );
}
