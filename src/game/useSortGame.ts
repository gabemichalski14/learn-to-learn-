import { useMemo, useState } from 'react';
import type { SortRound, Placements, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { isCorrectPlacement, isRoundComplete } from '../domain/engine';

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

export function useSortGame(opts: { round: SortRound; audio: AudioPlayer }): UseSortGame {
  const { round, audio } = opts;
  const [placements, setPlacements] = useState<Placements>({});
  const [message, setMessage] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const byId = useMemo(() => {
    const m: Record<string, WordItem> = {};
    for (const i of round.items) m[i.id] = i;
    return m;
  }, [round]);

  function attemptPlace(wordId: string, basketSound: string): boolean {
    const item = byId[wordId];
    if (!item) return false;
    if (isCorrectPlacement(item, basketSound)) {
      setPlacements((prev) => ({ ...prev, [wordId]: basketSound }));
      setMessage(null);
      void audio.playWord(item);
      return true;
    }
    // No-anxiety: do not record, replay the basket sound, gently invite a retry.
    setMessage('Not quite — listen again and try another basket.');
    setWrongCount((c) => c + 1);
    void audio.playSound(basketSound);
    return false;
  }

  const remainingItems = round.items.filter((i) => placements[i.id] !== i.beginningSound);

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
