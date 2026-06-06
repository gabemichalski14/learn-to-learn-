import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SpaceSpecimen } from './creatureIcons';
import { shortVowelWords } from '../../content/packs/shortVowelWords';
import { everydayObjects } from '../../content/packs/everydayObjects';
import { everydayEndings } from '../../content/packs/everydayEndings';

const packs = [shortVowelWords, everydayObjects, everydayEndings];

describe('SpaceSpecimen / creature icons', () => {
  it('has a bespoke SVG icon for every Level 2 word (no emoji fallback)', () => {
    for (const pack of packs) {
      for (const w of pack.words) {
        const { container } = render(<SpaceSpecimen id={w.id} label={w.label} emoji={w.emoji} />);
        expect(container.querySelector('svg.sg-spec__art'), `missing icon for "${w.id}" (${w.label})`).toBeTruthy();
        expect(container.querySelector('.sg-spec__emoji')).toBeNull();
      }
    }
  });

  it('falls back to the emoji for an unknown word', () => {
    const { container } = render(<SpaceSpecimen id="__nope__" label="__nope__" emoji="🛸" />);
    expect(container.querySelector('svg.sg-spec__art')).toBeNull();
    expect(container.querySelector('.sg-spec__emoji')?.textContent).toBe('🛸');
  });
});
