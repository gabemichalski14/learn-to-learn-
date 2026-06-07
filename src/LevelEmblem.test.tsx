import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LevelEmblem } from './LevelEmblem';

describe('LevelEmblem', () => {
  it('renders the bespoke animated space emblem for level 2', () => {
    const { container } = render(<LevelEmblem level={2} />);
    expect(container.querySelector('.level-emblem--space')).toBeTruthy();
    expect(container.querySelector('.le-rocket')).toBeTruthy();
  });
  it('renders a themed glyph for other levels', () => {
    const { container } = render(<LevelEmblem level={1} />);
    expect(container.querySelector('.level-emblem--space')).toBeNull();
    expect(container.textContent).toContain('👂');
  });
});
