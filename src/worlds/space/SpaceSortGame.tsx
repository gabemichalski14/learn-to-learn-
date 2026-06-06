import { useRef, useState } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { SortRound, WordItem } from '../../domain/types';
import type { AudioPlayer } from '../../audio/audioPlayer';
import { useSortGame } from '../../game/useSortGame';
import { recordItem } from '../../mastery/mastery';
import { recordFinish, formatTime } from '../../progress';
import { logSession, noteRound } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { navigate } from '../../router';
import { SpaceBackdrop, ScoutDrone } from './SpaceArt';
import './space.css';

interface Props {
  round: SortRound;
  audio: AudioPlayer;
  roundIndex?: number;
  totalRounds?: number;
  sessionId?: number;
  learnerId?: string;
  gameId?: string;
  sessionStartAt?: number;
  onAdvance?: () => void;
  onRestart?: () => void;
}

/** A vowel "planet" — a droppable basket. Tapping it replays its sound. */
function Planet({ vowel, catching, onReplay }: { vowel: string; catching: boolean; onReplay: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: vowel });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`sg-planet v-${vowel}${isOver ? ' sg-planet--over' : ''}${catching ? ' sg-planet--catch' : ''}`}
      onClick={onReplay}
      aria-label={`Planet for the ${vowel} sound — tap to hear it`}
    >
      <span className="lab">{vowel}</span>
    </button>
  );
}

/** A space creature — a draggable picture. Tapping it replays its word. */
function Creature({ item, onReplay }: { item: WordItem; onReplay: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = {
    transform: isDragging
      ? `${CSS.Translate.toString(transform) ?? ''} scale(1.12) rotate(-3deg)`
      : CSS.Translate.toString(transform) ?? undefined,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`sg-creature${isDragging ? ' is-dragging' : ''}`}
      aria-label={item.label}
      onClick={onReplay}
      {...listeners}
      {...attributes}
    >
      <span aria-hidden="true">{item.emoji}</span>
    </button>
  );
}

/** Vowel Patrol (Space Patrol world) — sort creatures to the planet of their
 *  middle vowel. Drop-in for the platform's sort screen; reuses useSortGame. */
export function SpaceSortGame({
  round, audio, roundIndex = 0, totalRounds = 1, sessionId = 0,
  learnerId = 'guest', gameId = 'middle-sounds', sessionStartAt, onAdvance, onRestart,
}: Props) {
  const [startAt] = useState(() => sessionStartAt ?? Date.now());
  const [catching, setCatching] = useState<string | null>(null);
  const [finish, setFinish] = useState<{ ms: number; best: boolean } | null>(null);
  const handledRef = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const total = round.items.length;
  const isLast = roundIndex >= totalRounds - 1;

  const game = useSortGame({
    round,
    audio,
    onItemResult: ({ skillKey, correct }) => recordItem(learnerId, skillKey, correct),
    onCorrect: ({ complete }) => finishRoundIfComplete(complete),
  });

  const placed = total - game.remainingItems.length;
  const roundDone = game.isComplete;

  // Hoisted named function so the impure Date.now()/new Date() aren't treated as
  // called-during-render; this only runs on the placement that finishes a round.
  function finishRoundIfComplete(complete: boolean) {
    if (!complete || handledRef.current) return;
    handledRef.current = true;
    const totals = noteRound(sessionId, game.wrongCount, total);
    if (!isLast) return;
    const durationMs = Math.max(0, Date.now() - startAt);
    const res = recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: gameId,
      level: 2,
      startedAt: new Date(startAt).toISOString(),
      endedAt: new Date().toISOString(),
      durationMs,
      rounds: totalRounds,
      items: totals.items,
      wrongAttempts: totals.wrong,
      accuracy: totals.items > 0 ? totals.items / (totals.items + totals.wrong) : 1,
    });
    awardForSession(learnerId);
    setFinish({ ms: durationMs, best: res.isBest });
  }

  function handleDragEnd(e: DragEndEvent) {
    const wordId = String(e.active.id);
    const basket = e.over ? String(e.over.id) : null;
    if (!basket) return;
    if (game.attemptPlace(wordId, basket)) {
      setCatching(basket);
      window.setTimeout(() => setCatching((c) => (c === basket ? null : c)), 500);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="sg">
        <SpaceBackdrop />

        <div className="sg-hud">
          <button type="button" className="sg-back" onClick={() => navigate('#/level/2')}>← Back</button>
          <span className="sg-badge"><span className="dot" /> Vowel Patrol · Sector {roundIndex + 1}</span>
          <span className="sg-seg" aria-label={`Sector ${roundIndex + 1} of ${totalRounds}`}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <i key={i} className={i <= roundIndex ? 'on' : ''} />
            ))}
          </span>
        </div>

        <p className="sg-ask">Hear each creature, then send it to the planet of its <b>middle sound</b>.</p>

        <div className="sg-planets">
          {round.baskets.map((v) => (
            <Planet key={v} vowel={v} catching={catching === v} onReplay={() => game.replaySound(v)} />
          ))}
        </div>

        <div className="sg-tray">
          {game.remainingItems.map((it) => (
            <Creature key={it.id} item={it} onReplay={() => game.replayWord(it)} />
          ))}
        </div>

        <p className="sg-status" role="status">
          {game.message ?? (placed > 0 ? `${placed} of ${total} routed — keep going!` : 'Drag a creature to its planet.')}
        </p>

        <ScoutDrone />

        {roundDone && !isLast && !finish && (
          <div className="sg-finish">
            <div className="sg-finish__card">
              <p className="sg-finish__title">Sector clear! 🛰️</p>
              <p className="sg-finish__sub">Nice routing. Ready for the next sector?</p>
              <button type="button" className="sg-btn" onClick={onAdvance}>Next sector →</button>
            </div>
          </div>
        )}

        {finish && (
          <div className="sg-finish">
            <div className="sg-finish__card">
              <p className="sg-finish__title">Patrol complete! 🌟</p>
              <p className="sg-finish__sub">
                Finished in {formatTime(finish.ms)}{finish.best ? ' — new best time!' : ''}
              </p>
              <button type="button" className="sg-btn" onClick={onRestart} style={{ marginRight: 8 }}>Play again</button>
              <button type="button" className="sg-back" onClick={() => navigate('#/level/2')}>Back to Level 2</button>
            </div>
          </div>
        )}
      </main>
    </DndContext>
  );
}
