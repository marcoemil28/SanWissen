import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-traumatologie.json`.
 */
export function TraumatologieModule() {
  return (
    <TopicModule
      moduleId="traumatologie"
      heading="Traumatologie & Verbandslehre"
      disclaimer={
        <>
          Allgemeines rettungsdienstliches Grundlagenwissen zu Frakturen, Wundversorgung, Verbandstechniken und
          schweren Verletzungen — keine SAA/BPR-Quelle. Konkrete Vorgehensweisen können je nach
          Rettungsdienstbereich/aktueller Leitlinie variieren.
        </>
      }
    />
  );
}
