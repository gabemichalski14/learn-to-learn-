import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface Props { sound: string; onReplay: () => void; catching?: boolean; children: ReactNode; }

/**
 * The sound IS the basket. A big speaker sits at the center; tapping anywhere on
 * the basket (or pressing the speaker with a keyboard) replays its target sound.
 * No letter is ever shown — Level 1 is auditory. `catching` triggers a quick
 * bounce when the basket receives a correct picture.
 */
export function SoundBasket({ sound, onReplay, catching = false, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: sound });
  return (
    <div
      ref={setNodeRef}
      className={`sound-basket${isOver ? ' sound-basket--over' : ''}${catching ? ' is-catching' : ''}`}
      onClick={onReplay}
    >
      <button
        type="button"
        className="sound-basket__speaker"
        aria-label="Hear this basket's sound"
        onClick={(e) => {
          e.stopPropagation();
          onReplay();
        }}
      >
        <span aria-hidden="true">🔊</span>
      </button>
      <span className="sound-basket__hint" aria-hidden="true">tap to hear</span>
      <div className="sound-basket__items">{children}</div>
    </div>
  );
}
