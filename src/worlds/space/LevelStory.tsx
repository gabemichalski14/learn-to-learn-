import { useState, useMemo } from 'react';
import { navigate } from '../../router';
import { useLore, setStoryStage, acknowledge } from '../../world/lore/loreStore';
import { loadMastery } from '../../mastery/mastery';
import { castFor, characterStage, beatFor, healedBeatId } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';

/** How "whole" the character looks on the hub, by story stage. */
const STAGE_HEAL: Record<string, number> = { arrived: 0.12, healing: 0.5, healed: 1, resident: 1 };

/**
 * A level's character arc, surfaced on the level hub. The friend you meet asks
 * for help (arrived), cheers you on (healing), thanks you when their sound is
 * whole (healed → welcome them home), then lives in your garden (resident). The
 * "help" is the level's real game; this is the heart wrapped around it. Reusable
 * across levels — content comes from the cast registry.
 */
export function LevelStory({ learnerId, level }: { learnerId: string; level: number }) {
  const lore = useLore(learnerId);              // reactive: re-renders on welcome-home
  const character = castFor(level);
  // Stable per-mount seed keeps the chosen beat deterministic in render (no impure
  // Math.random during render); recomputed only when the stage actually changes.
  const [seed] = useState(() => Math.random());

  const mastery = useMemo(() => loadMastery(learnerId), [learnerId]);
  const stage = character ? characterStage(character, lore, mastery) : 'arrived';
  const beat = useMemo(() => (character ? beatFor(character, stage, () => seed) : ''), [character, stage, seed]);

  if (!character) return null;

  function welcomeHome() {
    if (!character) return;
    acknowledge(learnerId, healedBeatId(character));
    setStoryStage(learnerId, character.id, 'resident');
  }

  return (
    <section className={`sg-story sg-story--${stage}`} aria-label={`${character.name}'s story`}>
      <span className="sg-story__face">
        <CharacterArt emoji={character.emoji} heal={STAGE_HEAL[stage] ?? 1} size={72} art={character.art} label={character.name} />
      </span>
      <div className="sg-story__body">
        <p className="sg-story__name">{character.name}{stage === 'arrived' ? ' needs your help' : ''}</p>
        <p className="sg-story__beat" role="status">{beat}</p>
        {(stage === 'arrived' || stage === 'healing') && (
          <button type="button" className="sg-story__cta" onClick={() => navigate(character.playRoute)}>
            Help {character.name} ▸
          </button>
        )}
        {stage === 'healed' && (
          <button type="button" className="sg-story__cta sg-story__cta--home" onClick={welcomeHome}>
            Welcome him home ✓
          </button>
        )}
        {stage === 'resident' && (
          <button type="button" className="sg-story__cta sg-story__cta--ghost" onClick={() => navigate('#/level/1')}>
            Visit the garden 🌼
          </button>
        )}
      </div>
    </section>
  );
}
