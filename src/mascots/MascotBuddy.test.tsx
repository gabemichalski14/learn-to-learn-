import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MascotBuddy } from './MascotBuddy';
import { Pip } from './Pip';
import { Echo } from './Echo';

beforeEach(() => localStorage.clear());

describe('Pip & Echo', () => {
  it('render as accessible mascots', () => {
    render(<Pip expression="happy" />);
    expect(screen.getByRole('img', { name: /pip/i })).toBeTruthy();
    render(<Echo />);
    expect(screen.getByRole('img', { name: /echo/i })).toBeTruthy();
  });
});

describe('MascotBuddy', () => {
  // Pin randomness so the rare "trickster dodge" (≈18% of pokes) never fires
  // during these deterministic interaction tests.
  beforeEach(() => vi.spyOn(Math, 'random').mockReturnValue(0.99));
  afterEach(() => vi.restoreAllMocks());

  it('pops a warm, dismissible phrase when poked', () => {
    render(<MascotBuddy learnerId="test" />);
    const btn = screen.getByRole('button', { name: /says hi/i });
    fireEvent.click(btn);
    // a dismissible speech bubble appears (the phrase is random; a CTA is optional)
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeTruthy();
  });

  it('summons the Pip parade on rapid pokes (the easter egg)', () => {
    const { container } = render(<MascotBuddy learnerId="test" />);
    const btn = screen.getByRole('button', { name: /says hi/i });
    for (let i = 0; i < 4; i++) fireEvent.click(btn);
    expect(container.querySelector('.pip-parade')).toBeTruthy();
  });
});
