import { LevelHubShell } from '../../ui/LevelHubShell';
import { SpaceBackdrop } from './SpaceArt';
import { LevelStory } from './LevelStory';
import { Icon } from '../../ui/Icon';
import { MissionIcon } from '../../ui/MissionIcon';
import './space.css';

/** Per-game painted icon (emoji fallback until a PNG exists). */
const GAME_ICON: Record<string, string> = {
  'beginning-sounds': 'ico-blast-off', 'ending-sounds': 'ico-touchdown', 'middle-sounds': 'ico-vowel-patrol',
  'star-station': 'ico-star-station', 'word-beam': 'ico-word-beam', 'warp-speed': 'ico-warp-speed',
};

/** Space Patrol — the immersive launcher for Level 2. Structure comes from the
 *  shared LevelHubShell (congruent with every level); Space supplies only its
 *  theme: the `sg` prefix, a starfield backdrop, its mission icons, and "Launch". */
export function SpaceLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  return (
    <LevelHubShell
      level={level}
      learnerId={learnerId}
      prefix="sg"
      rootClass="sg sg-hub"
      badge={<><Icon name="ico-space-patrol" emoji="🛸" className="sg-badge__ico" /> Space Patrol · Level {level}</>}
      backdrop={<SpaceBackdrop />}
      ctaVerb="Launch"
      renderIcon={(g) => <MissionIcon name={GAME_ICON[g.id] ?? ''} emoji={g.emoji} accent="#3fd0c0" />}
      greeting={<LevelStory learnerId={learnerId} level={level} />}
    />
  );
}
