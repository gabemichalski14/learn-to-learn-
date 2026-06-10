import { getSupabase } from './supabase';
import * as cloud from './cloud';
import type { Learner } from '../profiles';
import { loadSessionLog } from '../sessionLog';
import type { SessionRecord } from '../sessionLog';
import { loadMastery } from '../mastery/mastery';
import type { MasteryMap } from '../mastery/mastery';
import { masteryFromEvents } from '../mastery/events';

async function cloudActiveId(learner: Learner): Promise<string | null> {
  const cloudId = learner.cloudId;
  if (!cloudId) return null;
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ? cloudId : null;
}

/** A learner's finished sessions — cloud when signed in, local otherwise. */
export async function getSessions(learner: Learner): Promise<SessionRecord[]> {
  const cloudId = await cloudActiveId(learner);
  if (cloudId) {
    try {
      const rows = await cloud.listSessions(cloudId);
      return rows.map((r) => ({
        id: r.id as string,
        game: r.game as string,
        level: r.level != null ? (r.level as number) : undefined,
        lesson: r.lesson != null ? (r.lesson as number) : undefined,
        startedAt: (r.started_at as string | undefined) ?? '',
        endedAt: r.ended_at as string,
        durationMs: r.duration_ms as number,
        rounds: (r.rounds as number | undefined) ?? 0,
        items: (r.items as number | undefined) ?? 0,
        wrongAttempts: (r.wrong_attempts as number | undefined) ?? 0,
        accuracy: (r.accuracy as number | undefined) ?? 1,
      }));
    } catch {
      /* fall through to local */
    }
  }
  return loadSessionLog(learner.id);
}

/** A learner's enriched per-answer events (chosen/first_try/latency/…) for the
 *  personalization engine. Cloud-only (the local mastery store doesn't keep
 *  these); empty when signed out. */
export async function getEnrichedEvents(learner: Learner): Promise<cloud.EnrichedSkillEvent[]> {
  const cloudId = await cloudActiveId(learner);
  if (!cloudId) return [];
  try { return await cloud.listSkillEvents(cloudId); } catch { return []; }
}

/** A learner's mastery map — computed from cloud events when signed in, local otherwise. */
export async function getMastery(learner: Learner): Promise<MasteryMap> {
  const cloudId = await cloudActiveId(learner);
  if (cloudId) {
    try {
      const rows = await cloud.listSkillEvents(cloudId);
      return masteryFromEvents(
        rows.map((r) => ({ skillKey: r.skill_key, correct: r.correct, at: Date.parse(r.at), firstTry: r.first_try ?? undefined })),
      );
    } catch {
      /* fall through to local */
    }
  }
  return loadMastery(learner.id);
}
