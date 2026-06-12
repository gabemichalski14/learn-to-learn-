import { LevelHubShell } from '../../ui/LevelHubShell';
import { LevelStory } from '../space/LevelStory';
import '../workshop/workshop.css';
import './tinkertown.css';

/** Tinker Town — the immersive launcher for Level 5, hosted by Sprig. Structure
 *  comes from the shared LevelHubShell (congruent with every level); Tinker Town
 *  supplies only its theme: the `wk` prefix + `tt` tint, Sprig's story greeting, and
 *  the "Build" verb. */
export function TinkerTownLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  return (
    <LevelHubShell
      level={level}
      learnerId={learnerId}
      prefix="wk"
      rootClass="wk wk-hub tt"
      badge={<>🧚 Tinker Town · Level {level}</>}
      ctaVerb="Build"
      renderIcon={(g) => <span className="wk-mission__emoji" aria-hidden="true">{g.emoji}</span>}
      greeting={<LevelStory learnerId={learnerId} level={level} />}
    />
  );
}
