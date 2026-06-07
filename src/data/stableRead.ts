/**
 * Stable-reference memoizer for localStorage-backed reads.
 *
 * The hazard it removes: functions like `loadLearners()` / `loadProgress()` do
 * `JSON.parse(localStorage…)` and return a BRAND-NEW object every call. When a
 * component reads one during render and uses it as a `useEffect`/`useMemo`
 * dependency, the identity changes every render → the effect re-fires forever →
 * an infinite render loop that pegs the CPU. (That was the Home-page freeze.)
 *
 * `stableRead` caches the built value against a cheap "signature" of the raw
 * source (usually the raw localStorage string). While the signature is
 * unchanged it returns the SAME reference, so dependency arrays stay stable.
 * When the source actually changes — a write, `localStorage.clear()`, or even
 * another tab — the signature differs and we rebuild. That makes it correct,
 * self-invalidating, and safe in tests (which clear storage between cases)
 * without any manual cache-busting.
 *
 * The expensive part we skip when unchanged is the parse + fresh-object
 * allocation; reading the raw string for the signature is cheap.
 */
const cache = new Map<string, { sig: string; val: unknown }>();

export function stableRead<T>(cacheKey: string, sig: string, build: () => T): T {
  const hit = cache.get(cacheKey);
  if (hit && hit.sig === sig) return hit.val as T;
  const val = build();
  cache.set(cacheKey, { sig, val });
  return val;
}

/** Test-only: drop all cached values (not needed in app code — the signature
 *  check self-invalidates — but handy for asserting rebuild behavior). */
export function __resetStableReadCache(): void {
  cache.clear();
}
