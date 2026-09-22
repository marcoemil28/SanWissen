/**
 * Darstellung der App: hell, dunkel oder hoher Kontrast.
 *
 * Gleiche vier Möglichkeiten wie in der iOS-App (`AppearanceMode` in
 * `ios/SanWissen/Core/Store.swift`), damit beide Fassungen dasselbe
 * anbieten.
 *
 * Die Auflösung von „Automatisch" passiert hier in JavaScript und nicht
 * über `@media (prefers-color-scheme)`. Sonst müssten die hellen Werte
 * zweimal im Stylesheet stehen, einmal in der Medienabfrage und einmal
 * für die ausdrückliche Wahl, und zwei Stellen laufen irgendwann
 * auseinander. So trägt `<html>` immer einen bereits entschiedenen Wert
 * und das Stylesheet kennt nur drei Blöcke.
 */
export type AppearanceMode = 'system' | 'light' | 'dark' | 'contrast';

/** Was am Ende wirklich angezeigt wird, nachdem „Automatisch" aufgelöst ist. */
export type ResolvedAppearance = 'light' | 'dark' | 'contrast';

export const APPEARANCE_MODES: { mode: AppearanceMode; label: string; icon: string }[] = [
  { mode: 'system', label: 'Automatisch', icon: '◐' },
  { mode: 'light', label: 'Hell', icon: '☀' },
  { mode: 'dark', label: 'Dunkel', icon: '☾' },
  { mode: 'contrast', label: 'Hoher Kontrast', icon: '◑' },
];

const STORAGE_KEY = 'sanwissen:appearance';

/**
 * Bis 1.1.0 gab es nur einen Schalter für den hohen Kontrast. Wer ihn an
 * hatte, soll ihn nach dem Update nicht verloren haben.
 */
const LEGACY_CONTRAST_KEY = 'sanwissen:highContrast';

function isMode(value: unknown): value is AppearanceMode {
  return value === 'system' || value === 'light' || value === 'dark' || value === 'contrast';
}

export function loadAppearance(): AppearanceMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isMode(stored)) return stored;
    if (localStorage.getItem(LEGACY_CONTRAST_KEY) === '1') return 'contrast';
  } catch {
    // Kein localStorage (privates Fenster, gesperrte Website-Daten): dann
    // gilt die Voreinstellung und die Wahl hält nur für diese Sitzung.
  }
  return 'system';
}

export function saveAppearance(mode: AppearanceMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // siehe oben
  }
}

function prefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveAppearance(mode: AppearanceMode): ResolvedAppearance {
  if (mode === 'system') return prefersDark() ? 'dark' : 'light';
  return mode;
}

/** Setzt die aufgelöste Darstellung auf `<html>`, wo auch der Seitenhintergrund hängt. */
export function applyAppearance(resolved: ResolvedAppearance): void {
  const root = document.documentElement;
  root.dataset.appearance = resolved;
  root.style.colorScheme = resolved === 'light' ? 'light' : 'dark';
}

/**
 * Meldet Änderungen der Systemeinstellung. Nur bei „Automatisch" von
 * Belang, aber das Abmelden gehört zum Aufrufer.
 */
export function watchSystemAppearance(onChange: () => void): () => void {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
