import { describe, it, expect } from 'vitest';
import { pipSuggest } from './pipBrain';
import { isMuted, hapticsOn } from '../audio/sfx';

describe('pipBrain — one-stop suggestions', () => {
  it('empty query → no suggestions', () => {
    expect(pipSuggest('')).toEqual([]);
    expect(pipSuggest('   ')).toEqual([]);
  });

  it('navigates to a place (go)', () => {
    const r = pipSuggest('garden')[0];
    expect(r).toBeDefined();
    expect(r.run().kind).toBe('go');
  });

  it('toggles sound + buzz as independent settings, and the toggle flips state', () => {
    const before = isMuted();
    const out = pipSuggest('sounds')[0].run();
    expect(out.kind).toBe('say');
    expect(isMuted()).toBe(!before);

    const b = hapticsOn();
    pipSuggest('buzz')[0].run();
    expect(hapticsOn()).toBe(!b);
  });

  it('explains a game straight from the registry', () => {
    const out = pipSuggest('blend buddies')[0].run();
    expect(out.kind).toBe('explain');
    if (out.kind === 'explain') {
      expect(out.to).toBe('#/play/blend-buddies');
      expect(out.body.length).toBeGreaterThan(10);
    }
  });

  it('explains a data concept (mastery = first-try)', () => {
    const out = pipSuggest('mastered')[0].run();
    expect(out.kind).toBe('explain');
    if (out.kind === 'explain') expect(out.body.toLowerCase()).toContain('first');
  });

  it('takes you to your data', () => {
    const out = pipSuggest('my progress')[0].run();
    expect(out.kind).toBe('go'); // "my progress" walks you straight to the data
    if (out.kind === 'go') expect(out.to).toBe('#/profile');
  });
});
