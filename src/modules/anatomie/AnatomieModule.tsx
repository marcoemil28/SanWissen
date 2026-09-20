import { TopicModule } from '../../components/TopicModule';

/**
 * Hülle um die gemeinsame Themen-Ansicht. Inhalte und Kategorien stehen in
 * `content/topics-anatomie.json`.
 */
export function AnatomieModule() {
  return (
    <TopicModule
      moduleId="anatomie"
      heading="Anatomie & Physiologie"
      disclaimer={
        <>
          Grundlagenwissen zu Aufbau und Funktion des Körpers — als Verständnisbasis für andere Module (z. B.
          Erregungsleitungssystem fürs EKG, vegetatives Nervensystem für Medikamentenwirkungen). Allgemeines
          anatomisch-physiologisches Wissen, keine bestimmte Quelle wie beim SAA/BPR-PDF — für Prüfungsdetails gilt
          dein Kurs-Lehrbuch/Skript.
        </>
      }
    />
  );
}
