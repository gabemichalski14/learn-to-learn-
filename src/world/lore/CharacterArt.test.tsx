import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CharacterArt } from './CharacterArt';

describe('CharacterArt', () => {
  it('renders the emoji placeholder (transforming) when no art is set', () => {
    const { container } = render(<CharacterArt emoji="🌱" heal={0} label="Moss" />);
    const el = container.querySelector('.char-art') as HTMLElement;
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('🌱');
    expect(el.className).toContain('char-art--s0'); // scattered at heal 0
  });

  it('renders the base image when art.image is set, with the heal stage class', () => {
    const { container } = render(
      <CharacterArt emoji="🌱" heal={1} art={{ image: 'moss.png' }} label="Moss" />,
    );
    const img = container.querySelector('img.char-art') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('moss.png');
    expect(img.className).toContain('char-art--s3'); // whole at heal 1
  });

  it('swaps to the matching expression frame on a mood', () => {
    const { container } = render(
      <CharacterArt emoji="🌱" heal={1} mood="cheer" art={{ image: 'moss.png', frames: { cheer: 'moss-cheer.png' } }} />,
    );
    const img = container.querySelector('img.char-art') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('moss-cheer.png');
    expect(img.className).toContain('char-art--cheer');
  });

  it('falls back to the base image when no frame exists for the mood', () => {
    const { container } = render(
      <CharacterArt emoji="🌱" heal={1} mood="wobble" art={{ image: 'moss.png', frames: { cheer: 'c.png' } }} />,
    );
    const img = container.querySelector('img.char-art') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('moss.png');
  });
});
