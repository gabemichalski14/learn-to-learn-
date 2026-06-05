import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { WordItem } from '../domain/types';

interface Props { item: WordItem; onActivate?: () => void; }

export function PictureCard({ item, onActivate }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const base = CSS.Translate.toString(transform) ?? '';
  // While dragging the card "picks up": scale + tilt, layered onto dnd-kit's translate.
  const style = {
    transform: isDragging ? `${base} scale(1.1) rotate(-4deg)` : base || undefined,
    opacity: isDragging ? 0.96 : 1,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`picture-card${isDragging ? ' is-dragging' : ''}`}
      aria-label={item.label}
      {...listeners}
      {...attributes}
      role="img"
      onClick={onActivate}
    >
      <span aria-hidden="true" className="picture-card__emoji">{item.emoji}</span>
    </button>
  );
}
