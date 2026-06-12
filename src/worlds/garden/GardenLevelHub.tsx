import { useMemo, useState } from 'react';
import { navigate } from '../../router';
import { useDataVersion } from '../../data/store';
import { hasPendingReview } from '../../world/memory/reviewStore';
import { hasScreened } from '../../mastery/screener';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { loadMastery } from '../../mastery/mastery';
import { loadLore, setStoryStage } from '../../world/lore/loreStore';
import { castFor, healFor, characterStage, beatFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { GardenBackdrop } from './GardenArt';
import { Icon } from '../../ui/Icon';
import { MissionIcon } from '../../ui/MissionIcon';
import { LevelHubShell } from '../../ui/LevelHubShell';
import './garden.css';

/** Per-game painted icon (falls back to the game's emoji until a PNG exists). */
const GAME_ICON: Record<string, string> = {
  'tap-it-out': 'ico-tap-it-out', 'same-or-different': 'ico-same-different', 'switch-it': 'ico-switch-it',
  'rhyme-time': 'ico-rhyme-time', 'blend-it': 'ico-blend-it',
};

/** Sound Garden — the immersive launcher for Level 1, hosted by Chip. Structure
 *  comes from the shared LevelHubShell (congruent with every level); the Garden
 *  supplies its theme (the `gd` prefix, a painted meadow, "Play") PLUS its own
 *  companion greeter + warm-up/walk-home/tending slots that live in the same
 *  places the shell reserves for them. */
export function GardenLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion(); // greeter reflects live recovery (heals as you play)
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(level);

  const mastery = loadMastery(learnerId);
  const heal = character ? healFor(character, mastery) : 1;
  const stage = character ? characterStage(character, loadLore(learnerId), mastery) : 'arrived';
  const [line] = useState(() => (character ? beatFor(character, stage) : ''));
  const [mood, setMood] = useState<'cheer' | null>(null);

  function walkHome() {
    if (!character) return;
    setStoryStage(learnerId, character.id, 'resident');
    navigate('#/village');
  }

  // The companion greets you and reflects real recovery — same slot LevelStory
  // fills on the other levels, so the greeting sits in the same place everywhere.
  const greeting = character ? (
    <div className="gd-hero gd-hub__greeter">
      <button
        type="button"
        className="gd-hero__face"
        onClick={() => { void audio.narrate(line); sfx.tap(); setMood('cheer'); window.setTimeout(() => setMood((m) => (m === 'cheer' ? null : m)), 760); }}
        aria-label={`Hear ${character.name}`}
      >
        <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={84} art={character.art} label={character.name} />
      </button>
      <div className="gd-hero__body">
        <p className="gd-hero__line" role="status">{line}</p>
        <div className="gd-hero__meter" role="img" aria-label={`${character.name}'s song: ${Math.round(heal * 100)}% back`}>
          <span className="gd-hero__fill" style={{ width: `${Math.round(heal * 100)}%` }} />
        </div>
      </div>
    </div>
  ) : null;

  const beforeMissions = (
    <>
      {character && stage === 'healed' && (
        <button type="button" className="lvlhub-check" onClick={walkHome}>🏡 Walk {character.name} home — his whole song is back!</button>
      )}
      {!hasScreened(learnerId) && (
        <button type="button" className="lvlhub-check" onClick={() => navigate('#/welcome')}>🌱 Meet {character?.name ?? 'Chip'} — a quick garden warm-up</button>
      )}
    </>
  );

  const afterMissions = hasPendingReview(learnerId) ? (
    <button type="button" className="lvlhub-village" onClick={() => navigate('#/tending')}>🌱 Tend the garden — check a few sounds</button>
  ) : null;

  return (
    <LevelHubShell
      level={level}
      learnerId={learnerId}
      prefix="gd"
      rootClass="gd gd-hub"
      badge={<><Icon name="ico-sound-garden" emoji="🌱" /> Sound Garden · Level {level}</>}
      backdrop={<GardenBackdrop />}
      ctaVerb="Play"
      renderIcon={(g) => <MissionIcon name={GAME_ICON[g.id] ?? ''} emoji={g.emoji} accent="#5aa06f" />}
      greeting={greeting}
      beforeMissions={beforeMissions}
      afterMissions={afterMissions}
    />
  );
}
