import type { SyntheticEvent } from 'react';

/**
 * Shared <img> onError fallback — the app-wide rule is "no broken-image icon, ever".
 *
 * Decorative images (aria-hidden, world/scene art, stat icons) degrade to nothing:
 * the adjacent label/number still carries the meaning, so hiding a missing PNG is
 * the graceful outcome. MEANINGFUL images (a word picture, a character, a level
 * emblem) must instead go through a fallback COMPONENT — WordPicture / Icon /
 * CharacterArt / LevelEmblem / Art — which swaps a missing PNG for its emoji.
 *
 * Enforced by src/ui/assetSafety.test.ts: every <img> in the app must carry an
 * onError handler (this one, or a component's own emoji-swap). That guard is the
 * fail-safe — a new raw <img> without a fallback fails the gate.
 */
export function hideBrokenImg(e: SyntheticEvent<HTMLImageElement>): void {
  e.currentTarget.style.display = 'none';
}
