import { type CSSProperties } from 'react';
import { artSrc, useImagePresent } from './assets';

/**
 * Render an art asset by KEY, with a graceful fallback: the PNG when it exists,
 * else the given emoji (the current look). Drop a file at the key's path and it
 * appears — no code change. See assets.ts / docs/art/PNG-MANIFEST.md.
 */
export function Art({ imageKey, emoji, alt = '', size, className, style }: {
  imageKey: string;
  emoji: string;
  alt?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const src = artSrc(imageKey);
  const ready = useImagePresent(src);
  if (ready) {
    return <img src={src} alt={alt} width={size} height={size} className={className} style={style} draggable={false} />;
  }
  return (
    <span
      className={className}
      style={{ fontSize: size ? `${size}px` : undefined, lineHeight: 1, ...style }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      {emoji}
    </span>
  );
}
