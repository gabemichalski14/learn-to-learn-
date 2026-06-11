import { useEffect, useState } from 'react';

/**
 * The art-asset system. Every visual the app can show is a semantic KEY that
 * resolves to a PNG under `public/art/…`. Components render the PNG when it
 * exists and fall back to the current emoji/CSS otherwise — so the app looks
 * complete today and upgrades the instant a file lands at its path, with no code
 * change. (See docs/art/PNG-MANIFEST.md for the full list.)
 *
 * Key shape: `<group>:<id>[:<variant>]` →  /art/<group>/<id>[-<variant>].png
 *   char:patch:cheer  → /art/char/patch-cheer.png
 *   hub:workshop:bg   → /art/hub/workshop-bg.png
 *   ui:level-3        → /art/ui/level-3.png
 */
export const ART_ROOT = '/art';

export function artSrc(key: string): string {
  const [group, ...rest] = key.split(':');
  return `${ART_ROOT}/${group}/${rest.join('-')}.png`;
}

// Probe cache shared across all <Art>/CharacterArt instances (one HEAD per path).
const present = new Map<string, boolean>();

/**
 * True once we've confirmed a REAL image lives at `src`. We HEAD-probe and
 * require a non-HTML content-type, because a dev server's SPA fallback answers
 * 200 + text/html for a MISSING file — trusting `ok` alone would try to decode
 * HTML as an image (console noise). Cached per path; null src → false.
 */
export function useImagePresent(src: string | null): boolean {
  const [, force] = useState(0); // bump to re-read the cache after an async probe
  useEffect(() => {
    if (!src || present.has(src)) return;           // unknown only — known reads from cache
    if (typeof fetch === 'undefined') { present.set(src, false); return; }
    let live = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => { present.set(src, r.ok && !(r.headers.get('content-type') || '').includes('text/html')); })
      .catch(() => { present.set(src, false); })
      .finally(() => { if (live) force((n) => n + 1); }); // async → no sync setState in the effect
    return () => { live = false; };
  }, [src]);
  return src ? present.get(src) ?? false : false;
}
