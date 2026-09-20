import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-medikamentenvorbereitung.json`.
 */
export function MedikamentenvorbereitungModule() {
  return (
    <TopicModule
      moduleId="medikamentenvorbereitung"
      heading="Medikamente vorbereiten & sicher verabreichen"
      notesHeading="Erläuterungen"
      disclaimer={
        <>
          Die 6-R-Regel, Sicherheitsprinzipien und das Standardvorgehen bei Medikamentengabe aus den
          Standard-Arbeitsanweisungen und Behandlungspfaden (SAA/BPR) 2025 — ergänzt um die allgemeine
          Verdünnungsformel (siehe Quellenhinweis).
        </>
      }
    />
  );
}
