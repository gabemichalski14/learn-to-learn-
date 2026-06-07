/**
 * Tiny synthesized game "juice" sound effects (Web Audio) + light haptics.
 * No asset files — everything is generated on the fly. The AudioContext is
 * created lazily and resumed on the user's first gesture. A single mute toggle
 * (persisted) silences both sound and vibration. Separate from spoken
 * phoneme/word audio (that's the AudioPlayer).
 */
let ctx: AudioContext | null = null;

const MUTE_KEY = 'll-muted';
let muted = (() => {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
})();

export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* ignore */ }
}
export function isMuted(): boolean {
  return muted;
}

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
  if (muted) return;
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

function haptic(pattern: number | number[]): void {
  if (muted) return;
  try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
}

export const sfx = {
  /** Soft tick when picking up / tapping an item. */
  tap(): void {
    tone(520, 0, 0.05, 'sine', 0.05);
  },
  /** A satisfying "catch" pop when a piece lands. */
  pop(): void {
    tone(420, 0, 0.07, 'triangle', 0.08);
    tone(680, 0.04, 0.09, 'triangle', 0.06);
    haptic(14);
  },
  /** Bright two-note sparkle for a correct answer. */
  correct(): void {
    tone(660, 0, 0.12, 'triangle', 0.09);
    tone(990, 0.07, 0.16, 'triangle', 0.08);
    haptic(18);
  },
  /** Rising chime that climbs with the combo count — bigger streak, brighter. */
  combo(n: number): void {
    const base = 620 + Math.min(n, 8) * 70;
    tone(base, 0, 0.1, 'triangle', 0.09);
    tone(base * 1.5, 0.06, 0.14, 'triangle', 0.07);
    haptic(22);
  },
  /** Soft, gentle low blip for a wrong try — never harsh. */
  wrong(): void {
    tone(220, 0, 0.16, 'sine', 0.07);
    haptic([10, 40, 10]);
  },
  /** Celebratory ascending fanfare at the finish. */
  win(): void {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.1));
    haptic([20, 40, 20, 40, 30]);
  },
  /** Legacy alias used by the older SortGame. */
  complete(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.26, 'triangle', 0.1));
  },
};
