import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildSortRounds, SORT_BINS, type SortRound } from '../../content/packs/level5';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './tinkertown.css';

const ROUNDS = 8;
const SKILL = 'affix:sort';
const HINT = 'Which part does the word have? Or is it "Not a Part!" 🗂️';

/**
 * Block Sort — Sprig's Level 5 sorting game with the false-affix "check the base"
 * beat. A word appears; the child sorts it into its affix bin (un- / re- / -ing /
 * -ed) — OR into "Not a Part!" when the edge letters only LOOK like an affix (under,
 * red, bring): peel it and no real base is left. This discernment is the research's
 * flagged crux of affix teaching. Logs affix:sort; replays = re-hears.
 */
export function BlockSort({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<SortRound[]>(() => buildSortRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(HINT);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const roundWrongRef = useRef(0);
  const firstWrongRef = useRef<string | undefined>(undefined);
  const shownRef = useRef(0);
  const replaysRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; say(round.word); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  const hearAgain = () => { if (round) { replaysRef.current += 1; say(round.word); sfx.tap(); } };

  function choose(binId: string) {
    if (picked !== null || !round || finish || advancingRef.current) return;
    const correct = binId === round.answer;
    setPicked(binId);
    if (correct) {
      advancingRef.current = true;
      const firstTry = roundWrongRef.current === 0;
      const chosen = firstWrongRef.current;
      const shown = shownRef.current;
      const replays = replaysRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, SKILL, firstTry, latencyMs, firstTry ? undefined : chosen);
        logSkillEvent(learnerId, { skillKey: SKILL, correct: firstTry, at: Date.now(), game: 'l5-sort', level: 5, firstTry: true, latencyMs, replays, chosen: firstTry ? undefined : chosen });
      }, 0);
      sfx.correct(); setMood('cheer');
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null); setPicked(null);
        roundWrongRef.current = 0; firstWrongRef.current = undefined;
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setRi((n) => n + 1); setLine(HINT); }
      }, 1100);
    } else {
      wrongRef.current += 1; roundWrongRef.current += 1;
      if (firstWrongRef.current === undefined) firstWrongRef.current = binId;
      sfx.wrong(); setMood('wobble');
      if (character) setLine(reactionLine(character, 'wrong'));
      window.setTimeout(() => { setMood(null); setPicked(null); }, 800);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'l5-sort', level: 5,
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
    roundWrongRef.current = 0; firstWrongRef.current = undefined; startRef.current = Date.now();
    setRounds(buildSortRounds(ROUNDS)); setFinish(null); setRi(0); setPicked(null); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={<>🗂️ Block Sort · Level 5</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Every part sorted! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">Sprig says a good tinkerer knows a real part from a stuck-on letter. 🗂️</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Sort more 🔁</button>
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

          <p className="tt-base" aria-label={`the word ${round.word}`}>{round.word}</p>
          <button type="button" className="tt-hear" onClick={hearAgain}>🔊 hear it again</button>

          <div className="tt-bins" role="group" aria-label="sort the word into its part">
            {SORT_BINS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`tt-bin${b.id === 'none' ? ' tt-bin--none' : ''}${picked === b.id ? (b.id === round.answer ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null}
                onClick={() => choose(b.id)}
                aria-label={b.id === 'none' ? 'not a real part' : `the ${b.label} part`}
              >{b.label}</button>
            ))}
          </div>

          <p className="tt-help">🗂️ A real part peels off to leave a real word. If it doesn't — it's "Not a Part!"</p>
        </div>
      ) : null}
    </GameShell>
  );
}
