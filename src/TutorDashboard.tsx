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
import { getSessions, getMastery, getEnrichedEvents } from './data/dataSource';
import type { EnrichedSkillEvent } from './data/cloud';
import type { SkillEvent } from './mastery/events';
import { confusions, confusionPhrase, fluency, spellingSlips, spellingSlipPhrase, readingPace } from './world/tutor/personalization';
import { loadMastery } from './mastery/mastery';
import type { MasteryMap } from './mastery/mastery';
import { skillLabel } from './mastery/skills';
import { TutorPip } from './world/tutor/TutorPip';
import { LevelControls } from './world/tutor/LevelControls';
import { SoundMap } from './world/tutor/SoundMap';
import { SignalsPanel } from './world/tutor/SignalsPanel';
import { summarize, insightLine, whyNote, retention } from './world/tutor/dashboardData';

/** Full-page tutor view: mastery-first — what each student has learned, what to
 *  teach next, and the supporting record. */
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

  // Enriched events (cloud-only) power the confusion analysis.
  const [cloudEvents, setCloudEvents] = useState<{ id: string; rows: EnrichedSkillEvent[] } | null>(null);
  useEffect(() => {
    let live = true;
    const l = sel ? getLearner(sel) : undefined;
    if (!l) return;
    void getEnrichedEvents(l).then((rows) => { if (live) setCloudEvents({ id: sel, rows }); });
    return () => { live = false; };
  }, [sel, version]);
  const events = cloudEvents && cloudEvents.id === sel ? cloudEvents.rows : [];
  // Adapt cloud rows (snake_case, ISO `at`) → SkillEvent (camelCase, epoch ms) for
  // the signal-derivation layer — same mapping getMastery uses.
  const sigEvents: SkillEvent[] = events.map((r) => ({
    skillKey: r.skill_key, correct: r.correct, at: Date.parse(r.at),
    chosen: r.chosen ?? undefined, firstTry: r.first_try ?? undefined,
    latencyMs: r.latency_ms ?? undefined, replays: r.replays ?? undefined,
    level: r.level ?? undefined, lesson: r.lesson ?? undefined,
  }));
  const mixUps = confusions(events);
  const automatic = new Set([...fluency(events)].filter(([, v]) => v === 'automatic').map(([k]) => k));
  const slips = spellingSlips(events);   // dictation misspellings (cloud events)
  const pace = readingPace(log);          // reading words/min from fluency sessions

  const summary = summarize(mastery);
  const topNeed = summary.working[0];
  const ret = retention(mastery, now);
  const fresh = [...ret.slipping, ...ret.keepFresh].slice(0, 10); // slipping first (more urgent)
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
  const avgAccuracy = log.length ? Math.round((log.reduce((s, r) => s + r.accuracy, 0) / log.length) * 100) : 0;
  const avgMs = log.length ? Math.round(log.reduce((s, r) => s + r.durationMs, 0) / log.length) : 0;
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

                {/* BLUF — the takeaway before any detail */}
                <p className="dash-insight">{insightLine(learner.name, mastery)}</p>

                <div className="kpi-grid" style={{ marginTop: '14px' }}>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/star.png" alt="" aria-hidden="true" /><strong>{summary.mastered.length}</strong><span className="kpi__label">sounds mastered</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/bullseye.png" alt="" aria-hidden="true" /><strong>{avgAccuracy}%</strong><span className="kpi__label">avg accuracy</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/controller.png" alt="" aria-hidden="true" /><strong>{prog.sessions}</strong><span className="kpi__label">sessions</span></div>
                  <div className="kpi"><img className="kpi__icon kpi__icon--img" src="/images/ui/calendar.png" alt="" aria-hidden="true" /><strong>{week}</strong><span className="kpi__label">this week</span></div>
                </div>
              </div>

              {/* Work on next — the single instructional move */}
              <div className="l2l-card dash-next" style={{ marginTop: '16px' }}>
                {topNeed ? (
                  <>
                    <p className="dash-next__eyebrow">🎯 Work on next</p>
                    <h3 className="dash-next__skill">{skillLabel(topNeed.skillKey)}</h3>
                    <p className="dash-next__why">{whyNote(topNeed)} · {Math.round(topNeed.score * 100)}% so far</p>
                    <button type="button" className="l2l-btn no-print" onClick={() => navigate('#/levels')}>Practice this →</button>
                  </>
                ) : (
                  <p className="dash-next__done">{summary.total > 0
                    ? `🌟 Nothing needs work right now — ${learner.name} is on top of every sound they've practised.`
                    : 'Play a few rounds and the next focus to teach shows up here.'}</p>
                )}
              </div>

              {/* Common mix-ups — recurring confusions (from the chosen answer) */}
              {mixUps.length > 0 && (
                <div className="l2l-card" style={{ marginTop: '16px' }}>
                  <h3 className="chart-card__title">🔀 Common mix-ups</h3>
                  <p className="dash-engage">Mixing up similar letters or sounds is common at this age — a gentle side-by-side contrast drill clears it.</p>
                  <ul className="dash-fresh">
                    {mixUps.slice(0, 6).map((c) => <li key={`${c.skillKey}-${c.chosen}`} className="dash-fresh__chip">{confusionPhrase(c)}</li>)}
                  </ul>
                </div>
              )}

              {/* Reading pace — words/min from the fluency games (growth, not a benchmark) */}
              {pace.n > 0 && (
                <div className="l2l-card" style={{ marginTop: '16px' }}>
                  <h3 className="chart-card__title">⚡ Reading pace</h3>
                  <p className="dash-engage">
                    <strong>{pace.wcpm} words/min</strong> last fluency round{pace.best > pace.wcpm ? ` · best ${pace.best}` : ''}
                    {' '}· across {pace.n} timed game{pace.n === 1 ? '' : 's'}. Accuracy comes first — pace grows as reading becomes automatic.
                  </p>
                </div>
              )}

              {/* Spelling slips — recurring dictation misspellings (what to drill next) */}
              {slips.length > 0 && (
                <div className="l2l-card" style={{ marginTop: '16px' }}>
                  <h3 className="chart-card__title">✏️ Spelling slips</h3>
                  <p className="dash-engage">From dictation — the letters that trip them up. A quick targeted drill on these clears them fastest.</p>
                  <ul className="dash-fresh">
                    {slips.slice(0, 6).map((c) => <li key={`${c.skillKey}-${c.chosen}`} className="dash-fresh__chip">{spellingSlipPhrase(c)}</li>)}
                  </ul>
                </div>
              )}

              {/* Keep fresh — spaced review: mastered-but-stale + freshly slipping */}
              {fresh.length > 0 && (
                <div className="l2l-card" style={{ marginTop: '16px' }}>
                  <h3 className="chart-card__title">🔁 Keep fresh — a quick re-test</h3>
                  <p className="dash-engage">Solid a while ago or just starting to slip — a one-round refresher locks it back in.</p>
                  <ul className="dash-fresh">
                    {fresh.map((it) => (
                      <li key={it.skillKey} className="dash-fresh__chip">
                        {skillLabel(it.skillKey)}
                        <i>{it.days >= 1 ? `${Math.round(it.days)}d ago` : 'today'}</i>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deeper signals — derived from gameplay (stuck / not-yet-fluent / coming along) */}
              <SignalsPanel events={sigEvents} name={learner.name} />

              {/* Sound map — replaces the noisy accuracy line */}
              <div className="l2l-card" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Sound map — mastered &amp; what's next</h3>
                <SoundMap map={mastery} automatic={automatic} />
              </div>

              <TutorPip mastery={mastery} name={learner.name} />

              {/* Engagement — demoted to a quiet line + activity dots */}
              <div className="l2l-card" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Engagement{streak > 1 ? ` · ${streak}-day streak 🔥` : ''}</h3>
                <p className="dash-engage">{prog.sessions} session{prog.sessions === 1 ? '' : 's'} total{avgMs ? ` · ~${formatTime(avgMs)}/session` : ''} · {week} this week{lastPlayed ? ` · last played ${lastPlayed.toLocaleDateString()}` : ''}</p>
                <div className="activity-strip" aria-label={`${activeIn14} active days in the last 14`}>
                  {days.map((d) => <span key={d.key} className={`activity-dot${d.active ? ' on' : ''}`} title={d.key} />)}
                </div>
              </div>

              <div className="l2l-card no-print" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Levels &amp; games — access</h3>
                <LevelControls learnerId={sel} />
              </div>

              <div className="l2l-card report__log" style={{ marginTop: '16px' }}>
                <h3 className="chart-card__title">Session history</h3>
                <SessionLogPanel learnerId={sel} showSummary={false} collapsible />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
