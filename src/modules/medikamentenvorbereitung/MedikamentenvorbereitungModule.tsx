import { MED_VORBEREITUNG, CONTENT_STAND } from './data';
import { formatStand } from '../../app/formatDate';
import { SectionIllustration } from '../../components/SectionIllustration';

export function MedikamentenvorbereitungModule() {
  const entry = MED_VORBEREITUNG[0];

  return (
    <div className="module medikamentenvorbereitung-module">
      <header className="module-header">
        <h1>Medikamente vorbereiten & sicher verabreichen</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ Die 6-R-Regel, Sicherheitsprinzipien und das Standardvorgehen bei Medikamentengabe aus den
        Standard-Arbeitsanweisungen und Behandlungspfaden (SAA/BPR) 2025 — ergänzt um die allgemeine
        Verdünnungsformel (siehe Quellenhinweis). Inhaltlicher Stand: {formatStand(CONTENT_STAND)}.
      </div>

      <div className="algo-detail">
        <div className="algo-detail-header">
          <div>
            <h2>{entry.title}</h2>
            <p className="algo-summary">{entry.summary}</p>
          </div>
          {entry.page && <span className="med-page-ref">SAA und BPR 2025, S. {entry.page}</span>}
        </div>

        {entry.sections.map((section, i) => (
          <div key={i} className="algo-section">
            {section.heading && <h4>{section.heading}</h4>}
            <SectionIllustration id={section.illustrationId} />
            <ul>
              {section.steps.map((step, j) => (
                <li key={j}>{step.text}</li>
              ))}
            </ul>
          </div>
        ))}

        {entry.notes && entry.notes.length > 0 && (
          <div className="algo-notes">
            <h4>Erläuterungen</h4>
            <ul>
              {entry.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {entry.sourceNote && <p className="algo-source-note">ℹ️ {entry.sourceNote}</p>}
      </div>
    </div>
  );
}
