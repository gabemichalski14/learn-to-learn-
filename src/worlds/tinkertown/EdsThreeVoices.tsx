import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildEdRounds, ED_VOICES, type EdWord, type EdSound } from '../../content/packs/level5';
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
const SKILL = 'affix:ed';
const HINT = 'Listen to the -ed at the end — which voice is it? 🎵';

/**
 * Ed's Three Voices — Sprig's Level 5 listening game for the three sounds of -ed:
 * /t/ (jumped), /d/ (played), /uh-d/ (wanted). The word is shown AND played; the -ed
 * spelling is the same every time, so the child can't read the sound — they must
 * LISTEN and tap the matching voice. Audio-first by design (the schwa /uh-d/ can't be
 * sounded from letters). Logs affix:ed; replays = re-hears.
 */
export function EdsThreeVoices({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<EdWord[]>(() => buildEdRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<EdSound | null>(null);
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

  function choose(id: EdSound) {
    if (picked !== null || !round || finish || advancingRef.current) return;
    const correct = id === round.sound;
    setPicked(id);
    if (correct) {
      advancingRef.current = true;
      const firstTry = roundWrongRef.current === 0;
      const chosen = firstWrongRef.current;
      const shown = shownRef.current;
      const replays = replaysRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, SKILL, firstTry, latencyMs, firstTry ? undefined : chosen);
        logSkillEvent(learnerId, { skillKey: SKILL, correct: firstTry, at: Date.now(), game: 'l5-ed', level: 5, firstTry: true, latencyMs, replays, chosen: firstTry ? undefined : chosen });
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
      if (firstWrongRef.current === undefined) firstWrongRef.current = id;
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
      game: 'l5-ed', level: 5,
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
    setRounds(buildEdRounds(ROUNDS)); setFinish(null); setRi(0); setPicked(null); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={<>🎵 Ed's Three Voices · Level 5</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">You heard every voice! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">Sprig loves how you listened — same -ed, three sounds. 🎵</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Listen more 🔁</button>
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

          <div className="tt-pic" aria-hidden="true">{round.emoji}</div>
          <p className="tt-base" aria-label={`the word ${round.word}`}>{round.word}</p>
          <button type="button" className="tt-hear" onClick={hearAgain}>🔊 hear it again</button>

          <div className="tt-voices" role="group" aria-label="which sound does -ed make?">
            {ED_VOICES.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`tt-voice${picked === v.id ? (v.id === round.sound ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null}
                onClick={() => choose(v.id)}
                aria-label={`the ${v.label} sound, like ${v.example}`}
              >
                <span className="tt-voice__label">{v.label}</span>
                <span className="tt-voice__eg">like {v.example}</span>
              </button>
            ))}
          </div>

          <p className="tt-help">🎵 The letters -ed can say /t/, /d/, or /uh-d/ — your ears decide, not your eyes.</p>
        </div>
      ) : null}
    </GameShell>
  );
}
