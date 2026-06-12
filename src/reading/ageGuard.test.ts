import { describe, it, expect } from 'vitest';
import { LEXICON, lookupWord } from './lexicon';
import { resolveInventory } from './inventory';
import { compose } from './compose';
import { tokenize } from './validate';
import { bannedReason, BANNED_WORDS } from './ageGuard';

function rngFrom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('age-appropriateness guard (hard gate)', () => {
  it('no lexicon word is age-inappropriate', () => {
    for (const e of LEXICON) {
      expect(bannedReason(e.word), `lexicon word "${e.word}"`).toBeNull();
    }
  });

  it('lexicon words are short and simple (1–6 letters)', () => {
    for (const e of LEXICON) {
      expect(e.word, e.word).toMatch(/^[a-zA-Z]{1,6}$/);
    }
  });

  it('the composer emits a CLOSED vocabulary — every generated token is a curated lexicon word', () => {
    // This is the load-bearing guarantee: because the output never escapes the
    // (denylist-clean) lexicon, every generated unit is provably age-safe.
    for (const level of [2, 3]) {
      const inv = resolveInventory(level);
      for (const kind of ['phrase', 'sentence', 'passage'] as const) {
        for (let seed = 1; seed <= 30; seed++) {
          const u = compose(inv, kind, rngFrom(seed * 5 + level))!;
          for (const token of tokenize(u.text)) {
            expect(lookupWord(token), `unknown token "${token}" in "${u.text}"`).toBeDefined();
            expect(bannedReason(token), `banned token "${token}" in "${u.text}"`).toBeNull();
          }
        }
      }
    }
  });

  it('the guard itself works (test-the-test)', () => {
    expect(bannedReason('gun')).not.toBeNull();
    expect(bannedReason('Hate')).not.toBeNull(); // case-insensitive
    expect(bannedReason('fuuck')).toBeNull(); // not the exact substring
    expect(bannedReason('shituation')).not.toBeNull(); // substring root
    expect(bannedReason('cat')).toBeNull();
    expect(bannedReason('hat')).toBeNull(); // must NOT trip "hate"
    expect(BANNED_WORDS.size).toBeGreaterThan(25);
  });
});
