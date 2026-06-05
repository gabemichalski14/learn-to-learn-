import { useEffect, useMemo, useState } from 'react';
import { generateSortRound } from './domain/engine';
import { everydayObjects } from './content/packs/everydayObjects';
import { createStubAudioPlayer } from './audio/stubAudioPlayer';
import { SortGame } from './game/SortGame';
import { BookTree } from './game/BookTree';
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
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="bubble" />
        ))}
      </div>

      <div className="app__topbar">
        <ThemeSwitcher value={theme} onSelect={setTheme} />
      </div>

      <header className="app__header">
        <BookTree className="app__logo" progress={1} />
        <div className="app__titles">
          <h1 className="app__title">Beginning Sounds Match</h1>
          <p className="app__brand">Learn to Learn</p>
        </div>
      </header>

      <SortGame
        key={`${sessionId}-${roundIndex}`}
        round={round}
        audio={audio}
        roundIndex={roundIndex}
        totalRounds={TOTAL_ROUNDS}
        playful={theme === 'playful'}
        onAdvance={() => setRoundIndex((i) => Math.min(i + 1, TOTAL_ROUNDS - 1))}
        onRestart={() => {
          setSessionId((s) => s + 1);
          setRoundIndex(0);
        }}
      />
    </main>
  );
}
