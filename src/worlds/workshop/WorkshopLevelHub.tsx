import { LevelHubShell } from '../../ui/LevelHubShell';
import { LevelStory } from '../space/LevelStory';
import './workshop.css';

/** Patch's Workshop — the immersive launcher for Level 3. Structure comes from the
 *  shared LevelHubShell (congruent with every other level); the Workshop supplies
 *  only its theme: the `wk` prefix, Patch's story greeting, and the "Build" verb. */
export function WorkshopLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  return (
    <LevelHubShell
      level={level}
      learnerId={learnerId}
      prefix="wk"
      rootClass="wk wk-hub"
      badge={<>🧵 Patch's Workshop · Level {level}</>}
      ctaVerb="Build"
      renderIcon={(g) => <span className="wk-mission__emoji" aria-hidden="true">{g.emoji}</span>}
      greeting={<LevelStory learnerId={learnerId} level={level} />}
    />
  );
}
