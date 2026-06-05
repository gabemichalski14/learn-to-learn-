import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { ReplayButton } from './ReplayButton';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';

describe('ReplayButton', () => {
  it('calls onReplay when clicked', async () => {
    const onReplay = vi.fn();
    render(<ReplayButton label="Replay the b sound" onReplay={onReplay} />);
    await userEvent.click(screen.getByRole('button', { name: /replay the b sound/i }));
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});

describe('PictureCard', () => {
  it('renders the picture with an accessible name from the label', () => {
    render(
      <DndContext>
        <PictureCard item={{ id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' }} />
      </DndContext>,
    );
    expect(screen.getByRole('img', { name: /ball/i })).toBeInTheDocument();
  });
});

describe('SoundBasket', () => {
  it('renders a replay control for its sound', () => {
    render(
      <DndContext>
        <SoundBasket sound="b" onReplay={() => {}}>{null}</SoundBasket>
      </DndContext>,
    );
    expect(screen.getByRole('button', { name: /sound/i })).toBeInTheDocument();
  });
});
