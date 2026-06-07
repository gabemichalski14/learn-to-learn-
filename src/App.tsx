import { useState } from 'react';
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
import { SiteFooter } from './SiteFooter';
import { LivingWorld } from './world/LivingWorld';
import { GardenFrame } from './world/GardenFrame';
import { EasterEggs } from './world/EasterEggs';
import { useWorldTier } from './world/worldTier';
import { MascotBuddy } from './mascots/MascotBuddy';
import { SpaceLevelHub } from './worlds/space/SpaceLevelHub';
import { GardenLevelHub } from './worlds/garden/GardenLevelHub';
import { TapItOutGame } from './worlds/garden/TapItOutGame';
import { ensureLearner, setCurrentLearnerId } from './profiles';
import { useTutorSignedIn } from './useAuth';

export default function App() {
  const route = useRoute();
  const [learnerId, setLearnerId] = useState<string>(() => ensureLearner().id);
  const isTutor = useTutorSignedIn();
  const world = useWorldTier(learnerId); // app-wide ambient richness grows with real practice

  function chooseLearner(id: string) {
    setCurrentLearnerId(id);
    setLearnerId(id);
  }

  // The game screens stay immersive (their own back button); every other page
  // gets the left-side burger menu.
  if (route.name === 'play' && route.game === 'tap-it-out') {
    return <TapItOutGame learnerId={learnerId} />;
  }
  if (route.name === 'play') {
    return <GameScreen learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} focus={route.focus} />;
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
      <LivingWorld tier={world.tier} lush={world.lush} score={world.score} />
      <GardenFrame />
      <NavDrawer route={route.name} isTutor={isTutor} />
      {page}
      <SiteFooter />
      {/* Roaming easter-egg buddy — keyed by route so each page gets a fresh
          surprise placement/message. Only on these (non-immersive) pages; the
          games keep their own world guides. */}
      <MascotBuddy key={route.name} learnerId={learnerId} />
      {/* Rare ambient surprises (Pip peek, clover, butterfly) — tier-scaled. */}
      <EasterEggs key={`egg-${route.name}`} tier={world.tier} />
    </>
  );
}
