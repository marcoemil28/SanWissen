import { APPEARANCE_MODES, type AppearanceMode } from './appearance';

/**
 * Umschalter für die Darstellung, vier Felder nebeneinander.
 *
 * Auf iOS steckt dasselbe hinter einem Menü in der Werkzeugleiste. Hier
 * liegt es offen, weil in der Seitenleiste Platz dafür ist und ein
 * zusätzlicher Klick nichts gewinnt.
 */
export function AppearancePicker({
  value,
  onChange,
}: {
  value: AppearanceMode;
  onChange: (mode: AppearanceMode) => void;
}) {
  return (
    <div className="appearance-picker" role="group" aria-label="Darstellung">
      {APPEARANCE_MODES.map(({ mode, label, icon }) => (
        <button
          key={mode}
          type="button"
          className={`appearance-option ${value === mode ? 'active' : ''}`}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          title={label}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="appearance-option-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
