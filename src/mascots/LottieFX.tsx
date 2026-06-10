import { lazy, Suspense, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

const LottieInner = lazy(() => import('./LottieInner'));

/**
 * Plays a Lottie animation (`/lottie/<name>.json`) with a graceful fallback —
 * great for celebratory flourishes (level-up bursts, sticker pops, the village
 * fanfare) and gentle ambient loops.
 *
 * Until a `.json` exists at `src`, ONLY `fallback` renders (default: nothing)
 * and lottie-web never loads — we HEAD-probe first. Drop files in
 * `public/lottie/`; see `public/lottie/README.md`.
 */
export function LottieFX({ src, loop = true, autoplay = true, style, fallback = null }: {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: CSSProperties;
  fallback?: ReactNode;
}) {
  const [exists, setExists] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => { if (live) setExists(r.ok); })
      .catch(() => { if (live) setExists(false); });
    return () => { live = false; };
  }, [src]);

  if (exists !== true) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <LottieInner src={src} loop={loop} autoplay={autoplay} style={style} fallback={fallback} />
    </Suspense>
  );
}
