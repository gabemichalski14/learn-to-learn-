import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { isCloudConfigured } from './data/supabase';
import { useDialog } from './ui/dialogContext';
import {
  listLearners, listTutors, listAssignments, listDeletionRequests,
  createInviteCode, createLearner, assignTutor, unassignTutor, deleteLearner, resolveDeletion,
  type CloudLearner, type CloudTutor, type CloudAssignment, type DeletionRequest,
} from './data/cloud';
import './admin.css';

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
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<{ label: string; value: string } | null>(null);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    // NB: no synchronous setState here — the effect calls this, and the initial
    // `loading` state already covers the first paint (react-hooks/set-state-in-effect).
    try {
      const [l, t, a, r] = await Promise.all([listLearners(), listTutors(), listAssignments(), listDeletionRequests()]);
      setLearners(l); setTutors(t); setAssigns(a); setRequests(r); setErr(null);
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
  const nameOf = (id: string) => { const t = tutorById(id); return t ? tutorName(t) : 'Tutor'; };
  const primaryOf = (learnerId: string) => assigns.find((a) => a.learner_id === learnerId && a.relation === 'primary')?.tutor_id ?? '';
  const subsOf = (learnerId: string) => assigns.filter((a) => a.learner_id === learnerId && a.relation === 'substitute').map((a) => a.tutor_id);

  /** Set (or clear, with '') the student's one primary tutor. */
  async function setPrimary(learnerId: string, tutorId: string) {
    try {
      for (const old of assigns.filter((a) => a.learner_id === learnerId && a.relation === 'primary' && a.tutor_id !== tutorId)) {
        await unassignTutor(learnerId, old.tutor_id);
      }
      if (tutorId) await assignTutor(learnerId, tutorId, 'primary');
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not update the tutor.'); }
  }
  async function addSub(learnerId: string, tutorId: string) {
    if (!tutorId) return;
    try { await assignTutor(learnerId, tutorId, 'substitute'); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not add the substitute.'); }
  }
  async function removeAssign(learnerId: string, tutorId: string) {
    try { await unassignTutor(learnerId, tutorId); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not update the assignment.'); }
  }

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

  /** Create an invite and hand back a CLICKABLE link (carries the code + role). */
  async function invite(kind: 'tutor' | 'parent', learnerId?: string, label?: string) {
    try {
      const codeVal = await createInviteCode(kind, learnerId);
      const base = `${window.location.origin}${window.location.pathname}`;
      const url = `${base}#/account?invite=${encodeURIComponent(codeVal)}&as=${kind}`;
      setCode({ label: label ?? (kind === 'tutor' ? 'New tutor' : 'Parent'), value: url });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create an invite.'); }
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

  async function removeStudent(l: CloudLearner) {
    const ok = await dialog.confirm({
      title: `Remove ${l.display_name}?`,
      message: `Permanently delete ${l.display_name} and all of their data? This can’t be undone.`,
      okLabel: 'Remove', danger: true,
    });
    if (!ok) return;
    try { await deleteLearner(l.id); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not remove the student.'); }
  }

  return (
    <main className="l2l-page">
      <header className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Center admin</p>
        <h1 className="l2l-display">Your <em>center</em></h1>
        <p className="l2l-lead">Assign students to tutors, invite staff and parents, and handle data-deletion requests.</p>
      </header>

      {!configured ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">Cloud sync isn't set up yet — admin tools appear once a Supabase project + the roles migration are in place.</p></div>
      ) : loading ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p>Loading your center…</p></div>
      ) : (
        <div className="admin">
          {err && <p className="admin__err" role="alert">{err}</p>}
          {code && (
            <div className="admin__code" role="status">
              <span><strong>{code.label}</strong> invite link — send it once; it opens sign-up with everything filled in:</span>
              <code className="admin__codeval">{code.value}</code>
              <button type="button" className="admin__copy" onClick={() => navigator.clipboard?.writeText(code.value).catch(() => {})}>Copy</button>
              <button type="button" className="admin__codex" aria-label="dismiss" onClick={() => setCode(null)}>×</button>
            </div>
          )}

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
                  const primary = primaryOf(l.id);
                  const subs = subsOf(l.id);
                  const subOptions = tutors.filter((t) => t.id !== primary && !subs.includes(t.id));
                  return (
                    <li key={l.id} className="admin__student">
                      <span className="admin__avatar" style={{ background: l.color }} aria-hidden="true">{l.display_name.slice(0, 1).toUpperCase()}</span>
                      <div className="admin__student-main">
                        <strong className="admin__student-name">{l.display_name}</strong>
                        <div className="admin__student-controls">
                          <label className="admin__field">Tutor
                            <select value={primary} onChange={(e) => void setPrimary(l.id, e.target.value)}>
                              <option value="">— Unassigned —</option>
                              {tutors.map((t) => <option key={t.id} value={t.id}>{tutorName(t)}</option>)}
                            </select>
                          </label>
                          <button type="button" className="admin__linkbtn" onClick={() => invite('parent', l.id, `${l.display_name}'s parent`)}>Invite parent</button>
                          <button type="button" className="admin__remove" onClick={() => void removeStudent(l)} aria-label={`Remove ${l.display_name}`}>Remove</button>
                        </div>
                        {(subs.length > 0 || subOptions.length > 0) && (
                          <div className="admin__subs">
                            {subs.map((id) => (
                              <span key={id} className="admin__subchip">{nameOf(id)} · sub
                                <button type="button" onClick={() => void removeAssign(l.id, id)} aria-label="remove substitute">×</button>
                              </span>
                            ))}
                            {subOptions.length > 0 && (
                              <select className="admin__subadd" value="" onChange={(e) => { if (e.target.value) void addSub(l.id, e.target.value); }} aria-label="Add a substitute tutor">
                                <option value="">+ substitute</option>
                                {subOptions.map((t) => <option key={t.id} value={t.id}>{tutorName(t)}</option>)}
                              </select>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* staff */}
          <section className="l2l-card admin__sec">
            <div className="admin__sechead">
              <h2 className="admin__h">Tutors · {tutors.length}</h2>
              <button type="button" className="admin__cta" onClick={() => invite('tutor')}>+ Invite tutor</button>
            </div>
            <ul className="admin__chips">{tutors.map((t) => <li key={t.id} className="admin__chip">{tutorName(t)}{t.role === 'owner' && <i> · owner</i>}</li>)}</ul>
          </section>
        </div>
      )}
    </main>
  );
}
