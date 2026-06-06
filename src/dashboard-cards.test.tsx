import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AreasToImprove } from './AreasToImprove';
import { NextUp } from './NextUp';
import { recordItem } from './mastery/mastery';
import { setPlacement } from './mastery/placement';

const L = 'ui-test-learner';
beforeEach(() => localStorage.clear());

describe('AreasToImprove', () => {
  it('shows an empty-state prompt when there is no data', () => {
    render(<AreasToImprove learnerId={L} />);
    expect(screen.getByText(/personalized focus areas will appear/i)).toBeTruthy();
  });

  it('lists a weak, rated skill with a Practice button (the full loop renders)', () => {
    for (let i = 0; i < 5; i++) recordItem(L, 'sound:first:b', false);
    render(<AreasToImprove learnerId={L} />);
    expect(screen.getByText('the /b/ sound at the start')).toBeTruthy();
    expect(screen.getByText(/Practice this/i)).toBeTruthy();
  });
});

describe('NextUp', () => {
  it('renders upcoming lessons from the learner placement', () => {
    setPlacement(L, 2, 2);
    render(<NextUp learnerId={L} />);
    expect(screen.getByText(/Next up/i)).toBeTruthy();
    expect(screen.getByText('Lesson 3')).toBeTruthy();
  });
});
