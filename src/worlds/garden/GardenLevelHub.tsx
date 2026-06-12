import { useMemo, useState } from 'react';
import { goBack, navigate } from '../../router';
import { findLevel } from '../../games';
import { useDataVersion } from '../../data/store';
import { isLevelReady, isLevelPassed } from '../../mastery/levelGate';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { loadMastery } from '../../mastery/mastery';
import { loadLore, setStoryStage } from '../../world/lore/loreStore';
import { castFor, healFor, characterStage, beatFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { GardenBackdrop } from './GardenArt';
import { Icon } from '../../ui/Icon';
import { MissionIcon } from '../../ui/MissionIcon';
import { HubHeader } from '../../ui/HubHeader';
import './garden.css';

/** Per-game painted icon (falls back to the game's emoji until a PNG exists). */
const GAME_ICON: Record<string, string> = {
  'tap-it-out': 'ico-tap-it-out', 'same-or-different': 'ico-same-different', 'switch-it': 'ico-switch-it',
  'rhyme-time': 'ico-rhyme-time', 'blend-it': 'ico-blend-it',
};

/** Calm launcher for Level 1's Sound Garden games. A painted meadow, the level's
 *  focus, its games — and the level's companion (Chip) greeting you, healing as
 *  you play. The cozy reward space (your bloomed flowers, friends) lives in the
 *  Village one tap away. Rendered drawer-free by App for level 1. */
export function GardenLevelHub({ level, learnerId }: { level: number; learnerId: string }) {
  useDataVersion();
  const lvl = findLevel(level);
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(level);

  // The companion greets you and reflects real recovery (heals as you play). When
  // his whole song is back (every game mastered) you can walk him home from here.
  const mastery = loadMastery(learnerId);
  const heal = character ? healFor(character, mastery) : 1;
  const stage = character ? characterStage(character, loadLore(learnerId), mastery) : 'arrived';
  const [line] = useState(() => (character ? beatFor(character, stage) : ''));
  const [mood, setMood] = useState<'cheer' | null>(null);

  if (!lvl) {
    return (
      <main className="gd gd-hub">
        <GardenBackdrop />
        <div className="gd-hud"><button type="button" className="gd-back" onClick={() => goBack('#/levels')}>← Levels</button></div>
        <div className="gd-stage"><h1 className="gd-hub__title">Level not found</h1></div>
      </main>
    );
  }

  function walkHome() {
    if (!character) return;
    setStoryStage(learnerId, character.id, 'resident');
    navigate('#/village');
  }

  return (
    <main className="gd gd-hub">
      <GardenBackdrop />
      <HubHeader
        prefix="gd"
        back={{ label: '← Levels', onClick: () => goBack('#/levels') }}
        badge={<><Icon name="ico-sound-garden" emoji="🌱" /> Sound Garden · Level {lvl.num}</>}
      />

      <div className="gd-stage gd-hub__stage">
        <h1 className="gd-hub__title">{lvl.title}</h1>
        <p className="gd-hub__lead">{lvl.focus}</p>

        {character && (
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
        )}

        {character && stage === 'healed' && (
          <button type="button" className="gd-hub__home" onClick={walkHome}>
            🏡 Walk {character.name} home — his whole song is back!
          </button>
        )}

        <div className="gd-missions">
          {lvl.games.map((g) => {
            const available = g.status === 'available';
            return (
              <button
                key={g.id}
                type="button"
                className="gd-mission"
                onClick={() => { if (available && g.route) navigate(g.route); }}
                disabled={!available}
                aria-label={available ? `Play ${g.title}` : `${g.title} — coming soon`}
              >
                <MissionIcon name={GAME_ICON[g.id] ?? ''} emoji={g.emoji} accent="#5aa06f" />
                <span className="gd-mission__title">{g.title}</span>
                <span className="gd-mission__tag">{g.tagline}</span>
                <span className={`gd-mission__foot ${available ? 'gd-mission__go' : 'gd-mission__soon'}`}>
                  {available ? 'Play ▸' : 'Soon'}
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

        <button type="button" className="gd-hub__village" onClick={() => navigate('#/village')}>
          <Icon name="ico-village" emoji="🏡" /> Visit your Village
        </button>
      </div>
    </main>
  );
}
