import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS } from './games';

/**
 * Themed level cards — fail-safe. Every level must wear its painted world
 * (public/images/card-N.png), and every card must wear it the SAME way (one
 * congruent treatment, theme supplied only by the PNG). This guard fails the gate
 * if a level's card art is missing, or if per-level visual special-casing creeps
 * back into LevelsPage — the two ways this regressed before.
 */
describe('themed level cards (congruent: every level wears its painted world)', () => {
  it('every level has a card-N.png in public/images', () => {
    const missing = LEVELS.map((l) => l.num).filter(
      (n) => !existsSync(join(process.cwd(), `public/images/card-${n}.png`)),
    );
    expect(missing, `levels missing themed card art: ${missing.join(', ')}`).toEqual([]);
  });

  it('LevelsPage renders ONE congruent card treatment (no per-world special-casing)', () => {
    const src = readFileSync(join(process.cwd(), 'src/LevelsPage.tsx'), 'utf8');
    expect(src, 'cards must render card-${num}.png').toContain('card-${num}.png');
    expect(src, 'cards must use the single themed treatment class').toContain('lvl-card--world');
    expect(src, 'the card art must carry an onError fallback').toContain('onError={hideBrokenImg}');
    // the old per-level visuals must not return — that asymmetry IS the bug
    for (const dead of ['lvl-card--space', 'lvl-card--garden', 'lvl-card--std', '<SpaceVisual', '<GardenVisual']) {
      expect(src, `LevelsPage must not re-introduce ${dead}`).not.toContain(dead);
    }
  });
});
