import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Level-hub congruence — AUTO-DISCOVERING fail-safe. Every level hub must wear the
 * shared LevelHubShell so the back button, title, lead, companion greeting, games
 * grid, checkpoint CTA and Village button sit in the SAME place with the SAME words
 * on every level. The world supplies only its theme (prefix + backdrop + verb).
 *
 * This is the fix for the copy-paste drift that let the four hubs diverge (Space
 * even borrowed Garden's checkpoint class). A new hub that hand-rolls the skeleton
 * fails this gate automatically — discovered, not listed.
 */
function walkTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsx(p, out);
    else if (p.endsWith('LevelHub.tsx')) out.push(p);
  }
  return out;
}

const WORLDS = join(process.cwd(), 'src/worlds');
const hubs = walkTsx(WORLDS);

describe('level hub congruence (auto-discovering)', () => {
  it('discovers the level hubs (sanity — one per built world)', () => {
    expect(hubs.length).toBeGreaterThanOrEqual(4);
    for (const known of ['GardenLevelHub.tsx', 'SpaceLevelHub.tsx', 'WorkshopLevelHub.tsx', 'GiantValleyLevelHub.tsx']) {
      expect(hubs.some((f) => f.endsWith(known)), `expected to discover ${known}`).toBe(true);
    }
  });

  for (const file of hubs) {
    const rel = file.slice(WORLDS.length + 1);
    it(`${rel} wears the shared LevelHubShell (no hand-rolled skeleton)`, () => {
      const src = readFileSync(file, 'utf8');
      expect(src, `${rel} should render via <LevelHubShell>`).toContain('<LevelHubShell');
      // the shell owns the HUD, the missions grid, and the checkpoint — a hub that
      // hand-rolls any of them has drifted out of congruence
      expect(src, `${rel} must not hand-roll a -hud (HubHeader is inside the shell)`).not.toMatch(/className="[a-z]+-hud"/);
      expect(src, `${rel} must not hand-roll a -missions grid (the shell owns it)`).not.toMatch(/className="[a-z]+-missions"/);
      expect(src, `${rel} must not hand-roll the checkpoint CTA (the shell owns it)`).not.toContain('Take the Checkpoint');
    });
  }
});
