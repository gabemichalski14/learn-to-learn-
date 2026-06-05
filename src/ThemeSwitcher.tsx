export type ThemeId = 'playful' | 'l2l' | 'grownup';

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'playful', label: 'Playful' },
  { id: 'l2l', label: 'L2L' },
  { id: 'grownup', label: 'Clean' },
];

interface Props {
  value: ThemeId;
  onSelect: (id: ThemeId) => void;
}

/**
 * Tutor control to set the look for a student's age. All themes are teal-family;
 * they vary shape, brightness, contrast, motion, and type — not the brand color.
 */
export function ThemeSwitcher({ value, onSelect }: Props) {
  return (
    <div className="theme-switch" role="group" aria-label="Look and feel">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`theme-switch__btn${value === t.id ? ' is-active' : ''}`}
          aria-pressed={value === t.id}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
