import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LevelScene } from './LevelScene';

describe('LevelScene', () => {
  it('warm overlay opacity tracks heal, clamped to [0,1]', () => {
    const { container, rerender } = render(<LevelScene heal={0} warmth={0.9} />);
    const warm = () => container.querySelector('.level-scene__warm') as HTMLElement;
    expect(warm().style.opacity).toBe('0');
    rerender(<LevelScene heal={0.5} warmth={0.9} />);
    expect(warm().style.opacity).toBe('0.45');
    rerender(<LevelScene heal={5} warmth={0.9} />); // clamps
    expect(warm().style.opacity).toBe('0.9');
  });

  it('renders provided CC0 layers back→front', () => {
    const { container } = render(
      <LevelScene heal={1} layers={[{ src: 'far.png' }, { src: 'near.png', opacity: 0.5 }]} />,
    );
    expect(container.querySelectorAll('.level-scene__layer')).toHaveLength(2);
  });

  it('works with no layers (overlay only)', () => {
    const { container } = render(<LevelScene heal={0.3} />);
    expect(container.querySelectorAll('.level-scene__layer')).toHaveLength(0);
    expect(container.querySelector('.level-scene__warm')).toBeTruthy();
  });
});
