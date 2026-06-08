import { type CSSProperties } from 'react';
import { healStage, type ArtSource } from './cast';
import './characterArt.css';

/**
 * The single render point for a character's avatar — used by the in-game hero,
 * the level hub, and the Garden resident, so a character looks the same
 * everywhere and transforms with progress (the character IS the progress).
 *
 * RIVE DROP-IN: when `art.rive` is set we'll dynamic-import a Rive renderer here
 * (added with the first .riv) and feed it `heal` (0–100) + `mood` via its state
 * machine — see docs/art/2026-06-07-character-art-brief.md. Until the asset
 * exists, a CSS-transformation emoji placeholder still HEALS with progress
 * (scattered/grey/small → whole/colorful/bright) so the design reads now.
 */
export function CharacterArt({
  emoji, heal = 1, mood = null, size = 64, art, label,
}: {
  emoji: string;
  heal?: number;            // 0..1 — transformation progress
  mood?: 'cheer' | 'wobble' | null;
  size?: number;            // px
  art?: ArtSource;          // when present (future), render Rive instead of emoji
  label?: string;
}) {
  const stage = healStage(heal);
  const cls = `char-art char-art--s${stage}${mood ? ` char-art--${mood}` : ''}`;

  // Real flat art (transparent PNG): the matching expression frame if we have
  // one for the current mood, else the base image. CSS still does the heal
  // transform (grey/small → colour/whole) right on the <img>. (Rive drop-in
  // when `art.rive` lands will replace this branch.)
  const frame = (mood && art?.frames?.[mood]) || art?.image;
  if (frame) {
    return (
      <img
        className={cls}
        style={{ width: `${size}px`, height: 'auto', '--heal': heal } as CSSProperties}
        src={frame}
        alt={label ?? ''}
        draggable={false}
      />
    );
  }

  // Emoji placeholder (still transforms with progress) until art exists.
  return (
    <span
      className={cls}
      style={{ fontSize: `${size}px`, '--heal': heal } as CSSProperties}
      role="img"
      aria-label={label}
    >
      {emoji}
    </span>
  );
}
