import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';

describe('PictureCard', () => {
  it('renders the picture with an accessible name from the label', () => {
    render(
      <DndContext>
        <PictureCard item={{ id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' }} />
      </DndContext>,
    );
    expect(screen.getByRole('img', { name: /ball/i })).toBeInTheDocument();
  });

  it('plays its word when activated (tap/click)', () => {
    const onActivate = vi.fn();
    render(
      <DndContext>
        <PictureCard
          item={{ id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' }}
          onActivate={onActivate}
        />
      </DndContext>,
    );
    fireEvent.click(screen.getByRole('img', { name: /ball/i }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });
});

describe('SoundBasket', () => {
  it('exposes a keyboard-reachable control to hear the sound (no letter shown)', () => {
    render(
      <DndContext>
        <SoundBasket sound="b" onReplay={() => {}}>{null}</SoundBasket>
      </DndContext>,
    );
    const control = screen.getByRole('button', { name: /sound/i });
    expect(control).toBeInTheDocument();
    expect(control.textContent).not.toMatch(/b/i); // never names the letter
  });

  it('plays the sound when the speaker is pressed', () => {
    const onReplay = vi.fn();
    render(
      <DndContext>
        <SoundBasket sound="b" onReplay={onReplay}>{null}</SoundBasket>
      </DndContext>,
    );
    fireEvent.click(screen.getByRole('button', { name: /sound/i }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});
