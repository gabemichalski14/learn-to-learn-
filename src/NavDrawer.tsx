import { useEffect, useState } from 'react';
import { navigate } from './router';
import type { RouteName } from './router';
import type { Role } from './useAuth';
import { LogoMark } from './LogoMark';

/** Who sees a nav item. `guest` = nobody signed in (a child on a shared device). */
type Audience = 'guest' | 'owner' | 'tutor' | 'parent';

interface NavItem {
  label: string;
  to: string;
  /** Route names that should show this item as the active page. */
  match: RouteName[];
  roles: Audience[];
}

// The OWNER account is control-only (Center admin + Account) — no kid/family
// pages. Tutors get teaching tools; parents get their child; the shared-device
// guest gets the full kid world.
const ITEMS: NavItem[] = [
  { label: 'Students', to: '#/admin', match: ['admin', 'admin-student'], roles: ['owner'] },
  { label: 'Tutors', to: '#/admin/tutors', match: ['admin-tutors'], roles: ['owner'] },
  { label: 'Dashboard', to: '#/tutor', match: ['tutor'], roles: ['tutor'] },
  { label: 'My child', to: '#/family', match: ['family'], roles: ['parent'] },
  { label: 'Levels', to: '#/levels', match: ['levels', 'level'], roles: ['guest', 'tutor', 'owner'] },
  { label: 'Games', to: '#/games', match: ['games', 'play'], roles: ['guest', 'tutor'] },
  { label: 'Village', to: '#/village', match: ['village'], roles: ['guest'] },
  { label: 'Leaderboard', to: '#/leaderboard', match: ['leaderboard'], roles: ['guest', 'owner'] },
  { label: 'Profile', to: '#/profile', match: ['profile'], roles: ['guest', 'tutor'] },
  { label: 'Account', to: '#/account', match: ['account'], roles: ['guest', 'owner', 'tutor', 'parent'] },
];

/**
 * Left-side hamburger menu. The burger button is fixed top-left on every
 * platform page; tapping it slides a drawer in from the left with the page list.
 */
export function NavDrawer({ route, role = null }: { route: RouteName; role?: Role | null }) {
  const [open, setOpen] = useState(false);
  const audience: Audience = role ?? 'guest';

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function go(to: string) {
    setOpen(false);
    navigate(to);
  }

  return (
    <>
      <button
        type="button"
        className="burger"
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="nav-drawer"
        onClick={() => setOpen(true)}
      >
        <span className="burger__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className={`drawer-overlay${open ? ' drawer-overlay--show' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <nav
        id="nav-drawer"
        className={`drawer${open ? ' drawer--open' : ''}`}
        aria-label="Main menu"
        aria-hidden={!open}
      >
        <button
          type="button"
          className="drawer__brand"
          onClick={() => go('#/')}
          aria-label="Learn to Learn home"
        >
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
                <button
                  type="button"
                  className={`drawer__item${active ? ' drawer__item--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => go(item.to)}
                >
                  <span className="drawer__label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button type="button" className="drawer__close" onClick={() => setOpen(false)}>
          Close
        </button>
      </nav>
    </>
  );
}
