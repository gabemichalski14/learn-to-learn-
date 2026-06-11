import { useState, type CSSProperties } from 'react';
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
  mood?: 'cheer' | 'wobble' | 'point' | 'bloom' | 'talk' | null;
  size?: number;            // px
  art?: ArtSource;          // when present (future), render Rive instead of emoji
  label?: string;
}) {
  const [errored, setErrored] = useState<Set<string>>(new Set());
  const stage = healStage(heal);
  const cls = `char-art char-art--s${stage}${mood ? ` char-art--${mood}` : ''}`;

  // Real flat art (transparent PNG): try the matching expression frame, then fall
  // back to the base/calm image, then (only if both are missing) the emoji. A
  // single missing expression must NOT blank the whole avatar to emoji.
  const moodFrame = (mood && art?.frames?.[mood]) || undefined;
  const frame = [moodFrame, art?.image].find((s): s is string => !!s && !errored.has(s));
  if (frame) {
    return (
      // Square box + object-fit:contain (CSS) so non-square art is centered, never
      // squished/short, and every character reads at a consistent size.
      <img
        className={cls}
        style={{ width: `${size}px`, height: `${size}px`, '--heal': heal } as CSSProperties}
        src={frame}
        alt={label ?? ''}
        draggable={false}
        onError={() => setErrored((prev) => new Set(prev).add(frame))}
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
