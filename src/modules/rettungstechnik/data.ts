import type { RettungstechnikTopic } from './types';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rettungsdienstliches Grundlagenwissen zu Trageformen, Lagerung, Atemwegshilfen und Gerätekunde ' +
  '— keine SAA/BPR-Quelle. Konkrete Geräte, Ausstattung und Checklisten können je nach Organisation/Fahrzeugtyp ' +
  'abweichen.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const RETTUNGSTECHNIK_THEMEN: RettungstechnikTopic[] = [
  {
    id: 'trageformen',
    title: 'Trageformen',
    category: 'Transport & Trageformen',
    minLevel: 'SanH',
    summary: 'Rautekgriff, Tragestuhl, Schaufeltrage und Vakuummatratze. Wann welche Trageform sinnvoll ist.',
    sections: [
      {
        heading: 'Rautekgriff (Rautek-Rettungsgriff)',
        illustrationId: 'rautekgriff',
        facts: [
          { text: 'Zweck: schnelle Rettung aus akuter Gefahr (z. B. brennendes Fahrzeug, einsturzgefährdeter Raum)' },
          { text: 'Durchführung: von hinten unter den Achseln durchgreifen, einen Unterarm des Patienten fassen, rückwärts ziehen' },
          { text: 'Einschränkung: keine Rücksicht auf Wirbelsäule möglich. Daher nur bei unmittelbarer Lebensgefahr anwenden' },
        ],
      },
      {
        heading: 'Tragestuhl',
        facts: [
          { text: 'Einsatzbereich: enge Räume und Treppenhäuser' },
          { text: 'Vorteil: sitzender Transport bei ansprechbaren, kreislaufstabilen Patienten' },
        ],
      },
      {
        heading: 'Schaufeltrage',
        illustrationId: 'schaufeltrage',
        facts: [
          { text: 'Einsatzbereich: schonende Umlagerung, z. B. bei Verdacht auf Wirbelsäulenverletzung' },
          { text: 'Anwendung: seitlich in zwei Hälften unter dem liegenden Patienten zusammenführen, ohne ihn zu drehen', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Vakuummatratze',
        illustrationId: 'vakuummatratze',
        facts: [
          { text: 'Zweck: Ganzkörper-Immobilisation durch Anmodellieren an den Körper und Evakuierung der Luft' },
          { text: 'Einsatzbereich: Polytrauma, Wirbelsäulenverletzung, instabile Frakturen', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'lagerungsarten',
    title: 'Lagerungsarten mit Indikation',
    category: 'Lagerungsarten',
    minLevel: 'SanH',
    summary: 'Die wichtigsten Lagerungsarten und wann sie jeweils angewendet werden.',
    sections: [
      {
        heading: 'Stabile Seitenlage',
        illustrationId: 'stabile-seitenlage',
        facts: [
          { text: 'Indikation: Bewusstlosigkeit mit erhaltener, ausreichender Spontanatmung' },
          { text: 'Zweck: Atemwege freihalten, Schutz vor Aspiration von Erbrochenem' },
        ],
      },
      {
        heading: 'Schocklage (Beine hoch)',
        illustrationId: 'schocklage',
        facts: [
          { text: 'Indikation: Kreislaufschwäche/Schock ohne Atemnot und ohne Kopf- oder Wirbelsäulenverletzung' },
          { text: 'Zweck: venösen Rückstrom zum Herzen fördern' },
        ],
      },
      {
        heading: 'Oberkörperhochlagerung',
        illustrationId: 'oberkoerperhochlagerung',
        facts: [
          { text: 'Indikation: Atemnot, Herzinsuffizienz, Schlaganfall bei erhaltenem Bewusstsein' },
          { text: 'Zweck: Atemarbeit erleichtern' },
        ],
      },
      {
        heading: 'Knierolle / Flachlagerung mit angewinkelten Beinen',
        illustrationId: 'knierolle',
        facts: [
          { text: 'Indikation: akutes Abdomen, starke Bauchschmerzen' },
          { text: 'Zweck: Entspannung der Bauchdecke' },
        ],
      },
      {
        heading: 'Weitere Besonderheiten',
        facts: [
          { text: 'Schwangere: leichte Linksseitenlage, um das Vena-cava-Kompressionssyndrom zu vermeiden', minLevel: 'RS' },
          { text: 'Verdacht auf Wirbelsäulenverletzung: Patient möglichst in der vorgefundenen Position belassen, bis eine fachgerechte Immobilisation erfolgt', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'sauerstoffgabe',
    title: 'Sauerstoffgabe',
    category: 'Atemwege & Beatmung',
    minLevel: 'SanH',
    summary: 'Systeme, Flussraten-Richtwerte und Indikationen zur Sauerstoffgabe.',
    sections: [
      {
        heading: 'Systeme',
        illustrationId: 'sauerstoffmaske',
        facts: [
          { text: 'Nasenbrille: niedrige Flussraten, wird von Patienten meist gut toleriert' },
          { text: 'Einfache Sauerstoffmaske: mittlere bis hohe Flussraten' },
          { text: 'Maske mit Reservoirbeutel: hohe Flussraten für eine hohe Sauerstoffkonzentration' },
        ],
      },
      {
        heading: 'Richtwerte Flussraten (grobe Orientierung)',
        facts: [
          { text: 'Nasenbrille: ca. 1–6 l/min', minLevel: 'RS' },
          { text: 'Einfache Maske: ca. 6–10 l/min', minLevel: 'RS' },
          { text: 'Maske mit Reservoir: ca. 10–15 l/min', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Indikationen',
        facts: [
          { text: 'Hypoxie/Sauerstoffmangel' },
          { text: 'Schwere Traumata, Schock' },
          { text: 'Reanimation' },
          { text: 'Verdacht auf Kohlenmonoxidvergiftung' },
        ],
      },
    ],
    notes: ['Sauerstoff ist ein Medikament. Gabe orientiert sich an SpO2-Messung/Klinik, nicht an einer routinemäßigen Gabe bei jedem Patienten.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'absaugung-atemwegshilfen',
    title: 'Absaugung & Atemwegshilfen (Guedel-/Wendl-Tubus)',
    category: 'Atemwege & Beatmung',
    minLevel: 'RS',
    summary: 'Absaugen der Atemwege sowie oro- und nasopharyngeale Atemwegshilfen richtig einsetzen.',
    sections: [
      {
        heading: 'Absaugung',
        facts: [
          { text: 'Indikation: sichtbare Flüssigkeit, Erbrochenes oder Blut in den Atemwegen' },
          { text: 'Vorgehen: unter Sicht und zeitlich begrenzt absaugen, um eine Hypoxie durch zu langes Absaugen zu vermeiden' },
        ],
      },
      {
        heading: 'Guedel-Tubus (oropharyngealer Tubus)',
        illustrationId: 'guedel-wendl',
        facts: [
          { text: 'Zweck: hält den Atemweg bei Bewusstlosigkeit offen, hält die Zunge von der Rachenhinterwand fern' },
          { text: 'Größenbestimmung: Abstand vom Mundwinkel bis zum Ohrläppchen' },
          { text: 'Nur bei tief bewusstlosen Patienten ohne Würgereflex anwenden' },
        ],
      },
      {
        heading: 'Wendl-Tubus (nasopharyngealer Tubus)',
        illustrationId: 'wendl-tubus',
        facts: [
          { text: 'Zweck: Alternative bei erhaltenem Würgereflex oder Kieferklemme' },
          { text: 'Größenbestimmung: Abstand von der Nasenspitze bis zum Ohrläppchen' },
          { text: 'Vorsicht bei Verdacht auf Schädelbasisfraktur' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'beatmungsbeutel',
    title: 'Beatmungsbeutel',
    category: 'Atemwege & Beatmung',
    minLevel: 'RS',
    summary: 'Aufbau, korrekte Anwendung und häufige Fehler bei der Beutel-Masken-Beatmung.',
    sections: [
      {
        heading: 'Aufbau',
        illustrationId: 'beatmungsbeutel-aufbau',
        facts: [
          { text: 'Beutel, Ventil und Maske (alternativ Anschluss an Tubus oder Larynxmaske)' },
          { text: 'Optionales Reservoir für eine höhere Sauerstoffkonzentration' },
        ],
      },
      {
        heading: 'Anwendung',
        illustrationId: 'beutel-masken-beatmung',
        facts: [
          { text: 'Korrekter Maskensitz (z. B. C-Griff/Esmarch-Handgriff)' },
          { text: 'Ausreichende Kopfüberstreckung. Außer bei Verdacht auf Trauma' },
          { text: 'Beatmungsfrequenz und -volumen sind altersabhängig' },
        ],
      },
      {
        heading: 'Häufige Fehler',
        facts: [
          { text: 'Zu forsches oder zu schnelles Beatmen. Gefahr von Magenüberblähung und Aspiration' },
          { text: 'Undichter Maskensitz mit Luftverlust' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'notfallrucksack-checkliste',
    title: 'Notfallrucksack & Checkliste',
    category: 'Gerätekunde',
    minLevel: 'SanH',
    summary: 'Typischer Inhalt eines Notfallrucksacks und wie eine Vollständigkeitsprüfung abläuft.',
    sections: [
      {
        heading: 'Typischer Inhalt',
        illustrationId: 'notfallrucksack',
        facts: [
          { text: 'Basisausstattung: Handschuhe, Verbandsmaterial, Beatmungsbeutel/-maske' },
          { text: 'Absauggerät, Blutdruckmessgerät, Stethoskop' },
          { text: 'Sauerstoff sowie Guedel-/Wendl-Tuben in verschiedenen Größen' },
        ],
      },
      {
        heading: 'Vollständigkeitsprüfung',
        facts: [
          { text: 'Inhalt zu Dienstbeginn gegen eine Checkliste prüfen' },
          { text: 'Verfallsdaten von Medikamenten und sterilem Material kontrollieren' },
          { text: 'Verbrauchtes Material nach jedem Einsatz umgehend auffüllen' },
        ],
      },
      {
        heading: 'Organisation',
        facts: [
          { text: 'Einheitliche, immer gleiche Anordnung im Rucksack. Für schnellen Zugriff auch im Dunkeln oder unter Stress' },
          { text: 'Regelmäßige technische Prüfung von Geräten (z. B. Absauggerät, Sauerstoffflasche)' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getRettungstechnikTopicById(id: string): RettungstechnikTopic | undefined {
  return RETTUNGSTECHNIK_THEMEN.find((t) => t.id === id);
}
