import { describe, it, expect } from 'vitest';
import { summarize, insightLine, whyNote, retention } from './dashboardData';
import type { MasteryMap, SkillStat } from '../../mastery/mastery';

const stat = (recent: number[], extra: Partial<SkillStat> = {}): SkillStat => ({
  attempts: Math.max(recent.length, 5),
  correct: recent.filter(Boolean).length,
  recent,
  lastSeen: 1,
  ...extra,
});

describe('dashboardData.summarize', () => {
  it('buckets rated skills into mastered / practicing / working', () => {
    const map: MasteryMap = {
      'sound:m': stat([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), // 1.0  → mastered
      'first:b': stat([1, 1, 1, 1, 1, 0, 1, 1, 1, 1]), // ~.89 → practicing
      'last:t': stat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),  // 0    → working
    };
    const s = summarize(map);
    expect(s.mastered.map((x) => x.skillKey)).toContain('sound:m');
    expect(s.practicing.map((x) => x.skillKey)).toContain('first:b');
    expect(s.working.map((x) => x.skillKey)).toContain('last:t');
    expect(s.total).toBe(3);
  });

  it('ignores barely-tried skills (under the rated minimum)', () => {
    const map: MasteryMap = { 'sound:m': stat([0, 1], { attempts: 2 }) };
    expect(summarize(map).total).toBe(0);
  });
});

describe('dashboardData.insightLine', () => {
  it('names the next focus and never shames', () => {
    const map: MasteryMap = {
      'sound:m': stat([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
      'last:t': stat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    };
    const line = insightLine('Ava', map);
    expect(line).toMatch(/Ava/);
    expect(line.toLowerCase()).not.toMatch(/fail|bad|poor|behind|struggl|worst/);
    expect(line).toMatch(/focus on|start with/);
  });

  it('celebrates when nothing needs work', () => {
    const map: MasteryMap = { 'sound:m': stat([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]) };
    expect(insightLine('Ava', map)).toMatch(/mastering|solid/);
  });

  it('gives a friendly placeholder with no data', () => {
    expect(insightLine('Ava', {})).toMatch(/fills in/);
  });
});

describe('dashboardData.whyNote', () => {
  it('flags re-hears and slow responses', () => {
    expect(whyNote({ skillKey: 'x', score: 0.5, attempts: 8, replays: 4, avgMs: 3000 })).toBe('often re-hears it');
    expect(whyNote({ skillKey: 'x', score: 0.7, attempts: 8, replays: 0, avgMs: 8000 })).toBe('takes some thought');
  });
});

describe('dashboardData.retention', () => {
  const now = 1_000_000_000_000;
  const DAY = 86_400_000;

  it('flags mastered-but-stale sounds (not fresh ones)', () => {
    const map: MasteryMap = {
      'sound:m': stat([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], { lastSeen: now - 20 * DAY }), // mastered + stale
      'sound:a': stat([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], { lastSeen: now }),            // mastered + fresh
    };
    const r = retention(map, now);
    expect(r.keepFresh.map((x) => x.skillKey)).toEqual(['sound:m']);
  });

  it('flags a historically-solid sound that is now slipping', () => {
    const map: MasteryMap = {
      'first:b': stat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { attempts: 20, correct: 18, lastSeen: now }),
    };
    expect(retention(map, now).slipping.map((x) => x.skillKey)).toContain('first:b');
  });
});
