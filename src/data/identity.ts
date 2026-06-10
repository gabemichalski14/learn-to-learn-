import { getSupabase } from './supabase';
import * as cloud from './cloud';
import { loadLearners, addLearner, removeLearner, setCloudId, updateLearnerMeta } from '../profiles';

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
 * don't propagate". Signed OUT (or Supabase unconfigured) it's a no-op, leaving
 * on-device guest profiles untouched. Never changes which student is active.
 * A transient cloud error throws → caught → local roster left as-is.
 */
export async function reconcileRoster(): Promise<void> {
  try {
    const supabase = await getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return; // signed out → guest mode, leave local roster alone

    const cloudLearners = await cloud.listLearners();
    const byCloudId = new Map(cloudLearners.map((c) => [c.id, c]));
    const local = loadLearners();

    // 1) refresh name/color on cloud-linked profiles + note which ids we have
    const haveCloudIds = new Set<string>();
    for (const l of local) {
      if (l.cloudId && byCloudId.has(l.cloudId)) {
        haveCloudIds.add(l.cloudId);
        const cl = byCloudId.get(l.cloudId)!;
        updateLearnerMeta(l.id, { name: cl.display_name, color: cl.color });
      }
    }
    // 2) prune anything not in this account's roster (other students / local-only ghosts)
    for (const l of local) {
      if (!(l.cloudId && byCloudId.has(l.cloudId))) removeLearner(l.id);
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
