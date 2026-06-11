import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildBlendRounds } from '../../content/packs/level3';
import { recordItem } from '../../mastery/mastery';
import { blendKey } from '../../mastery/skills';
import { l3WeightOf } from './adaptive';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import './workshop.css';

const ROUNDS = 6;
const PATCH = { emoji: '🧵', name: 'Patch' };

/**
 * Blend Buddies — Patch's Level 3 headliner. Hear a word, then BUILD it from tiles.
 * The two blend consonants are "buddies" that must BOTH be placed — dropping one is
 * blend reduction ("slip" → "sip"), the central L3 error. We log the blend skill
 * per word (first-try) and, on a miss in the blend, the DROPPED consonant via
 * `chosen` — so the dashboard's confusion engine can surface "often drops /l/".
 */
export function BlendBuddies({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [rounds, setRounds] = useState(() => buildBlendRounds(ROUNDS, Math.random, l3WeightOf(learnerId)));
  const [ri, setRi] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<Set<number>>(new Set());
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Hear the word, then build it — keep BOTH buddies together! 🤝');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);              // total wrong taps (for the star score)
  const wrongWordRef = useRef(false);      // any miss on THIS word?
  const reducedRef = useRef<string | null>(null); // the blend consonant they dropped
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const word = round?.word ?? '';
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function logBlend() {
    if (!round) return;
    const k = blendKey(round.position, round.blend);
    const correct = !wrongWordRef.current;
    const chosen = correct ? undefined : (reducedRef.current ?? undefined);
    window.setTimeout(() => {
      recordItem(learnerId, k, correct, undefined, chosen, true);
      logSkillEvent(learnerId, { skillKey: k, correct, at: Date.now(), game: 'blend-buddies', level: 3, firstTry: true, chosen });
    }, 0);
  }

  function onTile(tileIdx: number) {
    if (finish || advancingRef.current || used.has(tileIdx) || !round) return;
    const letter = round.tiles[tileIdx];
    const p = placed;
    if (letter === word[p]) {
      sfx.correct();
      setUsed((prev) => new Set(prev).add(tileIdx));
      setPlaced(p + 1);
      if (p + 1 >= word.length) {
        logBlend();
        advancingRef.current = true;
        setMood('cheer');
        setLine(`Both buddies stayed — “${word}”! 🤝`);
        say(word);
        window.setTimeout(() => {
          setMood(null);
          if (ri + 1 >= ROUNDS) finishSession(Date.now());
          else { setRi((n) => n + 1); setPlaced(0); setUsed(new Set()); wrongWordRef.current = false; reducedRef.current = null; advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1;
      wrongWordRef.current = true;
      const droppingBuddy = round.blendIdx.includes(p);
      if (droppingBuddy) reducedRef.current = word[p]; // the blend sound they're skipping
      sfx.wrong();
      setMood('wobble');
      setWrongTile(tileIdx);
      setLine(droppingBuddy ? `Don't drop the /${word[p]}/ — both buddies hold hands! 🤝` : 'Hmm, listen again — which sound comes next?');
      window.setTimeout(() => { setWrongTile(null); setMood(null); }, 650);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'blend-buddies', level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    wrongWordRef.current = false; reducedRef.current = null; startRef.current = Date.now();
    setRounds(buildBlendRounds(ROUNDS, Math.random, l3WeightOf(learnerId))); setFinish(null); setRi(0); setPlaced(0); setUsed(new Set());
  }

  return (
    <main className="wk">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/3')}>← Workshop</button>
        <span className="wk-badge">🧵 Blend Buddies · Level 3</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art" aria-hidden="true">{PATCH.emoji}</div>
            <p className="wk-finish__title">Built it! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{PATCH.name} loved how you kept every buddy together. 🤝</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Build again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/3')}>Back to the Workshop</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${PATCH.name} again`}>
              <span className={`wk-patch${mood ? ` is-${mood}` : ''}`} aria-hidden="true">{PATCH.emoji}</span>
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <button type="button" className="wk-pic" onClick={() => say(word)} aria-label="Hear the word again">
            <span className="wk-pic__emoji">{round.emoji ?? '🔧'}</span>
            <span className="wk-pic__hear">🔊 hear it</span>
          </button>

          <div className="wk-slots" aria-label="word being built">
            {Array.from(word).map((ch, idx) => {
              const buddy = round.blendIdx.includes(idx);
              return <span key={idx} className={`wk-slot${idx < placed ? ' is-filled' : ''}${buddy ? ' is-buddy' : ''}`}>{idx < placed ? ch : ''}</span>;
            })}
          </div>

          <div className="wk-tray" role="group" aria-label="letter tiles">
            {round.tiles.map((ch, idx) => (
              <button key={idx} type="button" className={`wk-tile${used.has(idx) ? ' is-used' : ''}${wrongTile === idx ? ' is-wrong' : ''}`} disabled={used.has(idx)} onClick={() => onTile(idx)}>{ch}</button>
            ))}
          </div>

          <span className="wk-progress" aria-hidden="true">
            {rounds.map((_, n) => <i key={n} className={n < ri ? 'done' : n === ri ? 'on' : ''} />)}
          </span>
        </div>
      )}
    </main>
  );
}
