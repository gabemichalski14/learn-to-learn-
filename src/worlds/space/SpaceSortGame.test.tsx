import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceSortGame } from './SpaceSortGame';
import type { SortRound } from '../../domain/types';
import type { AudioPlayer } from '../../audio/audioPlayer';

const fakeAudio = (): AudioPlayer => ({
  playSound: vi.fn().mockResolvedValue(undefined),
  playWord: vi.fn().mockResolvedValue(undefined),
});

const round: SortRound = {
  baskets: ['a', 'i'],
  target: 'medial',
  items: [
    { id: 'cat', label: 'cat', medialVowel: 'a', emoji: '🐱' },
    { id: 'pig', label: 'pig', medialVowel: 'i', emoji: '🐷' },
  ],
};

beforeEach(() => localStorage.clear());

describe('SpaceSortGame (Vowel Patrol)', () => {
  it('renders the Space world: HUD, vowel planets, and draggable creatures', () => {
    render(<SpaceSortGame round={round} audio={fakeAudio()} totalRounds={1} />);
    expect(screen.getByText(/Vowel Patrol/i)).toBeTruthy();
    // a planet for each round basket (tappable to hear its sound)
    expect(screen.getByLabelText(/planet for the a sound/i)).toBeTruthy();
    expect(screen.getByLabelText(/planet for the i sound/i)).toBeTruthy();
    // a draggable creature per item
    expect(screen.getByLabelText('cat')).toBeTruthy();
    expect(screen.getByLabelText('pig')).toBeTruthy();
  });

  it('shows a custom title when provided (Blast Off)', () => {
    render(<SpaceSortGame round={round} audio={fakeAudio()} totalRounds={1} title="Blast Off" target="beginning" />);
    expect(screen.getByText(/Blast Off/i)).toBeTruthy();
  });

  it('shows the learner name chip when learnerName is provided', () => {
    render(<SpaceSortGame round={round} audio={fakeAudio()} totalRounds={1} learnerName="Mia" />);
    expect(screen.getByText(/Mia/i)).toBeTruthy();
  });
});
