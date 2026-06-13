import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildPeelRounds, type PeelWord } from '../../content/packs/level5';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './tinkertown.css';

const ROUNDS = 6;
const SKILL = 'affix:peel';
const HINT = 'Peel off the parts to find the little base word! 🍃';

type Chip = { text: string; base: boolean };

/**
 * Take It Apart — Sprig's Level 5 PEEL-OFF game. A long word arrives in its parts
 * (un · lock · ing); the child peels the affix chips off the front + end, leaving the
 * base to read. This is the structured-literacy "peel-off" strategy for the long
 * words that overwhelm a struggling reader — make a giant word small by finding the
 * base. Tapping the base by mistake is gently corrected. Logs affix:peel.
 */
export function TakeItApart({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<PeelWord[]>(() => buildPeelRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [peeled, setPeeled] = useState<number[]>([]); // indices of peeled affix chips
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(HINT);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const roundWrongRef = useRef(0);
  const shownRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const chips: Chip[] = round
    ? [
        ...(round.prefix ? [{ text: round.prefix, base: false }] : []),
        { text: round.base, base: true },
        ...(round.suffix ? [{ text: round.suffix, base: false }] : []),
      ]
    : [];
  const affixCount = round ? (round.prefix ? 1 : 0) + (round.suffix ? 1 : 0) : 0;
  const solved = round != null && peeled.length === affixCount;
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) shownRef.current = Date.now(); // peeled is reset on advance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function tapChip(idx: number, chip: Chip) {
    if (!round || finish || advancingRef.current || solved || peeled.includes(idx)) return;
    if (chip.base) {
      // tapped the base by mistake — gentle correction, not a fail
      wrongRef.current += 1; roundWrongRef.current += 1;
      sfx.wrong(); setWrongIdx(idx); setMood('wobble');
      setLine("That's the base — peel the PARTS around it. 🍃");
      window.setTimeout(() => { setWrongIdx(null); setMood(null); }, 700);
      return;
    }
    sfx.tap();
    const next = [...peeled, idx];
    setPeeled(next);
    if (next.length === affixCount) {
      advancingRef.current = true;
      const firstTry = roundWrongRef.current === 0;
      const shown = shownRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, SKILL, firstTry, latencyMs);
        logSkillEvent(learnerId, { skillKey: SKILL, correct: firstTry, at: Date.now(), game: 'l5-peel', level: 5, firstTry: true, latencyMs, replays: 0 });
      }, 0);
      sfx.correct(); setMood('cheer');
      window.setTimeout(() => say(round.base), 260); // read the base…
      window.setTimeout(() => say(round.word), 920); // …then the whole word
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null); roundWrongRef.current = 0;
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setPeeled([]); setRi((n) => n + 1); setLine(HINT); advancingRef.current = false; }
      }, 1600);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'l5-peel', level: 5,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: rounds.length, items: rounds.length, wrongAttempts: wrongRef.current,
      accuracy: rounds.length / (rounds.length + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    roundWrongRef.current = 0; startRef.current = Date.now();
    setRounds(buildPeelRounds(ROUNDS)); setFinish(null); setRi(0); setPeeled([]); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={<>🍃 Take It Apart · Level 5</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Every giant word, taken apart! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">Sprig says a big word is never too big — just peel it to the base. 🍃</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Peel more 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/5')}>Back to Tinker Town</button>
            </div>
          </div>
        </div>
      ) : round ? (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Sprig'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood={mood} size={88} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <p className="tt-job">peel the parts — tap each one that's stuck on the base</p>
          <div className="tt-peel" role="group" aria-label={`take apart the word ${round.word}`}>
            {chips.map((c, idx) => (
              <button
                key={idx}
                type="button"
                className={`tt-peel-chip${c.base ? ' tt-peel-chip--base' : ' tt-peel-chip--affix'}${peeled.includes(idx) ? ' is-peeled' : ''}${c.base && solved ? ' is-base-glow' : ''}${wrongIdx === idx ? ' is-wrong' : ''}`}
                disabled={peeled.includes(idx) || solved}
                onClick={() => tapChip(idx, c)}
                aria-label={c.base ? `base word ${c.text}` : `peel the part ${c.text}`}
              >{c.text}</button>
            ))}
          </div>

          <p className="tt-help">🍃 A big word is a little base with parts stuck on. Peel them, and the base is right there.</p>
        </div>
      ) : null}
    </GameShell>
  );
}
