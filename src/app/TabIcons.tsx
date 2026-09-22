/**
 * Symbole der unteren Reiterleiste.
 *
 * Bewusst als SVG und nicht als Emoji: die Reiterleiste auf iOS nutzt
 * SF Symbols, die einfarbig sind und sich mit der Auswahl einfärben.
 * Emoji bringen ihre eigenen Farben mit, dann leuchtet der gewählte
 * Reiter nicht. Mit `currentColor` übernimmt das SVG die Farbe der
 * Schaltfläche.
 *
 * Die Formen entsprechen den Symbolen, die `RootView.swift` für die
 * TabView angibt: house, square.grid.2x2, questionmark.circle,
 * magnifyingglass.
 */
const COMMON = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function HomeIcon() {
  return (
    <svg {...COMMON}>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.7V20h13V9.7" />
      <path d="M9.8 20v-5.4h4.4V20" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg {...COMMON}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </svg>
  );
}

export function QuestionIcon() {
  return (
    <svg {...COMMON}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.5" />
      <path d="M12 17.2h.01" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg {...COMMON}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.4 15.4 4.1 4.1" />
    </svg>
  );
}
