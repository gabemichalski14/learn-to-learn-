import { describe, it, expect } from 'vitest';
import { BLEND_WORDS, DIGRAPH_WORDS, DIGRAPHS, RULE_WORDS, SYLL_WORDS, buildSortItRounds } from './level3';
import { blendKey, digraphKey, ruleKey, syllKey, skillLabel } from '../../mastery/skills';

describe('level3 content pack', () => {
  it('blend words carry the blend at the right position', () => {
    for (const w of BLEND_WORDS) {
      expect(w.blend).toHaveLength(2);
      if (w.position === 'init') expect(w.label.startsWith(w.blend)).toBe(true);
      else expect(w.label.endsWith(w.blend)).toBe(true);
    }
  });

  it('digraph words contain a known digraph', () => {
    for (const w of DIGRAPH_WORDS) {
      expect(DIGRAPHS).toContain(w.digraph as (typeof DIGRAPHS)[number]);
      expect(w.label.includes(w.digraph)).toBe(true);
    }
  });

  it('rule words end with the correct doubled / ck ending (distractor is the single)', () => {
    for (const w of RULE_WORDS) {
      expect(w.label.endsWith(w.ending)).toBe(true);
      if (w.rule === 'ck') {
        expect(w.ending).toBe('ck');
        expect(w.distractor).toBe('k'); // the tempting single spelling
      } else {
        expect(w.ending).toMatch(/^(ff|ll|ss|zz)$/);      // FLOSS doubles
        expect(w.ending).toBe(w.distractor + w.distractor); // 'll' = doubled 'l'
      }
    }
  });

  it('syllable splits cut into two non-empty closed syllables', () => {
    for (const w of SYLL_WORDS) {
      expect(w.split).toBeGreaterThan(0);
      expect(w.split).toBeLessThan(w.label.length);
      expect(w.label.slice(0, w.split).length).toBeGreaterThan(0);
      expect(w.label.slice(w.split).length).toBeGreaterThan(0);
    }
  });

  it('adaptive selection biases toward weighted-up (weak) skills', () => {
    const weightOf = (skill: string) => (skill === digraphKey('sh') ? 100 : 0.01);
    let sh = 0, total = 0;
    for (let i = 0; i < 30; i++) for (const r of buildSortItRounds(3, Math.random, weightOf)) { total++; if (r.digraph === 'sh') sh++; }
    expect(sh / total).toBeGreaterThan(0.4); // the weak skill dominates practice (vs ~0.23 uniform)
  });

  it('produces readable, no-shame skill labels for the new kinds', () => {
    const labels = [skillLabel(blendKey('init', 'fl')), skillLabel(digraphKey('sh')), skillLabel(ruleKey('floss')), skillLabel(ruleKey('ck')), skillLabel(syllKey('vccv'))];
    for (const l of labels) {
      expect(l).not.toBe('');
      expect(l.toLowerCase()).not.toMatch(/fail|bad|wrong|poor|stupid/);
    }
    expect(skillLabel(blendKey('init', 'fl'))).toMatch(/f-l blend/);
    expect(skillLabel(ruleKey('floss'))).toMatch(/FLOSS/);
  });
});
