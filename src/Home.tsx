import { useEffect, useState } from 'react';
import { navigate } from './router';
import { getLearner, loadLearners, initials } from './profiles';
import { loadProgress } from './progress';
import { ACHIEVEMENTS } from './achievements';
import { NowPlaying } from './NowPlaying';
import { AreasToImprove } from './AreasToImprove';
import { getMastery, getSessions } from './data/dataSource';
import { useDataVersion } from './data/store';
import { useTutorSignedIn } from './useAuth';
import { rankAreas, type FocusArea } from './mastery/mastery';
import type { SessionRecord } from './sessionLog';
import { useNarrative, homeLead } from './world/narrative';

interface Props {
  learnerId: string;
  onChooseLearner?: (id: string) => void;
}

/** Family/student home: a warm, branded dashboard for the active student —
 *  progress snapshot, what to practice next, and the leaderboard. The full
 *  curriculum lives on the Levels page (in the menu). */
export function Home({ learnerId, onChooseLearner }: Props) {
  const version = useDataVersion(); // re-render + refetch when local data changes
  const signedIn = useTutorSignedIn();
  const learner = getLearner(learnerId);
  const name = learner?.name ?? 'Explorer';
  const prog = loadProgress(learnerId);
  const stickers = new Set(prog.earned).size;
  const narr = useNarrative(learnerId); // story spine: premise + memory of your last visit

  // Sessions + focus from cloud-or-local, keyed by learner so switching students
  // never shows stale data (setState only in the async .then).
  const [data, setData] = useState<{ id: string; sessions: SessionRecord[]; focus: FocusArea[] } | null>(null);
  // Depend ONLY on the stable learnerId — `learner` is a fresh object on every
  // render (getLearner re-parses localStorage), so using it as a dep caused an
  // infinite render loop (effect → setData → re-render → new learner → effect…)
  // that pegged a CPU core. Look the learner up inside the effect instead.
  useEffect(() => {
    let live = true;
    const lr = getLearner(learnerId);
    if (!lr) return;
    void Promise.all([getSessions(lr), getMastery(lr)]).then(([sessions, mastery]) => {
      if (live) setData({ id: learnerId, sessions, focus: rankAreas(mastery) });
    });
    return () => { live = false; };
    // `version` re-runs the fetch when a session/progress write happens, so the
    // headline stats refresh live. (version is a stable number — no loop.)
  }, [learnerId, version]);
  const fresh = data && data.id === learnerId ? data : null;
  const sessions = fresh?.sessions ?? [];
  const focus = fresh?.focus ?? [];

  const accuracy = sessions.length ? Math.round((sessions.reduce((s, r) => s + r.accuracy, 0) / sessions.length) * 100) : null;
  // Days learned — a gentle, non-resetting count of the distinct days played. No
  // streak-loss / FOMO (a child-safety bright line): it only ever grows, and a
  // missed day never resets or shames the child.
  const daysLearning = new Set(sessions.map((r) => r.endedAt.slice(0, 10))).size;

  const board = loadLearners()
    .map((l) => ({ l, p: loadProgress(l.id) }))
    .sort((a, b) => new Set(b.p.earned).size - new Set(a.p.earned).size || b.p.sessions - a.p.sessions)
    .slice(0, 5);

  const greeting = sessions.length ? 'Welcome back' : 'Welcome';

  // Obvious empty state for a signed-in tutor with no student selected. No student
  // is ever auto-created — the tutor adds them in the admin. (Brief on first load
  // until the cloud roster reconciles in.)
  if (signedIn && !learner) {
    return (
      <main className="l2l-page home">
        <NowPlaying onChange={onChooseLearner} />
        <div className="l2l-card home-empty l2l-reveal" role="status">
          <div className="home-empty__icon" aria-hidden="true">🧑‍🏫</div>
          <h1 className="home-empty__title">No student selected</h1>
          <p className="home-empty__lead">Pick a student from <strong>Explorer</strong> above, or add one to start tracking progress. Students are created in the admin — none are added automatically.</p>
          <div className="home-hero__cta">
            <button type="button" className="l2l-btn" onClick={() => navigate('#/admin')}>Add a student</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="l2l-page home">
      <NowPlaying onChange={onChooseLearner} />

      <header className="l2l-card home-hero l2l-reveal" style={{ '--i': 0 } as React.CSSProperties}>
        <div className="l2l-leaves" aria-hidden="true"><span className="l2l-leaf" /><span className="l2l-leaf" /><span className="l2l-leaf" /><span className="l2l-leaf" /></div>
        <div className="home-hero__content">
          <p className="l2l-eyebrow">{greeting}</p>
          <h1 className="l2l-display">Hi <em>{name}</em>,<br />let's keep growing.</h1>
          <p className="l2l-lead">{homeLead(narr)}</p>
          <div className="home-hero__cta">
            <button type="button" className="l2l-btn" onClick={() => navigate('#/levels')}>Continue learning →</button>
            <button type="button" className="l2l-btn l2l-btn--ghost" onClick={() => navigate('#/profile')}>My profile</button>
          </div>
        </div>
        <div className="home-hero__avatar" style={{ background: learner?.color ?? 'var(--teal)' }} aria-hidden="true">{initials(name)}</div>
      </header>

      <section className="home-stats" aria-label="Your progress">
        <div className="l2l-card l2l-reveal" style={{ '--i': 1 } as React.CSSProperties}><div className="l2l-stat"><img className="l2l-stat__icon l2l-stat__icon--img" src="/images/ui/controller.png" alt="" aria-hidden="true" /><span className="l2l-stat__num">{prog.sessions}</span><span className="l2l-stat__label">Sessions played</span></div></div>
        <div className="l2l-card l2l-reveal" style={{ '--i': 2 } as React.CSSProperties}><div className="l2l-stat"><img className="l2l-stat__icon l2l-stat__icon--img" src="/images/ui/bullseye.png" alt="" aria-hidden="true" /><span className="l2l-stat__num">{accuracy != null ? `${accuracy}%` : '—'}</span><span className="l2l-stat__label">Accuracy</span></div></div>
        <div className="l2l-card l2l-reveal" style={{ '--i': 3 } as React.CSSProperties}><div className="l2l-stat"><img className="l2l-stat__icon l2l-stat__icon--img" src="/images/ui/campfire.png" alt="" aria-hidden="true" /><span className="l2l-stat__num">{daysLearning}</span><span className="l2l-stat__label">Days learning</span></div></div>
        <div className="l2l-card l2l-reveal" style={{ '--i': 4 } as React.CSSProperties}><div className="l2l-stat"><img className="l2l-stat__icon l2l-stat__icon--img" src="/images/ui/star.png" alt="" aria-hidden="true" /><span className="l2l-stat__num">{stickers}/{ACHIEVEMENTS.length}</span><span className="l2l-stat__label">Stickers earned</span></div></div>
      </section>

      <div className="home-cols">
        <section className="l2l-card l2l-reveal" style={{ '--i': 5 } as React.CSSProperties} aria-labelledby="focus-h">
          <h2 id="focus-h" className="l2l-h2">What to practice next</h2>
          <p className="home-sub">Friendly next steps based on how {name} is doing.</p>
          <AreasToImprove learnerId={learnerId} focus={focus} />
        </section>

        <section className="l2l-card l2l-reveal" style={{ '--i': 6 } as React.CSSProperties} aria-labelledby="lb-h">
          <h2 id="lb-h" className="l2l-h2">Leaderboard</h2>
          <p className="home-sub">Friendly standings across players on this device.</p>
          <ol className="lb">
            {board.length === 0 && <li className="home-sub">No players yet.</li>}
            {board.map(({ l, p }, i) => (
              <li key={l.id} className={`lb-row${l.id === learnerId ? ' lb-row--me' : ''}`}>
                <span className="lb-rank">{i + 1}</span>
                <span className="lb-av" style={{ background: l.color }} aria-hidden="true">{initials(l.name)}</span>
                <span className="lb-name">{l.name}</span>
                <span className="lb-meta">{new Set(p.earned).size} ⭐ · {p.sessions} played</span>
              </li>
            ))}
          </ol>
          <button type="button" className="l2l-btn l2l-btn--ghost home-lb__more" onClick={() => navigate('#/leaderboard')}>Full leaderboard →</button>
        </section>
      </div>
    </main>
  );
}
