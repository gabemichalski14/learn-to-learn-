import { WordPicture } from '../../world/WordPicture';

/**
 * A space "specimen" — the draggable item in the Space games. The painted word
 * picture sits inside a glowing holo-capsule (the capsule keeps the space feel;
 * the content is now real painted art via WordPicture, with an emoji fallback).
 *
 * (This replaced a ~960-line hand-drawn SVG icon set — all generic SVG creatures
 * are gone in favour of the cohesive painted illustrations.)
 */
export function SpaceSpecimen({ label, emoji }: { id?: string; label: string; emoji: string }) {
  return (
    <span className="sg-spec" aria-hidden="true">
      <span className="sg-spec__orbit" />
      <WordPicture label={label} emoji={emoji} className="sg-spec__art" />
    </span>
  );
}
