import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import type { SortRound, WordItem } from '../domain/types';
import type { AudioPlayer } from '../audio/audioPlayer';
import { sfx } from '../audio/sfx';
import { useSortGame } from './useSortGame';
import { PictureCard } from './PictureCard';
import { SoundBasket } from './SoundBasket';
import { BookTree } from './BookTree';
import { WalkProgress } from './WalkProgress';
import { ProgressTrail } from './ProgressTrail';
import { SproutGlyph } from '../Mascot';
import { soundOf } from '../domain/engine';
import { recordFinish, formatTime, loadEarned } from '../progress';
import { logSession, noteRound } from '../sessionLog';
import { recordItem } from '../mastery/mastery';
import { logSkillEvent } from '../data/cloudSync';
import { awardForSession, ACHIEVEMENTS } from '../achievements';
import type { Achievement } from '../achievements';

interface Props {
  round: SortRound;
  audio: AudioPlayer;
  roundIndex?: number;
  totalRounds?: number;
  /** Identifies the current session (resets the cross-round accumulator). */
  sessionId?: number;
  /** Which learner this session belongs to (keys progress / log / stickers). */
  learnerId?: string;
  /** Which game this is, for the session log (e.g. 'beginning-sounds'). */
  gameId?: string;
  /** Timestamp (ms) when the current session began — for the elapsed finish clock. */
  sessionStartAt?: number;
  onAdvance?: () => void;
  onRestart?: () => void;
  /** Open the sticker-book overlay (offered on the finish screen). */
  onOpenStickerBook?: () => void;
  /** Playful theme — turns on the mascot, confetti, and extra celebration. */
  playful?: boolean;
  /** Clean theme — swaps the growing tree for a minimal walk-to-the-finish meter. */
  clean?: boolean;
}

interface Faller { id: number; x: number; y: number; sway: number; dur: number }
interface ConfettiPiece { dx: number; dy: number; rot: number; color: string; size: number; dur: number }
interface Burst { id: number; pieces: ConfettiPiece[] }

const CONFETTI_COLORS = ['#7ffdf7', '#12b3a8', '#0f978f', '#ffd23f', '#ff8a3d', '#ff6b9d'];

const SPROUT_MOVES = ['spin', 'jump', 'dance', 'flip'] as const;
type SproutMove = (typeof SPROUT_MOVES)[number];
const SPROUT_COLORS: [string, string][] = [
  ['#ffd23f', '#d99e00'], ['#ff8fb0', '#e85c86'], ['#8a6bff', '#6a47e0'],
  ['#36c5ff', '#1a93d6'], ['#4fe08a', '#23b85f'], ['#ff9a4d', '#e87320'],
];
interface CelSprout { id: number; left: number; top: number; move: SproutMove; color: string; edge: string }

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 22 }, () => ({
    dx: Math.round((Math.random() * 2 - 1) * 220),
    dy: Math.round(-150 + Math.random() * 380),
    rot: Math.round((Math.random() * 2 - 1) * 300),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 10 + Math.round(Math.random() * 9),
    dur: 800 + Math.round(Math.random() * 500),
  }));
}

/** One wave of a gentle, full confetti shower — several waves fire at the finish. */
function makeFinishConfetti(): ConfettiPiece[] {
  return Array.from({ length: 45 }, () => ({
    dx: Math.round((Math.random() * 2 - 1) * 440),
    dy: Math.round(160 + Math.random() * 560), // falls downward, like a shower
    rot: Math.round((Math.random() * 2 - 1) * 360),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 9 + Math.round(Math.random() * 11),
    dur: 2400 + Math.round(Math.random() * 1400),
  }));
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function SortGame({ round, audio, roundIndex = 0, totalRounds = 1, sessionId = 0, learnerId = 'guest', gameId = 'beginning-sounds', sessionStartAt, onAdvance, onRestart, onOpenStickerBook, playful = false, clean = false }: Props) {
  // The session clock comes from the parent (stable across this game's pages);
  // the Date.now() fallback is only for standalone use. Resolved via a lazy
  // initializer so render stays pure.
  const [startAt] = useState(() => sessionStartAt ?? Date.now());
  const game = useSortGame({
    round,
    audio,
    onItemResult: ({ skillKey, correct }) => {
      recordItem(learnerId, skillKey, correct);
      logSkillEvent(learnerId, { skillKey, correct, at: Date.now() });
    },
    onCorrect: ({ complete }) => spawnCorrectFeedback(complete),
    onWrong: () => spawnWrongFeedback(),
  });
  // distance constraint so a tap fires the card's onClick (replay the word)
  // instead of being captured as a zero-length drag; real drags still work.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const total = round.items.length;
  const roundTarget = round.target ?? 'beginning';
  const correct = round.items.filter((i) => game.placements[i.id] === soundOf(i, roundTarget)).length;
  const withinRound = total ? correct / total : 0;
  const roundDone = game.isComplete;
  const isLastRound = roundIndex >= totalRounds - 1;
  const sessionProgress = (roundIndex + withinRound) / totalRounds;
  const bloom = roundDone && isLastRound;

  const [fallers, setFallers] = useState<Faller[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [sprouts, setSprouts] = useState<CelSprout[]>([]);
  const [catching, setCatching] = useState<string | null>(null);
  const [walking, setWalking] = useState(false);
  const [reward, setReward] = useState<{ newly: Achievement[]; totalEarned: number } | null>(null);
  const [finish, setFinish] = useState<{ ms: number; best: boolean } | null>(null);
  const roundHandledRef = useRef(false);
  const walkTimer = useRef<number | undefined>(undefined);

  // Wrong answer: a leaf drifts down; the buddy gives a sympathetic wobble.
  // Fired straight from the placement event (useSortGame.onWrong), so there's no
  // state-watching effect calling setState synchronously after render.
  function spawnWrongFeedback() {
    if (playful) sfx.wrong();
    if (prefersReducedMotion()) return;
    // A falling leaf only makes sense where there's a tree — not the Clean walker.
    if (!clean) {
      const id = game.wrongCount * 1000 + Math.floor(Math.random() * 1000);
      const tree = document.querySelector('.sort-game__tree')?.getBoundingClientRect();
      const cx = tree ? tree.left + tree.width / 2 : window.innerWidth / 2;
      const cy = tree ? tree.top + tree.height * 0.5 : 150;
      const faller: Faller = { id, x: cx + (Math.random() * 24 - 12), y: cy, sway: Math.round(Math.random() * 44 - 22), dur: 1.9 + Math.random() * 0.7 };
      setFallers((f) => [...f, faller]);
      window.setTimeout(() => setFallers((f) => f.filter((x) => x.id !== id)), (faller.dur + 0.4) * 1000);
    }
  }

  // Correct answer: confetti / sprouts. When the placement finishes the page,
  // this also reports the tally to the cross-round accumulator and — on the LAST
  // page — records best time + session count, writes the tutor session log, and
  // evaluates which goal-based stickers were newly earned. Fired from the
  // placement event (useSortGame.onCorrect); `complete` is the old `roundDone`.
  function spawnCorrectFeedback(complete: boolean) {
    if (complete && !roundHandledRef.current) {
      roundHandledRef.current = true;
      const totals = noteRound(sessionId, game.wrongCount, total);
      if (isLastRound) {
        const durationMs = Math.max(0, Date.now() - startAt);
        const res = recordFinish(learnerId, durationMs);
        logSession(learnerId, {
          game: gameId,
          level: 2,
          startedAt: new Date(startAt).toISOString(),
          endedAt: new Date().toISOString(),
          durationMs,
          rounds: totalRounds,
          items: totals.items,
          wrongAttempts: totals.wrong,
          accuracy: totals.items > 0 ? totals.items / (totals.items + totals.wrong) : 1,
        });
        const newly = awardForSession(learnerId);
        setFinish({ ms: durationMs, best: res.isBest });
        if (!clean) setReward({ newly, totalEarned: loadEarned(learnerId).length });
      }
    }

    // Finish: a full confetti shower in a few gentle waves — for every theme.
    if (complete && isLastRound && !prefersReducedMotion()) {
      [0, 400, 800].forEach((delay) => {
        window.setTimeout(() => {
          const fid = Math.random();
          setBursts((b) => [...b, { id: fid, pieces: makeFinishConfetti() }]);
          window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== fid)), 4200);
        }, delay);
      });
    }
    // Page milestone (a page finished, but not the last): a quick confetti cheer
    // for L2L too — Playful gets its own burst just below. (SFX stays Playful-only.)
    if (complete && !isLastRound && !clean && !playful && !prefersReducedMotion()) {
      const mid = Math.random();
      setBursts((b) => [...b, { id: mid, pieces: makeConfetti() }]);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== mid)), 1500);
    }
    if (!playful) return;
    if (complete) sfx.complete();
    else sfx.correct();
    if (prefersReducedMotion()) return;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, pieces: makeConfetti() }]);
    window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1300);

    // A little crowd of sprouts pops up, each doing its own move, then fades.
    const party = Array.from({ length: 3 }, () => {
      const [color, edge] = SPROUT_COLORS[Math.floor(Math.random() * SPROUT_COLORS.length)];
      return {
        id: Math.random(),
        left: 8 + Math.random() * 80,
        top: 6 + Math.random() * 46,
        move: SPROUT_MOVES[Math.floor(Math.random() * SPROUT_MOVES.length)],
        color,
        edge,
      };
    });
    setSprouts((s) => [...s, ...party]);
    party.forEach((o) => window.setTimeout(() => setSprouts((s) => s.filter((x) => x.id !== o.id)), 1700));
  }

  function handleDragEnd(event: DragEndEvent) {
    const wordId = String(event.active.id);
    const basketSound = event.over ? String(event.over.id) : null;
    if (!basketSound) return;
    const ok = game.attemptPlace(wordId, basketSound);
    if (ok) {
      setCatching(basketSound);
      window.setTimeout(() => setCatching((c) => (c === basketSound ? null : c)), 450);
      // Clean theme: the figure takes a few steps only when the answer is right.
      setWalking(true);
      if (walkTimer.current) window.clearTimeout(walkTimer.current);
      walkTimer.current = window.setTimeout(() => setWalking(false), 1000);
    }
  }

  function placedIn(sound: string): WordItem[] {
    return round.items.filter((i) => game.placements[i.id] === sound);
  }

  const finishLine = clean ? 'You reached the finish! Great listening.' : 'You grew the whole tree! Great listening.';
  const status = roundDone
    ? (isLastRound ? finishLine : 'Nice listening! Ready for the next page?')
    : (game.message ?? 'Tap a basket to hear its sound, then drag each picture where it belongs.');

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="sort-game">
        {clean ? (
          <WalkProgress className="sort-game__walk" progress={sessionProgress} walking={walking} finished={roundDone && isLastRound} />
        ) : (
          <BookTree className="sort-game__tree" progress={sessionProgress} bloom={bloom} />
        )}

        {!clean && totalRounds > 1 && (
          <ProgressTrail
            className="sort-game__trail"
            total={totalRounds}
            current={roundIndex}
            progress={sessionProgress}
            roundDone={roundDone}
            finished={roundDone && isLastRound}
          />
        )}

        <p
          className={`sort-game__status${roundDone ? ' sort-game__status--celebrate' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status}
        </p>

        {finish && (
          <p className="finish-time" aria-live="polite">
            <span aria-hidden="true">⏱ </span>Finished in {formatTime(finish.ms)}
            {finish.best && <span className="finish-time__best"> ✨ fastest yet!</span>}
          </p>
        )}

        {reward && (
          <div className="reward" aria-live="polite">
            {reward.newly.length > 0 ? (
              <>
                <p className="reward__label">{reward.newly.length > 1 ? 'New stickers!' : 'New sticker!'}</p>
                <div className="reward__new-row">
                  {reward.newly.map((a) => (
                    <div key={a.id} className="reward__new-item">
                      <span className="reward__new" role="img" aria-label={a.title}>{a.emoji}</span>
                      <span className="reward__new-title">{a.title}</span>
                      <span className="reward__new-desc">{a.desc}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="reward__label">Great job! Play again to chase the next sticker.</p>
            )}
            <p className="reward__count">{reward.totalEarned} of {ACHIEVEMENTS.length} stickers collected</p>
            {onOpenStickerBook && (
              <button type="button" className="btn-ghost" onClick={onOpenStickerBook}>
                See my sticker book →
              </button>
            )}
          </div>
        )}

        {!roundDone && (
          <div className="sort-game__tray">
            {game.remainingItems.map((item) => (
              <PictureCard key={item.id} item={item} onActivate={() => game.replayWord(item)} />
            ))}
          </div>
        )}

        <div className="sort-game__baskets">
          {round.baskets.map((sound) => (
            <SoundBasket key={sound} sound={sound} catching={catching === sound} onReplay={() => game.replaySound(sound)}>
              {placedIn(sound).map((item) => (
                <span key={item.id} className="placed" aria-label={item.label} role="img">
                  <span aria-hidden="true">{item.emoji}</span>
                </span>
              ))}
            </SoundBasket>
          ))}
        </div>

        {roundDone && !isLastRound && onAdvance && (
          <button type="button" className="btn-primary" onClick={onAdvance}>
            Next page →
          </button>
        )}
        {roundDone && isLastRound && onRestart && (
          <button type="button" className="btn-primary" onClick={onRestart}>
            Play again
          </button>
        )}
      </div>

      <div className="falling-leaves" aria-hidden="true">
        {fallers.map((f) => (
          <svg
            key={f.id}
            className="falling-leaf"
            viewBox="-10 -24 20 26"
            style={{ left: `${f.x}px`, top: `${f.y}px`, animationDuration: `${f.dur}s`, '--sway': `${f.sway}px` } as CSSProperties}
          >
            <path d="M0,0 C 8,-4 9,-18 0,-24 C -9,-18 -8,-4 0,0 Z" fill="var(--tree-canopy)" stroke="var(--tree-canopy-edge)" strokeWidth="1.5" />
          </svg>
        ))}
      </div>

      {bursts.length > 0 && (
        <div className="confetti" aria-hidden="true">
          {bursts.flatMap((burst) =>
            burst.pieces.map((p, i) => (
              <span
                key={`${burst.id}-${i}`}
                className="confetti-piece"
                style={{
                  width: p.size,
                  height: p.size,
                  background: p.color,
                  animationDuration: `${p.dur}ms`,
                  '--dx': `${p.dx}px`,
                  '--dy': `${p.dy}px`,
                  '--rot': `${p.rot}deg`,
                } as CSSProperties}
              />
            )),
          )}
        </div>
      )}

      {playful && (
        <div className="sprout-party" aria-hidden="true">
          {sprouts.map((s) => (
            <div
              key={s.id}
              className={`cel-sprout cel-sprout--${s.move}`}
              style={{ left: `${s.left}%`, top: `${s.top}%`, '--teal': s.color, '--teal-deep': s.edge } as CSSProperties}
            >
              <SproutGlyph mood="happy" />
            </div>
          ))}
        </div>
      )}
    </DndContext>
  );
}
