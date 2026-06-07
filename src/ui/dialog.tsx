import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DialogCtx, type DialogApi, type PromptOpts, type ConfirmOpts } from './dialogContext';
import './dialog.css';

type Active =
  | { kind: 'prompt'; opts: PromptOpts; resolve: (v: string | null) => void }
  | { kind: 'confirm'; opts: ConfirmOpts; resolve: (v: boolean) => void };

export function DialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active | null>(null);
  const api = useMemo<DialogApi>(() => ({
    prompt: (opts) => new Promise<string | null>((resolve) => setActive({ kind: 'prompt', opts, resolve })),
    confirm: (opts) => new Promise<boolean>((resolve) => setActive({ kind: 'confirm', opts, resolve })),
  }), []);
  return (
    <DialogCtx.Provider value={api}>
      {children}
      {active && <DialogHost key={active.kind + active.opts.title} active={active} done={() => setActive(null)} />}
    </DialogCtx.Provider>
  );
}

function DialogHost({ active, done }: { active: Active; done: () => void }) {
  const [value, setValue] = useState(active.kind === 'prompt' ? (active.opts.initial ?? '') : '');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const okRef = useRef<HTMLButtonElement | null>(null);

  const cancel = useCallback(() => {
    if (active.kind === 'prompt') active.resolve(null); else active.resolve(false);
    done();
  }, [active, done]);
  const ok = useCallback(() => {
    if (active.kind === 'prompt') active.resolve(value.trim() || null);
    else active.resolve(true);
    done();
  }, [active, value, done]);

  useEffect(() => {
    (active.kind === 'prompt' ? inputRef.current : okRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active.kind, cancel]);

  const o = active.opts;
  const danger = active.kind === 'confirm' && active.opts.danger;
  return (
    <div className="ll-modal-overlay" onMouseDown={cancel}>
      <div className="ll-modal" role="dialog" aria-modal="true" aria-label={o.title} onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="ll-modal__title">{o.title}</h2>
        {active.kind === 'confirm' && active.opts.message && <p className="ll-modal__msg">{active.opts.message}</p>}
        {active.kind === 'prompt' && (
          <form onSubmit={(e) => { e.preventDefault(); ok(); }}>
            <input
              ref={inputRef}
              className="ll-modal__input"
              value={value}
              placeholder={active.opts.placeholder}
              onChange={(e) => setValue(e.target.value)}
              aria-label={o.title}
              maxLength={40}
            />
          </form>
        )}
        <div className="ll-modal__btns">
          <button type="button" className="ll-modal__btn ll-modal__btn--ghost" onClick={cancel}>Cancel</button>
          <button ref={okRef} type="button" className={`ll-modal__btn${danger ? ' ll-modal__btn--danger' : ''}`} onClick={ok}>
            {o.okLabel ?? (active.kind === 'prompt' ? 'Save' : 'OK')}
          </button>
        </div>
      </div>
    </div>
  );
}
