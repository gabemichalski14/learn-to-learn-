import '@testing-library/jest-dom/vitest';

// jsdom has no speechSynthesis; provide a no-op mock so the audio stub runs in tests.
if (!('speechSynthesis' in globalThis)) {
  (globalThis as unknown as { speechSynthesis: unknown }).speechSynthesis = {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  };
  (globalThis as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance =
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    };
}
