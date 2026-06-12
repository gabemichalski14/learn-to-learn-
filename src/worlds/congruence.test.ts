import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Congruence fail-safe — AUTO-DISCOVERING (enforce, don't review).
 *
 * Every GAME SCREEN must wear the shared GameShell chrome (back / title / progress
 * / mute in the same place on every level) instead of hand-rolling its own <main> +
 * HUD. That hand-rolling is exactly how levels drifted: the old guard kept a
 * hand-typed list of workshop files, so Level 4's six games never got checked and
 * shipped with bespoke chrome, no mute, and no no-scroll frame.
 *
 * The fix is to DISCOVER the game set instead of typing it. A "game screen" is any
 * src/worlds file that owns a play loop — i.e. it logs skill events. Wrapper games
 * (e.g. SortIt → WorkshopPick) delegate their chrome to a parent that IS itself a
 * discovered game screen, so they need neither GameShell nor a <main> of their own.
 *
 * Because the set is discovered, a NEW game that hand-rolls chrome fails this gate
 * automatically — nobody has to remember to add it to a list.
 */
function walkTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsx(p, out);
    else if (p.endsWith('.tsx') && !p.endsWith('.test.tsx')) out.push(p);
  }
  return out;
}

const WORLDS = join(process.cwd(), 'src/worlds');
const gameScreens = walkTsx(WORLDS).filter((f) => readFileSync(f, 'utf8').includes('logSkillEvent('));

describe('game chrome congruence (auto-discovering)', () => {
  it('discovers the game screens (sanity — finds the loop-owning games)', () => {
    expect(gameScreens.length).toBeGreaterThan(8);
    // a known game from each world must be in the discovered set
    for (const known of ['TapItOutGame.tsx', 'SpaceSortGame.tsx', 'WorkshopPick.tsx', 'NameChange.tsx']) {
      expect(gameScreens.some((f) => f.endsWith(known)), `expected to discover ${known}`).toBe(true);
    }
  });

  for (const file of gameScreens) {
    const rel = file.slice(WORLDS.length + 1);
    it(`${rel} wears GameShell (no hand-rolled <main> / HUD)`, () => {
      const src = readFileSync(file, 'utf8');
      expect(src, `${rel} should render via <GameShell>`).toContain('<GameShell');
      expect(src, `${rel} must not hand-roll its own <main> — GameShell owns the frame`).not.toMatch(/<main[\s>]/);
      expect(src, `${rel} must not hand-roll a -hud row — GameShell owns the HUD`).not.toMatch(/className="[a-z]+-hud"/);
    });
  }

  it("the wk-game frame (workshop + Giant's Valley) never scrolls", () => {
    const css = readFileSync(join(WORLDS, 'workshop/workshop.css'), 'utf8');
    expect(css).toMatch(/\.wk-game\s*\{[^}]*100dvh/);
    expect(css).toMatch(/\.wk-game\s*\{[^}]*overflow:\s*hidden/);
  });
});
