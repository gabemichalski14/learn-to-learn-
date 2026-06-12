import { describe, it, expect } from 'vitest';
import { resolveInventory, newGraphemesAt } from './inventory';
import { compose, composeUnit, composePassage } from './compose';
import { validateUnit, validateText } from './validate';

/** Deterministic RNG (mulberry32) for reproducible composition in tests. */
function rngFrom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('composer guarantee: every generated unit passes the validator', () => {
  it('holds across every taught level (phrase/sentence/passage × L2–L10 × 40 seeds)', () => {
    for (const level of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      const inv = resolveInventory(level);
      for (const kind of ['phrase', 'sentence', 'passage'] as const) {
        for (let seed = 1; seed <= 40; seed++) {
          const unit = compose(inv, kind, rngFrom(seed));
          expect(unit, `${kind}@L${level} seed ${seed} produced nothing`).not.toBeNull();
          const v = validateUnit(unit!, inv);
          expect(v.ok, `${kind}@L${level} seed ${seed}: "${unit!.text}" → ${v.reasons.join('; ')}`).toBe(true);
          expect(v.decodability).toBe(1);
        }
      }
    }
  });
});

describe('composition shape', () => {
  it('phrases are lowercase and unpunctuated; sentences are capitalized and end with a period', () => {
    const phrase = composeUnit(resolveInventory(2), 'phrase', rngFrom(5))!;
    expect(phrase.text[0]).toBe(phrase.text[0].toLowerCase());
    expect(phrase.text.endsWith('.')).toBe(false);

    const sentence = composeUnit(resolveInventory(2), 'sentence', rngFrom(5))!;
    expect(sentence.text[0]).toBe(sentence.text[0].toUpperCase());
    expect(sentence.text.endsWith('.')).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = composeUnit(resolveInventory(2), 'sentence', rngFrom(7))!;
    const b = composeUnit(resolveInventory(2), 'sentence', rngFrom(7))!;
    expect(a.text).toBe(b.text);
  });

  it('cannot compose at Level 1 (oral, nothing decodable yet)', () => {
    expect(compose(resolveInventory(1), 'sentence', rngFrom(1))).toBeNull();
    expect(composePassage(resolveInventory(1), rngFrom(1))).toBeNull();
  });
});

describe('passage cohesion', () => {
  it('reuses one subject across distinct, decodable sentences', () => {
    const p = composePassage(resolveInventory(2), rngFrom(3), 3)!;
    expect(p).not.toBeNull();
    const sentences = p.text.split('.').map((s) => s.trim()).filter(Boolean);
    expect(sentences.length).toBe(3);
    const subject = sentences[0].split(' ')[1].toLowerCase(); // word after leading "The"
    for (const s of sentences) expect(s.toLowerCase()).toContain(subject);
    expect(validateUnit(p, resolveInventory(2)).ok).toBe(true);
  });
});

describe('new-skill density', () => {
  const hasDigraph = (text: string, dg: ReadonlySet<string>): boolean =>
    [...dg].some((g) => text.includes(g));

  it('foregrounds the new L3 digraph pattern, while keeping variety', () => {
    const l3 = resolveInventory(3);
    const dg = newGraphemesAt(3); // {sh, ch, th, wh, ck}
    const N = 80;
    let withNew = 0;
    for (let s = 1; s <= N; s++) {
      const u = compose(l3, 'sentence', rngFrom(s * 13 + 2))!;
      if (u.words.some((w) => hasDigraph(w.word, dg))) withNew += 1;
    }
    expect(withNew / N).toBeGreaterThan(0.4); // density: foregrounds the new skill
    expect(withNew / N).toBeLessThan(1); // variety: not every line (not predictable text)
  });

  it('never emits a digraph word at L2 (none taught yet)', () => {
    const l2 = resolveInventory(2);
    const dg = newGraphemesAt(3);
    for (let s = 1; s <= 40; s++) {
      const u = compose(l2, 'sentence', rngFrom(s * 9))!;
      expect(u.words.some((w) => hasDigraph(w.word, dg))).toBe(false);
    }
  });
});

describe('validator catches what the composer must never emit', () => {
  it('fails text with an untaught word at this level (decodability drops)', () => {
    // "fish" needs the L3 digraph "sh"; at L2 it's untaught.
    const atL2 = validateText('The fish can run.', resolveInventory(2), 'sentence');
    expect(atL2.ok).toBe(false);
    expect(atL2.decodability).toBeLessThan(1);
    // …but the same sentence is fine at L3.
    expect(validateText('The fish can run.', resolveInventory(3), 'sentence').ok).toBe(true);
  });

  it('fails text with an unknown (non-lexicon) word', () => {
    const v = validateText('The cat zzz.', resolveInventory(2), 'sentence');
    expect(v.ok).toBe(false);
    expect(v.reasons.join(' ')).toMatch(/unknown/);
  });

  it('fails text outside the length ramp for its kind', () => {
    expect(validateText('cat', resolveInventory(2), 'phrase').ok).toBe(false); // 1 word < phrase min
  });
});
