import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Asset-safety fail-safe (enforce, don't review): "no broken-image icon, ever".
 *
 * Every <img> in the shipped app MUST carry an onError fallback — either the shared
 * hideBrokenImg handler (decorative images degrade to nothing) or a fallback
 * component's own emoji-swap (WordPicture / Icon / CharacterArt / LevelEmblem).
 * A new raw <img> with no fallback fails this test, so missing/slow PNGs can never
 * render a broken-image icon to a child. See src/ui/imgFallback.ts.
 *
 * (Art.tsx is doubly safe: it presence-checks via useImagePresent AND carries
 * onError — the rule is uniform, no allowlist.)
 */
function walkTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsx(p, out);
    else if (p.endsWith('.tsx') && !p.endsWith('.test.tsx')) out.push(p);
  }
  return out;
}

describe('asset safety (no broken-image icon, ever)', () => {
  it('every <img> in the app carries an onError fallback', () => {
    const root = join(process.cwd(), 'src');
    const offenders: string[] = [];
    for (const file of walkTsx(root)) {
      const src = readFileSync(file, 'utf8');
      let idx = src.indexOf('<img');
      while (idx !== -1) {
        const end = src.indexOf('/>', idx); // <img …/> is always self-closing in JSX
        const tag = end === -1 ? src.slice(idx) : src.slice(idx, end + 2);
        if (!tag.includes('onError')) {
          offenders.push(`${file.slice(root.length + 1)} → ${tag.replace(/\s+/g, ' ').slice(0, 90)}`);
        }
        idx = src.indexOf('<img', end === -1 ? idx + 4 : end + 2);
      }
    }
    expect(offenders, `raw <img> without an onError fallback:\n${offenders.join('\n')}`).toEqual([]);
  });
});
