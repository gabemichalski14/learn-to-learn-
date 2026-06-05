import { navigate } from './router';
import { LearnerBar } from './LearnerBar';
import { getLearner, initials } from './profiles';
import { loadProgress } from './progress';
import { ACHIEVEMENTS } from './achievements';

interface Props {
  learnerId: string;
  onSelectLearner: (id: string) => void;
}

/** Profile page — the current player, quick stats, switching, and tutor sign-in. */
export function ProfilePage({ learnerId, onSelectLearner }: Props) {
  const learner = getLearner(learnerId);
  const { earned, sessions } = loadProgress(learnerId);
  const stickers = new Set(earned).size;

  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Profile</h1>

      {learner && (
        <div className="profile-card">
          <span className="profile-card__avatar" style={{ background: learner.color }} aria-hidden="true">
            {initials(learner.name)}
          </span>
          <div className="profile-card__body">
            <p className="profile-card__name">{learner.name}</p>
            <div className="profile-card__stats">
              <span className="profile-stat"><strong>{sessions}</strong> session{sessions === 1 ? '' : 's'}</span>
              <span className="profile-stat"><strong>{stickers}</strong> / {ACHIEVEMENTS.length} stickers</span>
            </div>
          </div>
        </div>
      )}

      <section className="site__section" aria-labelledby="who-h">
        <h2 id="who-h" className="site__h2">Switch player</h2>
        <LearnerBar learnerId={learnerId} onSelect={onSelectLearner} />
      </section>

      <section className="site__section" aria-labelledby="acct-h">
        <h2 id="acct-h" className="site__h2">Tutor account</h2>
        <div className="panel-grid">
          <button type="button" className="panel-card" onClick={() => navigate('#/account')}>
            <span className="panel-card__emoji" aria-hidden="true">🔐</span>
            <span className="panel-card__title">Account &amp; cloud sync</span>
            <span className="panel-card__sub">Sign in to sync students across devices</span>
          </button>
          <button type="button" className="panel-card" onClick={() => navigate('#/tutor')}>
            <span className="panel-card__emoji" aria-hidden="true">📊</span>
            <span className="panel-card__title">Dashboard</span>
            <span className="panel-card__sub">Per-student progress &amp; reports</span>
          </button>
        </div>
      </section>
    </main>
  );
}
