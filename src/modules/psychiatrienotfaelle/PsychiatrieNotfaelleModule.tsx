import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-psychiatrienotfaelle.json`.
 */
export function PsychiatrieNotfaelleModule() {
  return (
    <TopicModule
      moduleId="psychiatrienotfaelle"
      heading="Psychiatrische Notfälle & Kommunikation"
      disclaimer={
        <>
          Allgemeines rettungsdienstliches Grundlagenwissen zu psychiatrischen Notfällen, Gesprächsführung und
          Sterbebegleitung — keine SAA/BPR-Quelle. Rechtliche Rahmenbedingungen (Unterbringung,
          Todesfeststellung) sind bundeslandspezifisch geregelt.
        </>
      }
    />
  );
}
