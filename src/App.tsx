import { useEffect, useState } from 'react';
import { useRoute } from './router';
import { GameScreen } from './GameScreen';
import { Home } from './Home';
import { LevelPage } from './LevelPage';
import { Leaderboard } from './Leaderboard';
import { TutorDashboard } from './TutorDashboard';
import type { ThemeId } from './ThemeSwitcher';
import { ensureLearner, setCurrentLearnerId } from './profiles';

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
  const [learnerId, setLearnerId] = useState<string>(() => ensureLearner().id);

  function chooseLearner(id: string) {
    setCurrentLearnerId(id);
    setLearnerId(id);
  }

  // The kid-band themes only apply inside the game; the rest of the site stays
  // in the default brand look. Remember the chosen theme either way.
  useEffect(() => {
    document.documentElement.dataset.theme = route.name === 'play' ? theme : 'l2l';
    try {
      localStorage.setItem('ll-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, route.name]);

  switch (route.name) {
    case 'play':
      return <GameScreen theme={theme} setTheme={setTheme} learnerId={learnerId} />;
    case 'level':
      return <LevelPage level={route.level ?? 1} />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'tutor':
      return <TutorDashboard />;
    default:
      return <Home learnerId={learnerId} onSelectLearner={chooseLearner} />;
  }
}
