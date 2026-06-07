import { describe, it, expect } from 'vitest';
import {
  isMastered, plantingsFromMastery, speciesFor, SPECIES, FALLBACK_SPECIES,
  unacknowledgedPlantings, plantingId,
} from './plantings';
import type { MasteryMap } from '../../mastery/mastery';
import type { LoreState } from './loreStore';

const stat = (correct: number, attempts: number) => ({
  attempts,
  correct,
  recent: Array.from({ length: Math.min(attempts, 10) }, (_, i) => (i < correct ? 1 : 0)),
  lastSeen: 1000 + attempts,
});
const emptyLore: LoreState = { acknowledged: [], stories: {}, bonds: {}, recentLines: [] };

describe('isMastered', () => {
  it('requires rated (>=5 attempts) AND solid (score >= 0.8)', () => {
    expect(isMastered(undefined)).toBe(false);
    expect(isMastered(stat(4, 4))).toBe(false);  // not rated yet
    expect(isMastered(stat(3, 6))).toBe(false);  // rated but weak
    expect(isMastered(stat(6, 6))).toBe(true);   // rated + solid
  });
});

describe('plantingsFromMastery', () => {
  it('blooms only mastered per-sound skills, names them, and never leaks undefined', () => {
    const m: MasteryMap = {
      'sound:first:m': stat(6, 6),  // mastered -> the /m/ marigold
      'sound:last:t': stat(1, 6),   // weak -> no bloom
      'pa:segment': stat(6, 6),     // not a per-sound skill -> no bloom
      'sound:first:zz': stat(6, 6), // unknown sound -> fallback species, still named
    };
    const ps = plantingsFromMastery(m);
    expect(ps.map((p) => p.name)).toContain('the /m/ marigold');
    expect(ps.some((p) => p.skillKey === 'pa:segment')).toBe(false);
    expect(ps.some((p) => p.sound === 't')).toBe(false);
    expect(ps.find((p) => p.sound === 'zz')?.species.plant).toBe('sprout'); // fallback
    expect(ps.every((p) => !p.name.includes('undefined'))).toBe(true);
    // deterministic order by sound
    const sounds = ps.map((p) => p.sound);
    expect(sounds).toEqual([...sounds].sort());
  });
});

describe('species table', () => {
  it('every entry is complete and self-consistent', () => {
    for (const [sound, s] of Object.entries(SPECIES)) {
      expect(s.sound).toBe(sound);
      expect(s.plant.length).toBeGreaterThan(0);
      expect(s.emoji.length).toBeGreaterThan(0);
      expect(s.color).toMatch(/^#/);
    }
  });
  it('speciesFor falls back for an unknown sound', () => {
    expect(speciesFor('qq').plant).toBe(FALLBACK_SPECIES.plant);
    expect(speciesFor('m').plant).toBe('marigold');
  });
});

describe('unacknowledgedPlantings', () => {
  it('filters out plantings whose bloom beat was already shown', () => {
    const ps = plantingsFromMastery({ 'sound:first:m': stat(6, 6) });
    expect(unacknowledgedPlantings(ps, emptyLore)).toHaveLength(1);
    const seen: LoreState = { ...emptyLore, acknowledged: [plantingId(ps[0])] };
    expect(unacknowledgedPlantings(ps, seen)).toHaveLength(0);
  });
});
