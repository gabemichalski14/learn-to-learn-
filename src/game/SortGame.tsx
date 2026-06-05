import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SortRound, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { useSortGame } from './useSortGame';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';
import { BookTree } from './BookTree';

interface Props { round: SortRound; audio: AudioPlayer; onPlayAgain?: () => void; }

export function SortGame({ round, audio, onPlayAgain }: Props) {
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

  const total = round.items.length;
  const correct = round.items.filter((i) => game.placements[i.id] === i.beginningSound).length;
  const progress = total ? correct / total : 0;

  // One persistent live region whose text changes (reliable screen-reader announcement).
  const status = game.isComplete
    ? 'You grew the whole tree! Great listening.'
    : (game.message ?? 'Tap a basket to hear its sound, then drag each picture where it belongs.');

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sort-game">
        <BookTree className="sort-game__tree" progress={progress} bloom={game.isComplete} />

        <p
          className={`sort-game__status${game.isComplete ? ' sort-game__status--celebrate' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>

        {game.isComplete && onPlayAgain && (
          <button type="button" className="btn-primary" onClick={onPlayAgain}>
            Play again 🌱
          </button>
        )}

        {!game.isComplete && (
          <div className="sort-game__tray">
            {game.remainingItems.map((item) => (
              <PictureCard key={item.id} item={item} onActivate={() => game.replayWord(item)} />
            ))}
          </div>
        )}

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
