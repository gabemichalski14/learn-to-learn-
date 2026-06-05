import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortGame } from './SortGame';
import type { SortRound } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';

const round: SortRound = {
  baskets: ['b', 's'],
  items: [
    { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' },
    { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' },
  ],
};
const audio: AudioPlayer = { playSound: vi.fn().mockResolvedValue(undefined), playWord: vi.fn().mockResolvedValue(undefined) };

describe('SortGame', () => {
  it('renders a basket per target sound and all unplaced pictures', () => {
    render(<SortGame round={round} audio={audio} />);
    expect(screen.getAllByRole('button', { name: /replay the .* sound/i })).toHaveLength(2);
    expect(screen.getByRole('img', { name: /ball/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /sun/i })).toBeInTheDocument();
  });

  it('plays the word audio when a picture is tapped', async () => {
    render(<SortGame round={round} audio={audio} />);
    screen.getByRole('img', { name: /ball/i }).click();
    expect(audio.playWord).toHaveBeenCalled();
  });
});
