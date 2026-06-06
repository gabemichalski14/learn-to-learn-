import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SpaceSpecimen } from './creatureIcons';
import { shortVowelWords } from '../../content/packs/shortVowelWords';

describe('SpaceSpecimen / creature icons', () => {
  it('has a bespoke SVG icon for every Vowel Patrol word (no emoji fallback)', () => {
    for (const w of shortVowelWords.words) {
      const { container } = render(<SpaceSpecimen id={w.id} emoji={w.emoji} />);
      // a real icon renders the <svg> art; the fallback renders .sg-spec__emoji
      expect(container.querySelector('svg.sg-spec__art'), `missing icon for "${w.id}"`).toBeTruthy();
      expect(container.querySelector('.sg-spec__emoji')).toBeNull();
    }
  });

  it('falls back to the emoji for an unknown word id', () => {
    const { container } = render(<SpaceSpecimen id="__nope__" emoji="🛸" />);
    expect(container.querySelector('svg.sg-spec__art')).toBeNull();
    expect(container.querySelector('.sg-spec__emoji')?.textContent).toBe('🛸');
  });
});
