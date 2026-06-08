import { useRef, useState, type CSSProperties } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { SortRound, WordItem, SoundTarget } from '../../domain/types';
import type { AudioPlayer } from '../../audio/audioPlayer';
import { useSortGame } from '../../game/useSortGame';
import { soundOf } from '../../domain/engine';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession, noteRound } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { goBack, navigate } from '../../router';
import { SpaceBackdrop, ScoutDrone } from './SpaceArt';
import { SpaceSpecimen } from './creatureIcons';
import { SpaceFinish } from './SpaceFinish';
import { castFor, reactionLine, healFor, fragmentToReveal, characterStage } from '../../world/lore/cast';
import { setStoryStage, acknowledge, loadLore } from '../../world/lore/loreStore';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { LevelScene } from '../../world/LevelScene';
import { EchoTwinkle } from '../../mascots/EchoTwinkle';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import './space.css';

/** Sparkle directions for the catch burst (degrees around the planet). */
const SPARKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

interface Props {
  round: SortRound;
  audio: AudioPlayer;
  roundIndex?: number;
  totalRounds?: number;
  sessionId?: number;
  learnerId?: string;
  gameId?: string;
  sessionStartAt?: number;
  target?: SoundTarget;
  title?: string;
  level?: number;
  learnerName?: string;
  onAdvance?: () => void;
  onRestart?: () => void;
}

/** Planet hue rotations (degrees) — assigned RANDOMLY to vowels each round so
 *  colour is never a shortcut; the vowel letter (and its sound) is the only
 *  reliable cue. Same painted planet, recoloured. */
const PLANET_HUES = [0, 60, 130, 200, 280];

/** Over-the-top hero ranks — one picked at random when a patrol is completed. */
const HERO_TITLES = ['GALACTIC LEGEND', 'COSMIC CHAMPION', 'STARFLEET HERO', 'NEBULA MASTER', 'SUPERNOVA STAR', 'INTERSTELLAR ACE'];

/** Human word for the sound position, used in the instructions + labels. */
const POS_WORD: Record<SoundTarget, string> = { beginning: 'first', ending: 'last', medial: 'middle' };

/** A vowel "planet" — a droppable basket. Tapping it replays its sound. The
 *  painted planet is hue-rotated per round (so colour never predicts the vowel —
 *  the letter/sound stays the only reliable cue). */
function Planet({ vowel, hue, catching, hint, onReplay }: { vowel: string; hue: number; catching: boolean; hint?: boolean; onReplay: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: vowel });
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`sg-planet${isOver ? ' sg-planet--over' : ''}${catching ? ' sg-planet--catch' : ''}${hint ? ' sg-planet--hint' : ''}`}
      onClick={onReplay}
      aria-label={`Planet for the ${vowel} sound — tap to hear it`}
    >
      <img className="sg-planet__art" src="/characters/space/planet.png" alt="" aria-hidden="true" style={{ '--hue': `${hue}deg` } as CSSProperties} />
      <span className="lab">{vowel}</span>
      {catching && (
        <span className="sg-burst" aria-hidden="true">
          {SPARKS.map((a, i) => <i key={i} style={{ '--a': `${a}deg` } as CSSProperties} />)}
        </span>
      )}
    </button>
  );
}

/** A space creature — a draggable picture. Tapping it replays its word. */
function Creature({ item, hint, onReplay }: { item: WordItem; hint?: boolean; onReplay: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const style = {
    transform: isDragging
      ? `${CSS.Translate.toString(transform) ?? ''} scale(1.12) rotate(-3deg)`
      : CSS.Translate.toString(transform) ?? undefined,
  };
  return (
    <button
      ref={setNodeRef}
      style={style}
      className={`sg-creature${isDragging ? ' is-dragging' : ''}${hint ? ' sg-creature--hint' : ''}`}
      aria-label={item.label}
      onClick={onReplay}
      {...listeners}
      {...attributes}
    >
      <SpaceSpecimen id={item.id} label={item.label} emoji={item.emoji} />
    </button>
  );
}

/** Vowel Patrol (Space Patrol world) — sort creatures to the planet of their
 *  middle vowel. Drop-in for the platform's sort screen; reuses useSortGame. */
export function SpaceSortGame({
  round, audio, roundIndex = 0, totalRounds = 1, sessionId = 0,
  learnerId = 'guest', gameId = 'middle-sounds', sessionStartAt,
  target = 'medial', title = 'Vowel Patrol', level = 2, learnerName,
  onAdvance, onRestart,
}: Props) {
  const posWord = POS_WORD[target];
  const [startAt] = useState(() => sessionStartAt ?? Date.now());
  const [catching, setCatching] = useState<string | null>(null);
  const [finish, setFinish] = useState<{ ms: number; best: boolean; stars: number; title: string; beat?: string; homecoming?: boolean } | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  // The level's character is the in-game companion — you play to help THEM, and
  // they react to every move (agency → attachment). Lines are authored/data-driven.
  const character = castFor(level);
  // The partnership, as a pre-emptive tutorial: on the VERY first item of the
  // session, Moss shows his way BEFORE you try — he points to where the first
  // critter's hum belongs (a no-fail "watch, then you try" scaffold). Opening
  // sector only, cleared the moment you make your first move. No hints on misses.
  const tutorialBasket = character && roundIndex === 0 && round.items.length > 0
    ? soundOf(round.items[0], target)
    : null;
  const [mood, setMood] = useState<'cheer' | 'wobble' | 'point' | null>(tutorialBasket ? 'point' : null);
  const [shake, setShake] = useState(false);
  const [hintBasket, setHintBasket] = useState<string | null>(tutorialBasket);
  const [muted, setMutedState] = useState(isMuted());
  const [echoPing, setEchoPing] = useState(0); // bumps on an audio moment → Echo twinkles
  const pingEcho = () => setEchoPing((p) => p + 1);
  // Opening line = his teaching line when the tutorial is showing, else his intro.
  const [charLine, setCharLine] = useState(() =>
    character ? reactionLine(character, tutorialBasket ? 'teach' : 'intro') : '');
  const [clearLine] = useState(() => (character ? reactionLine(character, 'clear') : '')); // stable sector-clear beat
  // Moss's REAL recovery: derived from the learner's mastery of HIS sound, so
  // playing literally heals him (intrinsic). Persists across sessions; rises as
  // correct answers raise that sound's mastery. Drives his art + the scene warmth.
  const [heal, setHeal] = useState(() => (character ? healFor(character, loadMastery(learnerId)) : 0));
  // Shuffle planet HUES across THIS round's planets so colour never predicts the
  // vowel (the painted planet is the same art, just hue-rotated). Lazy init (runs
  // once per mount; the screen remounts each round) keeps hues stable mid-round
  // and re-rolls them every new sector — no pattern.
  const [planetHues] = useState<Record<string, number>>(() => {
    const pal = [...PLANET_HUES];
    for (let i = pal.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pal[i], pal[j]] = [pal[j], pal[i]];
    }
    const map: Record<string, number> = {};
    round.baskets.forEach((v, i) => { map[v] = pal[i % pal.length]; });
    return map;
  });
  const handledRef = useRef(false);
  // distance constraint: a tap (<8px) fires the creature's onClick (replay the
  // word) instead of being swallowed as a zero-length drag; real drags still work.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const total = round.items.length;
  const isLast = roundIndex >= totalRounds - 1;

  const game = useSortGame({
    round,
    audio,
    onItemResult: ({ skillKey, correct }) => {
      recordItem(learnerId, skillKey, correct);
      logSkillEvent(learnerId, { skillKey, correct, at: Date.now() });
      // Recover the character from his OWN sounds' real mastery (recordItem just
      // updated them). Average across all his scattered hums.
      if (character) setHeal(healFor(character, loadMastery(learnerId)));
    },
    onCorrect: ({ complete }) => finishRoundIfComplete(complete),
  });

  const placed = total - game.remainingItems.length;
  const roundDone = game.isComplete;

  // Hoisted named function so the impure Date.now()/new Date() aren't treated as
  // called-during-render; this only runs on the placement that finishes a round.
  function finishRoundIfComplete(complete: boolean) {
    if (!complete || handledRef.current) return;
    handledRef.current = true;
    const totals = noteRound(sessionId, game.wrongCount, total);
    if (!isLast) return;
    const durationMs = Math.max(0, Date.now() - startAt);
    const res = recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: gameId,
      level,
      startedAt: new Date(startAt).toISOString(),
      endedAt: new Date().toISOString(),
      durationMs,
      rounds: totalRounds,
      items: totals.items,
      wrongAttempts: totals.wrong,
      accuracy: totals.items > 0 ? totals.items / (totals.items + totals.wrong) : 1,
    });
    awardForSession(learnerId);
    const stars = totals.wrong === 0 ? 3 : totals.wrong <= 2 ? 2 : 1;
    const title = HERO_TITLES[Math.floor(Math.random() * HERO_TITLES.length)];
    sfx.win();
    // If ALL his hums are now mastered, he's WHOLE — advance his arc and offer to
    // send him home to the garden (where his named planting blooms).
    const stage = character ? characterStage(character, loadLore(learnerId), loadMastery(learnerId)) : 'arrived';
    const homecoming = stage === 'healed' || stage === 'resident';
    if (stage === 'healed' && character) setStoryStage(learnerId, character.id, 'healed');
    setFinish({
      ms: durationMs, best: res.isBest, stars, title,
      beat: character ? reactionLine(character, homecoming ? 'win' : 'clear') : undefined,
      homecoming,
    });
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function handleDragEnd(e: DragEndEvent) {
    const wordId = String(e.active.id);
    const basket = e.over ? String(e.over.id) : null;
    if (!basket) return;
    // Your first real move ends the tutorial point — watch, then it's your turn.
    if (hintBasket) setHintBasket(null);
    if (game.attemptPlace(wordId, basket)) {
      // correct — pop the planet, burst sparkles, climb the combo, Scout cheers
      setCatching(basket);
      sfx.pop();
      const c = comboRef.current + 1;
      comboRef.current = c;
      setCombo(c);
      if (c >= 2) sfx.combo(c); else sfx.correct();
      setMood('cheer');
      // If a hum just came fully home (a sound newly mastered), reveal its
      // memory — a story beat earned by real progress. Otherwise a warm cheer.
      if (character) {
        const frag = fragmentToReveal(character, loadLore(learnerId), loadMastery(learnerId));
        if (frag) { setCharLine(frag.line); acknowledge(learnerId, frag.id); }
        else setCharLine(reactionLine(character, 'correct'));
      }
      window.setTimeout(() => setCatching((cur) => (cur === basket ? null : cur)), 520);
      window.setTimeout(() => setMood((m) => (m === 'cheer' ? null : m)), 760);
    } else {
      // miss — gentle shake, soft cue, combo resets (always no-fail). No pointing
      // on misses: the only scaffold is the opening tutorial. Here Moss just stays
      // warm ("not yet, the little sounds are slippery") and you try again — which
      // keeps the recovery honest at the 95% bar.
      comboRef.current = 0;
      setCombo(0);
      sfx.wrong();
      if (character) setCharLine(reactionLine(character, 'wrong'));
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      setMood('wobble');
      window.setTimeout(() => setMood((m) => (m === 'wobble' ? null : m)), 620);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="sg">
        <SpaceBackdrop />
        {character && <LevelScene heal={heal} />}

        <div className="sg-hud">
          <button type="button" className="sg-back" onClick={() => goBack(`#/level/${level}`)}>← Back</button>
          <span className="sg-badge"><span className="dot" /> {title} · Sector {roundIndex + 1}</span>
          {combo >= 2 && <span key={combo} className="sg-combo" aria-label={`${combo} in a row`}>🔥 {combo}</span>}
          <span className="sg-seg" aria-label={`Sector ${roundIndex + 1} of ${totalRounds}`}>
            {Array.from({ length: totalRounds }).map((_, i) => (
              <i key={i} className={i <= roundIndex ? 'on' : ''} />
            ))}
          </span>
          {learnerName && <span className="sg-who" aria-label={`Playing as ${learnerName}`}>👤 {learnerName}</span>}
          <button type="button" className="sg-mute" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={muted}>{muted ? '🔇' : '🔊'}</button>
        </div>

        <div className={`sg-stage${shake ? ' sg-stage--shake' : ''}`}>
          {echoPing > 0 && <EchoTwinkle key={echoPing} className="sg-echoping" />}

          {character && (
            <div className="sg-hero">
              <span className="sg-hero__face">
                <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={64} art={character.art} label={character.name} />
              </span>
              <div className="sg-hero__body">
                <p className="sg-hero__line" role="status">{charLine}</p>
                <div className="sg-hero__meter" role="img" aria-label={`${character.name}'s recovery: ${Math.round(heal * 100)}%`}>
                  <span className="sg-hero__fill" style={{ width: `${Math.round(heal * 100)}%` }} />
                </div>
                <p className="sg-hero__cap">Tap a critter to hear it, then fly it to the matching {posWord}-sound planet — every one brings {character.name} closer home.</p>
              </div>
            </div>
          )}

          <div className="sg-planets">
            {round.baskets.map((v) => (
              <Planet key={v} vowel={v} hue={planetHues[v]} catching={catching === v} hint={hintBasket === v} onReplay={() => { pingEcho(); game.replaySound(v); }} />
            ))}
          </div>

          <div className="sg-tray">
            {game.remainingItems.map((it) => (
              <Creature key={it.id} item={it} hint={!!hintBasket && it.id === round.items[0]?.id} onReplay={() => { sfx.tap(); pingEcho(); game.replayWord(it); }} />
            ))}
          </div>

          <p className="sg-status" role="status">
            {game.message ?? (placed > 0 ? `${placed} of ${total} routed — keep going!` : '')}
          </p>
        </div>

        {!character && (
          <div className="sg-scout">
            <button
              type="button"
              className={`sg-scout__btn${guideOpen ? '' : ' nudge'}`}
              onClick={() => setGuideOpen((o) => !o)}
              aria-label="Scout — tap for directions"
            >
              <ScoutDrone mood={mood === 'point' ? null : mood} />
            </button>
            {guideOpen && (
              <div className="sg-bubble" role="status">
                <button type="button" className="sg-bubble__x" onClick={() => setGuideOpen(false)} aria-label="Close directions">✕</button>
                <p className="sg-bubble__hi">Scout here, Captain! 🛰️</p>
                <p>Tap a space critter to <b>hear its word</b>, then drag it to the planet with the <b>same {posWord} sound</b>.</p>
                <p className="sg-bubble__hint">Tap a planet to hear its sound, too.</p>
              </div>
            )}
          </div>
        )}

        {roundDone && !isLast && !finish && (
          <div className="sg-finish">
            <div className="sg-finish__card">
              <p className="sg-finish__title">Sector clear! 🛰️</p>
              <p className="sg-finish__sub">{character && clearLine ? clearLine : 'Nice routing. Ready for the next sector?'}</p>
              <button type="button" className="sg-btn" onClick={onAdvance}>Next sector →</button>
            </div>
          </div>
        )}

        {finish && (
          <SpaceFinish
            ms={finish.ms}
            best={finish.best}
            stars={finish.stars}
            title={finish.title}
            beat={finish.beat}
            homecoming={finish.homecoming}
            characterEmoji={character?.emoji}
            characterArt={character?.art}
            onGarden={() => navigate('#/level/1')}
            onRestart={() => onRestart?.()}
            onBack={() => goBack(`#/level/${level}`)}
          />
        )}
      </main>
    </DndContext>
  );
}
