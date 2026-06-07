import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadLore, acknowledge, isAcknowledged, bumpBond, bondOf,
  setStoryStage, pushRecentLine, setChapter, clearLore,
} from './loreStore';
import { __resetStableReadCache } from '../../data/stableRead';

const L = 'lore-test';
beforeEach(() => { localStorage.clear(); __resetStableReadCache(); });

describe('loreStore', () => {
  it('defaults to an empty, well-formed state', () => {
    const s = loadLore(L);
    expect(s.acknowledged).toEqual([]);
    expect(s.bonds).toEqual({});
    expect(s.recentLines).toEqual([]);
    expect(s.stories).toEqual({});
  });

  it('acknowledge is idempotent', () => {
    acknowledge(L, 'beat1');
    acknowledge(L, 'beat1');
    expect(loadLore(L).acknowledged).toEqual(['beat1']);
    expect(isAcknowledged(L, 'beat1')).toBe(true);
    expect(isAcknowledged(L, 'nope')).toBe(false);
  });

  it('bumpBond accumulates and never decays', () => {
    bumpBond(L, 'pip');
    bumpBond(L, 'pip', 2);
    expect(bondOf(L, 'pip')).toBe(3);
    expect(bondOf(L, 'echo')).toBe(0);
  });

  it('setStoryStage stamps introducedAt and healedAt exactly once', () => {
    setStoryStage(L, 'moss', 'arrived', 100);
    setStoryStage(L, 'moss', 'healing', 200);
    expect(loadLore(L).stories.moss.introducedAt).toBe(100); // preserved
    setStoryStage(L, 'moss', 'healed', 300);
    setStoryStage(L, 'moss', 'healed', 400);
    expect(loadLore(L).stories.moss.healedAt).toBe(300); // first stamp wins
    expect(loadLore(L).stories.moss.stage).toBe('healed');
  });

  it('pushRecentLine dedupes and caps at 12', () => {
    for (let i = 0; i < 15; i++) pushRecentLine(L, `l${i}`);
    const r = loadLore(L).recentLines;
    expect(r.length).toBe(12);
    expect(r[r.length - 1]).toBe('l14');
    pushRecentLine(L, 'l14'); // re-show moves to end, doesn't duplicate
    expect(loadLore(L).recentLines.filter((x) => x === 'l14')).toHaveLength(1);
  });

  it('setChapter persists and no-ops when unchanged', () => {
    setChapter(L, 'ch1');
    expect(loadLore(L).chapterId).toBe('ch1');
  });

  it('clearLore resets everything', () => {
    acknowledge(L, 'x');
    bumpBond(L, 'pip');
    clearLore(L);
    expect(loadLore(L).acknowledged).toEqual([]);
    expect(bondOf(L, 'pip')).toBe(0);
  });
});
