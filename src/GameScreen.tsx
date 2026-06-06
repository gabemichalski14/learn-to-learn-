import { useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import type { Pack, SoundTarget, SortRound } from './domain/types';
import type { AudioPlayer } from './audio/audioPlayer';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { shortVowelWords } from './content/packs/shortVowelWords';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { SpaceSortGame } from './worlds/space/SpaceSortGame';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { ThemeId } from './themes';
import { StickerBook } from './StickerBook';
import { SessionLog } from './SessionLogView';
import { navigate } from './router';
import { parseSkillKey } from './mastery/skills';

const TOTAL_ROUNDS = 5;
const ITEMS_PER_ROUND = 6;

interface GameConfig {
  pack: Pack;
  target: SoundTarget;
  title: string;
  /** Renders in a themed per-level "world" shell instead of the legacy themes. */
  space?: boolean;
}

const GAMES: Record<string, GameConfig> = {
  'beginning-sounds': { pack: everydayObjects, target: 'beginning', title: 'Sound Safari' },
  'ending-sounds': { pack: everydayEndings, target: 'ending', title: 'Last Sound Standing' },
  'middle-sounds': { pack: shortVowelWords, target: 'medial', title: 'Vowel Patrol', space: true },
};

interface Props {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  learnerId: string;
  gameId: string;
  focus?: string;
}

interface PlaySessionProps {
  round: SortRound;
  audio: AudioPlayer;
  roundIndex: number;
  sessionId: number;
  learnerId: string;
  gameId: string;
  playful: boolean;
  clean: boolean;
  onOpenStickerBook: () => void;
  onAdvance: () => void;
  onRestart: () => void;
}

/**
 * Owns the session clock. The parent keys this on sessionId, so every new session
 * (initial load, Play again, game change) remounts it and the lazy initializer
 * captures a fresh start time — no effect required. The clock survives page
 * changes (roundIndex) because those don't change the key.
 */
function PlaySession({ round, audio, roundIndex, sessionId, learnerId, gameId, playful, clean, onOpenStickerBook, onAdvance, onRestart }: PlaySessionProps) {
  const [sessionStartAt] = useState(() => Date.now());
  return (
    <SortGame
      key={`${sessionId}-${roundIndex}`}
      round={round}
      audio={audio}
      roundIndex={roundIndex}
      totalRounds={TOTAL_ROUNDS}
      sessionId={sessionId}
      learnerId={learnerId}
      gameId={gameId}
      sessionStartAt={sessionStartAt}
      playful={playful}
      clean={clean}
      onOpenStickerBook={onOpenStickerBook}
      onAdvance={onAdvance}
      onRestart={onRestart}
    />
  );
}

/** Owns the per-session clock for a themed-world game (survives page changes,
 *  resets on a new session); inner game remounts per page to reset its state. */
function SpacePlaySession({ round, audio, roundIndex, sessionId, learnerId, gameId, onAdvance, onRestart }: {
  round: SortRound; audio: AudioPlayer; roundIndex: number; sessionId: number; learnerId: string; gameId: string;
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
      onAdvance={onAdvance}
      onRestart={onRestart}
    />
  );
}

/** A sound-sorting game screen — driven by which game id is in the route. */
export function GameScreen({ theme, setTheme, learnerId, gameId, focus }: Props) {
  const config = GAMES[gameId] ?? GAMES['beginning-sounds'];
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  // A fresh session whenever the game changes. Done during render (the sanctioned
  // "adjust state when a prop changes" pattern) instead of in an effect, so we
  // never call setState synchronously inside an effect. Bumping sessionId remounts
  // <PlaySession>, which resets the round page and restarts the session clock.
  const [prevGameId, setPrevGameId] = useState(gameId);
  if (gameId !== prevGameId) {
    setPrevGameId(gameId);
    setSessionId((s) => s + 1);
    setRoundIndex(0);
  }

  // Fresh random page whenever the session restarts or we advance a page.
  const focusSound = useMemo(() => {
    const p = focus ? parseSkillKey(focus) : null;
    return p && p.target === config.target ? p.soundId : undefined;
  }, [focus, config]);

  const round = useMemo(
    () => generateSortRound({ pack: config.pack, totalItems: ITEMS_PER_ROUND, target: config.target, focusSound }),
    // sessionId + roundIndex are intentional regeneration triggers: every new
    // session and every page must draw a fresh random round even when the pack /
    // target / focus are unchanged.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId, roundIndex, config, focusSound],
  );

  // Themed-world games (e.g. Space Patrol) render in their own full-screen shell,
  // bypassing the legacy theme chrome.
  if (config.space) {
    return (
      <SpacePlaySession
        key={sessionId}
        round={round}
        audio={audio}
        roundIndex={roundIndex}
        sessionId={sessionId}
        learnerId={learnerId}
        gameId={gameId}
        onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
        onRestart={() => { setSessionId((s) => s + 1); setRoundIndex(0); }}
      />
    );
  }

  return (
    <main className="app">
      <div className="playful-bg" aria-hidden="true">
        {/* sky */}
        <span className="pb-sun" />
        <span className="pb-cloud pb-cloud--1" />
        <span className="pb-cloud pb-cloud--2" />
        <span className="pb-cloud pb-cloud--3" />

        {/* little surprises — easter eggs to discover while you listen */}
        <span className="pb-balloon" />
        <span className="pb-bird pb-bird--1" />
        <span className="pb-bird pb-bird--2" />
        <span className="pb-bird pb-bird--3" />
        <span className="pb-butterfly pb-butterfly--1"><i /><i /></span>
        <span className="pb-butterfly pb-butterfly--2"><i /><i /></span>
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={`tw${i}`} className={`pb-twinkle pb-twinkle--${i + 1}`} />
        ))}
        {/* the rare one: only streaks across once in a while */}
        <span className="pb-shooting-star" />

        {/* rising bubbles (own wrapper so nth-child positions stay clean) */}
        <div className="pb-bubbles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="bubble" />
          ))}
        </div>
      </div>

      <div className="app__topbar">
        <button type="button" className="book-btn" onClick={() => navigate('#/')} aria-label="Back to home">
          <span aria-hidden="true">🏠</span>
        </button>
        <button type="button" className="book-btn" onClick={() => setBookOpen(true)} aria-label="Open my sticker book">
          <span aria-hidden="true">📖</span>
        </button>
        <ThemeSwitcher value={theme} onSelect={setTheme} />
      </div>

      {/* Heading kept for screen readers / document outline, hidden on screen
          so the page is just the game content. */}
      <h1 className="sr-only">{config.title} — Learn to Learn</h1>

      <PlaySession
        key={sessionId}
        round={round}
        audio={audio}
        roundIndex={roundIndex}
        sessionId={sessionId}
        learnerId={learnerId}
        gameId={gameId}
        playful={theme === 'playful'}
        clean={theme === 'grownup'}
        onOpenStickerBook={() => setBookOpen(true)}
        onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
        onRestart={() => {
          setSessionId((s) => s + 1);
          setRoundIndex(0);
        }}
      />

      <StickerBook open={bookOpen} onClose={() => setBookOpen(false)} learnerId={learnerId} />

      {/* Discreet tutor-only entry to the progress log. */}
      <button
        type="button"
        className="tutor-btn"
        onClick={() => setLogOpen(true)}
        aria-label="Tutor: open progress log"
        title="Tutor: progress log"
      >
        <span aria-hidden="true">📊</span>
      </button>
      <SessionLog open={logOpen} onClose={() => setLogOpen(false)} learnerId={learnerId} />
    </main>
  );
}
