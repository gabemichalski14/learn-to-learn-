import { describe, it, expect } from 'vitest';
import { CAST, MOSS, CHIP, castFor, characterStage, beatFor, reactionLine, healStage, healFromMastery, healFor, fragmentToReveal, fragmentId, soundsOf, gardenResidents, isFullyRecovered, isHumRecovered, storytimeScene } from './cast';
import type { ReactionKind } from './cast';
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
      // a real trainable skill — a per-sound key, or a phonemic-awareness key
      expect(parseSkillKey(c.skillKey) !== null || c.skillKey.startsWith('pa:')).toBe(true);
      expect(c.soundId.length).toBeGreaterThan(0);
      expect(c.playRoute).toMatch(/^#\//);
    }
  });
  it('castFor finds the level character', () => {
    expect(castFor(1)).toBe(CHIP);
    expect(castFor(2)).toBe(MOSS);
    expect(castFor(99)).toBeUndefined();
  });
});

// Master every one of a character's scattered hums.
const allMastered = (c = MOSS): MasteryMap =>
  Object.fromEntries(soundsOf(c).map((k) => [k, stat(6, 6)]));

describe('characterStage (needs ALL his sounds for healed)', () => {
  it('walks arrived → healing → healed → resident', () => {
    expect(characterStage(MOSS, lore(), {})).toBe('arrived');

    const started: MasteryMap = { 'sound:first:m': stat(1, 2) };
    expect(characterStage(MOSS, lore(), started)).toBe('healing');

    // only ONE of his three sounds mastered → still healing (harder arc)
    expect(characterStage(MOSS, lore(), { 'sound:first:m': stat(6, 6) })).toBe('healing');

    const whole = allMastered();
    expect(characterStage(MOSS, lore(), whole)).toBe('healed');
    expect(characterStage(MOSS, lore({ stories: { moss: { stage: 'resident' } } }), whole)).toBe('resident');
  });
});

describe('garden residency (a friend moves in once their level is 100% done)', () => {
  it('isFullyRecovered needs every scattered hum mastered', () => {
    expect(isFullyRecovered(MOSS, {})).toBe(false);
    // two of three mastered → not yet home
    expect(isFullyRecovered(MOSS, { 'sound:first:m': stat(6, 6), 'sound:last:t': stat(6, 6) })).toBe(false);
    expect(isFullyRecovered(MOSS, allMastered())).toBe(true);
  });
  it('gardenResidents lists only the fully-recovered cast', () => {
    expect(gardenResidents({})).toEqual([]);
    // partway through Moss's level → still nobody lives here
    expect(gardenResidents({ 'sound:first:m': stat(6, 6) })).toEqual([]);
    expect(gardenResidents(allMastered())).toEqual([MOSS]);
  });
  it('homecoming uses a HIGH bar (>95%) — solid-but-imperfect is NOT enough', () => {
    // /m/ is "mastered" by the general 0.8 bar but ~0.82 (a recent miss) → below
    // 95%, so Moss is not fully home and does not move into the garden yet.
    const solid = { 'sound:first:m': stat(9, 10), 'sound:last:t': stat(6, 6), 'sound:medial:a': stat(6, 6) };
    expect(isFullyRecovered(MOSS, solid)).toBe(false);
    expect(gardenResidents(solid)).toEqual([]);
  });
});

describe('isHumRecovered (the 95% homecoming bar)', () => {
  it('needs rated attempts AND over 95% correct', () => {
    expect(isHumRecovered(undefined)).toBe(false);
    expect(isHumRecovered(stat(4, 4))).toBe(false); // perfect but not yet rated (<5)
    expect(isHumRecovered(stat(6, 6))).toBe(true);  // rated + perfect
    expect(isHumRecovered(stat(9, 10))).toBe(false); // rated but ~0.82 — under 95%
  });
});

describe('healFor (average recovery across his hums)', () => {
  it('rises as each hum is mastered, reaching 1 when all are', () => {
    expect(healFor(MOSS, {})).toBe(0);
    const oneOfThree = healFor(MOSS, { 'sound:first:m': stat(6, 6) });
    expect(oneOfThree).toBeCloseTo(1 / 3, 5);
    expect(healFor(MOSS, allMastered())).toBe(1);
  });
});

describe('fragmentToReveal (a memory per recovered sound)', () => {
  it('surfaces a mastered sound\'s memory once, then not again', () => {
    const m = { 'sound:first:m': stat(6, 6) }; // /m/ mastered
    const got = fragmentToReveal(MOSS, lore(), m);
    expect(got?.soundId).toBe('m');
    expect(got?.line).toContain('moon-moths');
    // once acknowledged, it's no longer offered
    const seen = lore({ acknowledged: [fragmentId(MOSS, 'm')] });
    expect(fragmentToReveal(MOSS, seen, m)).toBeNull();
  });
  it('returns null when nothing new is mastered', () => {
    expect(fragmentToReveal(MOSS, lore(), {})).toBeNull();
  });
});

describe('storytimeScene (the cozy story a resident tells)', () => {
  it('is opening beat + every recovered memory + a gentle close', () => {
    const scene = storytimeScene(MOSS, allMastered(), () => 0);
    expect(scene[0]).toBe(MOSS.beats.resident![0]);        // warm opening
    expect(scene).toContain(MOSS.fragments!.m[0]);          // each recovered hum's memory
    expect(scene).toContain(MOSS.fragments!.t[0]);
    expect(scene).toContain(MOSS.fragments!.a[0]);
    expect(scene[scene.length - 1]).toBe(MOSS.storytime![0]); // gentle close
    expect(scene.length).toBe(5); // open + 3 memories + close
  });
  it('is memory-aware: only includes memories for sounds actually mastered', () => {
    const scene = storytimeScene(MOSS, { 'sound:first:m': stat(6, 6) }, () => 0);
    expect(scene).toContain(MOSS.fragments!.m[0]);
    expect(scene).not.toContain(MOSS.fragments!.t[0]);
    expect(scene).not.toContain(MOSS.fragments!.a[0]);
  });
  it('never yields empty/undefined lines', () => {
    for (const line of storytimeScene(MOSS, allMastered())) {
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toContain('undefined');
    }
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

describe('persona (want/need/flaw spine)', () => {
  it('every cast member has a full, non-empty persona', () => {
    for (const c of CAST) {
      for (const field of ['want', 'need', 'flaw', 'trait'] as const) {
        expect(c.persona[field].length).toBeGreaterThan(0);
      }
    }
  });
});

describe('in-game reactions', () => {
  const kinds: ReactionKind[] = ['intro', 'teach', 'correct', 'wrong', 'clear', 'win'];
  it('Moss reacts to every in-game moment, with no undefined leaks', () => {
    for (const kind of kinds) {
      const line = reactionLine(MOSS, kind, () => 0);
      expect(line.length).toBeGreaterThan(0);
      expect(line).not.toContain('undefined');
    }
  });
  it('reactionLine is deterministic given a seeded rng', () => {
    expect(reactionLine(MOSS, 'correct', () => 0)).toBe(MOSS.reactions.correct![0]);
  });
});

describe('healFromMastery (playing his sound recovers him)', () => {
  it('is 0 unseen, 1 when mastered, partial in between', () => {
    expect(healFromMastery(undefined)).toBe(0);
    expect(healFromMastery(stat(6, 6))).toBe(1);          // rated + solid → whole
    expect(healFromMastery(stat(3, 3))).toBeCloseTo(0.6, 5); // 3/5 attempts, perfect → 0.6
    expect(healFromMastery(stat(0, 0))).toBe(0);
  });
  it('rises monotonically with more correct practice', () => {
    expect(healFromMastery(stat(1, 1))).toBeLessThan(healFromMastery(stat(4, 4)));
  });
});

describe('healStage (transformation: scattered → whole)', () => {
  it('maps the heal fraction to 4 stages, clamped', () => {
    expect(healStage(-1)).toBe(0);
    expect(healStage(0)).toBe(0);
    expect(healStage(0.32)).toBe(0);
    expect(healStage(0.33)).toBe(1);
    expect(healStage(0.66)).toBe(2);
    expect(healStage(0.99)).toBe(2);
    expect(healStage(1)).toBe(3);
    expect(healStage(2)).toBe(3);
  });
});
