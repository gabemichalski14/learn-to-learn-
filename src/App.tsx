import { useEffect, useState } from 'react';
import { useRoute } from './router';
import { GameScreen } from './GameScreen';
import { Home } from './Home';
import { LevelPage } from './LevelPage';
import { Leaderboard } from './Leaderboard';
import { TutorDashboard } from './TutorDashboard';
import { Account } from './Account';
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

  // The theme applies on the game and the tutor dashboard (both have a theme
  // switcher); other pages stay in the default brand look. Remember it either way.
  const themed = route.name === 'play' || route.name === 'tutor';
  useEffect(() => {
    document.documentElement.dataset.theme = themed ? theme : 'l2l';
    try {
      localStorage.setItem('ll-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, themed]);

  switch (route.name) {
    case 'play':
      return <GameScreen theme={theme} setTheme={setTheme} learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} />;
    case 'level':
      return <LevelPage level={route.level ?? 1} />;
    case 'leaderboard':
      return <Leaderboard />;
    case 'tutor':
      return <TutorDashboard theme={theme} setTheme={setTheme} />;
    case 'account':
      return <Account />;
    default:
      return <Home learnerId={learnerId} onSelectLearner={chooseLearner} />;
  }
}
