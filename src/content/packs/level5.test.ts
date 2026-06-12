import { describe, it, expect } from 'vitest';
import {
  SUFFIX_ITEMS, PREFIX_ITEMS, WORD_SUMS, PEEL_WORDS, ED_WORDS, SORT_WORDS, ED_VOICES, SORT_BINS,
  buildSuffixRounds, buildPrefixRounds, buildWordSumRounds, buildPeelRounds, buildEdRounds, buildSortRounds,
} from './level5';

const rng = () => 0.42;

describe('level 5 data is self-consistent (no base/affix/word typos)', () => {
  it('every suffix word = base + suffix', () => {
    for (const it of SUFFIX_ITEMS) expect(it.word, `${it.base}+${it.suffix}`).toBe(it.base + it.suffix);
  });
  it('every prefix word = prefix + base', () => {
    for (const it of PREFIX_ITEMS) expect(it.word, `${it.prefix}+${it.base}`).toBe(it.prefix + it.base);
  });
  it('every word sum word = parts joined', () => {
    for (const ws of WORD_SUMS) expect(ws.word, ws.parts.join('+')).toBe(ws.parts.join(''));
  });
  it('every peel word = prefix? + base + suffix?', () => {
    for (const p of PEEL_WORDS) expect(p.word).toBe(`${p.prefix ?? ''}${p.base}${p.suffix ?? ''}`);
  });
  it('every -ed word ends in ed; every sort word is non-empty', () => {
    for (const w of ED_WORDS) expect(w.word.endsWith('ed')).toBe(true);
    for (const w of SORT_WORDS) expect(w.word.length).toBeGreaterThan(0);
  });
  it('the fixed UI sets exist (3 -ed voices, 5 sort bins incl. the reject bin)', () => {
    expect(ED_VOICES).toHaveLength(3);
    expect(SORT_BINS.map((b) => b.id)).toContain('none');
  });
});

describe('level 5 round builders', () => {
  it('suffix rounds: cap respected, answer in 3 options', () => {
    const rounds = buildSuffixRounds(6, rng);
    expect(rounds).toHaveLength(6);
    for (const r of rounds) {
      expect(r.options).toHaveLength(3);
      expect(r.options).toContain(r.suffix);
      expect(r.word).toBe(r.base + r.suffix);
    }
  });
  it('prefix rounds: answer in 3 options', () => {
    for (const r of buildPrefixRounds(5, rng)) {
      expect(r.options).toContain(r.prefix);
      expect(r.options).toHaveLength(3);
    }
  });
  it('word-sum rounds: tray contains every needed part + extra distractors', () => {
    for (const r of buildWordSumRounds(6, rng)) {
      for (const part of r.parts) expect(r.tray).toContain(part);
      expect(r.tray.length).toBeGreaterThan(r.parts.length); // has distractor parts too
    }
  });
  it('peel rounds: the word still equals its parts', () => {
    for (const p of buildPeelRounds(6, rng)) {
      expect(p.word).toBe(`${p.prefix ?? ''}${p.base}${p.suffix ?? ''}`);
    }
  });
  it('-ed rounds: each carries one of the three voices', () => {
    for (const r of buildEdRounds(8, rng)) expect(['t', 'd', 'uhd']).toContain(r.sound);
  });
  it('sort rounds: answer is an affix bin id or "none" (false affix)', () => {
    const ids = new Set([...SORT_BINS.map((b) => b.id)]);
    const rounds = buildSortRounds(SORT_WORDS.length, rng);
    for (const r of rounds) expect(ids.has(r.answer)).toBe(true);
    expect(rounds.some((r) => r.answer === 'none')).toBe(true); // the false-affix bin is exercised
  });
});
