import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { useDialog } from './ui/dialogContext';
import {
  listLearners, listTutors, listAssignments, listGuardians, listSessions, listSkillEvents,
  assignTutor, unassignTutor, createInviteCode, renameLearner, deleteGuardian, deleteLearner,
  type CloudLearner, type CloudTutor, type CloudAssignment, type CloudGuardian,
} from './data/cloud';
import { masteryFromEvents } from './mastery/events';
import type { MasteryMap } from './mastery/mastery';
import { skillLabel } from './mastery/skills';
import { StrengthsPanel } from './world/tutor/StrengthsPanel';
import { formatTime } from './progress';
import type { SessionRecord } from './sessionLog';
import './admin.css';

interface CloudSessionRow { id: string; game: string; level?: number; ended_at: string; duration_ms: number; rounds?: number; items?: number; wrong_attempts?: number; accuracy?: number }
const toRecord = (r: CloudSessionRow): SessionRecord => ({
  id: r.id, game: r.game, level: r.level ?? undefined, startedAt: r.ended_at, endedAt: r.ended_at,
  durationMs: r.duration_ms, rounds: r.rounds ?? 0, items: r.items ?? 0, wrongAttempts: r.wrong_attempts ?? 0, accuracy: r.accuracy ?? 0,
});
const GAME_TITLES: Record<string, string> = {
  'tap-it-out': 'Tap It Out', 'same-or-different': 'Same or Different?', 'switch-it': 'Switch It',
  'beginning-sounds': 'Blast Off', 'ending-sounds': 'Touchdown', 'middle-sounds': 'Vowel Patrol', 'star-station': 'Star Station',
};
const gameTitle = (id: string) => GAME_TITLES[id] ?? id.replace(/-/g, ' ');
const tutorName = (t: CloudTutor) => t.name || (t.role === 'owner' ? 'You (owner)' : 'Tutor');

/**
 * Owner's per-student control + record page (opened from the admin roster):
 * rename, manage tutors (primary + substitutes), manage linked parents, and see
 * all of the student's collected data (progress + strengths/needs + sessions).
 */
export function StudentAdminPage({ id }: { id: string }) {
  const dialog = useDialog();
  const configured = isCloudConfigured();
  const [learner, setLearner] = useState<CloudLearner | null>(null);
  const [tutors, setTutors] = useState<CloudTutor[]>([]);
  const [assigns, setAssigns] = useState<CloudAssignment[]>([]);
  const [guardians, setGuardians] = useState<CloudGuardian[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [events, setEvents] = useState<{ skillKey: string; correct: boolean; at: number; game: string | null }[]>([]);
  const [mastery, setMastery] = useState<MasteryMap>({});
  const [expanded, setExpanded] = useState<string | null>(null); // which session row is open
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [ls, t, a, g, s, ev] = await Promise.all([
        listLearners(), listTutors(), listAssignments(), listGuardians(id), listSessions(id), listSkillEvents(id),
      ]);
      const found = ls.find((l) => l.id === id) ?? null;
      setLearner(found); setName(found?.display_name ?? '');
      setTutors(t); setAssigns(a.filter((x) => x.learner_id === id)); setGuardians(g);
      setSessions((s as CloudSessionRow[]).map(toRecord));
      const evs = ev.map((e) => ({ skillKey: e.skill_key, correct: e.correct, at: new Date(e.at).getTime(), game: e.game }));
      setEvents(evs);
      setMastery(masteryFromEvents(evs));
      setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load this student.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { if (!configured) return; const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [configured, load]);

  const primary = assigns.find((a) => a.relation === 'primary')?.tutor_id ?? '';
  const subs = assigns.filter((a) => a.relation === 'substitute').map((a) => a.tutor_id);
  const subOptions = tutors.filter((t) => t.id !== primary && !subs.includes(t.id));
  const nameOf = (tid: string) => { const t = tutors.find((x) => x.id === tid); return t ? tutorName(t) : 'Tutor'; };

  async function saveName() {
    const n = name.trim();
    if (!n || !learner || n === learner.display_name) return;
    try { await renameLearner(id, n); await load(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not rename.'); }
  }
  async function setPrimary(tid: string) {
    try {
      for (const old of assigns.filter((a) => a.relation === 'primary' && a.tutor_id !== tid)) await unassignTutor(id, old.tutor_id);
      if (tid) await assignTutor(id, tid, 'primary');
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not update the tutor.'); }
  }
  async function addSub(tid: string) { if (!tid) return; try { await assignTutor(id, tid, 'substitute'); await load(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not add substitute.'); } }
  async function removeAssign(tid: string) { try { await unassignTutor(id, tid); await load(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not update.'); } }

  async function inviteParent() {
    try {
      const c = await createInviteCode('parent', id);
      setCode(`${window.location.origin}${window.location.pathname}#/account?invite=${encodeURIComponent(c)}&as=parent`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create an invite.'); }
  }
  async function removeParent(userId: string) {
    const ok = await dialog.confirm({ title: 'Remove parent access?', message: 'This parent will no longer be able to see this child. Continue?', okLabel: 'Remove', danger: true });
    if (!ok) return;
    try { await deleteGuardian(userId, id); await load(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not remove the parent.'); }
  }
  async function removeStudent() {
    if (!learner) return;
    const ok = await dialog.confirm({ title: `Remove ${learner.display_name}?`, message: `Permanently delete ${learner.display_name} and all of their data? This can’t be undone.`, okLabel: 'Remove', danger: true });
    if (!ok) return;
    try { await deleteLearner(id); navigate('#/admin'); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not remove the student.'); }
  }

  const n = sessions.length;
  const avg = n ? Math.round((sessions.reduce((s, r) => s + r.accuracy, 0) / n) * 100) : 0;
  const last = n ? new Date(sessions[n - 1].endedAt) : null;
  const totalMin = Math.round(sessions.reduce((s, r) => s + r.durationMs, 0) / 60000);
  const recent = sessions.slice().reverse().slice(0, 8);
  // The per-answer events captured during a given session (matched by time
  // window + game, since events carry only a timestamp). 2s buffer for skew.
  const sessionItems = (r: SessionRecord) => {
    const end = new Date(r.endedAt).getTime();
    const start = end - r.durationMs - 2000;
    return events.filter((e) => e.at >= start && e.at <= end + 2000 && (!e.game || !r.game || e.game === r.game));
  };

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/admin')}>← Center admin</button>

      {!configured ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">Cloud sync isn't set up yet.</p></div>
      ) : loading ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p>Loading…</p></div>
      ) : !learner ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">That student wasn't found.</p></div>
      ) : (
        <div className="admin" style={{ marginTop: 8 }}>
          <header className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
            <p className="l2l-eyebrow">Student</p>
            <h1 className="l2l-display" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="admin__avatar" style={{ background: learner.color, width: 40, height: 40, fontSize: 18 }} aria-hidden="true">{learner.display_name.slice(0, 1).toUpperCase()}</span>
              {learner.display_name}
            </h1>
          </header>

          {err && <p className="admin__err" role="alert">{err}</p>}
          {code && (
            <div className="admin__code" role="status">
              <span><strong>Parent</strong> invite link — send it once:</span>
              <code className="admin__codeval">{code}</code>
              <button type="button" className="admin__copy" onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}>Copy</button>
              <button type="button" className="admin__codex" aria-label="dismiss" onClick={() => setCode(null)}>×</button>
            </div>
          )}

          {/* edit info */}
          <section className="l2l-card admin__sec">
            <h2 className="admin__h">Info</h2>
            <div className="admin__add">
              <input className="admin__addinput" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} aria-label="Student first name" />
              <button type="button" className="admin__cta" disabled={!name.trim() || name.trim() === learner.display_name} onClick={() => void saveName()}>Save name</button>
            </div>
          </section>

          {/* tutors */}
          <section className="l2l-card admin__sec">
            <h2 className="admin__h">Tutors</h2>
            <div className="admin__student-controls">
              <label className="admin__field">Primary tutor
                <select value={primary} onChange={(e) => void setPrimary(e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {tutors.map((t) => <option key={t.id} value={t.id}>{tutorName(t)}</option>)}
                </select>
              </label>
            </div>
            <div className="admin__subs">
              {subs.map((tid) => (
                <span key={tid} className="admin__subchip">{nameOf(tid)} · sub
                  <button type="button" onClick={() => void removeAssign(tid)} aria-label="remove substitute">×</button>
                </span>
              ))}
              {subOptions.length > 0 && (
                <select className="admin__subadd" value="" onChange={(e) => { if (e.target.value) void addSub(e.target.value); }} aria-label="Add substitute tutor">
                  <option value="">+ substitute</option>
                  {subOptions.map((t) => <option key={t.id} value={t.id}>{tutorName(t)}</option>)}
                </select>
              )}
            </div>
          </section>

          {/* parents */}
          <section className="l2l-card admin__sec">
            <div className="admin__sechead">
              <h2 className="admin__h">Parents · {guardians.length}</h2>
              <button type="button" className="admin__cta" onClick={() => void inviteParent()}>+ Invite parent</button>
            </div>
            {guardians.length === 0 ? (
              <p className="admin__empty">No parent linked yet. Send an invite link above.</p>
            ) : (
              <div className="admin__subs">
                {guardians.map((g) => (
                  <span key={g.user_id} className="admin__subchip">Parent · {new Date(g.created_at).toLocaleDateString()}
                    <button type="button" onClick={() => void removeParent(g.user_id)} aria-label="remove parent">×</button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* data */}
          <section className="l2l-card admin__sec">
            <h2 className="admin__h">Progress</h2>
            <div className="admin__kpis">
              <span className="admin__kpi"><b>{n}</b><i>sessions</i></span>
              <span className="admin__kpi"><b>{avg}%</b><i>avg accuracy</i></span>
              <span className="admin__kpi"><b>{totalMin}m</b><i>total time</i></span>
              <span className="admin__kpi"><b>{last ? last.toLocaleDateString() : '—'}</b><i>last played</i></span>
            </div>
            <StrengthsPanel mastery={mastery} />
            {recent.length > 0 ? (
              <ul className="admin__recent">
                {recent.map((r) => {
                  const open = expanded === r.id;
                  const items = open ? sessionItems(r) : [];
                  const right = items.filter((i) => i.correct).length;
                  return (
                    <li key={r.id}>
                      <button type="button" className="admin__recent-row admin__recent-row--btn" aria-expanded={open} onClick={() => setExpanded(open ? null : r.id)}>
                        <span>{gameTitle(r.game)}{r.level != null ? ` · Lv ${r.level}` : ''}</span>
                        <span className="admin__recent-meta">{Math.round(r.accuracy * 100)}% · {formatTime(r.durationMs)} · {new Date(r.endedAt).toLocaleDateString()} <i className="admin__caret" aria-hidden="true">{open ? '▴' : '▾'}</i></span>
                      </button>
                      {open && (
                        <div className="admin__session">
                          {items.length === 0 ? (
                            <p className="admin__empty" style={{ margin: 0 }}>No per-answer data was captured for this session.</p>
                          ) : (
                            <>
                              <p className="admin__session-sum">{right}/{items.length} correct — every sound this session:</p>
                              <ul className="admin__items">
                                {items.map((e, i) => (
                                  <li key={i} className={`admin__item ${e.correct ? 'is-ok' : 'is-no'}`}>
                                    <span className="admin__item-mark" aria-hidden="true">{e.correct ? '✓' : '✗'}</span>
                                    <span className="admin__item-skill">{skillLabel(e.skillKey)}</span>
                                    <span className="admin__item-time">{new Date(e.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : <p className="admin__empty">No sessions played yet.</p>}
          </section>

          <button type="button" className="admin__danger" style={{ alignSelf: 'flex-start' }} onClick={() => void removeStudent()}>Remove this student</button>
        </div>
      )}
    </main>
  );
}
