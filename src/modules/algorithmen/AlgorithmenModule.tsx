import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-algorithmen.json`.
 */
export function AlgorithmenModule() {
  return (
    <TopicModule
      moduleId="algorithmen"
      heading="Algorithmen"
      notesHeading="Erläuterungen"
      disclaimer={
        <>
          Diese Algorithmen fassen die <strong>Herangehensweise- und Kreislaufstillstand-Behandlungspfade</strong>{' '}
          aus den Standard-Arbeitsanweisungen und Behandlungspfaden (SAA/BPR) 2025 zusammen — ergänzt um allgemeines
          Basiswissen (z. B. Laien-Basismaßnahmen bei der Reanimation), das nicht aus dem PDF stammt (siehe
          Quellenhinweis je Eintrag).
        </>
      }
    />
  );
}
