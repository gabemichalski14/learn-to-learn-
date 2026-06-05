import { useState } from 'react';
import { navigate } from './router';
import { SessionLogPanel } from './SessionLogPanel';
import { loadLearners, getCurrentLearnerId, getLearner, initials } from './profiles';
import { loadProgress, formatTime } from './progress';
import { loadSessionLog } from './sessionLog';
import { ACHIEVEMENTS } from './achievements';

/** Accuracy of the last up-to-10 sessions as tiny bars. */
function Trend({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  return (
    <div className="trend" aria-hidden="true">
      {values.map((v, i) => (
        <span key={i} className="trend__bar" style={{ height: `${Math.max(6, Math.round(v * 100))}%` }} />
      ))}
    </div>
  );
}

/** Full-page tutor view: pick a student, see their progress, log, and a printable report. */
export function TutorDashboard() {
  const learners = loadLearners();
  const [sel, setSel] = useState<string>(() => getCurrentLearnerId() ?? learners[0]?.id ?? '');

  const learner = getLearner(sel);
  const prog = sel ? loadProgress(sel) : null;
  const log = sel ? loadSessionLog(sel) : [];
  const avgAccuracy = log.length ? Math.round((log.reduce((s, r) => s + r.accuracy, 0) / log.length) * 100) : 0;
  const lastPlayed = log.length ? new Date(log[log.length - 1].endedAt) : null;
  const trend = log.slice(-10).map((r) => r.accuracy);

  return (
    <main className="site site--page">
      <button type="button" className="back-btn no-print" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Tutor Dashboard</h1>
      <p className="page__lead">Track a student's progress over time. Every finished session is recorded automatically.</p>

      {learners.length === 0 ? (
        <div className="page__panel"><p>No students yet — add one from the home screen.</p></div>
      ) : (
        <>
          <div className="student-picker no-print" role="group" aria-label="Choose a student">
            {learners.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`learner-chip${l.id === sel ? ' learner-chip--active' : ''}`}
                onClick={() => setSel(l.id)}
                aria-pressed={l.id === sel}
              >
                <span className="learner-chip__avatar" style={{ background: l.color }} aria-hidden="true">{initials(l.name)}</span>
                <span className="learner-chip__name">{l.name}</span>
              </button>
            ))}
          </div>

          {learner && prog && (
            <div className="page__panel report">
              <div className="report__head">
                <span className="report__avatar" style={{ background: learner.color }} aria-hidden="true">{initials(learner.name)}</span>
                <div>
                  <h2 className="report__name">{learner.name}</h2>
                  <p className="report__since">
                    {lastPlayed ? `Last played ${lastPlayed.toLocaleDateString()}` : 'No sessions yet'}
                  </p>
                </div>
                <button type="button" className="btn-ghost no-print report__print" onClick={() => window.print()}>Print report</button>
              </div>

              <div className="stat-tiles">
                <div className="stat-tile"><strong>{prog.sessions}</strong><span>sessions</span></div>
                <div className="stat-tile"><strong>{avgAccuracy}%</strong><span>avg accuracy</span></div>
                <div className="stat-tile"><strong>{prog.bestMs != null ? formatTime(prog.bestMs) : '—'}</strong><span>best time</span></div>
                <div className="stat-tile"><strong>{new Set(prog.earned).size}/{ACHIEVEMENTS.length}</strong><span>stickers</span></div>
              </div>

              {trend.length >= 2 && (
                <div className="report__trend">
                  <span className="report__trend-label">Accuracy — recent sessions</span>
                  <Trend values={trend} />
                </div>
              )}

              <SessionLogPanel learnerId={sel} />
            </div>
          )}
        </>
      )}
    </main>
  );
}
