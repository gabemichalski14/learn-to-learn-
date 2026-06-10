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
  | 'leaderboard'
  | 'tutor'
  | 'admin'
  | 'family'
  | 'profile'
  | 'account';
export interface Route {
  name: RouteName;
  level?: number;
  game?: string;
  focus?: string;
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
  if (h.startsWith('leaderboard')) return { name: 'leaderboard' };
  if (h.startsWith('tutor')) return { name: 'tutor' };
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

// Track the route we were on before the current one, so "leave a game" can
// return to wherever it was launched from (a level hub, the Games tab, …)
// instead of a hardcoded destination.
let prevHash: string | null = null;
let curHash: string | null = typeof window !== 'undefined' ? window.location.hash : null;
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    prevHash = curHash;
    curHash = window.location.hash;
  });
}

/**
 * Go back to the screen we came from. Used when leaving a game so the child
 * lands back where they started (the Games tab, the level hub, …) rather than
 * being thrown to a fixed page. Falls back to `fallback` when there's no prior
 * in-app screen (e.g. the game was opened via a direct link) or the prior
 * screen was itself a game.
 */
export function goBack(fallback: string): void {
  if (prevHash && !/^#\/?play/.test(prevHash)) {
    navigate(prevHash);
  } else {
    navigate(fallback);
  }
}
