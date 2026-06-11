import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { signIn, signUp, signOut, getCurrentUser, onAuthChange, redeemInvite, getRole, requestPasswordReset, updatePassword, onPasswordRecovery, getMyName, setMyName, type SignUpIntent } from './data/cloud';
import type { Role } from './useAuth';
import { reconcileRoster } from './data/identity';
import { flushOutbox } from './data/cloudSync';
import { useDialog } from './ui/dialogContext';

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
    case 'already_owner': return ''; // an owner clicked an invite — ignore it silently
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
  const dialog = useDialog();
  // An invite LINK lands here as #/account?invite=CODE&as=tutor|parent — prefill
  // the code + role + jump to sign-up so the invitee just adds email + password.
  const [inv] = useState(readInvite);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [centerName, setCenterName] = useState('');
  const [personName, setPersonName] = useState('');
  const [inviteCode, setInviteCode] = useState(inv.code);
  // Joining only — creating a new center is not offered in the UI (invite-only).
  const [role, setRole] = useState<SignUpIntent>(inv.as === 'parent' ? 'join_parent' : 'join_tutor');
  const [mode, setMode] = useState<Mode>(inv.code ? 'up' : 'in');
  const [user, setUser] = useState<string | null>(null);
  const [acctRole, setAcctRole] = useState<Role | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recovering, setRecovering] = useState(false); // arrived via a password-reset link
  const [nameField, setNameField] = useState('');
  const [savedName, setSavedName] = useState('');
  const [nameBusy, setNameBusy] = useState(false);

  useEffect(() => {
    if (!configured) return;
    const handle = async (u: { email?: string } | null) => {
      setUser(u?.email ?? null);
      if (!u) { setAcctRole(null); setNameField(''); setSavedName(''); return; }
      const r = await getRole();
      setAcctRole(r);
      const nm = (await getMyName()) ?? '';
      setNameField(nm); setSavedName(nm);
      // SAFETY: an owner must never auto-redeem a pending invite — that's what
      // demoted an admin to a tutor. Drop any stray code and skip redemption.
      if (r === 'owner') {
        try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
      } else {
        let hadPending = false;
        try { hadPending = !!localStorage.getItem(PENDING_KEY); } catch { /* ignore */ }
        const res = await redeemPendingInvite();
        // surface the outcome so a failed link isn't silent ("I signed up but I'm not showing")
        if (hadPending && res) { setMsg(redeemResultMsg(res)); if (res === 'ok') setAcctRole(await getRole()); }
      }
      await reconcileRoster();
      await flushOutbox();
    };
    getCurrentUser().then(handle);
    return onAuthChange(() => getCurrentUser().then(handle));
  }, [configured]);

  // Landed via a password-reset email link → show the "set a new password" form.
  useEffect(() => {
    if (!configured) return;
    return onPasswordRecovery(() => { setRecovering(true); setMsg('Choose a new password below.'); navigate('#/account'); });
  }, [configured]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'up') {
        const intent: SignUpIntent = role;
        // Guardrail: creating a center makes you an OWNER. Tutors/parents must use
        // their invite link — this confirm stops the accidental "own center" that
        // made invited people invisible to their real center.
        if (intent === 'new_center') {
          const ok = await dialog.confirm({
            title: 'Create a brand-new center?',
            message: 'This makes a new center with you as its owner/admin. If a center invited you as a tutor or parent, tap Cancel and open the invite link they sent you instead.',
            okLabel: 'Yes, create my center',
          });
          if (!ok) { setBusy(false); return; }
        }
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

  async function forgotPassword() {
    const target = email.trim();
    if (!target) { setMsg('Enter your email above first, then tap “Forgot password?”.'); return; }
    setBusy(true); setMsg(null);
    try {
      await withTimeout(requestPasswordReset(target));
      setMsg(`If an account exists for ${target}, a reset link is on its way — check your email.`);
    } catch { setMsg('Could not send a reset email just now. Please try again in a moment.'); }
    finally { setBusy(false); }
  }

  async function saveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setMsg('Pick a password of at least 6 characters.'); return; }
    setBusy(true); setMsg(null);
    try {
      const { error } = await withTimeout(updatePassword(password));
      if (error) throw error;
      setRecovering(false); setPassword('');
      setMsg('Password updated — you’re signed in.');
      const r = await getRole();
      navigate(r === 'owner' ? '#/admin' : r === 'parent' ? '#/family' : r === 'tutor' ? '#/tutor' : '#/');
    } catch (err) { setMsg(friendly(err)); }
    finally { setBusy(false); }
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
      ) : recovering ? (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', textAlign: 'left', '--i': 1 } as CSSProperties}>
          <p className="l2l-lead">Set a new password</p>
          <form onSubmit={saveNewPassword} className="auth-form">
            <input className="l2l-input auth-input" type="password" placeholder="New password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
            <button type="submit" className="l2l-btn" style={{ marginTop: '4px' }} disabled={busy}>{busy ? '…' : 'Update password'}</button>
          </form>
        </div>
      ) : user ? (
        <div className="l2l-card l2l-reveal" style={{ marginTop: '24px', textAlign: 'left', '--i': 1 } as CSSProperties}>
          <p className="l2l-lead">
            Signed in as <strong>{user}</strong>
            {acctRole && <> · <strong>{acctRole === 'owner' ? 'Center owner' : acctRole === 'tutor' ? 'Tutor' : 'Parent'}</strong></>}.
          </p>
          <p className="page__note" style={{ marginTop: 0 }}>Your students &amp; sessions sync to this account across devices.</p>
          <div className="auth-form" style={{ marginTop: '10px' }}>
            <label className="page__note" style={{ marginTop: 0, fontWeight: 700 }} htmlFor="acct-name">Your name</label>
            <input id="acct-name" className="l2l-input auth-input" type="text" placeholder="Your name" value={nameField} onChange={(e) => setNameField(e.target.value)} maxLength={60} autoComplete="name" />
            <button type="button" className="l2l-btn" disabled={nameBusy || !nameField.trim() || nameField.trim() === savedName}
              onClick={async () => { const n = nameField.trim(); setNameBusy(true); try { await setMyName(n); setSavedName(n); setMsg('Name updated.'); } catch { setMsg('Could not update your name — has the set-name migration (10) been run?'); } setNameBusy(false); }}>
              {nameBusy ? '…' : 'Save name'}
            </button>
          </div>
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
            <>
              <div className="auth-roles" role="radiogroup" aria-label="Account type">
                <button type="button" role="radio" aria-checked={role === 'join_tutor'} className={`auth-role${role === 'join_tutor' ? ' is-on' : ''}`} onClick={() => setRole('join_tutor')}>🧑‍🏫 I'm a tutor</button>
                <button type="button" role="radio" aria-checked={role === 'join_parent'} className={`auth-role${role === 'join_parent' ? ' is-on' : ''}`} onClick={() => setRole('join_parent')}>👪 I'm a parent</button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted, #6a6253)', margin: '8px 0 0', lineHeight: 1.45 }}>Joining a center? Open the invite link your center sent you. Centers are created by the platform owner.</p>
            </>
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
          <div className="auth-links">
            <button type="button" className="link-btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? 'Need an account? Create one' : 'Have an account? Sign in'}
            </button>
            {mode === 'in' && (
              <button type="button" className="link-btn" onClick={() => void forgotPassword()} disabled={busy}>Forgot password?</button>
            )}
          </div>
        </div>
      )}

      {msg && <p className="page__note l2l-reveal" style={{ '--i': 2 } as CSSProperties}>{msg}</p>}
    </main>
  );
}
