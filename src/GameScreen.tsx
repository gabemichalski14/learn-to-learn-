import { useEffect, useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import type { Pack, SoundTarget } from './domain/types';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { ThemeId } from './ThemeSwitcher';
import { StickerBook } from './StickerBook';
import { SessionLog } from './SessionLogView';
import { navigate } from './router';

const TOTAL_ROUNDS = 5;
const ITEMS_PER_ROUND = 6;

interface GameConfig {
  pack: Pack;
  target: SoundTarget;
  title: string;
}

const GAMES: Record<string, GameConfig> = {
  'beginning-sounds': { pack: everydayObjects, target: 'beginning', title: 'Sound Safari' },
  'ending-sounds': { pack: everydayEndings, target: 'ending', title: 'Last Sound Standing' },
};

interface Props {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  learnerId: string;
  gameId: string;
}

/** A sound-sorting game screen — driven by which game id is in the route. */
export function GameScreen({ theme, setTheme, learnerId, gameId }: Props) {
  const config = GAMES[gameId] ?? GAMES['beginning-sounds'];
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  // When the current session began — drives the elapsed "Finished in …" clock.
  // Lives here (not in SortGame) because SortGame remounts on every page.
  const [sessionStartAt, setSessionStartAt] = useState(() => Date.now());

  // Restart the clock whenever a fresh session starts (initial load + Play again).
  useEffect(() => {
    setSessionStartAt(Date.now());
  }, [sessionId]);

  // A fresh session whenever the game changes.
  useEffect(() => {
    setSessionId((s) => s + 1);
    setRoundIndex(0);
  }, [gameId]);

  // Fresh random page whenever the session restarts or we advance a page.
  const round = useMemo(
    () => generateSortRound({ pack: config.pack, totalItems: ITEMS_PER_ROUND, target: config.target }),
    [sessionId, roundIndex, config],
  );

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
