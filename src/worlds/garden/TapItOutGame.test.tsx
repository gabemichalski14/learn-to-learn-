import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TapItOutGame } from './TapItOutGame';

beforeEach(() => localStorage.clear());

describe('TapItOutGame (Sound Garden)', () => {
  it('renders the Tap It Out screen with the tap pad, hear button, and directions', () => {
    render(<TapItOutGame learnerId="L1" />);
    expect(screen.getByText(/Tap It Out/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /tap for one sound/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /hear it/i })).toBeTruthy();
    // The always-visible directions carry the "how to play" (the old floating
    // Sprout helper was removed — Chip + the inline prompt teach the task now).
    expect(screen.getByText(/how many sounds do you hear/i)).toBeTruthy();
  });
});
