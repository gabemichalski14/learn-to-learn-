import { type CSSProperties } from 'react';
import './levelScene.css';

export interface SceneLayer {
  src: string;       // a CC0 / commercial-safe background image
  opacity?: number;  // 0..1 (default 1)
}

/**
 * A level's background that FOLLOWS THE CHARACTER'S ARC. Optional CC0 parallax
 * layers (back→front) + a warm-light overlay whose strength tracks `heal`: the
 * scene starts dark (the character is lost) and warms/brightens as you bring them
 * home (the theme follows the arc — ludonarrative harmony at the environment
 * level). Renders fine with no images (just the overlay) and better once CC0 art
 * is dropped in. Decorative (aria-hidden), pointer-transparent, reduced-motion safe.
 */
export function LevelScene({
  heal = 0, layers = [], warmth = 0.9, className,
}: {
  heal?: number;          // 0..1 — arc progress
  layers?: SceneLayer[];  // CC0 images, painted back→front
  warmth?: number;        // overlay opacity at heal = 1
  className?: string;
}) {
  const h = Math.max(0, Math.min(1, heal));
  return (
    <div className={`level-scene${className ? ` ${className}` : ''}`} aria-hidden="true">
      {layers.map((l, i) => (
        <div
          key={`${l.src}-${i}`}
          className="level-scene__layer"
          style={{ backgroundImage: `url(${l.src})`, opacity: l.opacity ?? 1 } as CSSProperties}
        />
      ))}
      <div className="level-scene__warm" style={{ opacity: +(h * warmth).toFixed(3) }} />
    </div>
  );
}
