import { useState } from 'react';
import { navigate } from './router';
import { SessionLogPanel } from './SessionLogPanel';
import { loadLearners, getCurrentLearnerId, getLearner, initials, renameLearner, removeLearner } from './profiles';
import { loadProgress, formatTime } from './progress';
import { loadSessionLog } from './sessionLog';
import type { SessionRecord } from './sessionLog';
import { ACHIEVEMENTS } from './achievements';

const CW = 280;
const CH = 90;
const PAD = 8;

/** Accuracy (0..1) over recent sessions as a smooth area + line. */
function AccuracyChart({ values }: { values: number[] }) {
  const n = values.length;
  if (n < 2) return <p className="chart__empty">Two finished sessions needed for a trend.</p>;
  const x = (i: number) => PAD + (i / (n - 1)) * (CW - 2 * PAD);
  const y = (v: number) => PAD + (1 - v) * (CH - 2 * PAD);
  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `M ${x(0)},${CH - PAD} L ${line.split(' ').join(' L ')} L ${x(n - 1)},${CH - PAD} Z`;
  return (
    <svg className="chart" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" role="img" aria-label="Accuracy trend">
      <line className="chart__grid" x1={PAD} y1={y(0.9)} x2={CW - PAD} y2={y(0.9)} />
      <path className="chart__area" d={area} />
      <polyline className="chart__line" points={line} fill="none" />
    </svg>
  );
}

/** Time per session as bars (shorter is better). */
function TimeChart({ records }: { records: SessionRecord[] }) {
  const n = records.length;
  if (n < 1) return <p className="chart__empty">No sessions yet.</p>;
  const max = Math.max(...records.map((r) => r.durationMs), 1);
  return (
    <div className="bars" aria-hidden="true">
      {records.map((r) => (
        <span key={r.id} className="bars__bar" style={{ height: `${Math.max(8, Math.round((r.durationMs / max) * 100))}%` }} />
      ))}
    </div>
  );
}

/** Full-page tutor view: pick a student, see KPIs + charts + log + a printable report. */
export function TutorDashboard() {
  const [, bump] = useState(0);
  // Capture "now" once at mount rather than calling Date.now() during render
  // (keeps render pure; the week window is a snapshot, same as before).
  const [now] = useState(() => Date.now());
  const learners = loadLearners();
  const [sel, setSel] = useState<string>(() => getCurrentLearnerId() ?? learners[0]?.id ?? '');

  function renameStudent() {
    const learner = getLearner(sel);
    const name = window.prompt('Rename student:', learner?.name ?? '');
    if (name && name.trim()) {
      renameLearner(sel, name);
      bump((n) => n + 1);
    }
  }

  function removeStudent() {
    const learner = getLearner(sel);
    if (window.confirm(`Remove ${learner?.name ?? 'this student'} and all of their data? This cannot be undone.`)) {
      removeLearner(sel);
      const remaining = loadLearners();
      setSel(remaining[0]?.id ?? '');
      bump((n) => n + 1);
    }
  }

  const learner = getLearner(sel);
  const prog = sel ? loadProgress(sel) : null;
  const log = sel ? loadSessionLog(sel) : [];
  const recent = log.slice(-12);
  const avgAccuracy = log.length ? Math.round((log.reduce((s, r) => s + r.accuracy, 0) / log.length) * 100) : 0;
  const lastPlayed = log.length ? new Date(log[log.length - 1].endedAt) : null;
  const activeDays = new Set(log.map((r) => r.endedAt.slice(0, 10))).size;
  const week = log.filter((r) => now - new Date(r.endedAt).getTime() <= 7 * 864e5).length;

  return (
    <main className="site site--page dash">
      <button type="button" className="back-btn no-print" onClick={() => navigate('#/')}>← Home</button>
      <div className="dash__top">
        <div>
          <h1 className="site__title">Tutor Dashboard</h1>
          <p className="page__lead">Track each student's progress over time — recorded automatically.</p>
        </div>
        <div className="dash__controls no-print">
          {learner && <button type="button" className="btn-ghost" onClick={() => window.print()}>Print report</button>}
        </div>
      </div>

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
            <div className="report">
              <div className="report__head">
                <span className="report__avatar" style={{ background: learner.color }} aria-hidden="true">{initials(learner.name)}</span>
                <div>
                  <h2 className="report__name">{learner.name}</h2>
                  <p className="report__since">
                    {lastPlayed ? `Last played ${lastPlayed.toLocaleDateString()} · ${activeDays} day${activeDays === 1 ? '' : 's'} active` : 'No sessions yet'}
                  </p>
                </div>
                <div className="report__manage no-print">
                  <button type="button" className="link-btn" onClick={renameStudent}>Rename</button>
                  <button type="button" className="link-btn link-btn--danger" onClick={removeStudent}>Remove</button>
                </div>
              </div>

              <div className="kpi-grid">
                <div className="kpi"><span className="kpi__icon">🎮</span><strong>{prog.sessions}</strong><span className="kpi__label">sessions</span></div>
                <div className="kpi"><span className="kpi__icon">🎯</span><strong>{avgAccuracy}%</strong><span className="kpi__label">avg accuracy</span></div>
                <div className="kpi"><span className="kpi__icon">⏱</span><strong>{prog.bestMs != null ? formatTime(prog.bestMs) : '—'}</strong><span className="kpi__label">best time</span></div>
                <div className="kpi"><span className="kpi__icon">⭐</span><strong>{new Set(prog.earned).size}/{ACHIEVEMENTS.length}</strong><span className="kpi__label">stickers</span></div>
                <div className="kpi"><span className="kpi__icon">📅</span><strong>{week}</strong><span className="kpi__label">this week</span></div>
              </div>

              <div className="chart-grid">
                <div className="chart-card">
                  <h3 className="chart-card__title">Accuracy over time</h3>
                  <AccuracyChart values={recent.map((r) => r.accuracy)} />
                </div>
                <div className="chart-card">
                  <h3 className="chart-card__title">Time per session</h3>
                  <TimeChart records={recent} />
                </div>
              </div>

              <div className="page__panel report__log">
                <h3 className="chart-card__title">Session history</h3>
                <SessionLogPanel learnerId={sel} showSummary={false} />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
