import { describe, it, expect } from 'vitest';
import { CAST, MOSS, castFor, characterStage, beatFor } from './cast';
import { parseSkillKey } from '../../mastery/skills';
import type { MasteryMap } from '../../mastery/mastery';
import type { LoreState } from './loreStore';

const lore = (over: Partial<LoreState> = {}): LoreState => ({ acknowledged: [], stories: {}, bonds: {}, recentLines: [], ...over });
const stat = (correct: number, attempts: number) => ({
  attempts, correct,
  recent: Array.from({ length: Math.min(attempts, 10) }, (_, i) => (i < correct ? 1 : 0)),
  lastSeen: 1000,
});

describe('cast registry', () => {
  it('has unique ids and game-trainable sounds', () => {
    const ids = CAST.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of CAST) {
      expect(parseSkillKey(c.skillKey)).not.toBeNull(); // a real per-sound skill
      expect(c.soundId.length).toBeGreaterThan(0);
      expect(c.playRoute).toMatch(/^#\//);
    }
  });
  it('castFor finds the level character', () => {
    expect(castFor(2)).toBe(MOSS);
    expect(castFor(99)).toBeUndefined();
  });
});

describe('characterStage', () => {
  it('walks arrived → healing → healed → resident', () => {
    const empty: MasteryMap = {};
    expect(characterStage(MOSS, lore(), empty)).toBe('arrived');

    const started: MasteryMap = { 'sound:first:m': stat(1, 2) }; // attempts>0, not mastered
    expect(characterStage(MOSS, lore(), started)).toBe('healing');

    const mastered: MasteryMap = { 'sound:first:m': stat(6, 6) };
    expect(characterStage(MOSS, lore(), mastered)).toBe('healed');

    const welcomed = lore({ stories: { moss: { stage: 'resident' } } });
    expect(characterStage(MOSS, welcomed, mastered)).toBe('resident');
  });
});

describe('beatFor', () => {
  it('returns a non-empty, undefined-free line for every stage', () => {
    for (const stage of ['arrived', 'healing', 'healed', 'resident'] as const) {
      const line = beatFor(MOSS, stage, () => 0);
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toContain('undefined');
    }
  });
  it('is deterministic given a seeded rng', () => {
    expect(beatFor(MOSS, 'arrived', () => 0)).toBe(MOSS.beats.arrived![0]);
    expect(beatFor(MOSS, 'arrived', () => 0.99)).toBe(MOSS.beats.arrived![1]);
  });
});
