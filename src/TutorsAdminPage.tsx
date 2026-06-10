import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { listTutors, createInviteCode, type CloudTutor } from './data/cloud';
import './admin.css';

const tutorName = (t: CloudTutor) => t.name || (t.role === 'owner' ? 'You (owner)' : 'Tutor');

/** Owner's staff page: the tutors at the center + invite-by-link. Students live
 *  on the Students page; this is just the people who teach. */
export function TutorsAdminPage() {
  const configured = isCloudConfigured();
  const [tutors, setTutors] = useState<CloudTutor[]>([]);
  const [loading, setLoading] = useState(() => isCloudConfigured());
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setTutors(await listTutors()); setErr(null); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not load tutors.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!configured) return; const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [configured, load]);

  async function inviteTutor() {
    try {
      const c = await createInviteCode('tutor');
      setCode(`${window.location.origin}${window.location.pathname}#/account?invite=${encodeURIComponent(c)}&as=tutor`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create an invite.'); }
  }

  return (
    <main className="l2l-page">
      <button type="button" className="l2l-back" onClick={() => navigate('#/admin')}>← Students</button>
      <header className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Center admin</p>
        <h1 className="l2l-display">Your <em>tutors</em></h1>
        <p className="l2l-lead">The staff who teach at your center. Invite a tutor with a link, then assign them to students on the Students page.</p>
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
              <span><strong>Tutor</strong> invite link — send it once:</span>
              <code className="admin__codeval">{code}</code>
              <button type="button" className="admin__copy" onClick={() => navigator.clipboard?.writeText(code).catch(() => {})}>Copy</button>
              <button type="button" className="admin__codex" aria-label="dismiss" onClick={() => setCode(null)}>×</button>
            </div>
          )}
          <section className="l2l-card admin__sec">
            <div className="admin__sechead">
              <h2 className="admin__h">Tutors · {tutors.length}</h2>
              <button type="button" className="admin__cta" onClick={() => void inviteTutor()}>+ Invite tutor</button>
            </div>
            <ul className="admin__chips">
              {tutors.map((t) => <li key={t.id} className="admin__chip">{tutorName(t)}{t.role === 'owner' && <i> · owner</i>}</li>)}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
