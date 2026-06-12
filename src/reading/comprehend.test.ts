import { describe, it, expect } from 'vitest';
import { resolveInventory } from './inventory';
import { composeUnit } from './compose';
import { makeMeaningQuestion, distractorPool } from './comprehend';
import { admissibleWords } from './lexicon';

function rngFrom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('comprehension question generation', () => {
  it('produces a real, same-category choice for many composed sentences (L2–L4)', () => {
    let made = 0;
    for (const level of [2, 3, 4]) {
      const inv = resolveInventory(level);
      for (let seed = 1; seed <= 60; seed++) {
        const sentence = composeUnit(inv, 'sentence', rngFrom(seed))!;
        const q = makeMeaningQuestion(sentence, inv, rngFrom(seed * 7 + 1));
        if (!q) continue;
        made += 1;
        // the answer is a content word actually in the sentence the child read
        expect(sentence.words.some((w) => w.word === q.answer.word), q.sentence).toBe(true);
        // ≥3 distinct, picturable options including the answer
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(new Set(q.options.map((o) => o.word)).size).toBe(q.options.length);
        expect(q.options.includes(q.answer)).toBe(true);
        expect(q.options.every((o) => o.imageable)).toBe(true);
        // distractors share the answer's category → comprehension, not categorization
        const cat = (e: typeof q.answer) => (e.animate ? 'animate' : e.place ? 'place' : 'object');
        expect(q.options.every((o) => cat(o) === cat(q.answer)), `${q.prompt} :: ${q.options.map((o) => o.word)}`).toBe(true);
      }
    }
    expect(made).toBeGreaterThan(50); // it actually fires across the corpus
  });

  it('is deterministic for a given seed', () => {
    const inv = resolveInventory(3);
    const s = composeUnit(inv, 'sentence', rngFrom(9))!;
    const a = makeMeaningQuestion(s, inv, rngFrom(4));
    const b = makeMeaningQuestion(s, inv, rngFrom(4));
    expect(a?.options.map((o) => o.word)).toEqual(b?.options.map((o) => o.word));
  });

  it('a "where" question asks about the subject and answers with a place', () => {
    const inv = resolveInventory(2);
    // find a seed whose sentence is the "X is on the Y" (place) frame
    for (let seed = 1; seed <= 200; seed++) {
      const s = composeUnit(inv, 'sentence', rngFrom(seed))!;
      const q = makeMeaningQuestion(s, inv, rngFrom(seed));
      if (q?.ask === 'where') {
        expect(q.prompt.startsWith('Where is the ')).toBe(true);
        expect(q.answer.place).toBe(true);
        return;
      }
    }
    throw new Error('no "where" question generated in 200 seeds');
  });

  it('distractorPool keeps the answer category and never the answer itself', () => {
    const pool = admissibleWords(resolveInventory(2));
    const cat = pool.find((e) => e.animate && e.imageable)!;
    const d = distractorPool(cat, pool);
    expect(d.length).toBeGreaterThan(0);
    expect(d.every((e) => e.animate)).toBe(true);
    expect(d.some((e) => e.word === cat.word)).toBe(false);
  });
});
