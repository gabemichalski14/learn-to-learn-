import { useEffect, useState } from 'react';
import { navigate } from './router';
import type { RouteName } from './router';
import type { Role } from './useAuth';
import { LogoMark } from './LogoMark';
import { getCurrentUser, getMyName, onAuthChange, signOut } from './data/cloud';

/** Who sees a nav item. `guest` = nobody signed in (a child on a shared device). */
type Audience = 'guest' | 'owner' | 'tutor' | 'parent';

interface NavItem {
  label: string;
  to: string;
  /** Route names that should show this item as the active page. */
  match: RouteName[];
  roles: Audience[];
}

// Page navigation (middle of the drawer). Account + profile + settings live in the
// bottom account block (below), Claude-style — not in this list.
const ITEMS: NavItem[] = [
  { label: 'Students', to: '#/admin', match: ['admin', 'admin-student'], roles: ['owner'] },
  { label: 'Tutors', to: '#/admin/tutors', match: ['admin-tutors'], roles: ['owner'] },
  { label: 'Dashboard', to: '#/tutor', match: ['tutor'], roles: ['tutor'] },
  { label: 'My child', to: '#/family', match: ['family'], roles: ['parent'] },
  { label: 'Levels', to: '#/levels', match: ['levels', 'level', 'games', 'play'], roles: ['guest', 'tutor', 'owner'] },
  { label: 'Village', to: '#/village', match: ['village'], roles: ['guest'] },
  { label: 'Leaderboard', to: '#/leaderboard', match: ['leaderboard'], roles: ['guest', 'tutor', 'owner', 'parent'] },
];

const ROLE_LABEL: Record<Audience, string> = { owner: 'Owner', tutor: 'Tutor', parent: 'Parent', guest: 'Shared device' };

interface AcctItem { label: string; to?: string; act?: () => void; }

/**
 * Left-side hamburger menu. Brand at the top, page nav in the middle, and a
 * Claude-style ACCOUNT block pinned to the bottom: who's signed in + a popover
 * for profile / settings / help / sign-out.
 */
export function NavDrawer({ route, role = null }: { route: RouteName; role?: Role | null }) {
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const audience: Audience = role ?? 'guest';

  // Track the signed-in identity (name + email) for the bottom block. onAuthChange
  // gives a boolean + a cleanup fn, so we just re-fetch on any change.
  useEffect(() => {
    let live = true;
    const load = () => {
      void getCurrentUser().then((u) => { if (live) setEmail((u as { email?: string } | null)?.email ?? null); }).catch(() => {});
      void getMyName().then((n) => { if (live) setFullName(n); }).catch(() => {});
    };
    load();
    const off = onAuthChange(() => load());
    return () => { live = false; off(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAcctOpen(false); setOpen(false); } };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  function go(to: string) { setOpen(false); setAcctOpen(false); navigate(to); }
  async function doSignOut() {
    try { await signOut(); } catch { /* ignore */ }
    setOpen(false); setAcctOpen(false);
    navigate('#/');
    if (typeof window !== 'undefined') window.location.reload();
  }

  // Account popover items, by role. Real destinations only (no dead routes).
  const acctItems: AcctItem[] = (() => {
    const out: AcctItem[] = [];
    if (audience === 'guest' || audience === 'tutor') out.push({ label: 'My profile', to: '#/profile' });
    out.push({ label: email ? 'Account & settings' : 'Sign in', to: '#/account' });
    if (email) out.push({ label: 'Sign out', act: () => void doSignOut() });
    return out;
  })();

  // Prefer the first name (the name you set in Account); fall back to email, then guest.
  const firstName = fullName?.trim().split(/\s+/)[0] || '';
  const identityName = firstName || email || 'Shared device';
  const avatar = (firstName || email || 'L').slice(0, 1).toUpperCase();

  return (
    <>
      <button type="button" className="burger" aria-label="Open menu" aria-haspopup="true" aria-expanded={open} aria-controls="nav-drawer" onClick={() => setOpen(true)}>
        <span className="burger__bars" aria-hidden="true"><span /><span /><span /></span>
      </button>

      <div className={`drawer-overlay${open ? ' drawer-overlay--show' : ''}`} onClick={() => { setAcctOpen(false); setOpen(false); }} aria-hidden={!open} />

      <nav id="nav-drawer" className={`drawer${open ? ' drawer--open' : ''}`} aria-label="Main menu" aria-hidden={!open}>
        <button type="button" className="drawer__brand" onClick={() => go('#/')} aria-label="Learn to Learn home">
          <LogoMark className="drawer__logo" />
          <span className="drawer__brand-text">
            <span className="drawer__brand-name">Learn to Learn</span>
            <span className="drawer__brand-sub">Tutoring Solutions</span>
          </span>
        </button>

        <ul className="drawer__list">
          {ITEMS.filter((item) => item.roles.includes(audience)).map((item) => {
            const active = item.match.includes(route);
            return (
              <li key={item.label}>
                <button type="button" className={`drawer__item${active ? ' drawer__item--active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => go(item.to)}>
                  <span className="drawer__label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Account block — pinned to the bottom (Claude-style). */}
        <div className="drawer__acct">
          {acctOpen && (
            <div className="drawer__acct-menu" role="menu">
              {acctItems.map((it) => (
                <button key={it.label} type="button" role="menuitem" className={`drawer__acct-mi${it.label === 'Sign out' ? ' drawer__acct-mi--danger' : ''}`}
                  onClick={() => { if (it.act) it.act(); else if (it.to) go(it.to); }}>
                  {it.label}
                </button>
              ))}
              <button type="button" role="menuitem" className="drawer__acct-mi" aria-expanded={showHelp} onClick={() => setShowHelp((v) => !v)}>Help ▾</button>
              {showHelp && <p className="drawer__acct-help">Stuck on anything? Tap <strong>Pip 🧵</strong> on any page and type what you need — he can take you there, explain a game, or change a setting. Or ask your tutor.</p>}
            </div>
          )}
          <button type="button" className="drawer__acct-id" aria-haspopup="true" aria-expanded={acctOpen} onClick={() => setAcctOpen((v) => !v)}>
            <span className="drawer__acct-avatar" aria-hidden="true">{avatar}</span>
            <span className="drawer__acct-who">
              <span className="drawer__acct-name">{identityName}</span>
              <span className="drawer__acct-role">{ROLE_LABEL[audience]}</span>
            </span>
            <span className="drawer__acct-chev" aria-hidden="true">{acctOpen ? '▾' : '▴'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
