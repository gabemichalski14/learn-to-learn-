import { createContext, useContext } from 'react';

export interface PromptOpts { title: string; initial?: string; placeholder?: string; okLabel?: string }
export interface ConfirmOpts { title: string; message?: string; okLabel?: string; danger?: boolean }
export interface DialogApi {
  prompt: (o: PromptOpts) => Promise<string | null>;
  confirm: (o: ConfirmOpts) => Promise<boolean>;
}

export const DialogCtx = createContext<DialogApi | null>(null);

// Safe no-op when rendered outside a provider (e.g. unit tests) — never throws.
const FALLBACK: DialogApi = { prompt: async () => null, confirm: async () => false };

/** Non-blocking, accessible replacements for window.prompt/confirm. Returns a
 *  Promise so call sites read like the native ones (await dialog.prompt(...)),
 *  but never freeze the tab. Use inside <DialogProvider>. */
export function useDialog(): DialogApi {
  return useContext(DialogCtx) ?? FALLBACK;
}
