import { LogoMark } from './LogoMark';
import { GAMES } from './games';
import { navigate } from './router';
import { loadProgress } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { LearnerBar } from './LearnerBar';

interface Props {
  learnerId: string;
  onSelectLearner: (id: string) => void;
}

/** Platform home: who's playing, the game library, and entries to leaderboard + tutor data. */
export function Home({ learnerId, onSelectLearner }: Props) {
  const { earned, sessions } = loadProgress(learnerId);

  return (
    <main className="site">
      <header className="site__header">
        <LogoMark className="site__logo" />
        <div>
          <h1 className="site__title">Learn to Learn</h1>
          <p className="site__tagline">Phonics games built for the Barton Reading &amp; Spelling System</p>
        </div>
      </header>

      <LearnerBar learnerId={learnerId} onSelect={onSelectLearner} />

      <section className="site__section" aria-labelledby="games-h">
        <h2 id="games-h" className="site__h2">Games</h2>
        <div className="tile-grid">
          {GAMES.map((g) => {
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
                  <span className="tile__ref">{g.bartonRef}</span>
                  <span className={`tile__badge${available ? ' tile__badge--go' : ''}`}>
                    {available ? 'Play ▸' : 'Soon'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
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

      <footer className="site__footer">Learn to Learn Tutoring Solutions</footer>
    </main>
  );
}
