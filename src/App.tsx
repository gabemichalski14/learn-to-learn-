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
import { MascotBuddy } from './mascots/MascotBuddy';
import { SpaceLevelHub } from './worlds/space/SpaceLevelHub';
import { GardenLevelHub } from './worlds/garden/GardenLevelHub';
import { TapItOutGame } from './worlds/garden/TapItOutGame';
import type { ThemeId } from './themes';
import { ensureLearner, setCurrentLearnerId } from './profiles';
import { useTutorSignedIn } from './useAuth';

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
  const isTutor = useTutorSignedIn();

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
  if (route.name === 'play' && route.game === 'tap-it-out') {
    return <TapItOutGame learnerId={learnerId} />;
  }
  if (route.name === 'play') {
    return <GameScreen theme={theme} setTheme={setTheme} learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} focus={route.focus} />;
  }

  if (route.name === 'level' && (route.level ?? 1) === 2) {
    return <SpaceLevelHub level={2} />;
  }

  if (route.name === 'level' && (route.level ?? 1) === 1) {
    return <GardenLevelHub level={1} learnerId={learnerId} />;
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
      // Tutor-only: parents/students land on sign-in instead.
      page = isTutor ? <TutorDashboard /> : <Account />;
      break;
    case 'profile':
      page = <ProfilePage learnerId={learnerId} onSelectLearner={chooseLearner} />;
      break;
    case 'account':
      page = <Account />;
      break;
    default:
      page = <Home learnerId={learnerId} onChooseLearner={chooseLearner} />;
  }

  return (
    <>
      <NavDrawer route={route.name} isTutor={isTutor} />
      {page}
      {/* Roaming easter-egg buddy — keyed by route so each page gets a fresh
          surprise placement/message. Only on these (non-immersive) pages; the
          games keep their own world guides. */}
      <MascotBuddy key={route.name} />
    </>
  );
}
