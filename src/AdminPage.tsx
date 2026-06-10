import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { useDialog } from './ui/dialogContext';
import {
  listLearners, listTutors, listAssignments, listDeletionRequests, leaderboard,
  createLearner, assignTutor, deleteLearner, resolveDeletion,
  type CloudLearner, type CloudTutor, type CloudAssignment, type DeletionRequest,
} from './data/cloud';
import './admin.css';

interface StatRow { learner_id: string; display_name: string; sessions: number | null; avg_accuracy: number | null; last_played: string | null }
const STALE_DAYS = 10; // no play in this long → a re-engagement nudge

const tutorName = (t: CloudTutor) => t.name || (t.role === 'owner' ? 'You (owner)' : 'Tutor');
const STUDENT_COLORS = ['#1b9aaa', '#6bae7f', '#e0a14a', '#a8569c', '#5570c0', '#c0573c'];

/**
 * Owner/admin control center: who teaches whom, parent + staff invites, and the
 * COPPA deletion-requests inbox. Owner-only (the route guards it; this also
 * degrades gracefully if cloud isn't configured).
 */
export function AdminPage() {
  const dialog = useDialog();
  const configured = isCloudConfigured();
  const [learners, setLearners] = useState<CloudLearner[]>([]);
  const [tutors, setTutors] = useState<CloudTutor[]>([]);
  const [assigns, setAssigns] = useState<CloudAssignment[]>([]);
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [stats, setStats] = useState<StatRow[]>([]);
  const [now] = useState(() => Date.now());
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    // NB: no synchronous setState here — the effect calls this, and the initial
    // `loading` state already covers the first paint (react-hooks/set-state-in-effect).
    try {
      const [l, t, a, r, lb] = await Promise.all([listLearners(), listTutors(), listAssignments(), listDeletionRequests(), leaderboard()]);
      setLearners(l); setTutors(t); setAssigns(a); setRequests(r); setStats((lb ?? []) as StatRow[]); setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not load center data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    const id = setTimeout(() => { void load(); }, 0); // defer out of the effect (no sync setState)
    return () => clearTimeout(id);
  }, [configured, load]);

  const learnerName = (id: string) => learners.find((l) => l.id === id)?.display_name ?? 'this student';
  const ownerId = tutors.find((t) => t.role === 'owner')?.id;
  const tutorById = (id: string) => tutors.find((t) => t.id === id);
  const primaryOf = (learnerId: string) => assigns.find((a) => a.learner_id === learnerId && a.relation === 'primary')?.tutor_id ?? '';

  // Triage: students who've started but are stalled (no play in a while) or
  // finding it hard (low average) — the owner's "who needs a nudge" list.
  const needsAttention = stats.filter((s) => {
    if (!s.sessions) return false;
    const days = s.last_played ? (now - Date.parse(s.last_played)) / 86_400_000 : 999;
    return days >= STALE_DAYS || (s.avg_accuracy != null && s.avg_accuracy < 0.6);
  });
  const attentionReason = (s: StatRow) => {
    if (s.avg_accuracy != null && s.avg_accuracy < 0.6) return 'finding it tricky';
    const days = s.last_played ? Math.round((now - Date.parse(s.last_played)) / 86_400_000) : 0;
    return `away ${days} day${days === 1 ? '' : 's'}`;
  };

  async function addStudent() {
    const name = newName.trim();
    if (!name || adding) return;
    setAdding(true);
    try {
      const color = STUDENT_COLORS[learners.length % STUDENT_COLORS.length];
      const id = await createLearner(name, color);
      if (ownerId) await assignTutor(id, ownerId, 'primary'); // assigned to you to start; reassign on the grid
      setNewName('');
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not add the student.'); }
    finally { setAdding(false); }
  }

  async function onDelete(req: DeletionRequest) {
    const ok = await dialog.confirm({
      title: 'Delete this student’s data?',
      message: `Permanently delete all data for ${learnerName(req.learner_id)}? This cannot be undone.`,
      okLabel: 'Delete', danger: true,
    });
    if (!ok) return;
    try { await deleteLearner(req.learner_id); await resolveDeletion(req.id, 'done'); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not delete.'); }
  }
  async function onDismiss(req: DeletionRequest) {
    try { await resolveDeletion(req.id, 'dismissed'); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not update the request.'); }
  }

  return (
    <main className="l2l-page">
      <header className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Center admin</p>
        <h1 className="l2l-display">Your <em>students</em></h1>
        <p className="l2l-lead">Add students and set their tutor. Open any student to edit info, manage parents, and see their data.</p>
      </header>

      {!configured ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">Cloud sync isn't set up yet — admin tools appear once a Supabase project + the roles migration are in place.</p></div>
      ) : loading ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p>Loading your center…</p></div>
      ) : (
        <div className="admin">
          {err && <p className="admin__err" role="alert">{err}</p>}

          {/* deletion requests — easy to find for the owner */}
          {requests.length > 0 && (
            <section className="l2l-card admin__sec admin__sec--alert">
              <h2 className="admin__h">🗑️ Deletion requests · {requests.length}</h2>
              <ul className="admin__reqs">
                {requests.map((r) => (
                  <li key={r.id} className="admin__req">
                    <span><strong>{learnerName(r.learner_id)}</strong>{r.note ? ` — “${r.note}”` : ''}</span>
                    <span className="admin__reqbtns">
                      <button type="button" className="admin__danger" onClick={() => onDelete(r)}>Delete data</button>
                      <button type="button" className="admin__ghost" onClick={() => onDismiss(r)}>Dismiss</button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* triage — who needs a nudge (stalled or struggling) */}
          {needsAttention.length > 0 && (
            <section className="l2l-card admin__sec admin__sec--alert">
              <h2 className="admin__h">🔔 Needs a nudge · {needsAttention.length}</h2>
              <ul className="admin__students">
                {needsAttention.map((s) => (
                  <li key={s.learner_id}>
                    <button type="button" className="admin__studentrow" onClick={() => navigate(`#/admin/student/${s.learner_id}`)}>
                      <span className="admin__studentrow-main">
                        <strong className="admin__studentrow-name">{s.display_name}</strong>
                        <span className="admin__studentrow-sub">{attentionReason(s)}</span>
                      </span>
                      <span className="admin__chev" aria-hidden="true">›</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* students — add + assign (admin controls, not a progress view) */}
          <section className="l2l-card admin__sec">
            <div className="admin__sechead">
              <h2 className="admin__h">Students · {learners.length}</h2>
            </div>
            <form className="admin__add" onSubmit={(e) => { e.preventDefault(); void addStudent(); }}>
              <input className="admin__addinput" placeholder="New student’s first name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} aria-label="New student first name" />
              <button type="submit" className="admin__cta" disabled={!newName.trim() || adding}>{adding ? '…' : '+ Add student'}</button>
            </form>
            {learners.length === 0 ? (
              <p className="admin__empty">No students yet — add your first one above.</p>
            ) : (
              <ul className="admin__students">
                {learners.map((l) => {
                  const pid = primaryOf(l.id);
                  const t = pid ? tutorById(pid) : undefined;
                  return (
                    <li key={l.id}>
                      <button type="button" className="admin__studentrow" onClick={() => navigate(`#/admin/student/${l.id}`)}>
                        <span className="admin__avatar" style={{ background: l.color }} aria-hidden="true">{l.display_name.slice(0, 1).toUpperCase()}</span>
                        <span className="admin__studentrow-main">
                          <strong className="admin__studentrow-name">{l.display_name}</strong>
                          <span className="admin__studentrow-sub">{t ? `Tutor: ${tutorName(t)}` : 'No tutor assigned'}</span>
                        </span>
                        <span className="admin__chev" aria-hidden="true">›</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="admin__hint">Tap a student to edit their info, manage tutors &amp; parents, and see all their data.</p>
          </section>
        </div>
      )}
    </main>
  );
}
