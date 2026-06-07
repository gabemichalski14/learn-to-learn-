import { describe, it, expect, beforeEach } from 'vitest';
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
  it('peeks, then pops up with a warm nudge + a learning CTA when poked', () => {
    render(<MascotBuddy />);
    const btn = screen.getByRole('button', { name: /says hi/i });
    fireEvent.click(btn);
    // a dismissible nudge with a call-to-action toward learning appears
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(/→/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeTruthy();
  });
});
