import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * IP fail-safe (see docs/IP-CURRICULUM.md). A teaching method/sequence and the
 * facts it uses are not copyrightable, so plain skill descriptions ("final
 * blends", "soft c and g", "schwa") are allowed. What is BANNED is a named
 * program's distinctive creative EXPRESSION — its invented mnemonic names and
 * exact book titles — which must never re-enter the repo (even in a comment, an
 * internal-only source file, OR a docs/ note). If this test fails, reword to the
 * plain skill. (Scans src/ AND docs/ — the audit found transcribed scope living
 * in docs/, which the old src-only scan missed.)
 */
const BANNED = [
  'commodore sailor',
  'edward the lizard',
  'banana rule',
  'confident rule',
  'huge bridge',
  'sprinkle vehicle',
  'chameleon prefix',
  'balloons-pigs',
  'keyword apple',
  'six reasons for silent',
  'influence of foreign language',
];

const SRC = dirname(fileURLToPath(import.meta.url)); // …/src
const REPO = dirname(SRC); // repo root
const DOCS = join(REPO, 'docs');
// these two legitimately reference the banned terms to DEFINE/enforce the boundary
const EXCLUDE = new Set(['ipGuard.test.ts', 'IP-CURRICULUM.md']);

function walk(dir: string, exts: RegExp): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.test(entry) && !EXCLUDE.has(entry)) out.push(p);
  }
  return out;
}

describe('IP guard', () => {
  it('no named-program creative expression anywhere in src/ or docs/ (IP boundary)', () => {
    const files = [...walk(SRC, /\.(ts|tsx)$/), ...walk(DOCS, /\.(md|ts|tsx)$/)];
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8').toLowerCase();
      for (const term of BANNED) if (text.includes(term)) offenders.push(`"${term}" → ${file.replace(REPO + '/', '')}`);
    }
    expect(offenders).toEqual([]);
  });
});
