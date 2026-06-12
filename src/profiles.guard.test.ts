import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Regression guard: students are created ONLY by an admin (cloud) or the on-device
 * guest "+ Add" chip — never auto-fabricated. `addLearner()` (the local roster
 * mutation) may be called from exactly these sites; a new call anywhere else fails
 * the build, so the "phantom Player 1 / auto-created student" bug can't come back.
 * (See #134.) To add a site, it must be GENUINELY admin- or guest-initiated.
 */
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const ALLOWED = new Set([
  'src/profiles.ts', // defines addLearner + the deliberate guest helpers
  'src/LearnerBar.tsx', // guest-mode "+ Add" (hidden when an admin is signed in)
  'src/data/identity.ts', // mirrors admin-created CLOUD students onto the device
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name) && !/\.d\.ts$/.test(name)) out.push(p);
  }
  return out;
}
function stripComments(s: string): string {
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ');
}

describe('no unauthorized learner creation (regression guard for #134)', () => {
  it('addLearner( is only called from the allowlisted (admin/guest) sites', () => {
    const offenders = walk(SRC)
      .map((p) => relative(ROOT, p))
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) => /\baddLearner\s*\(/.test(stripComments(readFileSync(join(ROOT, rel), 'utf8'))));
    expect(
      offenders,
      `addLearner() called outside the allowlist — students must be created only by an admin or the guest "+ Add". If this site is genuinely admin/guest-initiated, add it to ALLOWED; otherwise remove the auto-creation:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
