import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Distinct level backgrounds — fail-safe. Each level is its OWN world; no two levels
 * may share a background. The worlds that reuse the shared `wk` chrome (Giant's
 * Valley, Tinker Town, …) MUST override the workshop's `.wk` background with their
 * own image — otherwise they silently inherit the workshop scene (the exact bug this
 * guards: Tinker Town shipped on the workshop background). Garden/Space render their
 * own backdrop COMPONENTS, so they're distinct by construction.
 */
const WK_WORLDS: Record<string, string> = {
  workshop: 'workshop/workshop.css',
  giantvalley: 'giantvalley/giantvalley.css',
  tinkertown: 'tinkertown/tinkertown.css',
};
const root = join(process.cwd(), 'src/worlds');

function rootBg(file: string): string | null {
  const css = readFileSync(join(root, file), 'utf8');
  const m = css.match(/background:[^;}]*url\((\/[^)]+)\)/); // the first image background
  return m ? m[1] : null;
}

describe('distinct level backgrounds (no level reuses another’s)', () => {
  it('every wk-based world sets its OWN background image (never inherits .wk)', () => {
    for (const [world, file] of Object.entries(WK_WORLDS)) {
      expect(rootBg(file), `${world} must set its own background: url(...)`).not.toBeNull();
    }
  });

  it('no two wk-based worlds share the same background image', () => {
    const pairs = Object.entries(WK_WORLDS).map(([world, f]) => [world, rootBg(f)] as const);
    const urls = pairs.map(([, u]) => u);
    expect(new Set(urls).size, `duplicate backgrounds: ${JSON.stringify(pairs)}`).toBe(urls.length);
  });
});
