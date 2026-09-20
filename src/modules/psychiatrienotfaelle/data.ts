import type { PsychiatrieNotfaelleTopic } from './types';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rettungsdienstliches Grundlagenwissen zu psychiatrischen Notfällen, Gesprächsführung und ' +
  'Sterbebegleitung. Keine SAA/BPR-Quelle. Rechtliche Rahmenbedingungen (z. B. Unterbringung gegen den ' +
  'eigenen Willen, Todesfeststellung) sind bundeslandspezifisch geregelt; es gilt immer die aktuelle, lokale ' +
  'Dienstanweisung bzw. Gesetzeslage.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const PSYCHIATRIENOTFAELLE_THEMEN: PsychiatrieNotfaelleTopic[] = [
  {
    id: 'erregungszustaende-deeskalation',
    title: 'Erregungszustände & Deeskalation',
    category: 'Psychiatrische Notfälle',
    minLevel: 'SanH',
    summary: 'Ursachen erregter Patienten erkennen und mit Grundprinzipien der Deeskalation sicher reagieren.',
    sections: [
      {
        heading: 'Mögliche Ursachen',
        facts: [
          { text: 'Psychiatrische Grunderkrankung' },
          { text: 'Alkohol- oder Drogeneinfluss' },
          { text: 'Unterzuckerung' },
          { text: 'Angst, Überforderung oder Schmerzen' },
        ],
      },
      {
        heading: 'Erkennungszeichen',
        facts: [
          { text: 'Lautes, forderndes oder aggressives Verhalten' },
          { text: 'Motorische Unruhe, schnelles oder abgehacktes Sprechen' },
          { text: 'Drohende Körpersprache (z. B. Fäuste ballen, auf jemanden zugehen)' },
        ],
      },
      {
        heading: 'Grundprinzipien der Deeskalation',
        facts: [
          { text: 'Ruhe bewahren und ausstrahlen. Die eigene Anspannung überträgt sich schnell' },
          { text: 'Ausreichend Abstand halten, keine Fluchtwege blockieren. Weder die eigenen noch die des Patienten' },
          { text: 'Ruhige, klare und kurze Sätze verwenden' },
          { text: 'Aktiv zuhören, Sorgen und Anliegen ernst nehmen' },
          { text: 'Keine Diskussionen oder Provokationen, eigene Bewegungen vorher ankündigen' },
        ],
      },
      {
        heading: 'Eigenschutz',
        facts: [
          { text: 'Immer einen eigenen Fluchtweg freihalten' },
          { text: 'Nie allein in eine unübersichtliche oder unsichere Situation gehen' },
          { text: 'Bei Gewaltandrohung oder -anwendung frühzeitig die Polizei hinzuziehen', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'suizidalitaet',
    title: 'Suizidalität',
    category: 'Psychiatrische Notfälle',
    minLevel: 'SanH',
    summary: 'Warnzeichen erkennen und den richtigen Umgang mit akuter Suizidalität finden.',
    sections: [
      {
        heading: 'Grundhaltung',
        facts: [{ text: 'Jede Suizidäußerung ernst nehmen. Niemals bagatellisieren oder als "nur Aufmerksamkeit" abtun' }],
      },
      {
        heading: 'Warnzeichen akuter Suizidalität',
        facts: [
          { text: 'Konkrete Pläne oder bereits vorhandene Mittel' },
          { text: 'Abschiedshandlungen. Z. B. Abschiedsbrief, Verschenken persönlicher Gegenstände' },
          { text: 'Plötzliche, auffällige Ruhe nach vorheriger schwerer Krise (kann auf einen gefassten Entschluss hindeuten)' },
        ],
      },
      {
        heading: 'Gesprächsführung',
        facts: [
          { text: 'Das Thema offen und direkt ansprechen. Das bringt niemanden erst auf die Idee, sondern signalisiert echtes Interesse' },
          { text: 'Die Person nicht allein lassen' },
          { text: 'Kein Werturteil abgeben, zuhören statt bewerten' },
        ],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Eigengefährdung einschätzen' },
          { text: 'Mittel zur Selbstschädigung wenn möglich und ohne Eigengefährdung entfernen', minLevel: 'RS' },
          { text: 'Notarzt bzw. psychiatrischen Dienst einbeziehen', minLevel: 'RS' },
          { text: 'Bei akuter Gefahr ggf. Unterbringung gegen den eigenen Willen nach dem jeweiligen Landesgesetz (PsychKG/Unterbringungsgesetz). Polizei hinzuziehen, falls nötig', minLevel: 'RS' },
        ],
      },
    ],
    notes: ['Die rechtlichen Voraussetzungen für eine Unterbringung gegen den Willen der Person sind bundeslandspezifisch geregelt.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'gespraechsfuehrung',
    title: 'Gesprächsführung mit Patienten & Angehörigen',
    category: 'Kommunikation',
    minLevel: 'SanH',
    summary: 'Grundprinzipien für klare, respektvolle Kommunikation im Einsatz.',
    sections: [
      {
        heading: 'Grundprinzipien',
        facts: [
          { text: 'Aktives Zuhören: ausreden lassen, Gehörtes zusammenfassen' },
          { text: 'Einfache, klare Sprache ohne unnötigen Fachjargon' },
          { text: 'Blickkontakt und offene Körpersprache' },
          { text: 'Auf Augenhöhe kommunizieren. Z. B. bei Kindern hinknien' },
        ],
      },
      {
        heading: 'Umgang mit Angehörigen',
        facts: [
          { text: 'Angehörige einbeziehen und informieren, aber die medizinische Versorgung nicht behindern lassen' },
          { text: 'Klare, konkrete Aufgaben geben (z. B. "Bitte leuchten Sie hier mit dem Handy")' },
          { text: 'Rückfragen zulassen und ruhig beantworten' },
        ],
      },
      {
        heading: 'Schwierige Nachrichten überbringen',
        facts: [
          { text: 'Wenn möglich eine ruhige Umgebung wählen' },
          { text: 'Klare, ehrliche Worte statt Beschönigung oder Fachbegriffe verwenden' },
          { text: 'Ausreichend Zeit und Raum für die Reaktion der Betroffenen lassen' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'umgang-sterbende-todesfeststellung',
    title: 'Umgang mit Sterbenden & Todesfeststellung',
    category: 'Sterben & Todesfeststellung',
    minLevel: 'SanH',
    summary: 'Würdevolle Sterbebegleitung, sichere Todeszeichen und der rechtliche Rahmen der Todesfeststellung.',
    sections: [
      {
        heading: 'Sterbebegleitung',
        facts: [
          { text: 'Würde und Privatsphäre des Sterbenden wahren' },
          { text: 'Ruhig ansprechen, auch bei vermeintlicher Bewusstlosigkeit. Das Hören bleibt oft am längsten erhalten' },
          { text: 'Angehörige nach Möglichkeit einbeziehen und dabei lassen' },
        ],
      },
      {
        heading: 'Sichere Todeszeichen',
        facts: [
          { text: 'Totenflecke (Livores)' },
          { text: 'Totenstarre (Rigor mortis)' },
          { text: 'Mit dem Leben nicht vereinbare Verletzungen' },
          { text: 'Fäulnis' },
        ],
      },
      {
        heading: 'Unsichere Todeszeichen – reichen NICHT zur Todesfeststellung',
        facts: [
          { text: 'Atem- und Kreislaufstillstand allein' },
          { text: 'Bewusstlosigkeit' },
          { text: 'Blasse oder kühle Haut' },
        ],
      },
      {
        heading: 'Rechtlicher Rahmen',
        facts: [
          { text: 'Die eigentliche Todesfeststellung (Leichenschau) ist ärztliche Aufgabe', minLevel: 'RS' },
          { text: 'Rettungsdienstpersonal kann sichere Todeszeichen erkennen und danach eine Reanimation unterlassen bzw. abbrechen', minLevel: 'RS' },
          { text: 'Je nach Situation sind Arzt und/oder Polizei zu verständigen', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'psychische-erste-hilfe-manv',
    title: 'Psychische Erste Hilfe bei Großschadenslagen',
    category: 'Großschadenslagen',
    minLevel: 'SanH',
    summary: 'Erste psychische Stabilisierung von Betroffenen (PSNV) bei einem Massenanfall von Verletzten.',
    sections: [
      {
        heading: 'Ziel',
        facts: [{ text: 'Unmittelbare Stabilisierung Betroffener und Einsatzkräfte. Keine Therapie oder Verarbeitung vor Ort' }],
      },
      {
        heading: 'Grundprinzipien',
        facts: [
          { text: 'Sicherheit vermitteln, Ruhe ausstrahlen' },
          { text: 'Betroffene nicht allein lassen' },
          { text: 'Einfache, konkrete Informationen geben statt vager Aussagen' },
          { text: 'Selbstwirksamkeit fördern. Z. B. kleine, sinnvolle Aufgaben geben' },
        ],
      },
      {
        heading: 'PSNV-Struktur',
        facts: [
          { text: 'Kriseninterventionsteams (KIT) bzw. Notfallseelsorge frühzeitig nachfordern', minLevel: 'RS' },
          { text: 'Betreuungsplätze abseits des unmittelbaren Einsatzgeschehens einrichten', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Auch an die eigenen Kräfte denken',
        facts: [{ text: 'Nach besonders belastenden Einsätzen Einsatznachsorge/Nachbesprechung in Anspruch nehmen' }],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getPsychiatrieNotfaelleTopicById(id: string): PsychiatrieNotfaelleTopic | undefined {
  return PSYCHIATRIENOTFAELLE_THEMEN.find((t) => t.id === id);
}
