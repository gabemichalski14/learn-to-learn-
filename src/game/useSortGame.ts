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
  onItemResult?: (r: { skillKey: string; correct: boolean }) => void;
}): UseSortGame {
  const { round, audio, onItemResult } = opts;
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
      if (sound) onItemResult?.({ skillKey: skillKeyForSound(sound, target), correct });
    }
    if (isCorrectPlacement(item, basketSound, round.target ?? 'beginning')) {
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
