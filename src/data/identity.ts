import { getSupabase } from './supabase';
import * as cloud from './cloud';
import { loadLearners, addLearner, setCloudId } from '../profiles';

/**
 * Pull the accessible cloud roster (tutor → center learners) and reconcile it
 * into local profiles, setting cloudId. A local profile already bound to a cloud
 * id is left alone; unseen cloud learners get a new local profile. Never changes
 * which student is active (setCurrent: false). No-op when signed out or Supabase
 * is unconfigured.
 */
export async function reconcileRoster(): Promise<void> {
  try {
    const supabase = await getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const cloudLearners = await cloud.listLearners();
    const local = loadLearners();
    const haveCloudIds = new Set(local.map((l) => l.cloudId).filter(Boolean));

    for (const cl of cloudLearners) {
      if (haveCloudIds.has(cl.id)) continue;
      const created = addLearner(cl.display_name, { color: cl.color, setCurrent: false });
      setCloudId(created.id, cl.id);
    }
  } catch (e) {
    console.warn('[cloud] roster reconcile failed:', e);
  }
}
