import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceLevelHub } from './SpaceLevelHub';

describe('SpaceLevelHub', () => {
  it('renders the Space Patrol hub for Level 2 with its games', () => {
    render(<SpaceLevelHub level={2} learnerId="test" />);
    expect(screen.getByText(/Space Patrol/i)).toBeTruthy();
    expect(screen.getByText('Vowel Patrol')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Play Vowel Patrol/i })).toBeTruthy();
  });
});
