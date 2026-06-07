import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TapItOutGame } from './TapItOutGame';

beforeEach(() => localStorage.clear());

describe('TapItOutGame (Sound Garden)', () => {
  it('renders the Tap It Out screen with the tap pad, hear button, and guide', () => {
    render(<TapItOutGame learnerId="L1" />);
    expect(screen.getByText(/Tap It Out/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /tap for one sound/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /hear it/i })).toBeTruthy();
    expect(screen.getByText(/I'm Sprout/i)).toBeTruthy();
  });
});
