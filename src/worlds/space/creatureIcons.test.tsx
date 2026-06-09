import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SpaceSpecimen } from './creatureIcons';
import { shortVowelWords } from '../../content/packs/shortVowelWords';
import { everydayObjects } from '../../content/packs/everydayObjects';
import { everydayEndings } from '../../content/packs/everydayEndings';

const packs = [shortVowelWords, everydayObjects, everydayEndings];

describe('SpaceSpecimen', () => {
  it('renders a painted word picture inside the holo-capsule for every Level 2 word', () => {
    for (const pack of packs) {
      for (const w of pack.words) {
        const { container } = render(<SpaceSpecimen id={w.id} label={w.label} emoji={w.emoji} />);
        expect(container.querySelector('.sg-spec'), `no capsule for "${w.id}"`).toBeTruthy();
        const img = container.querySelector('img.sg-spec__art') as HTMLImageElement | null;
        expect(img, `no picture for "${w.id}" (${w.label})`).toBeTruthy();
        // keyed by the spoken word (label), matching the audio clips
        expect(img!.getAttribute('src')).toContain('/images/words/');
      }
    }
  });

  it('keys the image by the spoken word (so e-cat and cat share one cat.png)', () => {
    const { container } = render(<SpaceSpecimen id="e-cat" label="cat" emoji="🐱" />);
    const img = container.querySelector('img.sg-spec__art') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/images/words/cat.png');
  });
});
