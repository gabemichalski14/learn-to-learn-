import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('renders the three age-band options and marks the active one', () => {
    render(<ThemeSwitcher value="l2l" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: /playful/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: /^l2l$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /clean/i })).toBeInTheDocument();
  });

  it('reports the chosen theme', () => {
    const onSelect = vi.fn();
    render(<ThemeSwitcher value="l2l" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /clean/i }));
    expect(onSelect).toHaveBeenCalledWith('grownup');
  });
});
