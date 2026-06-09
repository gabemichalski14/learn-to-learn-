import { useMemo, useState } from 'react';
import { generateSortRound, availableSounds } from './domain/engine';
import type { Pack, SoundTarget, SortRound } from './domain/types';
import type { AudioPlayer } from './audio/audioPlayer';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { shortVowelWords } from './content/packs/shortVowelWords';
import { createRecordedAudioPlayer } from './audio/recordedAudioPlayer';
import { SpaceSortGame } from './worlds/space/SpaceSortGame';
import { parseSkillKey } from './mastery/skills';
import { loadMastery, weakestSoundForTarget } from './mastery/mastery';
import { getLearner } from './profiles';

const TOTAL_ROUNDS = 5;
const ITEMS_PER_ROUND = 6;

interface GameConfig {
  pack: Pack;
  target: SoundTarget;
  title: string;
}

const GAMES: Record<string, GameConfig> = {
  'beginning-sounds': { pack: everydayObjects, target: 'beginning', title: 'Blast Off' },
  'ending-sounds': { pack: everydayEndings, target: 'ending', title: 'Touchdown' },
  'middle-sounds': { pack: shortVowelWords, target: 'medial', title: 'Vowel Patrol' },
};

interface Props {
  learnerId: string;
  gameId: string;
  focus?: string;
}

/** Owns the per-session clock for a themed-world game (survives page changes,
 *  resets on a new session); inner game remounts per page to reset its state. */
function SpacePlaySession({ round, audio, roundIndex, sessionId, learnerId, gameId, target, title, learnerName, needSound, onAdvance, onRestart }: {
  round: SortRound; audio: AudioPlayer; roundIndex: number; sessionId: number; learnerId: string; gameId: string;
  target: SoundTarget; title: string; learnerName?: string; needSound?: string;
  onAdvance: () => void; onRestart: () => void;
}) {
  const [sessionStartAt] = useState(() => Date.now());
  return (
    <SpaceSortGame
      key={`${sessionId}-${roundIndex}`}
      round={round}
      audio={audio}
      roundIndex={roundIndex}
      totalRounds={TOTAL_ROUNDS}
      sessionId={sessionId}
      learnerId={learnerId}
      gameId={gameId}
      sessionStartAt={sessionStartAt}
      target={target}
      title={title}
      learnerName={learnerName}
      needSound={needSound}
      onAdvance={onAdvance}
      onRestart={onRestart}
    />
  );
}

/** A sound-sorting game screen — driven by which game id is in the route. Every
 *  game renders in its themed full-screen world (the only render path). */
export function GameScreen({ learnerId, gameId, focus }: Props) {
  const config = GAMES[gameId] ?? GAMES['beginning-sounds'];
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);

  // A fresh session whenever the game changes (state-during-render pattern).
  const [prevGameId, setPrevGameId] = useState(gameId);
  if (gameId !== prevGameId) {
    setPrevGameId(gameId);
    setSessionId((s) => s + 1);
    setRoundIndex(0);
  }

  // The sound this session leans on. An explicit `focus` (from "Areas to improve")
  // wins; otherwise we gently auto-weight a NORMAL session toward the learner's
  // weakest sound for this target — data-driven, personalized practice. Computed
  // once per session (mastery read inside the memo, frozen by sessionId) so it
  // never shifts the round mid-play.
  const focusSound = useMemo(() => {
    if (focus) {
      const p = parseSkillKey(focus);
      return p && p.target === config.target ? p.soundId : undefined;
    }
    const pool = availableSounds(config.pack, 2, config.target);
    return weakestSoundForTarget(loadMastery(learnerId), config.target, pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, config, learnerId, sessionId]);

  const round = useMemo(
    () => generateSortRound({ pack: config.pack, totalItems: ITEMS_PER_ROUND, target: config.target, focusSound }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, roundIndex, config, focusSound],
  );

  return (
    <SpacePlaySession
      key={sessionId}
      round={round}
      audio={audio}
      roundIndex={roundIndex}
      sessionId={sessionId}
      learnerId={learnerId}
      gameId={gameId}
      target={config.target}
      title={config.title}
      learnerName={getLearner(learnerId)?.name}
      needSound={focusSound}
      onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
      onRestart={() => { setSessionId((s) => s + 1); setRoundIndex(0); }}
    />
  );
}
