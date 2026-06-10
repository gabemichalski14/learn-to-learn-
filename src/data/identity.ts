import { getSupabase } from './supabase';
import * as cloud from './cloud';
import { loadLearners, addLearner, removeLearner, setCloudId, updateLearnerMeta, stashGuestLearners, restoreGuestLearners } from '../profiles';

/**
 * Mirror the signed-in user's RLS-scoped cloud roster into local profiles, so
 * the picker/dashboards show EXACTLY what this account may see — a tutor sees
 * only their assigned students, a parent only their child, the owner the whole
 * center. While signed in we make the local roster equal the cloud roster:
 *   • cloud learner already linked locally → refresh its name + color
 *   • cloud learner not present locally     → create a local profile (+cloudId)
 *   • local profile NOT in the cloud roster → remove it (deassigned, another
 *     account's student, or a stale local-only guest profile)
 *
 * This is what fixes "a tutor sees students they aren't assigned to" and "renames
 * don't propagate".
 *
 * Guest vs account separation (privacy): device-local players (no cloudId) are
 * shown only when NOBODY is signed in. While an account is signed in we PARK them
 * in a stash and show ONLY this account's cloud roster; on sign-out we bring the
 * guests back and drop the account's mirrored students (cloud is canonical, so
 * they re-appear next sign-in). No guest data is ever deleted.
 *
 * Runs on startup + every auth change. A transient cloud error → caught → roster
 * left as-is.
 */
export async function reconcileRoster(): Promise<void> {
  try {
    const supabase = await getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      // Signed out → restore device-local players; drop the account's mirrored
      // students so they never linger on the device.
      restoreGuestLearners();
      for (const l of loadLearners()) if (l.cloudId) removeLearner(l.id);
      return;
    }

    // Signed in → hide device-local players, show ONLY this account's roster.
    stashGuestLearners();
    const cloudLearners = await cloud.listLearners();
    const byCloudId = new Map(cloudLearners.map((c) => [c.id, c]));

    // 1) refresh name/color on cloud-linked profiles + note which ids we have
    const haveCloudIds = new Set<string>();
    for (const l of loadLearners()) {
      if (l.cloudId && byCloudId.has(l.cloudId)) {
        haveCloudIds.add(l.cloudId);
        const cl = byCloudId.get(l.cloudId)!;
        updateLearnerMeta(l.id, { name: cl.display_name, color: cl.color });
      }
    }
    // 2) prune ONLY stale cloud mirrors (deassigned / removed). Guests are
    //    stashed, never deleted here.
    for (const l of loadLearners()) {
      if (l.cloudId && !byCloudId.has(l.cloudId)) removeLearner(l.id);
    }
    // 3) add roster members we don't have yet
    for (const cl of cloudLearners) {
      if (haveCloudIds.has(cl.id)) continue;
      const created = addLearner(cl.display_name, { color: cl.color, setCurrent: false });
      setCloudId(created.id, cl.id);
    }
  } catch (e) {
    console.warn('[cloud] roster reconcile failed:', e);
  }
}
