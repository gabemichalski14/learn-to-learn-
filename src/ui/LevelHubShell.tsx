import type { ReactNode } from 'react';
import { goBack, navigate } from '../router';
import { findLevel } from '../games';
import type { GameInfo } from '../games';
import { useDataVersion } from '../data/store';
import { isLevelReady, isLevelPassed } from '../mastery/levelGate';
import { HubHeader } from './HubHeader';
import './levelHub.css';

/**
 * LevelHubShell — the CONGRUENT skeleton every level hub wears, so the back
 * button, title, lead, the companion greeting, the games grid, the checkpoint
 * CTA and the Village button sit in the SAME place with the SAME words on every
 * level. The world supplies only its THEME: a `prefix` (gd / sg / wk) that tints
 * the shared classes, its backdrop, its mission CTA verb, and its mission icon.
 *
 * This kills the copy-paste drift that let the four hubs diverge (Space even
 * borrowed Garden's checkpoint class). Enforced by src/ui/hubCongruence.test.ts.
 */
export function LevelHubShell({
  level, learnerId, prefix, rootClass, badge, backdrop, ctaVerb, renderIcon,
  greeting, beforeMissions, afterMissions,
}: {
  level: number;
  learnerId: string;
  /** Theme prefix for the shared structure: gd / sg / wk. */
  prefix: string;
  /** Full <main> className, e.g. "gd gd-hub" or "wk wk-hub gv". */
  rootClass: string;
  /** Header badge: the world name + level, e.g. <>🌱 Sound Garden · Level 1</>. */
  badge: ReactNode;
  /** The world backdrop (rendered behind everything). */
  backdrop?: ReactNode;
  /** Mission CTA verb in the world's voice: Play / Launch / Build / Climb. */
  ctaVerb: string;
  /** Renders the icon for one game tile (MissionIcon or an emoji span). */
  renderIcon: (game: GameInfo) => ReactNode;
  /** The companion greeting (LevelStory, or a bespoke greeter) — same slot for all. */
  greeting?: ReactNode;
  /** Optional buttons above the missions (e.g. a warm-up / walk-home). */
  beforeMissions?: ReactNode;
  /** Optional buttons below the missions (e.g. garden tending). */
  afterMissions?: ReactNode;
}) {
  useDataVersion(); // re-check unlocks/passes when mastery changes
  const lvl = findLevel(level);
  if (!lvl) {
    return (
      <main className={rootClass}>
        {backdrop}
        <HubHeader prefix={prefix} back={{ label: '← Levels', onClick: () => goBack('#/levels') }} badge={badge} />
        <div className={`${prefix}-stage`}><h1 className={`${prefix}-hub__title`}>Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className={rootClass}>
      {backdrop}
      <HubHeader prefix={prefix} back={{ label: '← Levels', onClick: () => goBack('#/levels') }} badge={badge} />

      <div className={`${prefix}-stage ${prefix}-hub__stage`}>
        <h1 className={`${prefix}-hub__title`}>{lvl.title}</h1>
        <p className={`${prefix}-hub__lead`}>{lvl.focus}</p>

        {greeting}
        {beforeMissions}

        <div className={`${prefix}-missions`}>
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className={`${prefix}-mission`}
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                {renderIcon(g)}
                <span className={`${prefix}-mission__title`}>{g.title}</span>
                <span className={`${prefix}-mission__tag`}>{g.tagline}</span>
                <span className={`${prefix}-mission__foot ${available ? `${prefix}-mission__go` : `${prefix}-mission__soon`}`}>
                  {available ? `${ctaVerb} ▸` : 'Soon'}
                </span>
              </button>
            );
          })}
        </div>

        {afterMissions}

        {isLevelPassed(learnerId, level) ? (
          <button type="button" className="lvlhub-check lvlhub-check--done" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✓ Level {level} passed — retake the checkpoint
          </button>
        ) : isLevelReady(learnerId, level) ? (
          <button type="button" className="lvlhub-check" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✨ Take the Checkpoint — show what you learned!
          </button>
        ) : null}

        <button type="button" className="lvlhub-village" onClick={() => navigate('#/village')}>🏡 Visit your Village</button>
      </div>
    </main>
  );
}
