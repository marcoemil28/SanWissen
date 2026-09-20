import type { ComponentType } from 'react';
import type { QualificationLevel } from '../../app/levels';
import { GcsCalculator } from './GcsCalculator';
import { NacaScore } from './NacaScore';
import { SchmerzSkala } from './SchmerzSkala';
import { ApgarCalculator } from './ApgarCalculator';
import { NeunerRegel } from './NeunerRegel';
import { VerduennungsRechner } from './VerduennungsRechner';

export interface Tool {
  id: string;
  title: string;
  category: string;
  minLevel: QualificationLevel;
  description: string;
  component: ComponentType;
  /** Woher die Skala stammt, damit jeder Wert nachvollziehbar bleibt. */
  sourceNote?: string;
}

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-18';

export const TOOLS: Tool[] = [
  {
    id: 'gcs',
    title: 'Glasgow Coma Scale (GCS)',
    category: 'Bewusstsein',
    minLevel: 'RS',
    description: 'Interaktiver Rechner zur Beurteilung der Bewusstseinslage.',
    component: GcsCalculator,
    sourceNote:
      'Originalskala nach Teasdale und Jennett, „Assessment of coma and impaired consciousness. A practical scale", The Lancet 1974. Die Schweregrad-Einteilung 15 bis 13, 12 bis 9 und 8 bis 3 Punkte entspricht SAA und BPR 2025, Seite 77.',
  },
  {
    id: 'schmerzskala',
    title: 'Schmerzskala (NRS/VAS)',
    category: 'Schmerz',
    minLevel: 'SanH',
    description: 'Numerische Ratingskala 0–10 zur Schmerzeinschätzung.',
    component: SchmerzSkala,
    sourceNote:
      'Numerische Ratingskala von 0 bis 10. SAA und BPR 2025 nutzen die NRS durchgehend als Schwelle für die Analgesie, etwa „starker Schmerz (NRS größer oder gleich 6)" in den SAA zu Esketamin, Morphin und Nalbuphin, und im OPQRST-Schema auf Seite 79.',
  },
  {
    id: 'apgar',
    title: 'APGAR-Score',
    category: 'Neugeborene',
    minLevel: 'RS',
    description: 'Beurteilung von Neugeborenen nach 1/5/10 Minuten.',
    component: ApgarCalculator,
    sourceNote:
      'Score nach Virginia Apgar, „A proposal for a new method of evaluation of the newborn infant", Current Researches in Anesthesia and Analgesia 1953. Bewertet wird nach 1, 5 und 10 Minuten.',
  },
  {
    id: 'neuner-regel',
    title: 'Neuner-Regel (Verbrennungsfläche)',
    category: 'Verbrennung',
    minLevel: 'RS',
    description: 'Schätzung der verbrannten Körperoberfläche (VKOF).',
    component: NeunerRegel,
    sourceNote:
      'Neuner-Regel nach Wallace (1951) zur Schätzung der verbrannten Körperoberfläche. Bei Kindern gelten wegen des größeren Kopfanteils abweichende Werte, deshalb rechnet das Werkzeug altersabhängig. Als Faustregel für kleine Flächen gilt zusätzlich: die Handfläche des Patienten einschließlich Finger entspricht etwa einem Prozent.',
  },
  {
    id: 'naca',
    title: 'NACA-Score',
    category: 'Einsatzschwere',
    minLevel: 'RS',
    description: 'Einteilung der Einsatzschwere für Dokumentation.',
    component: NacaScore,
    sourceNote:
      'NACA-Score des National Advisory Committee for Aeronautics, in Deutschland etabliert über die DIVI-Notarzteinsatzprotokolle. Die Skala reicht von NACA 0 (keine Verletzung oder Erkrankung) bis NACA VII (Tod).',
  },
  {
    id: 'verduennung',
    title: 'Verdünnungsrechner',
    category: 'Medikamentenvorbereitung',
    minLevel: 'RS',
    description: 'Berechnet Ausgangslösung + Verdünnungsmittel für eine vorgegebene Zielkonzentration.',
    component: VerduennungsRechner,
    sourceNote:
      'Rechnet mit der Grundgleichung Ausgangskonzentration mal Ausgangsvolumen gleich Zielkonzentration mal Zielvolumen. Die Beispielwerte orientieren sich an den Verdünnungsangaben der SAA 2025, etwa 1 mg Epinephrin in 100 ml NaCl 0,9 Prozent (Seite 49).',
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}
