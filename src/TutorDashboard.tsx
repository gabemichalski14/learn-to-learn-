import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { navigate } from './router';
import { SessionLogPanel } from './SessionLogPanel';
import { loadLearners, getCurrentLearnerId, getLearner, initials, renameLearner, removeLearner } from './profiles';
import { useLearners, useDataVersion } from './data/store';
import { useDialog } from './ui/dialogContext';
import { loadProgress, formatTime } from './progress';
import { loadSessionLog } from './sessionLog';
import type { SessionRecord } from './sessionLog';
import { getSessions, getMastery } from './data/dataSource';
import { ACHIEVEMENTS } from './achievements';
import { loadMastery, rankAreas, scoreOf } from './mastery/mastery';
import type { MasteryMap, FocusArea } from './mastery/mastery';
import { skillLabel } from './mastery/skills';
import { AreasToImprove } from './AreasToImprove';
import { TutorPip } from './world/tutor/TutorPip';
import { LevelControls } from './world/tutor/LevelControls';

const CW = 300;
const CH = 100;
const PADL = 30; // room for the % axis labels
const PADR = 12;
const PADT = 12;
const PADB = 16;

const GAME_TITLES: Record<string, string> = {
  'tap-it-out': 'Tap It Out', 'beginning-sounds': 'Blast Off',
  'ending-sounds': 'Touchdown', 'middle-sounds': 'Vowel Patrol',
};

/** Accuracy over recent sessions — true 0–100% scale with labelled axis, a 90%
 *  mastery line, and a dot per session (the latest is called out). Honest: it
 *  plots the real values, never a smoothed vibe. */
function AccuracyChart({ values }: { values: number[] }) {
  const n = values.length;
  if (n < 2) return <p className="chart__empty">Two finished sessions needed for a trend.</p>;
  const x = (i: number) => PADL + (i / (n - 1)) * (CW - PADL - PADR);
  const y = (v: number) => PADT + (1 - v) * (CH - PADT - PADB); // 0..1 absolute
  const pts = values.map((v, i) => ({ x: x(i), y: y(v), v }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0].x},${CH - PADB} L ${line.split(' ').join(' L ')} L ${pts[n - 1].x},${CH - PADB} Z`;
  const last = pts[n - 1];
  return (
    <svg className="chart" viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={`Accuracy over the last ${n} sessions`}>
      {/* y-axis reference lines + labels: 100% and the 90% mastery line */}
      <line className="chart__axis" x1={PADL} y1={y(1)} x2={CW - PADR} y2={y(1)} />
      <text className="chart__lbl" x={PADL - 5} y={y(1) + 3} textAnchor="end">100%</text>
      <line className="chart__ref" x1={PADL} y1={y(0.9)} x2={CW - PADR} y2={y(0.9)} />
      <text className="chart__lbl" x={PADL - 5} y={y(0.9) + 3} textAnchor="end">90%</text>
      <path className="chart__area" d={area} />
      <polyline className="chart__line" points={line} fill="none" />
      {pts.map((p, i) => (
        <circle key={i} className="chart__dot" cx={p.x} cy={p.y} r={i === n - 1 ? 3.4 : 2.4}>
          <title>{`Session ${i + 1}: ${Math.round(p.v * 100)}%`}</title>
        </circle>
      ))}
      <text className="chart__val" x={Math.min(last.x, CW - PADR - 2)} y={Math.max(last.y - 6, 9)} textAnchor="end">{Math.round(last.v * 100)}%</text>
    </svg>
  );
}

/** Time per session — real proportional bars with an average line + the longest
 *  / average called out, and the exact game + time on each bar (hover). Linear so
 *  it's honest; the average line gives context when one session runs long. */
function TimeChart({ records }: { records: SessionRecord[] }) {
  const n = records.length;
  if (n < 1) return <p className="chart__empty">No sessions yet.</p>;
  const times = records.map((r) => r.durationMs);
  const max = Math.max(...times, 1);
  const avg = times.reduce((s, t) => s + t, 0) / n;
  return (
    <>
      <div className="barwrap" style={{ '--avg': `${Math.round((avg / max) * 100)}%` } as CSSProperties}>
        <div className="bars">
          {records.map((r) => (
            <span
              key={r.id}
              className="bars__bar"
              style={{ height: `${Math.max(6, Math.round((r.durationMs / max) * 100))}%` }}
              title={`${GAME_TITLES[r.game] ?? r.game}${r.level != null ? ` · Lv ${r.level}` : ''} — ${formatTime(r.durationMs)}`}
            />
          ))}
        </div>
        {n > 1 && <span className="bars__avgline" aria-hidden="true" />}
      </div>
      <p className="chart__cap">Longest <b>{formatTime(max)}</b>{n > 1 ? <> · avg <b>{formatTime(Math.round(avg))}</b></> : null}</p>
    </>
  );
}

/** Full-page tutor view: pick a student, see KPIs + charts + log + a printable report. */
export function TutorDashboard() {
  // Capture "now" once at mount rather than calling Date.now() during render
  // (keeps render pure; the week window is a snapshot, same as before).
  const [now] = useState(() => Date.now());
  const learners = useLearners(); // live roster (rename/remove reflect instantly)
  const version = useDataVersion(); // re-render + refetch when any data changes
  const dialog = useDialog();
  const [sel, setSel] = useState<string>(() => getCurrentLearnerId() ?? learners[0]?.id ?? '');

  async function renameStudent() {
    const learner = getLearner(sel);
    const name = await dialog.prompt({ title: 'Rename student', initial: learner?.name ?? '', okLabel: 'Save' });
    if (name) renameLearner(sel, name); // notifies → re-renders
  }

  async function removeStudent() {
    const learner = getLearner(sel);
    const ok = await dialog.confirm({
      title: 'Remove student?',
      message: `Remove ${learner?.name ?? 'this student'} and all of their data? This can’t be undone.`,
      okLabel: 'Remove', danger: true,
    });
    if (ok) {
      removeLearner(sel);
      setSel(loadLearners()[0]?.id ?? '');
    }
  }

  // Local sessions are read in render (instantly correct for the selected
  // student). Cloud sessions overlay once they resolve — keyed by `sel` so
  // switching students never shows the previous student's data.
  const [cloudLog, setCloudLog] = useState<{ id: string; rows: SessionRecord[] } | null>(null);
  useEffect(() => {
    let live = true;
    const learner = sel ? getLearner(sel) : undefined;
    if (!learner) return;
    void getSessions(learner).then((rows) => { if (live) setCloudLog({ id: sel, rows }); });
    return () => { live = false; };
  }, [sel, version]);
  const log = cloudLog && cloudLog.id === sel ? cloudLog.rows : (sel ? loadSessionLog(sel) : []);

  const [cloudMastery, setCloudMastery] = useState<{ id: string; map: MasteryMap } | null>(null);
  useEffect(() => {
    let live = true;
    const learner = sel ? getLearner(sel) : undefined;
    if (!learner) return;
    void getMastery(learner).then((map) => { if (live) setCloudMastery({ id: sel, map }); });
    return () => { live = false; };
  }, [sel, version]);
  const mastery: MasteryMap = cloudMastery && cloudMastery.id === sel ? cloudMastery.map : (sel ? loadMastery(sel) : {});
  const focus: FocusArea[] = rankAreas(mastery);
  const strongest = Object.entries(mastery)
    .filter(([, s]) => s.attempts >= 5)
    .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s), attempts: s.attempts }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const dayKeys = new Set(log.map((r) => r.endedAt.slice(0, 10)));
  const days = Array.from({ length: 14 }, (_, i) => {
    const key = new Date(now - (13 - i) * 864e5).toISOString().slice(0, 10);
    return { key, active: dayKeys.has(key) };
  });
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].active) streak++; else break; }
  const activeIn14 = days.filter((d) => d.active).length;

  const learner = getLearner(sel);
  const prog = sel ? loadProgress(sel) : null;
  const recent = log.slice(-12);
  const avgAccuracy = log.length ? Math.round((log.reduce((s, r) => s + r.accuracy, 0) / log.length) * 100) : 0;
  const lastPlayed = log.length ? new Date(log[log.length - 1].endedAt) : null;
  const activeDays = new Set(log.map((r) => r.endedAt.slice(0, 10))).size;
  const week = log.filter((r) => now - new Date(r.endedAt).getTime() <= 7 * 864e5).length;

  return (
    <main className="l2l-page dash">
      <button type="button" className="l2l-back no-print" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <div className="dash__top">
          <div>
            <p className="l2l-eyebrow">Progress</p>
            <h1 className="l2l-display">Tutor <em>Dashboard</em></h1>
            <p className="l2l-lead">Track each student's progress over time — recorded automatically.</p>
          </div>
          <div className="dash__controls no-print">
            {learner && (
              <button type="button" className="l2l-btn l2l-btn--ghost" onClick={() => window.print()}>Print report</button>
            )}
          </div>
        </div>
      </div>

      {learners.length === 0 ? (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', '--i': 1 } as CSSProperties}>
          <p>No students yet — add one from the home screen.</p>
        </div>
      ) : (
        <>
          <div className="student-picker no-print l2l-reveal" style={{ '--i': 1 } as CSSProperties} role="group" aria-label="Choose a student">
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
            <div className="report l2l-reveal" style={{ '--i': 2 } as CSSProperties}>
              <div className="l2l-card" style={{ marginTop: '16px' }}>
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

                <div className="kpi-grid" style={{ marginTop: '16px' }}>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/controller.png" alt="" aria-hidden="true" /><strong>{prog.sessions}</strong><span className="kpi__label">sessions</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/bullseye.png" alt="" aria-hidden="true" /><strong>{avgAccuracy}%</strong><span className="kpi__label">avg accuracy</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/stopwatch.png" alt="" aria-hidden="true" /><strong>{prog.bestMs != null ? formatTime(prog.bestMs) : '—'}</strong><span className="kpi__label">best time</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/star.png" alt="" aria-hidden="true" /><strong>{new Set(prog.earned).size}/{ACHIEVEMENTS.length}</strong><span className="kpi__label">stickers</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/calendar.png" alt="" aria-hidden="true" /><strong>{week}</strong><span className="kpi__label">this week</span></div>
                </div>
              </div>

              <TutorPip mastery={mastery} name={learner.name} />

              <div className="chart-grid" style={{ marginTop: '16px' }}>
                <div className="l2l-card chart-card">
                  <h3 className="chart-card__title">Accuracy over time</h3>
                  <AccuracyChart values={recent.map((r) => r.accuracy)} />
                </div>
                <div className="l2l-card chart-card">
                  <h3 className="chart-card__title">Time per session</h3>
                  <TimeChart records={recent} />
                </div>
              </div>

              <div className="chart-grid" style={{ marginTop: '16px' }}>
                {strongest.length > 0 && (
                  <div className="l2l-card chart-card">
                    <h3 className="chart-card__title">Sound mastery — strongest</h3>
                    <ul className="mastery-list">
                      {strongest.map((a) => (
                        <li key={a.skillKey} className="mastery-row">
                          <span className="mastery-row__label">{skillLabel(a.skillKey)}</span>
                          <span className="mastery-bar"><span className="mastery-bar__fill" style={{ width: `${Math.round(a.score * 100)}%` }} /></span>
                          <span className="mastery-row__pct">{Math.round(a.score * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="l2l-card chart-card">
                  <h3 className="chart-card__title">Activity — last 14 days{streak > 1 ? ` · ${streak}-day streak 🔥` : ''}</h3>
                  <div className="activity-strip" aria-label={`${activeIn14} active days in the last 14`}>
                    {days.map((d) => <span key={d.key} className={`activity-dot${d.active ? ' on' : ''}`} title={d.key} />)}
                  </div>
                </div>
              </div>

              <div className="l2l-card" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Focus areas</h3>
                <AreasToImprove learnerId={sel} focus={focus} />
              </div>

              <div className="l2l-card" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Levels &amp; games — access</h3>
                <LevelControls learnerId={sel} />
              </div>

              <div className="l2l-card report__log" style={{ marginTop: '16px' }}>
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
