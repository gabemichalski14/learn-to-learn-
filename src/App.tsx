import { useEffect, useState } from 'react';
import { useRoute } from './router';
import { GameScreen } from './GameScreen';
import { Home } from './Home';
import { LevelPage } from './LevelPage';
import { Leaderboard } from './Leaderboard';
import { TutorDashboard } from './TutorDashboard';
import { Account } from './Account';
import { LevelsPage } from './LevelsPage';
import { GamesPage } from './GamesPage';
import { ProfilePage } from './ProfilePage';
import { NavDrawer } from './NavDrawer';
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

  // The theme applies on the game screen (the only place with a theme switcher);
  // every other page stays in the default brand look. Remember it either way.
  const themed = route.name === 'play';
  useEffect(() => {
    document.documentElement.dataset.theme = themed ? theme : 'l2l';
    try {
      localStorage.setItem('ll-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme, themed]);

  // The game screen stays immersive (its own back button); every other page
  // gets the left-side burger menu.
  if (route.name === 'play') {
    return <GameScreen theme={theme} setTheme={setTheme} learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} />;
  }

  let page;
  switch (route.name) {
    case 'level':
      page = <LevelPage level={route.level ?? 1} />;
      break;
    case 'levels':
      page = <LevelsPage />;
      break;
    case 'games':
      page = <GamesPage />;
      break;
    case 'leaderboard':
      page = <Leaderboard />;
      break;
    case 'tutor':
      page = <TutorDashboard />;
      break;
    case 'profile':
      page = <ProfilePage learnerId={learnerId} onSelectLearner={chooseLearner} />;
      break;
    case 'account':
      page = <Account />;
      break;
    default:
      page = <Home learnerId={learnerId} />;
  }

  return (
    <>
      <NavDrawer route={route.name} />
      {page}
    </>
  );
}
