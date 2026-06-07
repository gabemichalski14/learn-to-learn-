/**
 * Tiny synchronous pub/sub for local data changes. Mutators (add/rename/remove a
 * learner, record a finish, log a session, switch the active student) call
 * `notifyDataChanged()`; React views subscribed via the store hooks
 * (see store.ts) then re-read and re-render. Kept dependency-free so both the
 * data modules and the store can import it without a cycle.
 */
type Listener = () => void;

const listeners = new Set<Listener>();
let version = 0;

export function subscribeData(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Bump the version and wake every subscriber. Call after any local write. */
export function notifyDataChanged(): void {
  version += 1;
  // Iterate a copy so a listener that unsubscribes mid-notify is safe.
  for (const l of [...listeners]) l();
}

/** Monotonic counter — a stable primitive snapshot for useSyncExternalStore. */
export function dataVersion(): number {
  return version;
}
