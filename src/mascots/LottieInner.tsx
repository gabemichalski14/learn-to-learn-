import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Lottie from 'lottie-react';

/**
 * The actual Lottie player. Lazy-loaded by LottieFX ONLY once the .json exists,
 * so lottie-web never touches the main bundle until there's an animation to play.
 * Fetches + parses the JSON, then renders it; shows the fallback until ready.
 */
export default function LottieInner({ src, loop, autoplay, style, fallback }: {
  src: string;
  loop: boolean;
  autoplay: boolean;
  style?: CSSProperties;
  fallback: ReactNode;
}) {
  const [data, setData] = useState<object | null>(null);
  useEffect(() => {
    let live = true;
    fetch(src).then((r) => r.json()).then((j) => { if (live) setData(j); }).catch(() => { /* keep fallback */ });
    return () => { live = false; };
  }, [src]);
  if (!data) return <>{fallback}</>;
  return <Lottie animationData={data} loop={loop} autoplay={autoplay} style={style} />;
}
