import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { LevelEmblem } from './LevelEmblem';

describe('LevelEmblem', () => {
  it('renders the painted level PNG by default', () => {
    const { container } = render(<LevelEmblem level={2} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/ui/level-2.png');
  });
  it('falls back to the bespoke space SVG for level 2 when the PNG is missing', () => {
    const { container } = render(<LevelEmblem level={2} />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('.level-emblem--space')).toBeTruthy();
    expect(container.querySelector('.le-rocket')).toBeTruthy();
  });
  it('falls back to a themed emoji glyph for other levels', () => {
    const { container } = render(<LevelEmblem level={1} />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('.level-emblem--space')).toBeNull();
    expect(container.textContent).toContain('👂');
  });
});
