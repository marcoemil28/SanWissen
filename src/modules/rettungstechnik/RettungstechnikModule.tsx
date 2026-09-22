import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-rettungstechnik.json`.
 */
export function RettungstechnikModule() {
  return (
    <TopicModule
      moduleId="rettungstechnik"
      heading="Rettungstechnik & Gerätekunde"
      disclaimer={
        <>
          Allgemeines rettungsdienstliches Grundlagenwissen zu Trageformen, Lagerung, Atemwegshilfen und
          Gerätekunde — keine SAA/BPR-Quelle. Konkrete Geräte und Checklisten können je nach
          Organisation/Fahrzeugtyp abweichen.
        </>
      }
    />
  );
}
