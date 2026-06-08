import { useEffect, useMemo, useState } from 'react';
import { createStubAudioPlayer } from '../../audio/stubAudioPlayer';
import { sfx } from '../../audio/sfx';
import { CharacterArt } from './CharacterArt';
import type { LevelCharacter } from './cast';
import './storytime.css';

/**
 * A cozy storybook scene a garden resident tells you — one line at a time, read
 * aloud, with the friend whole and glowing. Dyslexia-first: a single short line
 * on screen at once (no wall of text), big and calm, advanced at the child's
 * pace, always narrated so it can be *heard*. The lines come from the
 * memory-aware `storytimeScene` (their recovered hums), so it reflects what the
 * learner actually did. The last page blooms.
 */
export function Storytime({ character, lines, title, onClose }: {
  character: LevelCharacter;
  lines: string[];
  /** Optional heading (e.g. a Village lesson title); omitted for plain stories. */
  title?: string;
  onClose: () => void;
}) {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [i, setI] = useState(0);
  const total = Math.max(1, lines.length);
  const last = i >= total - 1;
  const line = lines[i] ?? '';

  // Read each page aloud as it appears (best-effort; honours global mute).
  useEffect(() => { void audio.narrate(line); }, [audio, line]);

  // Esc closes the scene.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const next = () => {
    if (last) { onClose(); return; }
    sfx.tap();
    setI((n) => Math.min(total - 1, n + 1));
  };

  return (
    <div className="st-overlay" onMouseDown={onClose} role="presentation">
      <section
        className="st-book"
        role="dialog"
        aria-modal="true"
        aria-label={`A story with ${character.name}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button type="button" className="st-x" onClick={onClose} aria-label="Close the story">✕</button>

        <div className="st-hero">
          <CharacterArt
            emoji={character.emoji}
            heal={1}
            mood={last ? 'bloom' : null}
            size={120}
            art={character.art}
            label={character.name}
          />
          <p className="st-name">{character.name}</p>
          {title && <p className="st-title">{title}</p>}
        </div>

        <p className="st-line" role="status" aria-live="polite" key={i}>{line}</p>

        <div className="st-dots" aria-hidden="true">
          {Array.from({ length: total }, (_, n) => (
            <i key={n} className={n === i ? 'on' : n < i ? 'past' : ''} />
          ))}
        </div>

        <div className="st-actions">
          <button
            type="button"
            className="st-hear"
            onClick={() => { sfx.tap(); void audio.narrate(line); }}
            aria-label="Hear it again"
          >
            🔊 Again
          </button>
          <button type="button" className="st-next" onClick={next}>
            {last ? 'The end 🌿' : 'Next ▸'}
          </button>
        </div>
      </section>
    </div>
  );
}
