import { useCallback, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { PipArt } from '../mascots/PipArt';
import { navigate } from '../router';
import { sfx } from '../audio/sfx';
import { GuideCtx, type GuideApi } from './guideContext';
import './guide.css';

/**
 * Mascot-led navigation. `useGuide().goTo(route)` plays a short "Pip walks you
 * there" wipe: a leafy curtain sweeps across with Pip scampering on the leading
 * edge, the route changes at the moment the screen is covered, then the curtain
 * clears to reveal the new page. Honors prefers-reduced-motion by navigating
 * instantly (the destination is never gated on the animation).
 */
interface Active { to: string; dir: 'right' | 'left'; key: number; }

const COVER_MS = 440;  // route swaps once the curtain has covered the screen
const TOTAL_MS = 920;  // full sweep in + out

export function GuideProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active | null>(null);
  const timers = useRef<number[]>([]);

  const goTo = useCallback<GuideApi['goTo']>((to, dir = 'right') => {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { navigate(to); return; }
    // Ignore re-entrancy while a sweep is mid-flight.
    if (timers.current.length) return;
    setActive({ to, dir, key: Date.now() });
    sfx.tick();
    timers.current.push(window.setTimeout(() => navigate(to), COVER_MS));
    timers.current.push(window.setTimeout(() => {
      setActive(null);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    }, TOTAL_MS));
  }, []);

  return (
    <GuideCtx.Provider value={{ goTo }}>
      {children}
      {active && (
        <div className={`guide guide--${active.dir}`} key={active.key} style={{ '--total': `${TOTAL_MS}ms` } as CSSProperties} aria-hidden="true">
          <div className="guide__curtain" />
          <div className="guide__pip">
            <PipArt size={120} expression="excited" />
          </div>
        </div>
      )}
    </GuideCtx.Provider>
  );
}
