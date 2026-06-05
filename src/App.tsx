import { useEffect, useState } from 'react';
import { useRoute } from './router';
import { GameScreen } from './GameScreen';
import { Home } from './Home';
import { Leaderboard } from './Leaderboard';
import { TutorDashboard } from './TutorDashboard';
import type { ThemeId } from './ThemeSwitcher';

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
  const route = useRoute();
  const [theme, setTheme] = useState<ThemeId>(loadTheme);

  // The kid-band themes only apply inside the game; the rest of the site stays
  // in the default brand look. Remember the chosen theme either way.
  useEffect(() => {
    document.documentElement.dataset.theme = route === 'play' ? theme : 'l2l';
    try {
      localStorage.setItem('ll-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, route]);

  switch (route) {
    case 'play':
      return <GameScreen theme={theme} setTheme={setTheme} />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'tutor':
      return <TutorDashboard />;
    default:
      return <Home />;
  }
}
