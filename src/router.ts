import { useEffect, useState } from 'react';

/**
 * Tiny dependency-free hash router. Routes: home / level/<n> / play / leaderboard
 * / tutor. Swap for React Router later without touching pages — they only use
 * navigate().
 */
export type RouteName = 'home' | 'level' | 'play' | 'leaderboard' | 'tutor';
export interface Route {
  name: RouteName;
  level?: number;
  game?: string;
}

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('play')) {
    const game = h.split('/')[1];
    return { name: 'play', game: game || 'beginning-sounds' };
  }
  if (h.startsWith('leaderboard')) return { name: 'leaderboard' };
  if (h.startsWith('tutor')) return { name: 'tutor' };
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
