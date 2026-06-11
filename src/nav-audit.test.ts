import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseHash } from './router';
import { LEVELS } from './games';

/**
 * Automated navigation audit (runs in the gate via vitest). This is the systemic
 * guard for the "a button doesn't go where it says" bug class — it scans every
 * STATIC navigation target in the source and asserts it resolves to a real screen.
 * It catches typo'd routes that silently fall back to Home, and #/play / #/level
 * targets pointing at games/levels that don't exist. (Dynamic targets with `${}`
 * are skipped — those are exercised by the live click-through and router tests.)
 */
const SRC = dirname(fileURLToPath(import.meta.url));
const GAME_IDS = new Set(LEVELS.flatMap((l) => l.games.map((g) => g.id)));
const LEVEL_NUMS = new Set(LEVELS.map((l) => l.num));

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...sourceFiles(p));
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

// navigate('#/x') | goBack('#/x') | to: '#/x'  — STATIC literals only (no `${}`)
const NAV_RE = /(?:navigate|goBack)\(\s*['"`](#\/[^'"`${}]*)['"`]|\bto:\s*['"`](#\/[^'"`${}]*)['"`]/g;

function collectTargets(): Map<string, string> {
  const targets = new Map<string, string>(); // target -> first file that uses it
  for (const f of sourceFiles(SRC)) {
    const src = readFileSync(f, 'utf8');
    let m: RegExpExecArray | null;
    NAV_RE.lastIndex = 0;
    while ((m = NAV_RE.exec(src))) {
      const t = m[1] ?? m[2];
      if (t && !targets.has(t)) targets.set(t, f.slice(SRC.length + 1));
    }
  }
  return targets;
}

describe('navigation audit — every static target goes to a real screen', () => {
  const targets = collectTargets();

  it('finds a representative set of navigation targets', () => {
    expect(targets.size).toBeGreaterThan(10);
  });

  it('no target silently falls back to Home (a typo / dead route)', () => {
    const bad = [...targets].filter(([t]) => t !== '#/' && t !== '#' && parseHash(t).name === 'home');
    expect(bad.map(([t, f]) => `${t} (${f})`)).toEqual([]);
  });

  it('every #/play/<game> target points at a real registered game', () => {
    const bad = [...targets].filter(([t]) => {
      const r = parseHash(t);
      return r.name === 'play' && !!r.game && !GAME_IDS.has(r.game);
    });
    expect(bad.map(([t, f]) => `${t} (${f})`)).toEqual([]);
  });

  it('every #/level and #/checkpoint target points at a real level', () => {
    const bad = [...targets].filter(([t]) => {
      const r = parseHash(t);
      return (r.name === 'level' || r.name === 'checkpoint') && r.level != null && !LEVEL_NUMS.has(r.level);
    });
    expect(bad.map(([t, f]) => `${t} (${f})`)).toEqual([]);
  });
});
