import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GardenPlantings } from './GardenPlantings';
import { __resetStableReadCache } from '../../data/stableRead';

const L = 'garden-plantings-test';
beforeEach(() => { localStorage.clear(); __resetStableReadCache(); });

function seedMastery(skill: string, correct: number, attempts: number) {
  const recent = Array.from({ length: Math.min(attempts, 10) }, (_, i) => (i < correct ? 1 : 0));
  localStorage.setItem(`ll:${L}:mastery`, JSON.stringify({ [skill]: { attempts, correct, recent, lastSeen: 1000 } }));
}

describe('GardenPlantings', () => {
  it('shows an empty state with a path to Space when nothing is mastered', () => {
    render(<GardenPlantings learnerId={L} />);
    expect(screen.getByText(/No sound flowers yet/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /space patrol/i })).toBeTruthy();
  });

  it('renders a named planting and a one-time bloom beat that can be dismissed', () => {
    seedMastery('sound:first:m', 6, 6);
    render(<GardenPlantings learnerId={L} />);
    // appears both as the planting chip and (bold) inside the bloom beat
    expect(screen.getAllByText('the /m/ marigold').length).toBeGreaterThan(0);
    expect(screen.getByText(/A new flower opened/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Lovely/i }));
    expect(screen.queryByText(/A new flower opened/i)).toBeNull(); // acknowledged, gone
  });

  it("reveals Pip's praise when a planting is tapped", () => {
    seedMastery('sound:first:m', 6, 6);
    render(<GardenPlantings learnerId={L} />);
    fireEvent.click(screen.getByRole('button', { name: /the \/m\/ marigold/i }));
    expect(screen.getByText(/You grew this/i)).toBeTruthy();
  });
});
