import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import {
  listTutors, listAssignments, listLearners, createInviteCode, assignTutor, unassignTutor,
  type CloudTutor, type CloudAssignment, type CloudLearner,
} from './data/cloud';
import './admin.css';

const tutorName = (t: CloudTutor) => t.name || (t.role === 'owner' ? 'You (owner)' : 'Tutor');

/** Owner's staff page: the tutors at the center + invite-by-link. Tap a tutor to
 *  see the students assigned to them; tap a student to open their record. */
export function TutorsAdminPage() {
  const configured = isCloudConfigured();
  const [tutors, setTutors] = useState<CloudTutor[]>([]);
  const [assigns, setAssigns] = useState<CloudAssignment[]>([]);
  const [learners, setLearners] = useState<CloudLearner[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');

  const load = useCallback(async () => {
    try {
      const [t, a, l] = await Promise.all([listTutors(), listAssignments(), listLearners()]);
      setTutors(t); setAssigns(a); setLearners(l); setErr(null);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load tutors.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!configured) return; const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [configured, load]);

  const learnerName = (id: string) => learners.find((l) => l.id === id)?.display_name ?? 'Student';
  const studentsOf = (tutorId: string) => assigns.filter((a) => a.tutor_id === tutorId);
  const unassignedFor = (tutorId: string) => learners.filter((l) => !assigns.some((a) => a.tutor_id === tutorId && a.learner_id === l.id));

  /** Make this tutor the student's primary (one primary per student). */
  async function assignToTutor(learnerId: string, tutorId: string) {
    try {
      for (const old of assigns.filter((a) => a.learner_id === learnerId && a.relation === 'primary' && a.tutor_id !== tutorId)) {
        await unassignTutor(learnerId, old.tutor_id);
      }
      await assignTutor(learnerId, tutorId, 'primary');
      await load();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not assign the student.'); }
  }
  async function unassign(learnerId: string, tutorId: string) {
    try { await unassignTutor(learnerId, tutorId); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not unassign.'); }
  }

  async function inviteTutor() {
    const email = inviteEmail.trim();
    try {
      const c = await createInviteCode('tutor');
      const link = `${window.location.origin}${window.location.pathname}#/account?invite=${encodeURIComponent(c)}&as=tutor`;
      setCode(link);
      if (email) {
        const subject = encodeURIComponent('Your Learn to Learn invite');
        const body = encodeURIComponent(`You've been invited to join Learn to Learn as a tutor.\n\nOpen this link to set up your account — just add your name and a password:\n${link}\n`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`; // opens YOUR mail app, pre-filled
        setInviteEmail('');
      }
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create an invite.'); }
  }

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/admin')}>← Students</button>
      <header className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Center admin</p>
        <h1 className="l2l-display">Your <em>tutors</em></h1>
        <p className="l2l-lead">Invite a tutor with a link, then assign them to students on the Students page. Tap a tutor to see who they teach.</p>
      </header>

      {!configured ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">Cloud sync isn't set up yet.</p></div>
      ) : loading ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p>Loading…</p></div>
      ) : (
        <div className="admin">
          {err && <p className="admin__err" role="alert">{err}</p>}
          {code && (
            <div className="admin__code" role="status">
              <span>Invite link {inviteEmail ? '' : 'ready'} — or copy &amp; send it yourself:</span>
              <code className="admin__codeval">{code}</code>
              <button type="button" className="admin__copy" onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}>Copy</button>
              <button type="button" className="admin__codex" aria-label="dismiss" onClick={() => setCode(null)}>×</button>
            </div>
          )}
          <section className="l2l-card admin__sec">
            <div className="admin__sechead">
              <h2 className="admin__h">Tutors · {tutors.length}</h2>
            </div>
            <form className="admin__add" onSubmit={(e) => { e.preventDefault(); void inviteTutor(); }}>
              <input className="admin__addinput" type="email" placeholder="Tutor's email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} autoComplete="off" />
              <button type="submit" className="admin__cta">Send invite</button>
            </form>
            <p className="admin__hint">Enter their email — your mail app opens with the invite ready to send. (No email? Tap Send to get a copyable link.)</p>
            <ul className="admin__students">
              {tutors.map((t) => {
                const open = expanded === t.id;
                const mine = studentsOf(t.id);
                return (
                  <li key={t.id}>
                    <button type="button" className="admin__studentrow" aria-expanded={open} onClick={() => setExpanded(open ? null : t.id)}>
                      <span className="admin__studentrow-main">
                        <strong className="admin__studentrow-name">{tutorName(t)}{t.role === 'owner' && <i style={{ fontStyle: 'normal', color: 'var(--teal-deep)' }}> · owner</i>}</strong>
                        <span className="admin__studentrow-sub">{mine.length === 0 ? 'No students assigned' : `${mine.length} student${mine.length === 1 ? '' : 's'}`}</span>
                      </span>
                      <span className="admin__chev" aria-hidden="true">{open ? '▴' : '▾'}</span>
                    </button>
                    {open && (
                      <div className="admin__session">
                        {mine.length > 0 && (
                          <ul className="admin__items" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            {mine.map((a) => (
                              <li key={a.learner_id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button type="button" className="admin__linkbtn" style={{ flex: 1, textAlign: 'left', justifyContent: 'space-between' }} onClick={() => navigate(`#/admin/student/${a.learner_id}`)}>
                                  {learnerName(a.learner_id)}
                                  <span style={{ opacity: 0.7 }}>{a.relation === 'substitute' ? 'substitute' : 'primary'} ›</span>
                                </button>
                                <button type="button" className="admin__remove" onClick={() => void unassign(a.learner_id, t.id)} aria-label={`Unassign ${learnerName(a.learner_id)}`}>remove</button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {unassignedFor(t.id).length > 0 ? (
                          <select className="admin__subadd" style={{ marginTop: mine.length ? 10 : 0 }} value="" onChange={(e) => { if (e.target.value) void assignToTutor(e.target.value, t.id); }} aria-label="Assign a student to this tutor">
                            <option value="">+ Assign a student…</option>
                            {unassignedFor(t.id).map((l) => <option key={l.id} value={l.id}>{l.display_name}</option>)}
                          </select>
                        ) : mine.length === 0 ? (
                          <p className="admin__empty" style={{ margin: 0 }}>No students yet — add students on the Students page first.</p>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
