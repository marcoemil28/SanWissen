import { useState } from 'react';
import { TopicModule } from '../../components/TopicModule';
import { RowGroup, RowLink } from '../../components/SectionBox';
import { AtlasView } from './atlas/AtlasView';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-anatomie.json`.
 *
 * Dazu der 3D-Atlas, der kein Thema ist, sondern eine eigene Ansicht. Er
 * steht über der Themenliste, so wie in der iOS-Fassung.
 */
export function AnatomieModule() {
  const [atlasOpen, setAtlasOpen] = useState(false);

  if (atlasOpen) return <AtlasView onClose={() => setAtlasOpen(false)} />;

  return (
    <TopicModule
      moduleId="anatomie"
      heading="Anatomie & Physiologie"
      leadIn={
        <RowGroup>
          <RowLink
            icon="🧍"
            title="3D-Atlas"
            subtitle="2.234 Modellteile zum Drehen, Freistellen und Auseinanderziehen"
            onClick={() => setAtlasOpen(true)}
          />
        </RowGroup>
      }
      disclaimer={
        <>
          Grundlagenwissen zu Aufbau und Funktion des Körpers, als Verständnisbasis für andere Module (zum Beispiel
          Erregungsleitungssystem fürs EKG, vegetatives Nervensystem für Medikamentenwirkungen). Allgemeines
          anatomisch-physiologisches Wissen ohne bestimmte Quelle wie beim SAA/BPR-PDF; für Prüfungsdetails gilt
          dein Kurs-Lehrbuch oder Skript.
        </>
      }
    />
  );
}
