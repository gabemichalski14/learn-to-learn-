import { describe, it, expect } from 'vitest';
import { MORPHEMES, morphemesAt, glossWord } from './morphology';

describe('morpheme inventory', () => {
  it('teaches common affixes at L5 and Greek/Latin roots at L10', () => {
    expect(morphemesAt(5).some((m) => m.morph === 'un' && m.kind === 'prefix')).toBe(true);
    expect(morphemesAt(5).some((m) => m.morph === 'ing' && m.kind === 'suffix')).toBe(true);
    expect(morphemesAt(5).some((m) => m.kind === 'root')).toBe(false); // roots not yet
    expect(morphemesAt(10).some((m) => m.morph === 'port' && m.kind === 'root')).toBe(true);
  });

  it('every morpheme carries a child-friendly meaning', () => {
    for (const m of MORPHEMES) expect(m.meaning.trim().length).toBeGreaterThan(0);
  });
});

describe('glossWord — meaning from parts', () => {
  it('peels a prefix and/or suffix off a real base, in word order', () => {
    expect(glossWord('unfit')).toEqual([
      { morph: 'un', meaning: 'not / the opposite', kind: 'prefix' },
      { morph: 'fit', meaning: 'fit', kind: 'base' },
    ]);
    expect(glossWord('jumping')).toEqual([
      { morph: 'jump', meaning: 'jump', kind: 'base' },
      { morph: 'ing', meaning: 'doing it now', kind: 'suffix' },
    ]);
    expect(glossWord('helpful')?.map((p) => p.morph)).toEqual(['help', 'ful']);
  });

  it('prefers the longest suffix (fastest = fast + est, not fast + s)', () => {
    expect(glossWord('fastest')?.map((p) => p.morph)).toEqual(['fast', 'est']);
  });

  it('never mis-splits a plain word (conservative base ≥ 3)', () => {
    expect(glossWord('rest')).toBeNull(); // not re + st
    expect(glossWord('cat')).toBeNull();
    expect(glossWord('red')).toBeNull(); // not re + d
  });

  it('names a Greek/Latin root when no affix applies', () => {
    expect(glossWord('transport')?.[0]).toMatchObject({ morph: 'port', meaning: 'carry', kind: 'root' });
  });
});
