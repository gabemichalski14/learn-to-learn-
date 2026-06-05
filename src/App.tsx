import { useEffect, useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { ThemeId } from './ThemeSwitcher';

const TOTAL_ROUNDS = 5;
const ITEMS_PER_ROUND = 6;

function loadTheme(): ThemeId {
  try {
    const t = localStorage.getItem('ll-theme');
    if (t === 'playful' || t === 'l2l' || t === 'grownup') return t;
    if (t === 'cool') return 'l2l'; // migrate the old label
  } catch {
    /* ignore */
  }
  return 'l2l';
}

export default function App() {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [sessionId, setSessionId] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [theme, setTheme] = useState<ThemeId>(loadTheme);
  // When the current session began — drives the elapsed "Finished in …" clock.
  // Lives here (not in SortGame) because SortGame remounts on every page.
  const [sessionStartAt, setSessionStartAt] = useState(() => Date.now());

  // Restart the clock whenever a fresh session starts (initial load + Play again).
  useEffect(() => {
    setSessionStartAt(Date.now());
  }, [sessionId]);

  // Apply the theme to the document so it restyles everything, and remember it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ll-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  // Fresh random page whenever the session restarts or we advance a page.
  const round = useMemo(
    () => generateSortRound({ pack: everydayObjects, totalItems: ITEMS_PER_ROUND }),
    [sessionId, roundIndex],
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
        <ThemeSwitcher value={theme} onSelect={setTheme} />
      </div>

      {/* Heading kept for screen readers / document outline, hidden on screen
          so the page is just the game content. */}
      <h1 className="sr-only">Beginning Sounds Match — Learn to Learn</h1>

      <SortGame
        key={`${sessionId}-${roundIndex}`}
        round={round}
        audio={audio}
        roundIndex={roundIndex}
        totalRounds={TOTAL_ROUNDS}
        sessionStartAt={sessionStartAt}
        playful={theme === 'playful'}
        clean={theme === 'grownup'}
        onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
        onRestart={() => {
          setSessionId((s) => s + 1);
          setRoundIndex(0);
        }}
      />
    </main>
  );
}
