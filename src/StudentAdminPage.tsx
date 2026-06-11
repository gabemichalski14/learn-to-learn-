import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { useDialog } from './ui/dialogContext';
import {
  listLearners, listTutors, listAssignments, listGuardians, listSessions, listSkillEvents,
  assignTutor, unassignTutor, createInviteCode, renameLearner, deleteGuardian, deleteLearner, getLearnerNote, setLearnerNote,
  listPendingInvites, deleteInviteCode, inviteLabel,
  type CloudLearner, type CloudTutor, type CloudAssignment, type CloudGuardian, type CloudInvite,
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
  'blend-buddies': 'Blend Buddies', 'sort-it': 'Sort It', 'rule-breakers': 'Rule Breakers', 'chop-shop': 'Chop Shop',
};
const gameTitle = (id: string) => GAME_TITLES[id] ?? id.replace(/-/g, ' ');
const tutorName = (t: CloudTutor) => t.name || (t.role === 'owner' ? 'You (owner)' : 'Tutor');

/** Collapse a session's per-answer events by skill, so a game that drills one
 *  skill (e.g. Tap It Out) shows ONE row with a ✓/✗ strip, not N identical
 *  labels. Games that vary the sound (Space Sort) get a row per sound. */
function groupItems(items: { skillKey: string; correct: boolean }[]): [string, { right: number; total: number; marks: boolean[] }][] {
  const m = new Map<string, { right: number; total: number; marks: boolean[] }>();
  for (const e of items) {
    const g = m.get(e.skillKey) ?? { right: 0, total: 0, marks: [] };
    g.total += 1;
    if (e.correct) g.right += 1;
    g.marks.push(e.correct);
    m.set(e.skillKey, g);
  }
  return [...m.entries()];
}

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
  const [pendingParents, setPendingParents] = useState<CloudInvite[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [events, setEvents] = useState<{ skillKey: string; correct: boolean; at: number; game: string | null; firstTry?: boolean }[]>([]);
  const [mastery, setMastery] = useState<MasteryMap>({});
  const [expanded, setExpanded] = useState<string | null>(null); // which session row is open
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [note, setNote] = useState('');
  const [savedNote, setSavedNote] = useState('');

  const load = useCallback(async () => {
    try {
      const [ls, t, a, g, s, ev, p] = await Promise.all([
        listLearners(), listTutors(), listAssignments(), listGuardians(id), listSessions(id), listSkillEvents(id), listPendingInvites('parent', id),
      ]);
      const found = ls.find((l) => l.id === id) ?? null;
      setLearner(found); setName(found?.display_name ?? '');
      setTutors(t); setAssigns(a.filter((x) => x.learner_id === id)); setGuardians(g); setPendingParents(p);
      setSessions((s as CloudSessionRow[]).map(toRecord));
      const evs = ev.map((e) => ({ skillKey: e.skill_key, correct: e.correct, at: new Date(e.at).getTime(), game: e.game, firstTry: e.first_try ?? undefined }));
      setEvents(evs);
      setMastery(masteryFromEvents(evs));
      setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load this student.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { if (!configured) return; const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [configured, load]);

  // Note loads separately + fails soft, so a pre-migration missing column can't
  // block the rest of the record.
  useEffect(() => {
    if (!configured) return;
    let live = true;
    void getLearnerNote(id).then((nt) => { if (live) { setNote(nt); setSavedNote(nt); } }).catch(() => {});
    return () => { live = false; };
  }, [configured, id]);

  const primary = assigns.find((a) => a.relation === 'primary')?.tutor_id ?? '';
  const subs = assigns.filter((a) => a.relation === 'substitute').map((a) => a.tutor_id);
  const subOptions = tutors.filter((t) => t.id !== primary && !subs.includes(t.id));
  const nameOf = (tid: string) => { const t = tutors.find((x) => x.id === tid); return t ? tutorName(t) : 'Tutor'; };

  async function saveName() {
    const n = name.trim();
    if (!n || !learner || n === learner.display_name) return;
    try { await renameLearner(id, n); await load(); } catch (e) { setErr(e instanceof Error ? e.message : 'Could not rename.'); }
  }
  async function saveNote() {
    try { await setLearnerNote(id, note); setSavedNote(note); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not save the note (have you run the note migration?).'); }
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
    const email = inviteEmail.trim();
    const parentName = inviteName.trim();
    try {
      const c = await createInviteCode('parent', id, email, parentName);
      const link = `${window.location.origin}${window.location.pathname}#/account?invite=${encodeURIComponent(c)}&as=parent`;
      setCode(link);
      if (email) {
        const child = learner?.display_name ?? 'your child';
        const subject = encodeURIComponent(`Follow ${child}'s progress on Learn to Learn`);
        const body = encodeURIComponent(`${parentName ? `Hi ${parentName},\n\n` : ''}You've been invited to follow ${child}'s progress on Learn to Learn.\n\nOpen this link to set up your account — just add your name and a password:\n${link}\n`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`; // opens YOUR mail app, pre-filled
      }
      setInviteEmail(''); setInviteName('');
      await load(); // show it under "Pending" right away
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create an invite.'); }
  }
  async function cancelInvite(c: string) {
    try { await deleteInviteCode(c); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not cancel the invite.'); }
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
              <span>Parent invite link — or copy &amp; send it yourself:</span>
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
            </div>
            <form className="admin__add" onSubmit={(e) => { e.preventDefault(); void inviteParent(); }}>
              <input className="admin__addinput" type="text" placeholder="Parent's name (optional)" value={inviteName} onChange={(e) => setInviteName(e.target.value)} autoComplete="off" />
              <input className="admin__addinput" type="email" placeholder="Parent's email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} autoComplete="off" />
              <button type="submit" className="admin__cta">Send invite</button>
            </form>
            {guardians.length === 0 ? (
              <p className="admin__empty">No parent linked yet. Send an invite link above.</p>
            ) : (
              <div className="admin__subs">
                {guardians.map((g) => (
                  <span key={g.user_id} className="admin__subchip">{g.name || 'Parent'} · {new Date(g.created_at).toLocaleDateString()}
                    <button type="button" onClick={() => void removeParent(g.user_id)} aria-label="remove parent">×</button>
                  </span>
                ))}
              </div>
            )}
            {pendingParents.length > 0 && (
              <>
                <h3 className="admin__subh">⏳ Pending · {pendingParents.length}</h3>
                <p className="admin__hint" style={{ marginTop: 0 }}>Invite sent — waiting for them to confirm. They move up to Parents once they make an account.</p>
                <div className="admin__subs">
                  {pendingParents.map((p) => (
                    <span key={p.code} className="admin__subchip" title={p.email ?? undefined}>
                      {inviteLabel(p)} · expires {new Date(p.expires_at).toLocaleDateString()}
                      <button type="button" onClick={() => void cancelInvite(p.code)} aria-label="Cancel invite">×</button>
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* private staff note */}
          <section className="l2l-card admin__sec">
            <h2 className="admin__h">Note</h2>
            <p className="admin__empty" style={{ marginTop: 0 }}>Private context the data can't capture — only staff see this.</p>
            <textarea
              className="admin__note" value={note} maxLength={2000} rows={3}
              placeholder="e.g. Loves space themes. Big breakthrough on short vowels this week."
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="admin__add" style={{ marginTop: 8 }}>
              <button type="button" className="admin__cta" disabled={note === savedNote} onClick={() => void saveNote()}>Save note</button>
            </div>
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
                              <p className="admin__session-sum">{right}/{items.length} correct this session — by sound:</p>
                              <ul className="admin__groups">
                                {groupItems(items).map(([skillKey, g]) => (
                                  <li key={skillKey} className="admin__group">
                                    <span className="admin__group-skill">{skillLabel(skillKey)}</span>
                                    <span className="admin__group-marks" aria-label={`${g.right} of ${g.total} correct`}>
                                      {g.marks.map((ok, j) => <b key={j} className={ok ? 'ok' : 'no'} aria-hidden="true">{ok ? '✓' : '✗'}</b>)}
                                    </span>
                                    <span className="admin__group-count">{g.right}/{g.total}</span>
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
