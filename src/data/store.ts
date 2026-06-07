import { useSyncExternalStore } from 'react';
import { subscribeData, dataVersion } from './dataBus';
import { loadLearners, getLearner, getCurrentLearnerId, type Learner } from '../profiles';
import { loadProgress, type Progress } from '../progress';

/**
 * Reactive views over the local data layer. These return the SAME stable
 * reference until the underlying data changes (the reads are memoized in
 * profiles.ts / progress.ts), which is exactly what useSyncExternalStore needs
 * to avoid tearing/loops — and means any view using these re-renders the instant
 * a mutator calls notifyDataChanged() (e.g. a finished session updates the
 * leaderboard live, no reload).
 */
export function useLearners(): Learner[] {
  return useSyncExternalStore(subscribeData, loadLearners);
}

export function useLearner(id: string | null): Learner | undefined {
  return useSyncExternalStore(subscribeData, () => getLearner(id));
}

export function useCurrentLearnerId(): string | null {
  return useSyncExternalStore(subscribeData, getCurrentLearnerId);
}

export function useProgress(id: string): Progress {
  return useSyncExternalStore(subscribeData, () => loadProgress(id));
}

/** Subscribe to "any local data changed" — for views that aggregate across
 *  learners (e.g. the leaderboard) and need to recompute on every write. */
export function useDataVersion(): number {
  return useSyncExternalStore(subscribeData, dataVersion);
}
