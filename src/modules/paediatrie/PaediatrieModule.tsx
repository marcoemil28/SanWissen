import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-paediatrie.json`.
 */
export function PaediatrieModule() {
  return (
    <TopicModule
      moduleId="paediatrie"
      heading="Pädiatrie & Geburtshilfe"
      disclaimer={
        <>
          Allgemeines rettungsdienstliches Grundlagenwissen zu pädiatrischen Notfällen und Geburtshilfe — keine
          SAA/BPR-Quelle. Der APGAR-Rechner findet sich im Werkzeuge-Modul, die Kinderreanimation im
          Algorithmen-Modul.
        </>
      }
    />
  );
}
