import { LevelHubShell } from '../../ui/LevelHubShell';
import { LevelStory } from '../space/LevelStory';
import '../workshop/workshop.css';
import './giantvalley.css';

/** Giant's Valley — the immersive launcher for Level 4, hosted by Bram. Structure
 *  comes from the shared LevelHubShell (congruent with every level); the Valley
 *  supplies only its theme: the `wk` prefix + `gv` tint, a valley deco, Bram's
 *  story greeting, and the "Climb" verb. */
export function GiantValleyLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  return (
    <LevelHubShell
      level={level}
      learnerId={learnerId}
      prefix="wk"
      rootClass="wk wk-hub gv"
      badge={<>🦕 Giant's Valley · Level {level}</>}
      backdrop={<div className="gv-deco" aria-hidden="true"><span>🏔️</span><span>🌲</span><span>🦕</span><span>🌄</span><span>🪨</span></div>}
      ctaVerb="Climb"
      renderIcon={(g) => <span className="wk-mission__emoji" aria-hidden="true">{g.emoji}</span>}
      greeting={<LevelStory learnerId={learnerId} level={level} />}
    />
  );
}
