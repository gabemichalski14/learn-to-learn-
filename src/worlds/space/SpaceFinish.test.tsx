import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceFinish } from './SpaceFinish';

const noop = () => {};

describe('SpaceFinish (victory overlay)', () => {
  it('renders the hero rank, stars, best-time flag, and both actions', () => {
    render(<SpaceFinish ms={61000} best stars={3} title="GALACTIC LEGEND" onRestart={noop} onBack={noop} />);
    expect(screen.getByText('GALACTIC LEGEND')).toBeTruthy();
    expect(screen.getByText(/MISSION COMPLETE/i)).toBeTruthy();
    expect(screen.getByLabelText('3 of 3 stars')).toBeTruthy();
    expect(screen.getByText(/NEW BEST/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /fly again/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /back to level 2/i })).toBeTruthy();
  });

  it('hides the best-time flag when it is not a personal best', () => {
    render(<SpaceFinish ms={61000} best={false} stars={2} title="NEBULA MASTER" onRestart={noop} onBack={noop} />);
    expect(screen.queryByText(/NEW BEST/i)).toBeNull();
    expect(screen.getByLabelText('2 of 3 stars')).toBeTruthy();
  });
});
