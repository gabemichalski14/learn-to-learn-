import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { signIn, signUp, signOut, getCurrentUser, onAuthChange, redeemInvite, getRole, type SignUpIntent } from './data/cloud';
import type { Role } from './useAuth';
import { reconcileRoster } from './data/identity';
import { flushOutbox } from './data/cloudSync';

type Mode = 'in' | 'up';

const PENDING_KEY = 'll-pending-invite';

/** Reject if an auth call doesn't return in time, so the button can never spin
 *  forever (network stall / unexpected hang). */
function withTimeout<T>(p: Promise<T>, ms = 12000): Promise<T> {
  return Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('__timeout__')), ms))]);
}

/** Turn auth errors into plain, actionable language (incl. "not registered"). */
function friendly(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (m === '__timeout__') return 'That took too long — check your connection and try again.';
  if (/invalid login credentials/i.test(m)) return 'We couldn’t sign you in: that email isn’t registered, or the password is wrong. New here? Tap “Create one”.';
  if (/email not confirmed/i.test(m)) return 'Please confirm your email first (check your inbox). For testing, you can turn off email confirmation in Supabase → Authentication → Providers → Email.';
  if (/already registered|already.*exists/i.test(m)) return 'That email already has an account — try signing in instead.';
  if (/password/i.test(m) && /(short|least|6)/i.test(m)) return 'Password must be at least 6 characters.';
  return m;
}

/** Read an invite link's params from the hash (#/account?invite=CODE&as=tutor). */
function readInvite(): { code: string; as: string } {
  try {
    const q = (typeof window !== 'undefined' ? window.location.hash : '').split('?')[1] || '';
    const p = new URLSearchParams(q);
    return { code: (p.get('invite') || '').trim(), as: p.get('as') || '' };
  } catch { return { code: '', as: '' }; }
}

/** Redeem a stashed invite once a session exists (covers email-confirmation flows:
 *  the code is kept until the user is actually signed in, then consumed once). */
/** Plain-language outcome of an invite redemption (server returns these codes). */
function redeemResultMsg(res: string): string {
  switch (res) {
    case 'ok': return '✅ Linked to your center!';
    case 'used': return 'That invite link was already used — ask your center for a fresh one.';
    case 'expired': return 'That invite link has expired — ask your center for a new one.';
    case 'invalid': return 'That invite link wasn’t recognized — ask your center for a new one.';
    default: return '';
  }
}

async function redeemPendingInvite(): Promise<string | null> {
  let code: string | null = null;
  try { code = localStorage.getItem(PENDING_KEY); } catch { /* ignore */ }
  if (!code) return null;
  try {
    const res = await redeemInvite(code);
    try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ } // terminal: clear
    return res;
  } catch {
    return null; // network error — keep the code for the next sign-in
  }
}

/**
 * Account / cloud sign-in with role-aware sign-up: set up a new center (owner),
 * or join an existing center as a tutor or parent with a one-time invite code.
 * Until Supabase is configured the app stays fully on-device.
 */
export function Account() {
  const configured = isCloudConfigured();
  // An invite LINK lands here as #/account?invite=CODE&as=tutor|parent — prefill
  // the code + role + jump to sign-up so the invitee just adds email + password.
  const [inv] = useState(readInvite);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [personName, setPersonName] = useState('');
  const [inviteCode, setInviteCode] = useState(inv.code);
  const [role, setRole] = useState<SignUpIntent>(inv.as === 'parent' ? 'join_parent' : inv.as === 'tutor' ? 'join_tutor' : 'new_center');
  const [mode, setMode] = useState<Mode>(inv.code ? 'up' : 'in');
  const [user, setUser] = useState<string | null>(null);
  const [acctRole, setAcctRole] = useState<Role | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const handle = (u: { email?: string } | null) => {
      setUser(u?.email ?? null);
      if (u) {
        void getRole().then(setAcctRole);
        let hadPending = false;
        try { hadPending = !!localStorage.getItem(PENDING_KEY); } catch { /* ignore */ }
        void redeemPendingInvite().then((res) => {
          // surface the outcome so a failed link isn't silent ("I signed up but I'm not showing")
          if (hadPending && res) { setMsg(redeemResultMsg(res)); if (res === 'ok') void getRole().then(setAcctRole); }
          return reconcileRoster();
        }).then(() => flushOutbox());
      } else { setAcctRole(null); }
    };
    getCurrentUser().then(handle);
    return onAuthChange(() => getCurrentUser().then(handle));
  }, [configured]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'up') {
        const intent: SignUpIntent = role;
        const { error } = await withTimeout(signUp(email, password, {
          centerName: intent === 'new_center' ? (centerName || undefined) : undefined,
          name: intent === 'new_center' ? undefined : (personName.trim() || undefined),
          intent,
        }));
        if (error) throw error;
        if (intent === 'new_center') {
          setMsg('Account created — your center is set up. If email confirmation is on, confirm first, then sign in.');
        } else {
          try { localStorage.setItem(PENDING_KEY, inviteCode.trim().toUpperCase()); } catch { /* ignore */ }
          const res = await redeemPendingInvite();
          setMsg(res === 'ok'
            ? 'Account created and linked to your center! Sign in to begin.'
            : res && res !== 'ok'
              ? `Account created, but couldn’t link: ${redeemResultMsg(res)}`
              : 'Account created. If email confirmation is on, confirm it, then sign in — your link connects you automatically.');
        }
      } else {
        const { error } = await withTimeout(signIn(email, password));
        if (error) throw error;
        await redeemPendingInvite(); // link recipients who already had an account
        const r = await getRole();
        setMsg('Signed in!');
        navigate(r === 'owner' ? '#/admin' : r === 'parent' ? '#/family' : r === 'tutor' ? '#/tutor' : '#/');
      }
    } catch (err) {
      setMsg(friendly(err));
    } finally {
      setBusy(false);
    }
  }

  const joining = mode === 'up' && role !== 'new_center';
  const fromLink = inv.code !== '';
  const joinKind = role === 'join_parent' ? 'parent' : 'tutor';

  // Arrived via an invite link → stash the code now so it links them whether they
  // sign up OR sign in (covers "I already have an account").
  useEffect(() => {
    if (inv.code) { try { localStorage.setItem(PENDING_KEY, inv.code.toUpperCase()); } catch { /* ignore */ } }
  }, [inv.code]);

  return (
    <main className="l2l-page l2l-page--narrow">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>

      <div className="l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <p className="l2l-eyebrow">Settings</p>
        <h1 className="l2l-display">Your <em>account</em></h1>
      </div>

      {!configured ? (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', textAlign: 'left', '--i': 1 } as CSSProperties}>
          <p className="l2l-lead">Cloud sync isn't set up yet — the app is running in on-device mode.</p>
          <p className="page__note" style={{ marginTop: 0 }}>
            To enable accounts &amp; sync: create a Supabase project, run <code>supabase/schema.sql</code> then the
            latest file in <code>supabase/migrations/</code>, and add the project URL + anon key to a local
            <code> .env.local</code> (see <code>.env.example</code>).
          </p>
        </div>
      ) : user ? (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', textAlign: 'left', '--i': 1 } as CSSProperties}>
          <p className="l2l-lead">
            Signed in as <strong>{user}</strong>
            {acctRole && <> · <strong>{acctRole === 'owner' ? 'Center owner' : acctRole === 'tutor' ? 'Tutor' : 'Parent'}</strong></>}.
          </p>
          <p className="page__note" style={{ marginTop: 0 }}>Your students &amp; sessions sync to this account across devices.</p>
          <div className="auth-links">
            {acctRole === 'owner' && <button type="button" className="l2l-btn" onClick={() => navigate('#/admin')}>Open Center admin →</button>}
            {acctRole === 'tutor' && <button type="button" className="l2l-btn" onClick={() => navigate('#/tutor')}>Tutor dashboard →</button>}
            {acctRole === 'parent' && <button type="button" className="l2l-btn" onClick={() => navigate('#/family')}>My child →</button>}
            {!acctRole && <button type="button" className="l2l-btn" onClick={() => navigate('#/')}>Go home →</button>}
          </div>
          <button type="button" className="link-btn" onClick={() => signOut()}>Sign out</button>
        </div>
      ) : (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', textAlign: 'left', '--i': 1 } as CSSProperties}>
          <p className="l2l-lead">
            {mode === 'in' ? 'Sign in to sync across devices.'
              : fromLink ? `You're invited to join as a ${joinKind}. Create your account to continue.`
              : 'Create an account.'}
          </p>

          {/* Role chooser only for a manual sign-up — an invite link already decides the role. */}
          {mode === 'up' && !fromLink && (
            <div className="auth-roles" role="radiogroup" aria-label="Account type">
              <button type="button" role="radio" aria-checked={role === 'new_center'} className={`auth-role${role === 'new_center' ? ' is-on' : ''}`} onClick={() => setRole('new_center')}>🏫 Set up my center</button>
              <button type="button" role="radio" aria-checked={role === 'join_tutor'} className={`auth-role${role === 'join_tutor' ? ' is-on' : ''}`} onClick={() => setRole('join_tutor')}>🧑‍🏫 I'm a tutor</button>
              <button type="button" role="radio" aria-checked={role === 'join_parent'} className={`auth-role${role === 'join_parent' ? ' is-on' : ''}`} onClick={() => setRole('join_parent')}>👪 I'm a parent</button>
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            {mode === 'up' && role === 'new_center' && (
              <input className="l2l-input auth-input" placeholder="Center / tutor name" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
            )}
            {/* Joining (tutor or parent) names themselves, so the center sees who they are. */}
            {joining && (
              <input className="l2l-input auth-input" placeholder="Your name" value={personName} onChange={(e) => setPersonName(e.target.value)} required autoComplete="name" />
            )}
            {/* Manual join needs a code field; an invite link carries the code itself. */}
            {joining && !fromLink && (
              <input className="l2l-input auth-input" placeholder="Invite code (e.g. ABCD-2345)" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required autoCapitalize="characters" />
            )}
            <input className="l2l-input auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="l2l-input auth-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="l2l-btn" style={{ marginTop: '4px' }} disabled={busy}>
              {busy ? '…' : mode === 'in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button type="button" className="link-btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
            {mode === 'in' ? 'Need an account? Create one' : 'Have an account? Sign in'}
          </button>
        </div>
      )}

      {msg && <p className="page__note l2l-reveal" style={{ '--i': 2 } as CSSProperties}>{msg}</p>}
    </main>
  );
}
