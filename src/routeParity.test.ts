import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS } from './games';

/**
 * Route parity — fail-safe. Every `available` game must be reachable. Most have an
 * explicit App.tsx branch (`route.game === '<id>'`); the Level-2 space-sort family
 * (beginning/ending/middle-sounds) instead shares the generalized GameScreen via a
 * terminal catch-all (`gameId={route.game}`). This guard fails if a game would route
 * nowhere, and pins the catch-all in place (without it the space-sort games — which
 * have no explicit branch — would silently break).
 */
describe('route parity (every available game is reachable)', () => {
  it('every available game has a route — explicit branch or the GameScreen catch-all', () => {
    const app = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');
    const hasCatchAll = app.includes('gameId={route.game');
    const unreachable: string[] = [];
    for (const lvl of LEVELS) {
      for (const g of lvl.games) {
        if (g.status !== 'available') continue;
        const explicit = app.includes(`route.game === '${g.id}'`);
        if (!explicit && !hasCatchAll) unreachable.push(`L${lvl.num}:${g.id}`);
      }
    }
    expect(unreachable, `available games that route nowhere: ${unreachable.join(', ')}`).toEqual([]);
    // the catch-all is load-bearing — the space-sort games have no explicit branch,
    // so removing it would strand them
    expect(hasCatchAll, 'the GameScreen catch-all must remain (space-sort games rely on it)').toBe(true);
  });
});
