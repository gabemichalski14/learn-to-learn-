import { createContext, useContext } from 'react';
import { navigate } from '../router';

/** A guided navigation: instead of teleporting, the mascot "walks you there" —
 *  Pip dashes across with a leafy wipe, the route changes mid-sweep, then the
 *  new page is revealed. Research: a companion leading you to a place conveys
 *  direction better than any UI arrow (and it's delightful). */
export interface GuideApi {
  /** Animate to a hash route. `dir` hints which way Pip travels. */
  goTo: (to: string, dir?: 'right' | 'left') => void;
}

export const GuideCtx = createContext<GuideApi | null>(null);

// Outside a provider (e.g. unit tests), guidance degrades to a plain navigate —
// the destination is always honored even if the animation isn't available.
const FALLBACK: GuideApi = { goTo: (to) => navigate(to) };

export function useGuide(): GuideApi {
  return useContext(GuideCtx) ?? FALLBACK;
}
