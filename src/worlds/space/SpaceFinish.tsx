import { useState, type CSSProperties } from 'react';
import { formatTime } from '../../progress';
import { MascotSpeaker } from '../../mascots/MascotSpeaker';
import { CharacterArt } from '../../world/lore/CharacterArt';
import type { ArtSource } from '../../world/lore/cast';

const CONFETTI_COLORS = ['#5ef0c8', '#f7c948', '#e0683f', '#6f8ad6', '#b07cff', '#3aa0b4', '#ffffff'];

/** A burst of confetti bits with randomised trajectories, rolled once per win. */
function makeConfetti(n = 26) {
  return Array.from({ length: n }, () => ({
    left: +(Math.random() * 100).toFixed(1),
    dx: Math.round(Math.random() * 160 - 80),
    rot: Math.round(Math.random() * 640 - 320),
    dur: +(1.7 + Math.random() * 1.6).toFixed(2),
    delay: +(Math.random() * 0.6).toFixed(2),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    round: Math.random() < 0.4,
  }));
}

/** Gold star medal on a ribbon — the trophy that pops in on completion. */
function StarMedal() {
  return (
    <svg viewBox="0 0 64 64" width="96" height="96" role="img" aria-label="gold medal">
      <path d="M24 30 L18 60 L26 53 L30 61 L37 36 Z" fill="#3aa0b4" />
      <path d="M40 30 L46 60 L38 53 L34 61 L27 36 Z" fill="#2b8294" />
      <circle cx="32" cy="26" r="20" fill="#e0a72e" />
      <circle cx="32" cy="26" r="17" fill="#f7c948" />
      <circle cx="32" cy="26" r="12.5" fill="#ffd95e" />
      <path d="M32 14 l3.4 7 7.6 .9 -5.6 5.2 1.5 7.5 -6.9 -3.7 -6.9 3.7 1.5 -7.5 -5.6 -5.2 7.6 -.9 z" fill="#fff6cf" />
      <circle cx="25" cy="19" r="2.4" fill="#fff" opacity=".5" />
    </svg>
  );
}

interface Props {
  ms: number;
  best: boolean;
  stars: number; // 1–3
  title: string;
  beat?: string; // the level character's win line (their arc payoff)
  homecoming?: boolean;      // the character's sound is now mastered → he's whole
  characterEmoji?: string;
  characterArt?: ArtSource;
  onGarden?: () => void;     // send the healed character home to the garden
  onRestart: () => void;
  onBack: () => void;
}

/** Over-the-top "you saved the galaxy" finish overlay for a completed patrol. */
export function SpaceFinish({ ms, best, stars, title, beat, homecoming, characterEmoji, characterArt, onGarden, onRestart, onBack }: Props) {
  const [bits] = useState(makeConfetti);
  return (
    <div className="sg-finish sg-win">
      <div className="sg-win__burst" aria-hidden="true" />
      <div className="sg-confetti" aria-hidden="true">
        {bits.map((b, i) => (
          <i
            key={i}
            className={b.round ? 'is-round' : undefined}
            style={{
              left: `${b.left}%`,
              background: b.color,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              '--dx': `${b.dx}px`,
              '--rot': `${b.rot}deg`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="sg-win__card" role="dialog" aria-label="Patrol complete">
        <MascotSpeaker className="sg-win__pip" size={86} expression="excited" kinds={['celebrate', 'idle']} label="Pip" />
        {homecoming && characterArt
          ? <div className="sg-win__moss"><CharacterArt emoji={characterEmoji ?? '🌱'} heal={1} art={characterArt} size={120} /></div>
          : <div className="sg-win__medal"><StarMedal /></div>}
        <p className="sg-win__eyebrow">{homecoming ? '✦ HE’S WHOLE AGAIN ✦' : '★ MISSION COMPLETE ★'}</p>
        <h2 className="sg-win__title">{title}</h2>
        <div className="sg-win__stars" aria-label={`${stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? 'on' : undefined} style={{ animationDelay: `${0.12 * i}s` }}>★</span>
          ))}
        </div>
        {beat
          ? <p className="sg-win__sub sg-win__beat">{beat}</p>
          : <p className="sg-win__sub">You cleared every sector and saved the whole galaxy! 🚀🌌</p>}
        <p className="sg-win__stat">
          Patrol time <b>{formatTime(ms)}</b>{best ? ' · 🏆 NEW BEST!' : ''}
        </p>
        <div className="sg-win__btns">
          {homecoming && onGarden && (
            <button type="button" className="sg-btn" onClick={onGarden}>Walk him to the Village 🏡</button>
          )}
          <button type="button" className="sg-btn" onClick={onRestart}>Fly again 🚀</button>
          <button type="button" className="sg-back" onClick={onBack}>Back to Level 2</button>
        </div>
      </div>
    </div>
  );
}
