import { useEffect, useState, type CSSProperties } from 'react';
import { navigate } from './router';
import { isCloudConfigured } from './data/supabase';
import { useDialog } from './ui/dialogContext';
import { PipArt } from './mascots/PipArt';
import { listLearners, listSessions, listSkillEvents, requestDeletion, type CloudLearner } from './data/cloud';
import { sessionLogCsv, type SessionRecord } from './sessionLog';
import { masteryFromEvents } from './mastery/events';
import { summarize } from './world/tutor/dashboardData';
import './admin.css';

interface CloudSessionRow {
  id: string; game: string; level?: number; lesson?: number;
  started_at?: string; ended_at: string; duration_ms: number;
  rounds?: number; items?: number; wrong_attempts?: number; accuracy?: number;
}

function toRecord(r: CloudSessionRow): SessionRecord {
  return {
    id: r.id, game: r.game, level: r.level ?? undefined, lesson: r.lesson ?? undefined,
    startedAt: r.started_at ?? r.ended_at, endedAt: r.ended_at, durationMs: r.duration_ms,
    rounds: r.rounds ?? 0, items: r.items ?? 0, wrongAttempts: r.wrong_attempts ?? 0, accuracy: r.accuracy ?? 0,
  };
}

function downloadCsv(name: string, rows: SessionRecord[]) {
  const blob = new Blob([sessionLogCsv(rows)], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** One child's card: progress summary + the COPPA parent rights (export + request delete). */
function ChildCard({ child }: { child: CloudLearner }) {
  const dialog = useDialog();
  const [rows, setRows] = useState<SessionRecord[] | null>(null);
  const [grown, setGrown] = useState<{ mastered: number; practising: number } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void listSessions(child.id)
      .then((s) => { if (live) setRows((s as CloudSessionRow[]).map(toRecord)); })
      .catch(() => { if (live) setRows([]); });
    void listSkillEvents(child.id)
      .then((ev) => {
        if (!live) return;
        const sum = summarize(masteryFromEvents(ev.map((e) => ({ skillKey: e.skill_key, correct: e.correct, at: Date.parse(e.at), firstTry: e.first_try ?? undefined }))));
        setGrown({ mastered: sum.mastered.length, practising: sum.practicing.length + sum.working.length });
      })
      .catch(() => { if (live) setGrown({ mastered: 0, practising: 0 }); });
    return () => { live = false; };
  }, [child.id]);

  const n = rows?.length ?? 0;
  const last = rows && rows.length ? new Date(rows[rows.length - 1].endedAt) : null;
  const name = child.display_name;
  // Warm growth story — the child's own progress, no skill detail, no peer ranking.
  const story = !grown
    ? 'Loading…'
    : grown.mastered === 0
      ? `${name} is just getting started — every round plants new sounds. 🌱`
      : `${name} has mastered ${grown.mastered} sound${grown.mastered === 1 ? '' : 's'}${grown.practising ? ` and is practising ${grown.practising} more` : ''}. 🌟`;

  async function onRequestDelete() {
    const ok = await dialog.confirm({
      title: 'Request data deletion?',
      message: `Ask ${child.display_name}'s tutor to delete all of their data? The tutor confirms it — you can always change your mind before then.`,
      okLabel: 'Send request',
    });
    if (!ok) return;
    try { await requestDeletion(child.id); setMsg('Request sent — the tutor will confirm the deletion.'); }
    catch { setMsg('Could not send the request just now. Please try again.'); }
  }

  return (
    <div className="l2l-card parent__child">
      <div className="parent__childhead">
        <span className="parent__avatar" style={{ background: child.color }} aria-hidden="true">{child.display_name.slice(0, 1)}</span>
        <div>
          <strong className="parent__name">{child.display_name}</strong>
          <p className="parent__stats">{rows === null ? 'Loading…' : `${n} session${n === 1 ? '' : 's'}${last ? ` · last played ${last.toLocaleDateString()}` : ''}`}</p>
        </div>
        {grown && grown.mastered > 0 && (
          <div className="parent__grow" aria-label={`${grown.mastered} sounds mastered`}>
            <strong>{grown.mastered}</strong><span>sounds<br />mastered</span>
          </div>
        )}
      </div>
      <p className="parent__story">{story}</p>
      <div className="parent__acts">
        <button type="button" className="l2l-btn" disabled={!rows || rows.length === 0} onClick={() => rows && downloadCsv(child.display_name, rows)}>⬇ Download report</button>
        <button type="button" className="l2l-btn l2l-btn--ghost" onClick={onRequestDelete}>Request data deletion</button>
      </div>
      {msg && <p className="parent__msg" role="status">{msg}</p>}
    </div>
  );
}

/**
 * A parent's home: a warm view of *their own* child(ren) only (RLS scopes the
 * roster), with the COPPA rights — review, export, and request deletion.
 */
export function ParentHome() {
  const configured = isCloudConfigured();
  const [children, setChildren] = useState<CloudLearner[] | null>(() => (isCloudConfigured() ? null : []));

  useEffect(() => {
    if (!configured) return;
    let live = true;
    void listLearners().then((c) => { if (live) setChildren(c); }).catch(() => { if (live) setChildren([]); });
    return () => { live = false; };
  }, [configured]);

  return (
    <main className="l2l-page l2l-page--narrow">
      <button type="button" className="l2l-back" onClick={() => navigate('#/')}>← Home</button>
      <header className="parent__hero l2l-reveal" style={{ '--i': 0 } as CSSProperties}>
        <PipArt size={84} expression="happy" />
        <div>
          <p className="l2l-eyebrow">Family</p>
          <h1 className="l2l-display">Your child's <em>progress</em></h1>
        </div>
      </header>

      {!configured ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p className="l2l-lead">Sign in with your parent invite code to see your child's progress. (Cloud sync isn't set up on this device yet.)</p></div>
      ) : children === null ? (
        <div className="l2l-card" style={{ marginTop: 24 }}><p>Loading…</p></div>
      ) : children.length === 0 ? (
        <div className="l2l-card" style={{ marginTop: 24 }}>
          <p className="l2l-lead">No child linked yet. Enter the parent invite code from your tutor on the <button type="button" className="link-btn" onClick={() => navigate('#/account')}>account page</button> to link your child.</p>
        </div>
      ) : (
        <div className="parent__list">{children.map((c) => <ChildCard key={c.id} child={c} />)}</div>
      )}
    </main>
  );
}
