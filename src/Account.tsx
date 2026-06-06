import { useEffect, useState } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { signIn, signUp, signOut, getCurrentUser, onAuthChange } from './data/cloud';
import { reconcileRoster } from './data/identity';
import { flushOutbox } from './data/cloudSync';

type Mode = 'in' | 'up';

/**
 * Tutor account / cloud sync sign-in. Until a Supabase project is configured
 * (env keys absent) this shows the setup note and the app stays fully local.
 */
export function Account() {
  const configured = isCloudConfigured();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [mode, setMode] = useState<Mode>('in');
  const [user, setUser] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) return;
    getCurrentUser().then((u) => {
      setUser(u?.email ?? null);
      if (u) void reconcileRoster().then(() => flushOutbox());
    });
    return onAuthChange(() =>
      getCurrentUser().then((u) => {
        setUser(u?.email ?? null);
        if (u) void reconcileRoster().then(() => flushOutbox());
      }),
    );
  }, [configured]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'up') {
        const { error } = await signUp(email, password, centerName || undefined);
        if (error) throw error;
        setMsg('Account created — your center is set up. If email confirmation is on, confirm first, then sign in.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setMsg('Signed in — your students and sessions will sync to this account.');
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="site site--page">
      <button type="button" className="back-btn" onClick={() => navigate('#/')}>← Home</button>
      <h1 className="site__title">Tutor Account</h1>

      {!configured ? (
        <div className="page__panel" style={{ textAlign: 'left' }}>
          <p className="page__lead">Cloud sync isn't set up yet — the app is running in on-device mode.</p>
          <p className="page__note" style={{ marginTop: 0 }}>
            To enable center-wide accounts &amp; leaderboards: create a Supabase project, run
            <code> supabase/schema.sql</code>, then add the project URL + anon key to a local
            <code> .env.local</code> (see <code>.env.example</code>). Sign-in appears here automatically.
          </p>
        </div>
      ) : user ? (
        <div className="page__panel" style={{ textAlign: 'left' }}>
          <p className="page__lead">Signed in as <strong>{user}</strong>. Students &amp; sessions sync to your center.</p>
          <button type="button" className="btn-ghost" onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <div className="page__panel" style={{ textAlign: 'left' }}>
          <p className="page__lead">{mode === 'in' ? 'Sign in to sync your students across devices.' : 'Create a center account.'}</p>
          <form onSubmit={submit} className="auth-form">
            {mode === 'up' && (
              <input className="auth-input" placeholder="Center / tutor name" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
            )}
            <input className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '…' : mode === 'in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button type="button" className="link-btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
            {mode === 'in' ? 'Need an account? Create one' : 'Have an account? Sign in'}
          </button>
        </div>
      )}

      {msg && <p className="page__note">{msg}</p>}
    </main>
  );
}
