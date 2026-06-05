import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SortRound, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { useSortGame } from './useSortGame';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';

interface Props { round: SortRound; audio: AudioPlayer; }

export function SortGame({ round, audio }: Props) {
  const game = useSortGame({ round, audio });
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  function handleDragEnd(event: DragEndEvent) {
    const wordId = String(event.active.id);
    const basketSound = event.over ? String(event.over.id) : null;
    if (basketSound) game.attemptPlace(wordId, basketSound);
  }

  function placedIn(sound: string): WordItem[] {
    return round.items.filter((i) => game.placements[i.id] === sound);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sort-game">
        {game.isComplete ? (
          <div className="sort-game__done" role="status">All sorted! Great listening. 🎉</div>
        ) : (
          <p className="sort-game__prompt" role="status" aria-live="polite">
            {game.message ?? 'Drag each picture to the basket with its beginning sound.'}
          </p>
        )}

        <div className="sort-game__tray">
          {game.remainingItems.map((item) => (
            <PictureCard key={item.id} item={item} onActivate={() => game.replayWord(item)} />
          ))}
        </div>

        <div className="sort-game__baskets">
          {round.baskets.map((sound) => (
            <SoundBasket key={sound} sound={sound} onReplay={() => game.replaySound(sound)}>
              {placedIn(sound).map((item) => (
                <span key={item.id} className="placed" aria-label={item.label} role="img">
                  <span aria-hidden="true">{item.emoji}</span>
                </span>
              ))}
            </SoundBasket>
          ))}
        </div>
      </div>
    </DndContext>
  );
}
