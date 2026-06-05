import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ReplayButton } from './ReplayButton';

interface Props { sound: string; onReplay: () => void; children: ReactNode; }

export function SoundBasket({ sound, onReplay, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: sound });
  return (
    <div ref={setNodeRef} className={`sound-basket${isOver ? ' sound-basket--over' : ''}`}>
      <div className="sound-basket__head">
        <ReplayButton label={`Replay the ${sound} sound`} onReplay={onReplay} />
      </div>
      <div className="sound-basket__items">{children}</div>
    </div>
  );
}
