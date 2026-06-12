import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { ALPHABET } from '../../content/packs/level2';
import { buildHeartRounds } from '../../content/packs/heartWords';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { SpaceBackdrop } from './SpaceArt';
import { GameShell } from '../../ui/GameShell';
import { Icon } from '../../ui/Icon';
import { castFor, reactionLine, healFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './space.css';

const ROUNDS = 5;

/**
 * Plant the Word — Moss's Level 2 HEART-WORD game (orthographic mapping of
 * irregular high-frequency words). Two beats per word: (1) LEARN — hear it in a
 * sentence and SEE the irregular "heart" letters highlighted ("your ears can't
 * sound this part — your eyes remember it"); (2) SPELL it back from memory on the
 * A–Z tray. Logs ONE heart:<word> event per word — correct only if spelled with no
 * wrong taps; the first wrong letter (often AT the heart) is the misspelling signal.
 */
export function PlantTheWord({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(2); // Moss
  const [heal, setHeal] = useState(() => (character ? healFor(character, loadMastery(learnerId)) : 1));
  const [muted, setMutedState] = useState(isMuted());
  function toggleMute() { const n = !muted; setMuted(n); setMutedState(n); }
  const [rounds, setRounds] = useState(() => buildHeartRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [phase, setPhase] = useState<'learn' | 'spell'>('learn');
  const [placed, setPlaced] = useState(0);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Some words you learn by heart. Listen — then look. 💛');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const wordWrongRef = useRef(0);
  const wordFirstWrongRef = useRef<string | undefined>(undefined);

  const round = rounds[ri];
  const word = round?.word ?? '';
  const shownRef = useRef(0); // when spelling began → time-to-spell latency

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish && phase === 'learn') void audio.narrate(round.sentence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function startSpelling() {
    if (!round) return;
    shownRef.current = Date.now(); // clock the spell-from-memory attempt
    setPhase('spell');
    setLine('Now spell it from memory — tap each letter in order.');
    void audio.playWord({ id: word, label: word, emoji: '🔈' });
  }

  function onLetter(letter: string) {
    if (finish || advancingRef.current || phase !== 'spell' || !round) return;
    const p = placed;
    if (letter === word[p]) {
      sfx.correct();
      setPlaced(p + 1);
      if (p + 1 >= word.length) {
        advancingRef.current = true;
        const correct = wordWrongRef.current === 0;
        const chosen = wordFirstWrongRef.current;
        setMood('cheer');
        if (character) setLine(reactionLine(character, 'correct'));
        window.setTimeout(() => {
          const latencyMs = Date.now() - shownRef.current;
          recordItem(learnerId, `heart:${word}`, correct, latencyMs, correct ? undefined : chosen, true);
          // replays: 0 by design — spell-from-memory has no re-hear button (re-hearing would defeat the orthographic-recall point).
          logSkillEvent(learnerId, { skillKey: `heart:${word}`, correct, at: Date.now(), game: 'plant-the-word', level: 2, firstTry: true, latencyMs, replays: 0, chosen: correct ? undefined : chosen });
          if (character) setHeal(healFor(character, loadMastery(learnerId)));
        }, 0);
        window.setTimeout(() => {
          setMood(null);
          wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
          if (ri + 1 >= ROUNDS) finishSession(Date.now());
          else { setRi((n) => n + 1); setPlaced(0); setPhase('learn'); setLine('Another one to plant. Listen — then look. 💛'); advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1;
      wordWrongRef.current += 1;
      if (wordFirstWrongRef.current === undefined) wordFirstWrongRef.current = letter;
      sfx.wrong();
      setMood('wobble');
      setWrongKey(letter);
      window.setTimeout(() => { setWrongKey(null); setMood(null); }, 460);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'plant-the-word', level: 2,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
    startRef.current = Date.now(); setRounds(buildHeartRounds(ROUNDS)); setFinish(null); setRi(0); setPlaced(0); setPhase('learn');
  }

  return (
    <GameShell
      prefix="sg"
      rootClass="sg ss"
      backdrop={<SpaceBackdrop />}
      back={{ label: '← Space', onClick: () => goBack('#/level/2') }}
      badge={<>💛 Plant the Word · Level 2</>}
      current={ri}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="ss-stage">
          <div className="ss-finish">
            <div className="ss-finish__art"><CharacterArt emoji={character?.emoji ?? '🛰️'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="ss-finish__title">Planted them all! {'★'.repeat(finish.stars)}</p>
            <p className="ss-finish__say">{character?.name ?? 'Moss'} will help these words grow into sight words. 💛</p>
            <div className="ss-actions">
              <button type="button" className="ss-btn" onClick={restart}>Plant again <Icon name="ico-replay" emoji="🔁" /></button>
              <button type="button" className="ss-btn ss-btn--ghost" onClick={() => navigate('#/level/2')}>Back to the Station</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="ss-stage">
          {character && (
            <div className="ss-hero">
              <button type="button" className="ss-hero__face" onClick={() => { void audio.narrate(phase === 'learn' ? round.sentence : line); sfx.tap(); }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={96} art={character.art} label={character.name} />
              </button>
              <p className="ss-hero__line" role="status">{line}</p>
            </div>
          )}

          {phase === 'learn' ? (
            <>
              <p className="hw-word" aria-label={word}>
                {Array.from(word).map((ch, idx) => (
                  <span key={idx} className={`hw-letter${round.heart.includes(idx) ? ' hw-letter--heart' : ''}`}>{ch}</span>
                ))}
              </p>
              <p className="hw-caption">The 💛 part you learn <b>by heart</b> — your ears can't sound it out. Sound out the rest.</p>
              <button type="button" className="ss-btn hw-plant" onClick={startSpelling}>Plant it 🌱 — now spell it</button>
            </>
          ) : (
            <>
              <p className="sg-ask">Spell <b>{word}</b> from memory — tap each letter in order.</p>
              <div className="ss-slots" aria-label="word being spelled">
                {Array.from(word).map((ch, idx) => (
                  <span key={idx} className={`ss-slot${idx < placed ? ' is-filled' : ''}${round.heart.includes(idx) ? ' is-heart' : ''}`}>{idx < placed ? ch : ''}</span>
                ))}
              </div>
              <div className="wb-keys" role="group" aria-label="alphabet">
                {ALPHABET.map((ch) => (
                  <button key={ch} type="button" className={`wb-key${wrongKey === ch ? ' is-wrong' : ''}`} onClick={() => onLetter(ch)}>{ch}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </GameShell>
  );
}
