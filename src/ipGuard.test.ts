import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * IP fail-safe (see docs/IP-CURRICULUM.md). A teaching method/sequence and the
 * facts it uses are not copyrightable, so plain skill descriptions ("final
 * blends", "soft c and g", "schwa") are allowed. What is BANNED is a named
 * program's distinctive creative EXPRESSION — its invented mnemonic names and
 * exact book titles — which must never re-enter the source (even in a comment or
 * an internal-only file). If this test fails, reword to the plain skill.
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

const SRC = dirname(fileURLToPath(import.meta.url));

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry) && !p.endsWith('ipGuard.test.ts')) out.push(p);
  }
  return out;
}

describe('IP guard', () => {
  it('source contains no named-program creative expression (IP boundary)', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, 'utf8').toLowerCase();
      for (const term of BANNED) if (text.includes(term)) offenders.push(`"${term}" → ${file.replace(SRC, 'src')}`);
    }
    expect(offenders).toEqual([]);
  });
});
