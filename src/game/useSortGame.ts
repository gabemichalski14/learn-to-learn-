import { useMemo, useRef, useState } from 'react';
import type { SortRound, Placements, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { isCorrectPlacement, isRoundComplete, soundOf } from '../domain/engine';
import { skillKeyForSound } from '../mastery/skills';

export interface UseSortGame {
  placements: Placements;
  message: string | null;
  isComplete: boolean;
  remainingItems: WordItem[];
  /** Increments on each wrong attempt — drives the falling-leaf feedback. */
  wrongCount: number;
  attemptPlace: (wordId: string, basketSound: string) => boolean;
  replaySound: (soundId: string) => void;
  replayWord: (item: WordItem) => void;
}

export function useSortGame(opts: {
  round: SortRound;
  audio: AudioPlayer;
  /** Fired ONCE per word, on its first attempt (so `correct` is the first-try
   *  result). `chosen` is the basket sound dropped into — the confusion when
   *  wrong; `sound` is the correct sound. */
  onItemResult?: (r: { skillKey: string; correct: boolean; chosen: string; sound: string }) => void;
  /** Fired on each correct placement; `complete` is true when it finishes the round. */
  onCorrect?: (r: { complete: boolean }) => void;
  /** Fired on each wrong attempt (including retries). */
  onWrong?: () => void;
}): UseSortGame {
  const { round, audio, onItemResult, onCorrect, onWrong } = opts;
  const [placements, setPlacements] = useState<Placements>({});
  const [message, setMessage] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const reported = useRef<Set<string>>(new Set());

  const byId = useMemo(() => {
    const m: Record<string, WordItem> = {};
    for (const i of round.items) m[i.id] = i;
    return m;
  }, [round]);

  function attemptPlace(wordId: string, basketSound: string): boolean {
    const item = byId[wordId];
    if (!item) return false;
    const target = round.target ?? 'beginning';
    if (!reported.current.has(wordId)) {
      reported.current.add(wordId);
      const sound = soundOf(item, target);
      const correct = isCorrectPlacement(item, basketSound, target);
      if (sound) onItemResult?.({ skillKey: skillKeyForSound(sound, target), correct, chosen: basketSound, sound });
    }
    if (isCorrectPlacement(item, basketSound, target)) {
      const next = { ...placements, [wordId]: basketSound };
      setPlacements(next);
      setMessage(null);
      void audio.playWord(item);
      // Spawn celebration from the event path (not an effect) so callers don't
      // need a state-watching effect to react to the placement.
      onCorrect?.({ complete: isRoundComplete(round, next) });
      return true;
    }
    // No-anxiety: do not record, replay the basket sound, gently invite a retry.
    setMessage('Not quite — listen again and try another basket.');
    setWrongCount((c) => c + 1);
    void audio.playSound(basketSound);
    onWrong?.();
    return false;
  }

  const target = round.target ?? 'beginning';
  const remainingItems = round.items.filter((i) => placements[i.id] !== soundOf(i, target));

  return {
    placements,
    message,
    isComplete: isRoundComplete(round, placements),
    remainingItems,
    wrongCount,
    attemptPlace,
    replaySound: (soundId) => void audio.playSound(soundId),
    replayWord: (item) => void audio.playWord(item),
  };
}
