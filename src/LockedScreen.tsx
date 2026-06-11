import { navigate } from './router';
import { findLevel } from './games';
import './locked.css';

/**
 * Shown when a learner reaches a level (or its games) they haven't unlocked yet.
 * Barton is strictly sequential — you pass each level before the next opens — so
 * this gently redirects without shame, framed in the garden's voice.
 */
export function LockedScreen({ level = 2, tutorLocked = false, authLocked = false }: { level?: number; learnerId?: string; tutorLocked?: boolean; authLocked?: boolean }) {
  const prereq = Math.max(1, level - 1);
  const prev = findLevel(prereq);
  if (authLocked) {
    return (
      <main className="locked">
        <div className="locked__card">
          <span className="locked__lock" aria-hidden="true">✨</span>
          <h1 className="locked__title">Free preview — sign in to unlock the rest</h1>
          <p className="locked__body">
            Level 1 is free to explore. Sign in with your Learn to Learn account to unlock every level,
            save progress across devices, and open the tutor &amp; parent dashboards. 🌱
          </p>
          <div className="locked__btns">
            <button type="button" className="locked__go" onClick={() => navigate('#/account')}>Sign in →</button>
            <button type="button" className="locked__home" onClick={() => navigate('#/level/1')}>Play Level 1 free</button>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="locked">
      <div className="locked__card">
        <span className="locked__lock" aria-hidden="true">🔒</span>
        {tutorLocked ? (
          <>
            <h1 className="locked__title">Paused by your tutor</h1>
            <p className="locked__body">
              Your tutor has this one resting for now — there's plenty more to play.
              Check back soon! 🌱
            </p>
            <div className="locked__btns">
              <button type="button" className="locked__go" onClick={() => navigate(`#/level/${level}`)}>Back to Level {level}</button>
              <button type="button" className="locked__home" onClick={() => navigate('#/')}>Home</button>
            </div>
          </>
        ) : (
          <>
            <h1 className="locked__title">This world is still asleep</h1>
            <p className="locked__body">
              Here we grow one step at a time. Finish <b>Level {prereq}{prev ? ` · ${prev.title}` : ''}</b> first —
              once you've mastered it, Level {level} wakes up just for you. 🌱
            </p>
            <div className="locked__btns">
              <button type="button" className="locked__go" onClick={() => navigate(`#/level/${prereq}`)}>Go to Level {prereq}</button>
              <button type="button" className="locked__home" onClick={() => navigate('#/')}>Home</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
