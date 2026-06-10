import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSortGame } from './useSortGame';
import type { SortRound } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';

function roundOf(): SortRound {
  return {
    baskets: ['m', 's'],
    target: 'beginning',
    items: [
      { id: 'moon', label: 'moon', beginningSound: 'm', emoji: '🌙' },
      { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
    ],
  };
}

const round: SortRound = {
  baskets: ['b', 's'],
  items: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
  ],
};

function fakeAudio(): AudioPlayer {
  return { playSound: vi.fn().mockResolvedValue(undefined), playWord: vi.fn().mockResolvedValue(undefined), narrate: vi.fn().mockResolvedValue(undefined) };
}

describe('useSortGame', () => {
  it('records a correct placement and clears any message', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.placements).toEqual({ ball: 'b' });
    expect(result.current.message).toBeNull();
  });

  it('rejects a wrong placement, sets a gentle message, and replays the sound', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useSortGame({ round, audio }));
    act(() => { result.current.attemptPlace('ball', 's'); });
    expect(result.current.placements).toEqual({}); // not recorded
    expect(result.current.message).toMatch(/listen again/i);
    expect(audio.playSound).toHaveBeenCalledWith('s');
  });

  it('reports completion only when all items are correctly placed', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.isComplete).toBe(false);
    act(() => { result.current.attemptPlace('sun', 's'); });
    expect(result.current.isComplete).toBe(true);
  });

  it('exposes still-unplaced items', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    act(() => { result.current.attemptPlace('ball', 'b'); });
    expect(result.current.remainingItems.map((i) => i.id)).toEqual(['sun']);
  });

  it('counts wrong attempts but not correct ones', () => {
    const { result } = renderHook(() => useSortGame({ round, audio: fakeAudio() }));
    expect(result.current.wrongCount).toBe(0);
    act(() => { result.current.attemptPlace('ball', 's'); }); // wrong
    expect(result.current.wrongCount).toBe(1);
    act(() => { result.current.attemptPlace('ball', 'b'); }); // correct
    expect(result.current.wrongCount).toBe(1);
  });
});

describe('useSortGame onItemResult', () => {
  it('emits one result per item on the FIRST attempt only', () => {
    const results: Array<{ skillKey: string; correct: boolean; chosen: string; sound: string }> = [];
    const { result } = renderHook(() =>
      useSortGame({ round: roundOf(), audio: fakeAudio(), onItemResult: (r) => results.push(r) }),
    );
    act(() => { result.current.attemptPlace('moon', 's'); }); // wrong first attempt
    act(() => { result.current.attemptPlace('moon', 'm'); }); // retry — must NOT emit again
    act(() => { result.current.attemptPlace('sun', 's'); });  // correct first attempt

    expect(results).toEqual([
      { skillKey: 'sound:first:m', correct: false, chosen: 's', sound: 'm' }, // chosen = the basket dropped into
      { skillKey: 'sound:first:s', correct: true, chosen: 's', sound: 's' },
    ]);
  });
});
