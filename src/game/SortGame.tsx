import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SortRound, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { useSortGame } from './useSortGame';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';
import { BookTree } from './BookTree';

interface Props {
  round: SortRound;
  audio: AudioPlayer;
  /** 0-based index of this page within the session. */
  roundIndex?: number;
  /** How many pages are in the session. */
  totalRounds?: number;
  /** Advance to the next page (shown when a non-final page is done). */
  onAdvance?: () => void;
  /** Start a fresh session (shown when the final page is done). */
  onRestart?: () => void;
}

export function SortGame({ round, audio, roundIndex = 0, totalRounds = 1, onAdvance, onRestart }: Props) {
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
  const withinRound = total ? correct / total : 0;
  const roundDone = game.isComplete;
  const isLastRound = roundIndex >= totalRounds - 1;

  // The tree grows across the WHOLE session, blooming only when the last page is done.
  const sessionProgress = (roundIndex + withinRound) / totalRounds;
  const bloom = roundDone && isLastRound;

  // One persistent live region whose text changes (reliable screen-reader announcement).
  const status = roundDone
    ? (isLastRound ? 'You grew the whole tree! Great listening.' : 'Nice listening! Ready for the next page?')
    : (game.message ?? 'Tap a basket to hear its sound, then drag each picture where it belongs.');

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sort-game">
        <BookTree className="sort-game__tree" progress={sessionProgress} bloom={bloom} />

        <p
          className={`sort-game__status${roundDone ? ' sort-game__status--celebrate' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>

        {!roundDone && (
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

        {totalRounds > 1 && (
          <div className="session-dots" role="img" aria-label={`Page ${roundIndex + 1} of ${totalRounds}`}>
            {Array.from({ length: totalRounds }).map((_, i) => {
              const done = i < roundIndex || (i === roundIndex && roundDone);
              const current = i === roundIndex && !roundDone;
              return (
                <span
                  key={i}
                  className={`session-dot${done ? ' session-dot--done' : ''}${current ? ' session-dot--current' : ''}`}
                />
              );
            })}
          </div>
        )}

        {roundDone && !isLastRound && onAdvance && (
          <button type="button" className="btn-primary" onClick={onAdvance}>
            Next page →
          </button>
        )}
        {roundDone && isLastRound && onRestart && (
          <button type="button" className="btn-primary" onClick={onRestart}>
            Play again 🌱
          </button>
        )}
      </div>
    </DndContext>
  );
}
