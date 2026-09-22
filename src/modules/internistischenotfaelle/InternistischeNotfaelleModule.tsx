import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-internistischenotfaelle.json`.
 */
export function InternistischeNotfaelleModule() {
  return (
    <TopicModule
      moduleId="internistischenotfaelle"
      heading="Internistische Notfälle"
      disclaimer={
        <>
          Allgemeines rettungsdienstliches Grundlagenwissen zur Erkennung und Erstversorgung internistischer
          Notfälle — keine SAA/BPR-Quelle. Ärztlich delegierte Maßnahmen (z. B. Medikamentengabe) sind gesondert
          gekennzeichnet, siehe Medikamente-Modul.
        </>
      }
    />
  );
}
