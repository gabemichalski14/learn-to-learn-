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
  it('pops a warm, dismissible phrase when poked', () => {
    render(<MascotBuddy />);
    const btn = screen.getByRole('button', { name: /says hi/i });
    fireEvent.click(btn);
    // a dismissible speech bubble appears (the phrase is random; a CTA is optional)
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeTruthy();
  });
});
