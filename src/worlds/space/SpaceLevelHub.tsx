import { navigate } from '../../router';
import { findLevel } from '../../games';
import { useDataVersion } from '../../data/store';
import { isLevelReady, isLevelPassed } from '../../mastery/levelGate';
import { SpaceBackdrop } from './SpaceArt';
import { LevelStory } from './LevelStory';
import { Icon } from '../../ui/Icon';
import { MissionIcon } from '../../ui/MissionIcon';
import { HubHeader } from '../../ui/HubHeader';
import './space.css';

/** Per-game painted icon (emoji fallback until a PNG exists). */
const GAME_ICON: Record<string, string> = {
  'beginning-sounds': 'ico-blast-off', 'ending-sounds': 'ico-touchdown', 'middle-sounds': 'ico-vowel-patrol',
  'star-station': 'ico-star-station', 'word-beam': 'ico-word-beam', 'warp-speed': 'ico-warp-speed',
};

/** Immersive Space Patrol hub for Level 2 — a themed landing that flows straight
 *  into the space games. Rendered drawer-free by App for level 2. */
export function SpaceLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion();
  const lvl = findLevel(level);
  if (!lvl) {
    return (
      <main className="sg sg-hub">
        <SpaceBackdrop />
        <div className="sg-hud"><button type="button" className="sg-back" onClick={() => navigate('#/levels')}>← Levels</button></div>
        <div className="sg-stage"><h1 className="sg-hub__title">Level not found</h1></div>
      </main>
    );
  }
  return (
    <main className="sg sg-hub">
      <SpaceBackdrop />
      <HubHeader
        prefix="sg"
        back={{ label: '← Levels', onClick: () => navigate('#/levels') }}
        badge={<><Icon name="ico-space-patrol" emoji="🛸" className="sg-badge__ico" /> Space Patrol · Level {lvl.num}</>}
      />
      <div className="sg-stage sg-hub__stage">
        <h1 className="sg-hub__title">{lvl.title}</h1>
        <p className="sg-hub__lead">{lvl.focus}</p>
        <LevelStory learnerId={learnerId} level={lvl.num} />
        <div className="sg-missions">
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className="sg-mission"
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                <MissionIcon name={GAME_ICON[g.id] ?? ''} emoji={g.emoji} accent="#3fd0c0" />
                <span className="sg-mission__title">{g.title}</span>
                <span className="sg-mission__tag">{g.tagline}</span>
                <span className={`sg-mission__foot ${available ? 'sg-mission__go' : 'sg-mission__soon'}`}>
                  {available ? 'Launch ▸' : 'Soon'}
                </span>
              </button>
            );
          })}
        </div>
        {isLevelPassed(learnerId, level) ? (
          <button type="button" className="gd-hub__check gd-hub__check--done" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✓ Level {level} passed — retake the checkpoint
          </button>
        ) : isLevelReady(learnerId, level) ? (
          <button type="button" className="gd-hub__check" onClick={() => navigate(`#/checkpoint/${level}`)}>
            ✨ Take the Checkpoint — show what you learned!
          </button>
        ) : null}

        <button type="button" className="sg-hub__village" onClick={() => navigate('#/village')}>
          <Icon name="ico-village" emoji="🏡" /> Visit your Village
        </button>
      </div>
    </main>
  );
}
