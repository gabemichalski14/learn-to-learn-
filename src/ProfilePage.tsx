import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { navigate } from './router';
import { LearnerBar } from './LearnerBar';
import { getLearner, initials } from './profiles';
import { loadProgress } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { AreasToImprove } from './AreasToImprove';
import { getMastery } from './data/dataSource';
import { rankAreas, areasToImprove, type FocusArea } from './mastery/mastery';

interface Props {
  learnerId: string;
  onSelectLearner: (id: string) => void;
}

/** Profile page — the current player, quick stats, switching, and tutor sign-in. */
export function ProfilePage({ learnerId, onSelectLearner }: Props) {
  const learner = getLearner(learnerId);
  const { earned, sessions } = loadProgress(learnerId);

  // Local areas are computed in render (correct for the active learner the instant
  // it changes). Cloud mastery overlays once it resolves — keyed by learnerId so
  // switching students never briefly shows the previous child's data.
  const [cloudFocus, setCloudFocus] = useState<{ id: string; focus: FocusArea[] } | null>(null);
  useEffect(() => {
    let live = true;
    const foundLearner = getLearner(learnerId);
    if (!foundLearner) return;
    void getMastery(foundLearner).then((map) => { if (live) setCloudFocus({ id: learnerId, focus: rankAreas(map) }); });
    return () => { live = false; };
  }, [learnerId]);
  const focus = cloudFocus && cloudFocus.id === learnerId ? cloudFocus.focus : areasToImprove(learnerId);
  const stickers = new Set(earned).size;

  return (
    <main className="l2l-page l2l-page--narrow">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Player</p>
        <h1 className="l2l-display">
          {learner ? <><em>{learner.name}'s</em> profile</> : 'Profile'}
        </h1>
      </div>

      {learner && (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', '--i': 1 } as CSSProperties}>
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
        </div>
      )}

      <section className="l2l-reveal" style={{ marginTop: '24px', '--i': 2 } as CSSProperties} aria-labelledby="focus-h">
        <div className="l2l-card">
          <h2 id="focus-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Learning focus</h2>
          <AreasToImprove learnerId={learnerId} focus={focus} />
        </div>
      </section>

      <section className="l2l-reveal" style={{ marginTop: '16px', '--i': 3 } as CSSProperties} aria-labelledby="who-h">
        <div className="l2l-card">
          <h2 id="who-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Switch player</h2>
          <LearnerBar learnerId={learnerId} onSelect={onSelectLearner} />
        </div>
      </section>

      <section className="l2l-reveal" style={{ marginTop: '16px', '--i': 4 } as CSSProperties} aria-labelledby="acct-h">
        <div className="l2l-card">
          <h2 id="acct-h" className="l2l-h2" style={{ marginBottom: '16px' }}>Tutor account</h2>
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
        </div>
      </section>
    </main>
  );
}
