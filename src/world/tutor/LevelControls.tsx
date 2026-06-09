import { LEVELS } from '../../games';
import { useDataVersion } from '../../data/store';
import { isLevelUnlocked, isGameUnlocked, levelGate } from '../../mastery/levelGate';
import {
  levelOverrideOf, gameOverrideOf, setLevelOverride, setGameOverride, type LockState,
} from '../../mastery/tutorOverrides';
import './levelControls.css';

/**
 * Tutor-only control to lock / unlock levels and games for one student. The
 * default is the automatic Barton mastery-gate; a tutor can override per level
 * (Auto / Open / Lock) and lock individual games. Rendered inside the
 * (auth-gated) Tutor Dashboard.
 */
export function LevelControls({ learnerId }: { learnerId: string }) {
  useDataVersion(); // reflect changes immediately

  return (
    <div className="lc">
      <p className="lc__hint">
        By default levels follow the mastery rule — each opens when the one before is passed at 95%.
        Override here for this student.
      </p>
      <ul className="lc__levels">
        {LEVELS.map((lvl) => {
          const ov = levelOverrideOf(learnerId, lvl.num);
          const open = isLevelUnlocked(learnerId, lvl.num);
          const auto = lvl.num <= 1 || levelGate(learnerId, lvl.num - 1).passed; // what the gate alone would say
          const current: LockState | 'auto' = ov ?? 'auto';
          return (
            <li key={lvl.num} className="lc__level">
              <div className="lc__head">
                <span className={`lc__status lc__status--${open ? 'open' : 'locked'}`}>{open ? '🔓' : '🔒'}</span>
                <span className="lc__name"><b>Level {lvl.num}</b> · {lvl.title}</span>
                <span className="lc__auto">{ov ? `tutor: ${ov === 'unlock' ? 'open' : 'locked'}` : `auto · ${auto ? 'open' : 'locked'}`}</span>
              </div>
              <div className="lc__seg" role="group" aria-label={`Level ${lvl.num} access`}>
                {(['auto', 'unlock', 'lock'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`lc__segbtn${current === opt ? ' is-on' : ''}`}
                    onClick={() => setLevelOverride(learnerId, lvl.num, opt === 'auto' ? null : opt)}
                  >
                    {opt === 'auto' ? 'Auto' : opt === 'unlock' ? '🔓 Open' : '🔒 Lock'}
                  </button>
                ))}
              </div>
              {open && lvl.games.length > 0 && (
                <ul className="lc__games">
                  {lvl.games.map((g) => {
                    const gLocked = gameOverrideOf(learnerId, g.id) === 'lock';
                    const playable = isGameUnlocked(learnerId, g.id) && g.status === 'available';
                    return (
                      <li key={g.id} className={`lc__game${playable ? '' : ' is-off'}`}>
                        <span className="lc__gname">{g.emoji} {g.title}{g.status !== 'available' ? ' (soon)' : ''}</span>
                        <button
                          type="button"
                          className={`lc__gbtn${gLocked ? ' is-locked' : ''}`}
                          disabled={g.status !== 'available'}
                          onClick={() => setGameOverride(learnerId, g.id, gLocked ? null : 'lock')}
                        >
                          {gLocked ? '🔒 Locked — unlock' : '🔓 Lock'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
