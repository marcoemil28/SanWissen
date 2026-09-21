import type { ReactNode } from 'react';

/**
 * Bausteine der Startseite, nachgebaut nach `SectionBox` und `RowLabel` aus
 * `ios/SanWissen/Features/Home/HomeView.swift`. Damit sehen beide Fassungen
 * gleich aus und Änderungen lassen sich an einer Stelle nachziehen.
 */

/** Überschrift mit optionalem Symbol in Akzentfarbe, darunter der Inhalt. */
export function SectionBox({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <section className="section-box">
      <h2 className="section-box-title">
        {icon && (
          <span className="section-box-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Anklickbare Zeile als Karte: Symbol, Titel, darunter optional eine
 * Unterzeile, rechts das Winkelzeichen.
 */
export function RowLink({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
  badge,
}: {
  /** Ohne Symbol rückt der Text an den Rand, so wie in den Themenlisten auf iOS. */
  icon?: string;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button type="button" className={`row-link ${icon ? '' : 'no-icon'}`} onClick={onClick} disabled={disabled}>
      {icon && (
        <span className="row-link-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="row-link-text">
        <span className="row-link-title">{title}</span>
        {subtitle && <span className="row-link-subtitle">{subtitle}</span>}
      </span>
      {badge && <span className="badge">{badge}</span>}
      <span className="row-link-chevron" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

/**
 * Mehrere Zeilen als ein Block mit gemeinsamen Ecken, so wie eine
 * gruppierte Liste auf iOS. Die Trennlinien zwischen den Zeilen setzt das
 * Stylesheet, eingerückt bis unter den Text.
 */
export function RowGroup({ children }: { children: ReactNode }) {
  return <div className="row-group">{children}</div>;
}
