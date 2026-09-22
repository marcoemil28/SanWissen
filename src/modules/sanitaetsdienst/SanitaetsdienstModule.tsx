import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-sanitaetsdienst.json`.
 */
export function SanitaetsdienstModule() {
  return (
    <TopicModule
      moduleId="sanitaetsdienst"
      heading="Sanitätsdienst (Veranstaltungsdienst)"
      disclaimer={
        <>
          Allgemeines Grundlagenwissen zu Wachdienst-Organisation, MANV/Sichtung, Funkdisziplin und Hygiene bei
          Veranstaltungen — keine SAA/BPR-Quelle. Konkrete Abläufe (Kanäle/Rufnamen, Sichtungsschema,
          Hygieneplan) sind organisations- und bundeslandspezifisch geregelt.
        </>
      }
    />
  );
}
