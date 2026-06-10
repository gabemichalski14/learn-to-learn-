import { useRive, RuntimeLoader, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import type { ReactNode } from 'react';

// Self-host the WASM (copied to /public/rive.wasm) so it loads same-origin —
// CSP-safe (script-src includes 'wasm-unsafe-eval'; connect-src allows 'self')
// and works fully offline. Set once on module load (before any Rive mounts).
RuntimeLoader.setWasmUrl('/rive.wasm');

/**
 * The actual Rive canvas. Lazy-loaded by RiveMascot ONLY when a .riv file is
 * present, so the ~2 MB Rive runtime + WASM never touch the bundle until there's
 * real animation to play. Shows the fallback until the file is fully loaded.
 */
export default function RiveInner({ src, stateMachines, artboard, size, fallback }: {
  src: string;
  stateMachines?: string;
  artboard?: string;
  size: number;
  fallback: ReactNode;
}) {
  const { RiveComponent, rive } = useRive({
    src,
    stateMachines,
    artboard,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
      {!rive && <span style={{ position: 'absolute', inset: 0 }}>{fallback}</span>}
    </span>
  );
}
