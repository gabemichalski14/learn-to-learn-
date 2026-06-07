import { describe, it, expect, beforeEach } from 'vitest';
import { daysBetween, homeLead, pipGreetingFor, narrativeState, type NarrativeState } from './narrative';

const base: NarrativeState = { newcomer: false, sessions: 5, stickers: 2, tierName: 'Sprouting', daysSince: 0, lastSkill: '/m/' };

describe('daysBetween', () => {
  it('floors to whole days, never negative, null for no prior visit', () => {
    const now = 1_000_000_000_000;
    expect(daysBetween(null, now)).toBeNull();
    expect(daysBetween(now, now)).toBe(0);
    expect(daysBetween(now - 86_400_000, now)).toBe(1);
    expect(daysBetween(now - 3 * 86_400_000 - 5, now)).toBe(3);
    expect(daysBetween(now + 999, now)).toBe(0); // clock skew -> 0, not negative
  });
});

describe('homeLead', () => {
  it('gives newcomers the world premise', () => {
    const l = homeLead({ ...base, newcomer: true, daysSince: null, lastSkill: null });
    expect(l.toLowerCase()).toContain('sound garden');
    expect(l.toLowerCase()).toContain('first');
  });
  it('remembers days away and the last sound', () => {
    expect(homeLead({ ...base, daysSince: 1 })).toContain('/m/');
    expect(homeLead({ ...base, daysSince: 3 })).toContain('3 days away');
    expect(homeLead({ ...base, daysSince: 0 })).toMatch(/warm from earlier/i);
  });
  it('still reads naturally with no recorded skill', () => {
    const l = homeLead({ ...base, daysSince: 2, lastSkill: null });
    expect(l).toContain('your sounds');
    expect(l).not.toContain('undefined');
  });
});

describe('pipGreetingFor', () => {
  it('newcomer greeting introduces Pip + the garden, links to levels', () => {
    const g = pipGreetingFor({ ...base, newcomer: true, daysSince: null, lastSkill: null });
    expect(g.say.toLowerCase()).toContain('pip');
    expect(g.to).toBe('#/levels');
  });
  it('references the remembered sound when returning', () => {
    expect(pipGreetingFor({ ...base, daysSince: 1 }).say).toContain('/m/');
    expect(pipGreetingFor({ ...base, daysSince: 4 }).say).toContain('4 days');
  });
});

describe('narrativeState (integration with real stored data)', () => {
  const id = 'narr-test';
  beforeEach(() => localStorage.clear());

  it('surfaces a SHORT sound token (/m/), never the doubled descriptive phrase', () => {
    const now = 1_700_000_000_000;
    localStorage.setItem(`ll:${id}:sessions`, '5');
    localStorage.setItem(`ll:${id}:earned`, '["a","b"]');
    // pa:segment is the most-recent skill but must be SKIPPED (it has no sound token);
    // sound:first:m is the most-recent actual sound and should win.
    localStorage.setItem(`ll:${id}:mastery`, JSON.stringify({
      'sound:first:m': { attempts: 8, correct: 6, recent: [], lastSeen: now - 10_000 },
      'sound:last:t': { attempts: 4, correct: 2, recent: [], lastSeen: now - 99_000 },
      'pa:segment': { attempts: 3, correct: 1, recent: [], lastSeen: now - 1 },
    }));
    localStorage.setItem(`ll:${id}:log`, JSON.stringify([
      { id: 'x', endedAt: new Date(now - 3 * 86_400_000 - 5).toISOString(), accuracy: 0.8 },
    ]));

    const s = narrativeState(id, now);
    expect(s.newcomer).toBe(false);
    expect(s.lastSkill).toBe('/m/');      // short token, not "the /m/ sound at the start"
    expect(s.daysSince).toBe(3);

    // And the rendered line reads naturally — no doubling, no leaked phrasing.
    const lead = homeLead(s);
    expect(lead).toContain('the /m/ sound');
    expect(lead).not.toContain('the the');
    expect(lead).not.toContain('at the start');
    expect(lead).not.toContain('undefined');
  });

  it('newcomer (no sessions) gets the premise, no skill leakage', () => {
    const s = narrativeState(id, Date.now());
    expect(s.newcomer).toBe(true);
    expect(s.lastSkill).toBeNull();
    expect(homeLead(s).toLowerCase()).toContain('sound garden');
  });
});
