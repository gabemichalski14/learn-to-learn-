import { useEffect, useState } from 'react';

/**
 * Tiny dependency-free hash router. Routes: home / level/<n> / play / leaderboard
 * / tutor. Swap for React Router later without touching pages — they only use
 * navigate().
 */
export type RouteName =
  | 'home'
  | 'level'
  | 'levels'
  | 'checkpoint'
  | 'play'
  | 'games'
  | 'village'
  | 'tending'
  | 'leaderboard'
  | 'tutor'
  | 'admin'
  | 'admin-tutors'
  | 'admin-student'
  | 'family'
  | 'profile'
  | 'account';
export interface Route {
  name: RouteName;
  level?: number;
  game?: string;
  focus?: string;
  studentId?: string;
}

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('play')) {
    const rest = h.slice('play'.length).replace(/^\//, ''); // "beginning-sounds?focus=..."
    const [gamePart, query] = rest.split('?');
    const focus = new URLSearchParams(query ?? '').get('focus') ?? undefined;
    return { name: 'play', game: gamePart || 'beginning-sounds', focus };
  }
  if (h.startsWith('village')) return { name: 'village' };
  if (h.startsWith('tending')) return { name: 'tending' };
  if (h.startsWith('leaderboard')) return { name: 'leaderboard' };
  if (h.startsWith('tutor')) return { name: 'tutor' };
  if (h.startsWith('admin/student/')) {
    const id = (h.split('/')[2] || '').split('?')[0];
    return { name: 'admin-student', studentId: id };
  }
  if (h.startsWith('admin/tutors')) return { name: 'admin-tutors' };
  if (h.startsWith('admin')) return { name: 'admin' };
  if (h.startsWith('family')) return { name: 'family' };
  if (h.startsWith('account')) return { name: 'account' };
  if (h.startsWith('profile')) return { name: 'profile' };
  if (h.startsWith('games')) return { name: 'games' };
  if (h.startsWith('levels')) return { name: 'levels' };
  if (h.startsWith('checkpoint/')) {
    const n = parseInt(h.split('/')[1] ?? '', 10);
    return { name: 'checkpoint', level: Number.isFinite(n) ? n : 1 };
  }
  if (h.startsWith('level/')) {
    const n = parseInt(h.split('/')[1] ?? '', 10);
    return { name: 'level', level: Number.isFinite(n) ? n : 1 };
  }
  return { name: 'home' };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() =>
    typeof window === 'undefined' ? { name: 'home' } : parseHash(window.location.hash),
  );
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to: string): void {
  if (typeof window !== 'undefined') window.location.hash = to;
}

/**
 * Go to a back/parent screen. Every call site passes its labelled destination
 * (e.g. "← Home" → '#/', "← Workshop" → '#/level/3'), so we navigate THERE
 * directly — the button always goes exactly where it says.
 *
 * (Previously this did history-style `prevHash` return, which made two pages
 * that link to each other — e.g. a level hub and the Village — ping-pong back
 * and forth on "← Home" instead of going home. A labelled button must match
 * its label, so we navigate to the destination, never to "wherever I came from".)
 */
export function goBack(destination: string): void {
  navigate(destination);
}
