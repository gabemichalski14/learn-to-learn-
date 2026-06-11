import { useState, useEffect } from 'react';
import { useRoute } from './router';
import { GameScreen } from './GameScreen';
import { Home } from './Home';
import { LevelPage } from './LevelPage';
import { Leaderboard } from './Leaderboard';
import { TutorDashboard } from './TutorDashboard';
import { Account } from './Account';
import { AdminPage } from './AdminPage';
import { StudentAdminPage } from './StudentAdminPage';
import { TutorsAdminPage } from './TutorsAdminPage';
import { ParentHome } from './ParentHome';
import { LevelsPage } from './LevelsPage';
import { GamesPage } from './GamesPage';
import { VillagePage } from './VillagePage';
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
import { SameOrDifferent } from './worlds/garden/SameOrDifferent';
import { SwitchItGame } from './worlds/garden/SwitchItGame';
import { StarStation } from './worlds/space/StarStation';
import { BlendBuddies } from './worlds/workshop/BlendBuddies';
import { SortIt } from './worlds/workshop/SortIt';
import { RuleBreakers } from './worlds/workshop/RuleBreakers';
import { ChopShop } from './worlds/workshop/ChopShop';
import { WorkshopLevelHub } from './worlds/workshop/WorkshopLevelHub';
import { CheckpointGame } from './CheckpointGame';
import { ensureLearner, setCurrentLearnerId, getCurrentLearnerId } from './profiles';
import { reconcileRoster } from './data/identity';
import { flushOutbox } from './data/cloudSync';
import { touchTutorPresence } from './data/cloud';
import { useTutorSignedIn, useRole } from './useAuth';
import { worldMotifs } from './world/lore/cast';
import { loadMastery } from './mastery/mastery';
import { isLevelUnlocked, isGameUnlocked } from './mastery/levelGate';
import { levelOfGame } from './games';
import { LockedScreen } from './LockedScreen';
import { markActive } from './presence';

export default function App() {
  const route = useRoute();
  const [learnerId, setLearnerId] = useState<string>(() => ensureLearner().id);
  const isTutor = useTutorSignedIn();
  const role = useRole();

  // Reconcile the roster on startup AND on every sign-in/out: while signed in we
  // show only this account's cloud roster (device-local guests are stashed); on
  // sign-out the guests come back and the account's students are dropped. Keyed on
  // isTutor so it re-runs the moment auth flips. Deferred to avoid setState-in-render.
  useEffect(() => {
    const t = setTimeout(() => {
      void reconcileRoster().then(() => {
        void flushOutbox();
        // reconcile may have stashed/added profiles → re-point to a valid one
        setLearnerId(getCurrentLearnerId() ?? ensureLearner().id);
      });
    }, 0);
    return () => clearTimeout(t);
  }, [isTutor]);

  // Every navigation starts at the top of the page (SPA hash changes otherwise
  // keep the previous scroll position — why Levels appeared to "load near the bottom").
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.name, route.level, route.game]);

  // Presence heartbeat: mark the active learner "on the platform" while the app
  // is open (drives the green dot on Admin + the Leaderboard).
  useEffect(() => {
    markActive(learnerId);
    const t = window.setInterval(() => markActive(learnerId), 60_000);
    return () => window.clearInterval(t);
  }, [learnerId]);

  // Tutor presence: while signed in, stamp this tutor/owner's "active now" so the
  // owner can see who's on their account (Tutors page). Best-effort/cloud.
  useEffect(() => {
    if (!isTutor) return;
    void touchTutorPresence();
    const t = window.setInterval(() => void touchTutorPresence(), 150_000); // ~2.5 min
    return () => window.clearInterval(t);
  }, [isTutor]);

  const world = useWorldTier(learnerId); // app-wide ambient richness grows with real practice
  // Friends light up the world: their motif drifts by while you're helping them
  // (a happy nudge) and gently after they're home. (Recomputed on navigation.)
  const motifs = worldMotifs(loadMastery(learnerId));
  const eggMotifs = motifs.helping.length ? motifs.helping : motifs.home;
  const eggBoost = motifs.helping.length ? 0.3 : motifs.home.length ? 0.12 : 0;

  function chooseLearner(id: string) {
    setCurrentLearnerId(id);
    setLearnerId(id);
  }

  // Mastery-gate: Barton is strictly sequential — a STUDENT can't enter a level (or
  // its games) until the previous level is passed at ~95%. The owner/admin always
  // has full access (to preview, demo, and manage), so they bypass the gate.
  const bypassGate = role === 'owner';
  if (route.name === 'play') {
    const gid = route.game ?? 'beginning-sounds';
    const lvl = levelOfGame(gid) ?? 1;
    if (!bypassGate && !isLevelUnlocked(learnerId, lvl)) return <LockedScreen level={lvl} learnerId={learnerId} />;
    if (!bypassGate && !isGameUnlocked(learnerId, gid)) return <LockedScreen level={lvl} learnerId={learnerId} tutorLocked />;
  }
  if (route.name === 'level' && !bypassGate && !isLevelUnlocked(learnerId, route.level ?? 1)) {
    return <LockedScreen level={route.level ?? 1} learnerId={learnerId} />;
  }
  if (route.name === 'checkpoint') {
    const lvl = route.level ?? 1;
    if (!bypassGate && !isLevelUnlocked(learnerId, lvl)) return <LockedScreen level={lvl} learnerId={learnerId} />;
    return <CheckpointGame level={lvl} learnerId={learnerId} />;
  }

  // The game screens stay immersive (their own back button); every other page
  // gets the left-side burger menu.
  if (route.name === 'play' && route.game === 'tap-it-out') {
    return <TapItOutGame learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'same-or-different') {
    return <SameOrDifferent learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'switch-it') {
    return <SwitchItGame learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'star-station') {
    return <StarStation learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'blend-buddies') {
    return <BlendBuddies learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'sort-it') {
    return <SortIt learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'rule-breakers') {
    return <RuleBreakers learnerId={learnerId} />;
  }
  if (route.name === 'play' && route.game === 'chop-shop') {
    return <ChopShop learnerId={learnerId} />;
  }
  if (route.name === 'play') {
    return <GameScreen learnerId={learnerId} gameId={route.game ?? 'beginning-sounds'} focus={route.focus} />;
  }

  if (route.name === 'level' && (route.level ?? 1) === 3) {
    return <WorkshopLevelHub level={3} learnerId={learnerId} />;
  }

  if (route.name === 'level' && (route.level ?? 1) === 2) {
    return <SpaceLevelHub level={2} learnerId={learnerId} />;
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
      page = <LevelsPage learnerId={learnerId} />;
      break;
    case 'games':
      page = <GamesPage />;
      break;
    case 'village':
      page = <VillagePage learnerId={learnerId} />;
      break;
    case 'leaderboard':
      page = <Leaderboard />;
      break;
    case 'tutor':
      // Tutor-only: parents/students land on sign-in instead.
      page = isTutor ? <TutorDashboard /> : <Account />;
      break;
    case 'admin':
      // Owner/admin only — everyone else is bounced to sign-in.
      page = role === 'owner' ? <AdminPage /> : <Account />;
      break;
    case 'admin-student':
      page = role === 'owner' ? <StudentAdminPage id={route.studentId ?? ''} /> : <Account />;
      break;
    case 'admin-tutors':
      page = role === 'owner' ? <TutorsAdminPage /> : <Account />;
      break;
    case 'family':
      page = <ParentHome />;
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

  // The OWNER's control consoles (Center admin + its sub-pages + Account) are bare
  // by design — no kid-world chrome. The tutor dashboard, by contrast, KEEPS the
  // warm themed backdrop (so the theme stays consistent as a tutor moves between
  // it and Games/Levels) — only the roaming mascot/eggs stay off it, to stay calm.
  const bareConsole = route.name === 'admin' || route.name === 'admin-student' || route.name === 'admin-tutors' || route.name === 'account';
  const noMascot = bareConsole || route.name === 'tutor';
  // The immersive world (soft backdrop + foreground meadow frame) belongs only on
  // the kid-play pages. Data/utility pages (leaderboard, profile, family, tutor,
  // consoles) get a clean paper page so the footer caps the bottom and the meadow
  // never leaks behind/below the content.
  const immersive = route.name === 'home' || route.name === 'level' || route.name === 'levels'
    || route.name === 'village' || route.name === 'games' || route.name === 'checkpoint';
  // The footer is a FIXED slim bar pinned to the viewport bottom — shown on the
  // clean data/utility pages (not the immersive kid worlds, where it would intrude,
  // nor the bare consoles). Content gets bottom padding so nothing hides behind it.
  const showFooter = !bareConsole && !immersive;

  return (
    <>
      {/* Storybook paper base — always present, behind everything (incl. the
          Living World garden on kid pages and the bare consoles). */}
      <div className="book-paper" aria-hidden="true" />
      {immersive && <LivingWorld tier={world.tier} lush={world.lush} score={world.score} />}
      {immersive && <GardenFrame />}
      <NavDrawer route={route.name} role={role ?? null} />
      <div className={`app-shell${showFooter ? ' app-shell--footer' : ''}`}>
        <div className="app-shell__main">{page}</div>
        {showFooter && <SiteFooter />}
      </div>
      {/* Roaming buddy + ambient surprises — child-facing; off the consoles AND the
          tutor dashboard (calm/professional), kept on kid + family pages. */}
      {!noMascot && <MascotBuddy key={route.name} learnerId={learnerId} />}
      {!noMascot && <EasterEggs key={`egg-${route.name}`} tier={world.tier} motifs={eggMotifs} boost={eggBoost} />}
    </>
  );
}
