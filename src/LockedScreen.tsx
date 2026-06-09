import { navigate } from './router';
import { findLevel } from './games';
import './locked.css';

/**
 * Shown when a learner reaches a level (or its games) they haven't unlocked yet.
 * Barton is strictly sequential — you pass each level before the next opens — so
 * this gently redirects without shame, framed in the garden's voice.
 */
export function LockedScreen({ level, tutorLocked = false }: { level: number; learnerId: string; tutorLocked?: boolean }) {
  const prereq = Math.max(1, level - 1);
  const prev = findLevel(prereq);
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
