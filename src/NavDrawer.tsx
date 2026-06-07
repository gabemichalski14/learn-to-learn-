import { useEffect, useState } from 'react';
import { navigate } from './router';
import type { RouteName } from './router';
import { LogoMark } from './LogoMark';

interface NavItem {
  label: string;
  to: string;
  /** Route names that should show this item as the active page. */
  match: RouteName[];
  /** Visible only when a tutor account is signed in. */
  tutorOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '#/tutor', match: ['tutor'], tutorOnly: true },
  { label: 'Levels', to: '#/levels', match: ['levels', 'level'] },
  { label: 'Games', to: '#/games', match: ['games', 'play'] },
  { label: 'Leaderboard', to: '#/leaderboard', match: ['leaderboard'] },
  { label: 'Profile', to: '#/profile', match: ['profile'] },
  { label: 'Tutor sign-in', to: '#/account', match: ['account'] },
];

/**
 * Left-side hamburger menu. The burger button is fixed top-left on every
 * platform page; tapping it slides a drawer in from the left with the page list.
 */
export function NavDrawer({ route, isTutor = false }: { route: RouteName; isTutor?: boolean }) {
  const [open, setOpen] = useState(false);

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
          {ITEMS.filter((item) => !item.tutorOnly || isTutor).map((item) => {
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
