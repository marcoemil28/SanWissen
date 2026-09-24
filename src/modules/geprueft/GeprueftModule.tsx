import { useMemo } from 'react';
import reviewersContent from '../../../content/reviewers.json';
import { MODULES } from '../../app/registry';
import { DisclaimerBox } from '../../components/SectionBox';
import { formatStand } from '../../app/formatDate';

/**
 * Wer die Fachinhalte gegengelesen hat.
 *
 * Bewusst auch ehrlich nach unten: die Seite nennt nicht nur, was geprüft
 * wurde, sondern auch, was noch niemand gegengelesen hat. Eine
 * Herkunftsangabe, die nur die geprüften Teile zeigt, erweckt den Eindruck,
 * alles sei geprüft.
 *
 * Die Einträge stehen in `content/reviewers.json`, `check-content.mjs`
 * prüft, dass die genannten Module wirklich existieren.
 */

interface Reviewer {
  id: string;
  name: string;
  role: string;
  organisation?: string;
  modules: string[];
  date: string;
  note?: string;
}

const REVIEWERS: Reviewer[] = reviewersContent.reviewers;

export function GeprueftModule() {
  const moduleTitle = useMemo(() => {
    const map = new Map(MODULES.map((m) => [m.id, m.title] as const));
    return (id: string) => map.get(id) ?? id;
  }, []);

  /** Module, zu denen niemand eine Prüfung eingetragen hat. */
  const ungeprueft = useMemo(() => {
    if (REVIEWERS.some((r) => r.modules.includes('alle'))) return [];
    const geprueft = new Set(REVIEWERS.flatMap((r) => r.modules));
    return MODULES.filter((m) => m.id !== 'geprueft' && !geprueft.has(m.id));
  }, []);

  return (
    <div className="module geprueft-module">
      <header className="page-header">
        <h1>Geprüft von</h1>
        <p className="page-subtitle">Wer die Fachinhalte gegengelesen hat.</p>
      </header>

      <DisclaimerBox>
        Eine Prüfung hier bedeutet: die genannte Person hat die Inhalte der aufgeführten Module fachlich
        durchgesehen. Sie ersetzt weder die offizielle Ausbildung noch die Dienstanweisung deiner Organisation,
        und sie macht die App nicht zu einer verbindlichen Quelle. Maßgeblich bleiben die Originaldokumente, die
        bei jedem Eintrag genannt sind.
      </DisclaimerBox>

      {REVIEWERS.length === 0 ? (
        <div className="geprueft-leer">
          <p>
            <strong>Bisher hat niemand gegengelesen.</strong>
          </p>
          <p>
            Die Inhalte stammen aus den bei jedem Eintrag genannten Quellen, vor allem aus den
            Standard-Arbeitsanweisungen und Behandlungspfaden 2025, sind aber noch von keiner weiteren Person
            fachlich geprüft worden. Sobald das geschieht, steht es hier.
          </p>
        </div>
      ) : (
        <div className="geprueft-grid">
          {REVIEWERS.map((person) => (
            <article key={person.id} className="geprueft-karte">
              <h2>{person.name}</h2>
              <p className="geprueft-rolle">{person.role}</p>
              {person.organisation && <p className="geprueft-organisation">{person.organisation}</p>}

              <p className="geprueft-label">Geprüft</p>
              {person.modules.includes('alle') ? (
                <p className="geprueft-bereiche">Alle Module</p>
              ) : (
                <ul className="geprueft-bereiche-liste">
                  {person.modules.map((id) => (
                    <li key={id}>{moduleTitle(id)}</li>
                  ))}
                </ul>
              )}

              {person.note && <p className="geprueft-notiz">{person.note}</p>}
              <p className="geprueft-datum">Stand {formatStand(person.date)}</p>
            </article>
          ))}
        </div>
      )}

      {REVIEWERS.length > 0 && ungeprueft.length > 0 && (
        <section className="section-box">
          <h2 className="section-box-title">Noch nicht gegengelesen</h2>
          <p className="section-box-hint">
            Zu diesen Modulen liegt keine Prüfung vor. Das heißt nicht, dass sie falsch sind, sondern dass
            niemand sie bestätigt hat.
          </p>
          <ul className="geprueft-offen">
            {ungeprueft.map((m) => (
              <li key={m.id}>
                <span aria-hidden="true">{m.icon}</span> {m.title}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
