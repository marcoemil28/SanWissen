import type { TraumaTopic } from './types';
import { DruckverbandIllustration } from './illustrations/DruckverbandIllustration';
import { ArmtragetuchIllustration } from './illustrations/ArmtragetuchIllustration';
import { KopfverbandIllustration } from './illustrations/KopfverbandIllustration';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rettungsdienstliches Grundlagenwissen (keine bestimmte Quelle wie beim SAA/BPR-PDF). ' +
  'Konkrete Vorgehensweisen (z. B. Immobilisationsumfang, Tourniquet-Freigabe) können je nach ' +
  'Rettungsdienstbereich/aktueller Leitlinie variieren. Es gilt deine lokale Ausbildungs-/Dienstordnung.';

const DLRG_SOURCE_NOTE =
  'Abbildungen und Handlungsabläufe aus den DLRG-Teilnehmerunterlagen Sanitätsausbildung A (2021) und B (2021). ' +
  'Ergänzt um allgemeines rettungsdienstliches Grundlagenwissen. Es gilt deine lokale Ausbildungs- und Dienstordnung.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-20';

export const TRAUMA_THEMEN: TraumaTopic[] = [
  {
    id: 'frakturlehre',
    title: 'Frakturlehre',
    category: 'Frakturen & Wunden',
    minLevel: 'SanH',
    summary: 'Frakturarten erkennen, sichere von unsicheren Frakturzeichen unterscheiden, richtig ruhigstellen.',
    sections: [
      {
        heading: 'Frakturarten',
        illustrationId: 'frakturarten',
        facts: [
          { text: 'Geschlossene Fraktur: Haut über der Bruchstelle intakt', minLevel: 'SanH' },
          {
            text: 'Offene Fraktur: Wunde reicht bis zum Knochen. Deutlich erhöhtes Infektionsrisiko',
            minLevel: 'SanH',
          },
          { text: 'Grünholzfraktur: unvollständiger Bruch, v. a. bei Kindern (Knochen noch elastischer)', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Unsichere Frakturzeichen',
        facts: [{ text: 'Schmerz, Schwellung, Bewegungseinschränkung, Hämatom (Bluterguss)', minLevel: 'SanH' }],
      },
      {
        heading: 'Sichere Frakturzeichen',
        facts: [
          { text: 'Sichtbare Fehlstellung', minLevel: 'SanH' },
          { text: 'Abnorme Beweglichkeit außerhalb eines Gelenks', minLevel: 'RS' },
          { text: 'Krepitation (Knochenreiben). Nicht aktiv prüfen, nur falls zufällig bemerkt', minLevel: 'RS' },
          { text: 'Sichtbare Knochenfragmente (bei offener Fraktur)', minLevel: 'SanH' },
        ],
      },
      {
        heading: 'Erstmaßnahmen',
        illustrationId: 'blutverlust-fraktur',
        facts: [
          {
            text: 'DMS-Kontrolle (Durchblutung, Motorik, Sensibilität) distal der Verletzung. Vor UND nach jeder Maßnahme',
            minLevel: 'RS',
          },
          { text: 'Ruhigstellung in der vorgefundenen Stellung. Nicht reponieren (nicht gewaltsam richten)!', minLevel: 'SanH' },
          { text: 'Bei offener Fraktur: steril abdecken statt reponieren, Knochenfragmente nicht zurückschieben', minLevel: 'SanH' },
          { text: 'Indirekt kühlen (nie direkt Eis auf die Haut) zur Schmerz-/Schwellungslinderung', minLevel: 'SanH' },
          { text: 'Grundsatz der Schienung: jeweils ein Gelenk oberhalb UND unterhalb der Fraktur mit ruhigstellen', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'wundversorgung',
    title: 'Wundversorgung',
    category: 'Frakturen & Wunden',
    minLevel: 'SanH',
    summary: 'Wundarten unterscheiden und die wichtigsten Grundprinzipien der Erstversorgung.',
    sections: [
      {
        heading: 'Wundarten',
        facts: [
          { text: 'Schnittwunde: glatte Wundränder, meist durch scharfe Gegenstände', minLevel: 'SanH' },
          { text: 'Platzwunde: unregelmäßige Wundränder durch stumpfe Gewalt (z. B. Sturz auf Kante)', minLevel: 'SanH' },
          { text: 'Schürfwunde: oberflächliche Hautabschürfung', minLevel: 'SanH' },
          { text: 'Stichwunde: kleine äußere Öffnung, potenziell tiefer innerer Verlauf/Organbeteiligung', minLevel: 'RS' },
          { text: 'Quetschwunde: durch Quetschung, oft mit Gewebeschädigung in der Umgebung', minLevel: 'RS' },
          { text: 'Bisswunde: erhöhtes Infektionsrisiko durch Keime im Speichel', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Grundprinzipien der Erstversorgung',
        facts: [
          { text: 'Wunde steril abdecken, im Rahmen der Erstversorgung nicht auswaschen oder desinfizieren', minLevel: 'SanH' },
          { text: 'Fremdkörper in der Wunde belassen und ringförmig umpolstern, niemals herausziehen', minLevel: 'SanH' },
          { text: 'Schmuck/einengende Gegenstände nahe der Verletzung frühzeitig entfernen (vor Schwellung)', minLevel: 'SanH' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'verbandslehre',
    title: 'Verbandslehre (Druckverband, Dreiecktuch, Schienung)',
    category: 'Verbandslehre',
    minLevel: 'SanH',
    summary: 'Die klassischen Verbandstechniken Schritt für Schritt. Grundlage für einen künftigen interaktiven Übungsmodus.',
    sections: [
      {
        heading: 'Druckverband (bei stärkerer Blutung)',
        illustration: DruckverbandIllustration,
        illustrationId: 'druckverband',
        facts: [
          { text: '1. Sterile Wundauflage direkt auf die Wunde legen', minLevel: 'SanH' },
          { text: '2. Druckpolster (z. B. unbenutztes Verbandpäckchen) darauf platzieren', minLevel: 'SanH' },
          { text: '3. Mit einer Fixierbinde straff umwickeln, sodass Druck auf der Wunde bleibt', minLevel: 'SanH' },
          { text: '4. DMS-Kontrolle distal des Verbands durchführen', minLevel: 'RS' },
          {
            text: 'Blutet der Verband durch: NICHT abnehmen, sondern einen weiteren Druckverband darüber anlegen',
            minLevel: 'SanH',
          },
        ],
      },
      {
        heading: 'Dreiecktuch: Armtragetuch',
        illustration: ArmtragetuchIllustration,
        illustrationId: 'armtragetuch',
        facts: [
          { text: 'Ruhigstellung von Verletzungen an Arm oder Schulter', minLevel: 'SanH' },
          { text: 'Hand sollte etwas höher liegen als der Ellenbogen (Schwellung vorbeugen)', minLevel: 'RS' },
          { text: 'Knoten seitlich am Hals, nicht direkt auf der Wirbelsäule, platzieren', minLevel: 'SanH' },
        ],
      },
      {
        heading: 'Dreiecktuch: Kopfverband',
        illustration: KopfverbandIllustration,
        facts: [
          { text: 'Fixierung von Wundauflagen am Kopf', minLevel: 'SanH' },
          { text: 'Tuch flach über die Wundauflage legen, Spitze am Oberkopf einschlagen', minLevel: 'SanH' },
          { text: 'Enden am Hinterkopf kreuzen und verknoten, nicht zu fest über den Ohren', minLevel: 'SanH' },
        ],
      },
      {
        heading: 'Weitere Anwendung',
        facts: [{ text: 'Fixierbinde-Ersatz: kann großflächige Wundauflagen provisorisch fixieren', minLevel: 'SanH' }],
      },
      {
        heading: 'Notverband (Israeli Bandage)',
        illustrationId: 'notverband',
        facts: [
          {
            text: 'Vorgefertigtes Verband-Set aus Wundauflage, elastischer Binde und aufgesetzter Druckstange, das den klassischen Druckverband ersetzen kann',
            minLevel: 'SanH',
          },
          { text: '1. Wundauflage auf die Wunde legen und die Binde einmal um die Extremität führen', minLevel: 'SanH' },
          { text: '2. Die elastische Binde in die Druckstange einfädeln', minLevel: 'SanH' },
          {
            text: '3. Die Binde straff ziehen und in die Gegenrichtung weiterführen, sodass die Druckstange auf die Wunde drückt',
            minLevel: 'SanH',
          },
          { text: '4. Die Binde einmal verdrehen und über die Ränder der Wundkompresse wickeln', minLevel: 'SanH' },
          { text: '5. Die Hakenenden der Schließstange in der elastischen Binde befestigen', minLevel: 'SanH' },
          {
            text: 'Dieselbe Technik ist am Arm, am Kopf und am Hals anwendbar. Am Hals wird der gegenüberliegende Arm über den Kopf gehoben und der Verband durch dessen Achselhöhle geführt, damit kein Druck auf den Kehlkopf entsteht',
            minLevel: 'RS',
          },
          { text: 'Anschließend DMS-Kontrolle distal des Verbands durchführen', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Schienung',
        illustrationId: 'schienung',
        facts: [
          { text: 'Vakuumschiene: formbar anlegen, dann Luft absaugen. Wird dadurch stabil/starr', minLevel: 'RS' },
          { text: 'Grundsatz: immer ein Gelenk oberhalb und unterhalb der Verletzung mit ruhigstellen', minLevel: 'SanH' },
        ],
      },
    ],
    notes: [
      'Die Abbildungen zeigen das Funktionsprinzip, nicht jedes Detail. Übe die Handgriffe zusätzlich ' +
        'praktisch (Kurs/Selbststudium mit echtem Material).',
    ],
    sourceNote: DLRG_SOURCE_NOTE,
  },
  {
    id: 'wirbelsaeulentrauma',
    title: 'Wirbelsäulentrauma & Immobilisation',
    category: 'Schwere Verletzungen',
    minLevel: 'RS',
    summary: 'Verdachtsmomente für ein Wirbelsäulentrauma und die gängigen Immobilisationstechniken.',
    sections: [
      {
        heading: 'Verdachtsmomente',
        illustrationId: 'wirbelsaeulen-fraktur',
        facts: [
          { text: 'Unfallmechanismus: Sturz aus der Höhe, Hochrasanztrauma, Kopfsprung ins Wasser', minLevel: 'RS' },
          { text: 'Rückenschmerz im Bereich der Wirbelsäule', minLevel: 'SanH' },
          { text: 'Neurologische Ausfälle: Kribbeln, Lähmungserscheinungen, Sensibilitätsverlust', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Immobilisationstechniken',
        illustrationId: 'hws-stuetzkragen',
        facts: [
          { text: 'Manuelle Inline-Stabilisation des Kopfes: als erste Maßnahme und durchgehend bis zur Übergabe', minLevel: 'RS' },
          { text: 'Zervikalstütze (HWS-Immobilisationskragen) zur Unterstützung der manuellen Stabilisation', minLevel: 'RS' },
          {
            text: 'Log-Roll-Manöver: achsengerechte 90°-en-bloc-Drehung mit mindestens 3 Helfenden, u. a. zur Rückenuntersuchung',
            minLevel: 'RS',
          },
          { text: 'Schaufeltrage zum schonenden Umlagern', minLevel: 'RS' },
          { text: 'Vakuummatratze zur Ganzkörperimmobilisation für den Transport', minLevel: 'RS' },
        ],
      },
    ],
    notes: [
      'Aktuelle Leitlinien differenzieren zunehmend, wann eine vollständige Immobilisation tatsächlich ' +
        'erforderlich ist. Nicht jeder Verdachtsfall braucht das volle Programm. Vorgehen ist regional/' +
        'schulungsabhängig unterschiedlich geregelt.',
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'thorax-abdominaltrauma',
    title: 'Thorax- und Abdominaltrauma',
    category: 'Schwere Verletzungen',
    minLevel: 'RS',
    summary: 'Der offene Pneumothorax, Warnzeichen für einen Spannungspneumothorax und das offene Abdominaltrauma.',
    sections: [
      {
        heading: 'Offener Pneumothorax',
        illustrationId: 'pneumothorax',
        facts: [
          {
            text: 'Durchgängige Verletzung der Thoraxwand. Bei Einatmung strömt Luft hörbar in den Pleuraspalt ("saugende Wunde")',
            minLevel: 'RS',
          },
          {
            text: 'Versorgung: dreiseitig okklusiver Verband (eine Seite offen lässt Luft beim Ausatmen entweichen, verhindert Ventilmechanismus)',
            minLevel: 'RS',
          },
          { text: 'Nach Anlage weiter auf Zeichen eines Spannungspneumothorax beobachten', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Spannungspneumothorax – Warnzeichen',
        facts: [
          { text: 'Zunehmende, schwere Atemnot', minLevel: 'RS' },
          { text: 'Einseitig fehlendes oder abgeschwächtes Atemgeräusch', minLevel: 'RS' },
          { text: 'Gestaute Halsvenen, (spät) Verlagerung der Luftröhre zur Gegenseite', minLevel: 'RS' },
          { text: 'Kreislaufinstabilität bis zum Kreislaufstillstand', minLevel: 'RS' },
          { text: 'Zeitkritisch. Therapie (Entlastungspunktion) ist NotSan-Kompetenz nach Delegation', minLevel: 'NotSan' },
        ],
      },
      {
        heading: 'Abdominaltrauma',
        facts: [
          { text: 'Verdacht bei stumpfem oder penetrierendem Bauchtrauma, Abwehrspannung, sichtbaren Prellmarken', minLevel: 'RS' },
          {
            text: 'Bei offener Bauchdecke mit Organvorfall: Organe NICHT zurückverlagern, nur feucht und steril abdecken',
            minLevel: 'RS',
          },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'verbrennungen',
    title: 'Verbrennungen',
    category: 'Verbrennungen',
    minLevel: 'SanH',
    summary: 'Gradeinteilung von Verbrennungen und die wichtigsten Erstmaßnahmen.',
    sections: [
      {
        heading: 'Gradeinteilung',
        illustrationId: 'verbrennungsgrade',
        facts: [
          { text: 'Grad 1: Rötung, schmerzhaft, keine Blasen (z. B. Sonnenbrand). Heilt folgenlos ab', minLevel: 'SanH' },
          { text: 'Grad 2a: Blasenbildung, Wundgrund rosig, sehr schmerzhaft', minLevel: 'RS' },
          { text: 'Grad 2b: Blasenbildung, Wundgrund blasser, weniger schmerzhaft, tiefere Schädigung', minLevel: 'RS' },
          { text: 'Grad 3: weißlich-lederartig oder verkohlt, schmerzlos (Nervenenden zerstört)', minLevel: 'RS' },
          { text: 'Grad 4: Verkohlung auch tieferer Strukturen (Muskeln, Knochen)', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Erstmaßnahmen',
        facts: [
          { text: 'Brandursache stoppen: Kleidung löschen, aus dem Gefahrenbereich bringen (Eigenschutz beachten)', minLevel: 'SanH' },
          {
            text: 'Nur kleinflächige Verbrennungen zeitnah kühlen. Bei großflächigen Verbrennungen und bei Kindern Auskühlung (Hypothermie) vermeiden!',
            minLevel: 'SanH',
          },
          { text: 'Steril bzw. keimarm abdecken (z. B. Brandwundenverbandtuch)', minLevel: 'SanH' },
          { text: 'Keine Hausmittel verwenden (Mehl, Öl, Zahnpasta o. Ä.)', minLevel: 'SanH' },
          { text: 'Schmuck/Kleidung im betroffenen Bereich entfernen, solange nicht festgeklebt', minLevel: 'SanH' },
        ],
      },
    ],
    notes: ['Zur Flächenabschätzung siehe Werkzeuge & Scores: Neuner-Regel.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'polytrauma-blutstillung',
    title: 'Polytrauma & kritische Blutungen (Tourniquet)',
    category: 'Polytrauma & Blutstillung',
    minLevel: 'RS',
    summary: 'Definition Polytrauma, das Stufenschema der Blutstillung und die korrekte Tourniquet-Anwendung.',
    sections: [
      {
        heading: 'Polytrauma',
        illustrationId: 'beckengurt',
        facts: [
          {
            text: 'Mehrere gleichzeitige Verletzungen, von denen mindestens eine oder deren Kombination lebensbedrohlich ist',
            minLevel: 'RS',
          },
          { text: 'Versorgung nach xABCDE-Schema. Kritische Blutung (x) wird zuerst behandelt', minLevel: 'RS' },
          { text: 'Load-and-go-Prinzip: kurze Versorgungszeit vor Ort bei zeitkritischen Verletzungen anstreben', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Stufenschema der Blutstillung',
        illustrationId: 'wound-packing',
        facts: [
          { text: '1. Manuelle Kompression der Blutungsquelle', minLevel: 'SanH' },
          { text: '2. Wunddruckverband', minLevel: 'SanH' },
          {
            text: '3. Bei unstillbarer Extremitätenblutung (z. B. Amputationsverletzung): Tourniquet',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Tourniquet-Anwendung',
        illustrationId: 'tourniquet',
        facts: [
          { text: 'So weit proximal wie nötig, so distal wie möglich anlegen', minLevel: 'RS' },
          {
            text: 'Straff genug anziehen, bis die Blutung sicher sistiert. Nur venöse Stauung verschlimmert die Blutung',
            minLevel: 'RS',
          },
          { text: 'Anlagezeitpunkt (Uhrzeit) gut sichtbar dokumentieren (z. B. auf dem Tourniquet selbst)', minLevel: 'RS' },
          { text: 'Kein routinemäßiges Öffnen/Lockern durch nachfolgendes Personal ohne ärztliche Rücksprache', minLevel: 'RS' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getTraumaTopicById(id: string): TraumaTopic | undefined {
  return TRAUMA_THEMEN.find((t) => t.id === id);
}
