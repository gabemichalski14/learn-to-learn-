import { useEffect, useState } from 'react';

/**
 * Tiny dependency-free hash router. Enough to give the platform a "home" that
 * can host many games, a leaderboard, and the tutor dashboard. Swap for React
 * Router later without touching page components — they only use navigate().
 */
export type RouteName = 'home' | 'play' | 'leaderboard' | 'tutor';

export function parseHash(hash: string): RouteName {
  const h = hash.replace(/^#\/?/, '');
  if (h.startsWith('play')) return 'play';
  if (h.startsWith('leaderboard')) return 'leaderboard';
  if (h.startsWith('tutor')) return 'tutor';
  return 'home';
}

export function useRoute(): RouteName {
  const [route, setRoute] = useState<RouteName>(() =>
    typeof window === 'undefined' ? 'home' : parseHash(window.location.hash),
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
