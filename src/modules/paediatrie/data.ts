import type { PaediatrieTopic } from './types';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rettungsdienstliches Grundlagenwissen zu pädiatrischen Notfällen und Geburtshilfe, keine ' +
  'SAA/BPR-Quelle. Konkrete Vorgehensweisen können je nach Ausbildungsstand/lokaler Vorgabe variieren.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const PAEDIATRIE_THEMEN: PaediatrieTopic[] = [
  {
    id: 'kindernotfaelle-besonderheiten',
    title: 'Besonderheiten pädiatrischer Notfälle',
    category: 'Pädiatrie',
    minLevel: 'SanH',
    summary:
      'Warum Kinder keine "kleinen Erwachsenen" sind. Anatomische und physiologische Besonderheiten, ' +
      'altersabhängige Vitalwerte, Dosierungsbesonderheiten und Kommunikation.',
    sections: [
      {
        heading: 'Anatomische & physiologische Besonderheiten',
        illustrationId: 'saeugling-puls',
        facts: [
          { text: 'Relativ großer Kopf und kurzer Hals. Beeinflusst Lagerung und Atemwegsmanagement' },
          { text: 'Engere Atemwege. Schon kleine Schwellungen/Fremdkörper wirken sich stark aus' },
          { text: 'Höhere Atem- und Herzfrequenz je jünger das Kind, altersabhängige Normwerte beachten (siehe Anatomie-Modul, Vitalparameter-Normwerte)' },
          { text: 'Höherer Wasser- und Wärmeverlust im Verhältnis zur Körperoberfläche, schnellere Auskühlungsgefahr' },
        ],
      },
      {
        heading: 'Kommunikation & Einschätzung',
        facts: [
          { text: 'Altersgerecht ansprechen, Eltern/Bezugsperson aktiv einbeziehen. Sie kennen das "normale" Verhalten des Kindes' },
          { text: 'Blickdiagnose oft aussagekräftiger als sofortiges Abtasten: Hautfarbe, Atemarbeit, Aktivität/Ansprechbarkeit beobachten, bevor man das Kind anfasst' },
          { text: 'Untersuchung nach Möglichkeit auf dem Arm/Schoß der Bezugsperson beginnen' },
        ],
      },
      {
        heading: 'Gewichtsschätzung im Notfall',
        facts: [
          { text: 'Grobe Faustformel als Orientierung (nur Richtwert, kein Ersatz für Angabe der Eltern): Alter in Jahren × 2 + 8 ≈ Gewicht in kg', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Dosierungsbesonderheiten bei Kindern',
        facts: [
          { text: 'Medikamentendosierungen bei Kindern richten sich nach dem Körpergewicht. Es gibt keine feste "Kinderdosis", sondern immer mg pro kg Körpergewicht', minLevel: 'RS' },
          {
            text: 'Gewichtsbasierte Referenzsysteme (z. B. farbcodierte Bänder/Karten nach Körperlänge) helfen im Notfall, wenn das tatsächliche Gewicht unbekannt ist',
            minLevel: 'RS',
          },
          {
            text: 'Konkrete Dosierungen einzelner Medikamente stehen im Medikamente-Modul bzw. in der jeweils gültigen SAA/BPR. Hier bewusst keine Zahlenwerte, um Verwechslung mit veralteten/falschen Angaben zu vermeiden',
            minLevel: 'RS',
          },
          { text: 'Im Zweifel oder bei fehlender Gewichtsangabe: ärztliche Rücksprache/Notarzt hinzuziehen statt zu schätzen', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Reanimation',
        facts: [
          { text: 'Kinder-Reanimation folgt einem eigenen Algorithmus mit abweichenden Frequenzen/Verhältnissen. Siehe Algorithmen-Modul „Reanimation Kinder"' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'normale-geburt',
    title: 'Normale Geburt',
    category: 'Geburtshilfe',
    minLevel: 'SanH',
    summary: 'Die drei Geburtsphasen und typische Anzeichen einer bevorstehenden Geburt.',
    sections: [
      {
        heading: 'Geburtsphasen',
        facts: [
          { text: 'Eröffnungsphase: regelmäßige Wehen, der Muttermund öffnet sich schrittweise' },
          { text: 'Austreibungsphase: Pressphase bis zur Geburt des Kindes' },
          { text: 'Nachgeburtsphase: Ausstoßung der Plazenta' },
        ],
      },
      {
        heading: 'Anzeichen einer bevorstehenden Geburt',
        facts: [
          { text: 'Regelmäßige, in kürzer werdenden Abständen auftretende Wehen' },
          { text: 'Fruchtwasserabgang (Blasensprung)' },
          { text: 'Pressdrang der Mutter' },
          { text: 'Sichtbarer Kopf des Kindes in der Vulva. Geburt steht unmittelbar bevor' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'notgeburt-ablauf',
    title: 'Notgeburt – Ablauf für den Sanitätsdienst',
    category: 'Geburtshilfe',
    minLevel: 'RS',
    summary: 'Wie eine Geburt begleitet wird, wenn kein rechtzeitiger Transport in die Klinik mehr möglich ist.',
    sections: [
      {
        heading: 'Vorbereitung',
        facts: [
          { text: 'Ruhe bewahren und ausstrahlen. Das beruhigt auch die Mutter' },
          { text: 'Sichtschutz und Privatsphäre schaffen' },
          { text: 'Mutter in halbsitzende oder liegende Position mit angewinkelten, gespreizten Beinen bringen' },
          { text: 'Sauberes Material bereitlegen (Tücher, Handschuhe, ggf. Abnabel-Set)' },
          { text: 'Frühzeitig Notarzt nachfordern' },
        ],
      },
      {
        heading: 'Während der Geburt',
        facts: [
          { text: 'Kopf des Kindes beim Durchtritt vorsichtig mit der Hand unterstützen, nicht ziehen' },
          { text: 'Geburtsvorgang nicht forcieren. Der natürliche Ablauf hat Vorrang' },
          { text: 'Auf eine Nabelschnur um den Hals des Kindes achten' },
        ],
      },
      {
        heading: 'Direkt nach der Geburt',
        facts: [
          { text: 'Kind sofort abtrocknen und warmhalten. Größter Wärmeverlust unmittelbar nach der Geburt' },
          { text: 'Atmung und Reaktion des Kindes prüfen' },
          { text: 'Abnabeln erst, wenn die Nabelschnur nicht mehr pulsiert bzw. nach lokaler Vorgabe', minLevel: 'RS' },
          { text: 'Kind zum Bonding und Wärmeerhalt auf die Brust/den Bauch der Mutter legen' },
        ],
      },
      {
        heading: 'Nach der Geburt',
        facts: [
          { text: 'Plazentageburt abwarten. Nicht an der Nabelschnur ziehen' },
          { text: 'Fundusstand und Blutungsmenge der Mutter beobachten (Nachblutung erkennen)', minLevel: 'RS' },
          { text: 'Notarzt für Mutter und Kind ist grundsätzlich immer erforderlich' },
        ],
      },
    ],
    notes: ['Eine Notgeburt ist ein Ausnahmefall. Bei jeder Möglichkeit hat der zügige, sichere Transport in eine Geburtsklinik Vorrang.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'neugeborenen-erstversorgung-apgar',
    title: 'Erstversorgung Neugeborenes & APGAR-Score',
    category: 'Geburtshilfe',
    minLevel: 'SanH',
    summary: 'Die ersten Maßnahmen am Neugeborenen und die standardisierte APGAR-Beurteilung.',
    sections: [
      {
        heading: 'Erste Maßnahmen',
        facts: [
          { text: 'Abtrocknen und Wärmeerhalt. Direkt nach der Geburt ist der Wärmeverlust am größten' },
          { text: 'Absaugen nur bei sichtbar verlegten Atemwegen, nicht routinemäßig' },
          { text: 'Taktile Stimulation (sanftes Abreiben des Rückens/der Fußsohlen) regt die Eigenatmung an' },
        ],
      },
      {
        heading: 'APGAR-Score – die 5 Kriterien',
        facts: [
          { text: 'Atmung. Fehlend, unregelmäßig/schwach, oder regelmäßig/kräftig (Schreien)' },
          { text: 'Puls (Herzfrequenz). Fehlend, unter 100/min, oder über 100/min' },
          { text: 'Grundtonus (Muskeltonus). Schlaff, träge Beugung, oder aktive Bewegung' },
          { text: 'Aussehen (Hautfarbe). Blass/blau, Stamm rosig/Extremitäten blau, oder komplett rosig' },
          { text: 'Reflexe (Reaktion auf Reiz, z. B. Absaugen). Keine, Grimassieren, oder Schreien/Husten' },
        ],
      },
      {
        heading: 'Bewertungszeitpunkte',
        facts: [
          { text: 'Beurteilung nach 1, 5 und 10 Minuten nach der Geburt' },
          { text: 'Der Verlauf über die drei Messzeitpunkte ist aussagekräftiger als der Einzelwert' },
          { text: 'Interaktiver Rechner: siehe Werkzeuge & Scores → APGAR-Score' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getPaediatrieTopicById(id: string): PaediatrieTopic | undefined {
  return PAEDIATRIE_THEMEN.find((t) => t.id === id);
}
