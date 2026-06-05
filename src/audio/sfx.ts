/**
 * Tiny synthesized UI sound effects (Web Audio) — pops, chimes, a finish
 * fanfare. These are game "juice", separate from the spoken phoneme/word audio.
 * No asset files; everything is generated on the fly. Safe to call anytime —
 * the AudioContext is created lazily and resumed on the user's first gesture.
 */
let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startOffset: number, dur: number, type: OscillatorType = 'triangle', gain = 0.1): void {
  const c = audioCtx();
  if (!c) return;
  const t0 = c.currentTime + startOffset;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export const sfx = {
  /** Bright two-note sparkle for a correct placement. */
  correct(): void {
    tone(660, 0, 0.12, 'triangle', 0.09);
    tone(990, 0.07, 0.16, 'triangle', 0.08);
  },
  /** Soft, gentle low blip for a wrong try — never harsh. */
  wrong(): void {
    tone(220, 0, 0.16, 'sine', 0.07);
  },
  /** Little ascending fanfare when the whole tree is grown. */
  complete(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.26, 'triangle', 0.1));
  },
};
