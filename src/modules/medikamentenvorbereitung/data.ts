import type { MedVorbereitungEntry } from './types';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const MED_VORBEREITUNG: MedVorbereitungEntry[] = [
  {
    id: 'medikamentenvorbereitung',
    title: 'Medikamente vorbereiten & sicher verabreichen',
    minLevel: 'RS',
    summary:
      'Die 6-R-Regel, das Standardvorgehen bei Medikamentengabe und die Grundrechnung zum Verdünnen — ' +
      'unabhängig vom einzelnen Medikament.',
    sections: [
      {
        heading: '6-R-Regel',
        illustrationId: 'medikamentenschachtel',
        steps: [
          { text: 'Richtiger Patient?', minLevel: 'RS' },
          { text: 'Richtiges Medikament?', minLevel: 'RS' },
          { text: 'Richtige Dosierung?', minLevel: 'RS' },
          { text: 'Richtige Konzentration?', minLevel: 'RS' },
          { text: 'Richtiger Zeitpunkt?', minLevel: 'RS' },
          { text: 'Richtige Applikationsart?', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Sicherheitsprinzipien bei Vorbereitung und Gabe',
        steps: [
          { text: 'Aufgezogene Spritzen eindeutig kennzeichnen (z. B. DIVI-ISO-Aufkleber)', minLevel: 'RS' },
          { text: '4-Augen-Prinzip anwenden, wo möglich', minLevel: 'RS' },
          { text: 'Doppelkontrolle. Sowohl bei der Vorbereitung als auch bei der Verabreichung', minLevel: 'RS' },
          {
            text: 'Gesicherte Kommunikation: Anordnungen (Präparat, Dosierung) von der ausführenden Person laut wiederholen',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Standardvorgehen bei Medikamentengabe (Ablauf)',
        illustrationId: 'infusionssystem',
        steps: [
          { text: 'Indikation anhand des passenden BPR bestätigt?', minLevel: 'RS' },
          { text: 'Kontraindikationen ausgeschlossen?', minLevel: 'RS' },
          { text: 'Einwilligung des Patienten erteilt?', minLevel: 'RS' },
          { text: '6-R-Regel. Alle sechs Punkte mit „ja" beantwortet?', minLevel: 'RS' },
          { text: 'Durchführung: Applikation gemäß SAA', minLevel: 'NotSan' },
          { text: 'Verlaufskontrolle: gewünschte Wirkung erreicht?', minLevel: 'NotSan' },
          { text: 'Dokumentation im Einsatzprotokoll', minLevel: 'RS' },
          {
            text: 'Bei „nein" an irgendeinem Punkt: Alternative laut BPR nutzen bzw. Gründe für ausbleibenden Erfolg bedenken und dokumentieren',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Verdünnen – die Grundrechnung',
        steps: [
          {
            text: 'Grundformel: Ausgangskonzentration × Ausgangsvolumen = Zielkonzentration × Zielvolumen (C1×V1 = C2×V2)',
            minLevel: 'RS',
          },
          {
            text: 'Praktisch: benötigte Menge der Ausgangslösung aufziehen, mit Trägerlösung (meist NaCl 0,9 %) auf das gewünschte Zielvolumen auffüllen',
            minLevel: 'RS',
          },
          { text: 'Fertige Spritze/Infusion sofort beschriften: Wirkstoff, Konzentration, Uhrzeit', minLevel: 'RS' },
          {
            text: 'Zum Nachrechnen: siehe Werkzeuge & Scores → Verdünnungsrechner',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Beispiele aus der Praxis (SAA/BPR)',
        steps: [
          {
            text: 'Epinephrin bei instabiler Bradykardie: 1 mg (1 ml) auf 100 ml NaCl 0,9 % verdünnt → 0,01 mg/ml',
            minLevel: 'NotSan',
          },
          {
            text: 'Naloxon (Notfallkarte Opioid-Überdosierung): 1 Amp. (1 ml = 0,4 mg) mit 3 ml NaCl 0,9 % verdünnt → 4 ml Lösung à 0,1 mg/ml',
            minLevel: 'NotSan',
          },
        ],
      },
    ],
    notes: [
      'Off-label-use: Die Anwendung mancher Medikamente außerhalb der Zulassung ist für NotSan nur im Rahmen ' +
        'spezifischer, eindeutiger Verfahrensanweisungen der Ärztlichen Leitung Rettungsdienst zulässig.',
      'Die SAA zu Medikamenten ersetzen weder Fachbuch noch Pharmakologie-Unterricht und erheben keinen ' +
        'Anspruch auf Vollständigkeit.',
    ],
    sourceNote:
      '6-R-Regel, Sicherheitsprinzipien und Standardvorgehen aus SAA/BPR „Allgemeine Erläuterungen ' +
      'Medikamentengabe" und „Standardvorgehen bei Medikamentengabe", S. 40–41. Die allgemeine Verdünnungsformel ' +
      '(C1×V1 = C2×V2) ist Pharmazie-Grundwissen und steht nicht im PDF; die zwei Praxisbeispiele stammen aus ' +
      'den jeweiligen Medikamenten-Seiten bzw. der Notfallkarte Opioid-Überdosierung (S. 42, 49).',
    page: 40,
  },
];

export function getMedVorbereitungById(id: string): MedVorbereitungEntry | undefined {
  return MED_VORBEREITUNG.find((e) => e.id === id);
}
