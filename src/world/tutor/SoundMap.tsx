import { useState } from 'react';
import { skillLabel } from '../../mastery/skills';
import type { MasteryMap, SkillInsight } from '../../mastery/mastery';
import { summarize, whyNote } from './dashboardData';
import './soundMap.css';

const BANDS = [
  { key: 'mastered', tone: 'ok', icon: '🟢', label: 'Mastered' },
  { key: 'practicing', tone: 'mid', icon: '🟡', label: 'Practicing' },
  { key: 'working', tone: 'go', icon: '🎯', label: 'Ready to work on' },
] as const;

function Chip({ s, recent }: { s: SkillInsight; recent: number[] }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round(s.score * 100);
  return (
    <li>
      <button type="button" className="smap-chip" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="smap-chip__label">{skillLabel(s.skillKey)}</span>
        <span className="smap-chip__bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
        <span className="smap-chip__pct">{pct}%</span>
      </button>
      {open && (
        <div className="smap-detail">
          <span className="smap-dots" aria-label="recent answers">
            {(recent.length ? recent.slice(-10) : [1]).map((v, i) => (
              <span key={i} className={v ? 'ok' : 'no'} aria-hidden="true">{v ? '✓' : '✗'}</span>
            ))}
          </span>
          <span className="smap-detail__meta">
            {s.attempts} tries{s.avgMs != null ? ` · ~${(s.avgMs / 1000).toFixed(1)}s` : ''} · {whyNote(s)}
          </span>
        </div>
      )}
    </li>
  );
}

/** The sound map: every practised sound grouped by mastery state, tap to see its
 *  recent answers. Replaces the noisy per-session accuracy line. */
export function SoundMap({ map }: { map: MasteryMap }) {
  const sum = summarize(map);
  if (sum.total === 0) {
    return <p className="smap-empty">Play a few rounds and each sound shows up here — mastered, practising, or ready to work on.</p>;
  }
  return (
    <div className="smap">
      {BANDS.map((b) => {
        const items = sum[b.key];
        if (items.length === 0) return null;
        return (
          <div key={b.key} className={`smap-band smap-band--${b.tone}`}>
            <h4 className="smap-band__h">{b.icon} {b.label} · {items.length}</h4>
            <ul className="smap-list">
              {items.map((s) => <Chip key={s.skillKey} s={s} recent={map[s.skillKey]?.recent ?? []} />)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
