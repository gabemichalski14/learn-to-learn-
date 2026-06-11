import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';

const RiveInner = lazy(() => import('./RiveInner'));

/**
 * Plays a Rive animation (`/rive/<name>.riv`) with a graceful PNG fallback —
 * the same "build the seam, drop the asset later" pattern we use everywhere.
 *
 * Until a `.riv` actually exists at `src`, ONLY the `fallback` renders and the
 * Rive runtime + WASM never load (we probe with a HEAD request first). The
 * moment you add the file, this character comes alive. Drop files in
 * `public/rive/` — see `public/rive/README.md`.
 */
export function RiveMascot({ src, stateMachines, artboard, size = 120, fallback }: {
  src: string;
  /** State-machine name to run (for interactive characters). */
  stateMachines?: string;
  artboard?: string;
  size?: number;
  fallback: ReactNode;
}) {
  const [exists, setExists] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => {
        // A dev server's SPA fallback answers 200 + text/html for a MISSING file —
        // that is not a real .riv. Only load Rive for an actual binary asset, else
        // the Rive runtime tries to parse HTML and logs "Bad header / failed to load".
        const isHtml = (r.headers.get('content-type') || '').includes('text/html');
        if (live) setExists(r.ok && !isHtml);
      })
      .catch(() => { if (live) setExists(false); });
    return () => { live = false; };
  }, [src]);

  if (exists !== true) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <RiveInner src={src} stateMachines={stateMachines} artboard={artboard} size={size} fallback={fallback} />
    </Suspense>
  );
}
