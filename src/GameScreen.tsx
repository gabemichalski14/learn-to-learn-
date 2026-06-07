import { useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import type { Pack, SoundTarget, SortRound } from './domain/types';
import type { AudioPlayer } from './audio/audioPlayer';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { shortVowelWords } from './content/packs/shortVowelWords';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SpaceSortGame } from './worlds/space/SpaceSortGame';
import { parseSkillKey } from './mastery/skills';
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
function SpacePlaySession({ round, audio, roundIndex, sessionId, learnerId, gameId, target, title, learnerName, onAdvance, onRestart }: {
  round: SortRound; audio: AudioPlayer; roundIndex: number; sessionId: number; learnerId: string; gameId: string;
  target: SoundTarget; title: string; learnerName?: string;
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
      onAdvance={onAdvance}
      onRestart={onRestart}
    />
  );
}

/** A sound-sorting game screen — driven by which game id is in the route. Every
 *  game renders in its themed full-screen world (the only render path). */
export function GameScreen({ learnerId, gameId, focus }: Props) {
  const config = GAMES[gameId] ?? GAMES['beginning-sounds'];
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);

  // A fresh session whenever the game changes (state-during-render pattern).
  const [prevGameId, setPrevGameId] = useState(gameId);
  if (gameId !== prevGameId) {
    setPrevGameId(gameId);
    setSessionId((s) => s + 1);
    setRoundIndex(0);
  }

  const focusSound = useMemo(() => {
    const p = focus ? parseSkillKey(focus) : null;
    return p && p.target === config.target ? p.soundId : undefined;
  }, [focus, config]);

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
      onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
      onRestart={() => { setSessionId((s) => s + 1); setRoundIndex(0); }}
    />
  );
}
