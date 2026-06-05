import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WordItem } from '../domain/types';

interface Props { item: WordItem; }

export function PictureCard({ item }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className="picture-card"
      aria-label={item.label}
      {...listeners}
      {...attributes}
      role="img"
    >
      <span aria-hidden="true" className="picture-card__emoji">{item.emoji}</span>
    </button>
  );
}
