import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Congruence guard (enforce, don't review): the Level-3 workshop GAME screens must
 * use the shared GameShell chrome — never hand-roll a `wk-hud` — and must opt into
 * the no-scroll game frame (`wk wk-game`). The hub (WorkshopLevelHub) is exempt: it
 * uses HubHeader semantics and is allowed to grow.
 */
const GAME_FILES = ['WorkshopPick', 'BlendBuddies', 'ChopShop', 'PatchesDictation', 'ToolTime', 'SayItAgain'];
const read = (rel: string) => readFileSync(join(process.cwd(), 'src/worlds/workshop', rel), 'utf8');

describe('workshop chrome congruence', () => {
  for (const name of GAME_FILES) {
    it(`${name} uses GameShell (no hand-rolled wk-hud) on the no-scroll frame`, () => {
      const src = read(`${name}.tsx`);
      expect(src, `${name} should import GameShell`).toContain("from '../../ui/GameShell'");
      expect(src, `${name} should render via GameShell`).toContain('<GameShell');
      expect(src, `${name} must not hand-roll the HUD`).not.toContain('className="wk-hud"');
      expect(src, `${name} must use the no-scroll game frame`).toContain('rootClass="wk wk-game"');
    });
  }

  it('the wk-game frame is fixed-height + non-scrolling (games never scroll)', () => {
    const css = read('workshop.css');
    expect(css).toMatch(/\.wk-game\s*\{[^}]*100dvh/);
    expect(css).toMatch(/\.wk-game\s*\{[^}]*overflow:\s*hidden/);
  });
});
