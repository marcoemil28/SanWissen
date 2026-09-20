import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-rechtlichegrundlagen.json`.
 */
export function RechtlicheGrundlagenModule() {
  return (
    <TopicModule
      moduleId="rechtlichegrundlagen"
      heading="Rechtliche & organisatorische Grundlagen"
      disclaimer={
        <>
          Allgemeines rechtliches Grundlagenwissen für den Rettungsdienst — keine SAA/BPR-Quelle und keine
          Rechtsberatung. Konkrete Rechtsvorschriften sind bundeslandspezifisch geregelt.
        </>
      }
    />
  );
}
