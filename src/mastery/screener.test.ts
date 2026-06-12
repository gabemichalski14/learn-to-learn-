import { describe, it, expect, beforeEach } from 'vitest';
import {
  pacingFor,
  saveScreener,
  loadScreener,
  hasScreened,
  pacingOf,
  RAN_FAST_MS,
  RAN_SLOW_MS,
  type ScreenerResult,
} from './screener';

beforeEach(() => localStorage.clear());

describe('pacingFor', () => {
  it('maps fast traversal → springboard, slow → gentle, middle → standard', () => {
    expect(pacingFor(RAN_FAST_MS - 100)).toBe('springboard');
    expect(pacingFor(RAN_FAST_MS)).toBe('springboard'); // boundary inclusive
    expect(pacingFor((RAN_FAST_MS + RAN_SLOW_MS) / 2)).toBe('standard');
    expect(pacingFor(RAN_SLOW_MS)).toBe('gentle'); // boundary inclusive
    expect(pacingFor(RAN_SLOW_MS + 100)).toBe('gentle');
  });

  it('defaults to standard for nonsense input (never throws, never extreme)', () => {
    expect(pacingFor(0)).toBe('standard');
    expect(pacingFor(-5)).toBe('standard');
    expect(pacingFor(NaN)).toBe('standard');
    expect(pacingFor(Infinity)).toBe('standard');
  });
});

describe('screener persistence', () => {
  const result: ScreenerResult = { ranMsPerItem: 500, takenAt: '2026-06-12T00:00:00.000Z', pacing: 'springboard' };

  it('round-trips a saved result', () => {
    expect(loadScreener('kid')).toBeNull();
    expect(hasScreened('kid')).toBe(false);
    saveScreener('kid', result);
    expect(loadScreener('kid')).toEqual(result);
    expect(hasScreened('kid')).toBe(true);
    expect(pacingOf('kid')).toBe('springboard');
  });

  it('keeps learners separate and defaults pacing to standard pre-screen', () => {
    saveScreener('a', result);
    expect(hasScreened('b')).toBe(false);
    expect(pacingOf('b')).toBe('standard');
  });

  it('tolerates corrupt storage without throwing', () => {
    localStorage.setItem('ll:kid:screener', '{not json');
    expect(loadScreener('kid')).toBeNull();
    expect(hasScreened('kid')).toBe(false);
  });
});
