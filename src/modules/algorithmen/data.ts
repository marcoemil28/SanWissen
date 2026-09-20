import type { AlgorithmEntry } from './types';

/**
 * Quelle (soweit nicht anders vermerkt): "Standard-Arbeitsanweisungen und
 * Behandlungspfade im Rettungsdienst (SAA und BPR) 2025", Ärztliche
 * Leitungen Rettungsdienst Baden-Württemberg, Brandenburg, Mecklenburg-
 * Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt,
 * Stand: 30.04.2025 — Abschnitte "Herangehensweise" und "Kreislaufstillstand".
 *
 * Die `minLevel`-Werte pro Schritt sind eine Einordnung nach bestem Wissen
 * (siehe docs/vorgaben_und_inhalte.txt Abschnitt 5) und keine rechtsverbindliche
 * Kompetenzzuordnung — es gilt immer deine eigene, aktuell gültige
 * Ausbildungs-/Dienstordnung.
 */

/** Zuletzt inhaltlich geprüft/aktualisiert (App-Stand, nicht das Datum der Quelle oben). */
export const CONTENT_STAND = '2026-09-17';

export const ALGORITHMEN: AlgorithmEntry[] = [
  {
    id: 'abcde-herangehensweise',
    title: 'cABCDE (xABCDE) – Herangehensweise',
    category: 'Herangehensweise & Einschätzung',
    minLevel: 'RS',
    summary:
      'Strukturierte Erstuntersuchung und Prioritätensetzung bei jedem Notfallpatienten. Immer dieselbe ' +
      'Reihenfolge, lebensbedrohliche Probleme werden sofort bei Entdeckung behandelt statt nur dokumentiert.',
    sections: [
      {
        heading: 'c – kritische Blutung (critical bleeding)',
        steps: [
          {
            text: 'Noch vor A wird geprüft, ob eine primär erkennbare kritische Blutung vorliegt. Daran kann jemand in wenigen Minuten versterben, bevor ein Atemwegsproblem überhaupt zum Tragen kommt',
            minLevel: 'SanH',
          },
          { text: 'Erste Maßnahme ist die Kompression, also kräftiger direkter Druck auf die Wunde und anschließend ein Druckverband', minLevel: 'SanH' },
          {
            text: 'An den Extremitäten wird bei nicht beherrschbarer Blutung bis zum Tourniquet eskaliert. Es sitzt körpernah oberhalb der Wunde, wird so fest angelegt bis die Blutung steht, die Anlagezeit wird notiert und es wird nicht wieder gelockert',
            minLevel: 'RS',
          },
          {
            text: 'An Übergangszonen wie Leiste, Achsel oder Hals greift kein Tourniquet. Dort wird die Wunde ausgestopft und anschließend komprimiert',
            minLevel: 'RS',
          },
          { text: 'Erst wenn die kritische Blutung versorgt ist, geht es mit A weiter. Der Behandlungspfad „kritische Blutung" führt die Maßnahmen im Einzelnen aus', minLevel: 'SanH' },
        ],
      },
      {
        heading: 'A – Airway (Atemweg)',
        steps: [
          { text: 'Ist der Atemweg frei? Bei Verlegung wird er freigemacht', minLevel: 'SanH' },
          { text: 'Bei Verdacht auf eine Wirbelsäulenverletzung wird zugleich die Halswirbelsäule immobilisiert', minLevel: 'RS' },
          { text: 'Bei Kreislaufstillstand wird nach dem passenden Behandlungspfad reanimiert', minLevel: 'RS' },
        ],
      },
      {
        heading: 'B – Breathing (Atmung)',
        steps: [
          {
            text: 'Ist die Atmung suffizient? Beurteilt werden Frequenz, Hautkolorit, Tidalvolumen und Thoraxexkursionen, Auskultation im Seitenvergleich sowie die Sauerstoffsättigung',
            minLevel: 'RS',
          },
          { text: 'Sauerstoffgabe', minLevel: 'RS' },
          { text: 'Bei Bedarf wird der Atemweg gesichert und beatmet, siehe Behandlungspfad Atemwegsmanagement', minLevel: 'NotSan' },
          { text: 'Bei Bedarf wird ein Spannungspneumothorax entlastet (Thoraxentlastungspunktion)', minLevel: 'NotSan' },
        ],
      },
      {
        heading: 'C – Circulation (Kreislauf)',
        steps: [
          {
            text: 'Beurteilt werden Puls nach Frequenz, Qualität und Rhythmus, dazu Hauttemperatur, Hautkolorit und die Rekapillarisierungszeit über oder unter 2 Sekunden',
            minLevel: 'RS',
          },
          {
            text: 'Blutungszeichen prüfen an vier Stellen: äußere Blutung, Brust und Bauch, Becken (Stichwort Open-Book-Fraktur) sowie Arme und Beine',
            minLevel: 'RS',
          },
          {
            text: 'Die kritische äußere Blutung ist bereits unter c versorgt. Hier geht es zusätzlich um innere Blutungsquellen in Thorax, Abdomen, Becken und langen Röhrenknochen',
            minLevel: 'RS',
          },
          { text: 'Bei Kreislaufinstabilität wird ein intravenöser Zugang gelegt', minLevel: 'NotSan' },
          { text: 'Gegebenenfalls besteht eine „Load-Go-Treat"-Indikation, der Transport hat dann Vorrang vor weiterer Versorgung am Einsatzort', minLevel: 'RS' },
        ],
      },
      {
        heading: 'D – Disability (neurologische Defizite)',
        steps: [
          { text: 'Bewusstseinslage nach WASB oder GCS beurteilen', minLevel: 'RS' },
          { text: 'Sensorik und Motorik prüfen', minLevel: 'RS' },
          { text: 'Pupillenreaktion prüfen und den Blutzucker kontrollieren', minLevel: 'RS' },
        ],
      },
      {
        heading: 'E – Exposure und Environment (weitere Untersuchung)',
        steps: [
          {
            text: 'Patient entkleiden und eine Ganzkörperuntersuchung durchführen',
            minLevel: 'RS',
          },
          {
            text: 'Bei Bedarf Logroll-Manöver, also eine achsengerechte 90-Grad-Drehung en bloc, um die verdeckte Körperseite anzusehen',
            minLevel: 'RS',
          },
          { text: 'Temperatur erfassen und den Patienten vor Auskühlung schützen', minLevel: 'SanH' },
        ],
      },
    ],
    notes: [
      'Die Versorgungsstrategie wird nach Leitsymptomen priorisiert, dann wird der passende Behandlungspfad gewählt.',
      'Der Patient wird regelmäßig neu beurteilt.',
      'Invasive Maßnahmen erfolgen nach SAA durch Notfallsanitäter mit ärztlicher Delegation.',
      'Das Behandlungspfad-Original schreibt das vorangestellte c für „critical bleeding". In vielen Lehrbüchern und Kursen steht an derselben Stelle ein x für „exsanguinating haemorrhage". Gemeint ist dasselbe: die kritische Blutung wird vor dem Atemweg versorgt.',
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „cABCDE, Herangehensweise", Seite 75, Stand 30.04.2025, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 75,
  },
  {
    id: 'abcde-instabilitaeten',
    title: 'cABCDE – Instabilitäten',
    category: 'Herangehensweise & Einschätzung',
    minLevel: 'RS',
    summary:
      'Warnzeichen, die auf ein instabiles Problem in einem der Schritte hinweisen. Wer eines davon findet, ' +
      'behandelt sofort statt nur zu dokumentieren.',
    sections: [
      {
        heading: 'c – kritische Blutung',
        steps: [
          { text: 'Anhaltend spritzende Blutung aus offenen Wunden oder Extremitätenstümpfen' },
          { text: 'Ausgeprägte Blässe der Haut' },
        ],
      },
      {
        heading: 'A – Atemweg',
        steps: [
          { text: 'Gefährdeter Atemweg' },
          { text: 'Pathologisches Atemgeräusch wie Schnarchen, Gurgeln oder Stridor' },
          { text: 'Obstruktion durch Erbrochenes, Blut, Flüssigkeit oder einen Fremdkörper' },
        ],
      },
      {
        heading: 'B – Atmung',
        steps: [
          { text: 'Atemfrequenz unter 8 oder über 30 pro Minute oder Atemstillstand' },
          { text: 'Sauerstoffsättigung unter 90 Prozent' },
          { text: 'Hypoxiezeichen' },
          { text: 'Pathologisches Atemmuster oder thorakale Einziehungen' },
          { text: 'Pathologische Auskultationsbefunde' },
        ],
      },
      {
        heading: 'C – Kreislauf',
        steps: [
          { text: 'Schwache oder fehlende periphere Pulse' },
          { text: 'Systolischer Blutdruck unter 80 oder über 200 mmHg' },
          { text: 'Herzfrequenz unter 40 oder über 130 pro Minute' },
          { text: 'Arrhythmischer Puls' },
          { text: 'Zyanose oder Blässe' },
          { text: 'Feuchte oder kühle Haut' },
          { text: 'Rekapillarisierungszeit über 2 Sekunden' },
          { text: 'Starkes Durstgefühl' },
        ],
      },
      {
        heading: 'D – Disability',
        steps: [
          { text: 'Bewusstlosigkeit' },
          { text: 'Eingeschränkte Bewusstseinslage' },
          { text: 'Lähmungen' },
          { text: 'Sensibilitätsstörungen' },
          { text: 'Blutzuckerentgleisung' },
        ],
      },
      {
        heading: 'E – Exposure und Environment',
        steps: [
          { text: 'Hypothermie oder Hyperthermie' },
          { text: 'Sonstige Eindrücke, die auf einen kritischen Zustand hinweisen' },
        ],
      },
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „cABCDE, Instabilitäten", Seite 76, Stand 22.05.2024, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 76,
  },
  {
    id: 'wasb-gcs',
    title: 'Beurteilung der Bewusstseinslage (WASB & GCS)',
    category: 'Herangehensweise & Einschätzung',
    minLevel: 'SanH',
    summary:
      'Schnelleinschätzung der Bewusstseinslage (WASB) sowie die differenziertere Glasgow Coma Scale (GCS), ' +
      'z. B. zur Beurteilung eines Schädel-Hirn-Traumas.',
    sections: [
      {
        heading: 'WASB (Schnelltest)',
        steps: [
          { text: 'W – wach? Ist der Patient wach, endet die Beurteilung hier', minLevel: 'SanH' },
          {
            text: 'A – Reaktion auf Ansprache? Reagiert er nur darauf, liegt eine Somnolenz vor, er kann dabei verwirrt sein',
            minLevel: 'SanH',
          },
          { text: 'S – Reaktion auf Schmerzreiz? Reagiert er nur darauf, liegt ein Sopor vor', minLevel: 'SanH' },
          {
            text: 'B – Bewusstlosigkeit? Bleibt jede Reaktion aus, liegt ein Koma vor. Dann fehlen die Schutzreflexe und der Atemweg ist gefährdet',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'GCS – Augenöffnung (E, max. 4 Punkte)',
        steps: [
          { text: '4 – spontan', minLevel: 'RS' },
          { text: '3 – auf Ansprache', minLevel: 'RS' },
          { text: '2 – auf Schmerzreiz', minLevel: 'RS' },
          { text: '1 – keine Reaktion', minLevel: 'RS' },
        ],
      },
      {
        heading: 'GCS – Verbale Reaktion (V, max. 5 Punkte)',
        steps: [
          { text: '5 – orientiert', minLevel: 'RS' },
          { text: '4 – verwirrt', minLevel: 'RS' },
          { text: '3 – unzusammenhängende Worte', minLevel: 'RS' },
          { text: '2 – unverständliche Laute', minLevel: 'RS' },
          { text: '1 – keine Reaktion', minLevel: 'RS' },
        ],
      },
      {
        heading: 'GCS – Motorische Reaktion (M, max. 6 Punkte)',
        steps: [
          { text: '6 – befolgt Aufforderungen', minLevel: 'RS' },
          { text: '5 – gezielte Schmerzabwehr', minLevel: 'RS' },
          { text: '4 – ungezielte Schmerzabwehr (normale Beugung)', minLevel: 'RS' },
          { text: '3 – abnorme Beugung (Beugesynergismen, Dekortikationshaltung)', minLevel: 'RS' },
          { text: '2 – Streckung (Strecksynergismen, Dezerebrationshaltung)', minLevel: 'RS' },
          { text: '1 – keine Reaktion', minLevel: 'RS' },
        ],
      },
      {
        heading: 'GCS – Schweregrad (Summe aus E + V + M, 3–15 Punkte)',
        steps: [
          { text: '15–13 Punkte: leichtes Schädel-Hirn-Trauma (SHT)', minLevel: 'RS' },
          { text: '12–9 Punkte: mittelschweres SHT', minLevel: 'RS' },
          { text: '8–3 Punkte: schweres SHT', minLevel: 'RS' },
        ],
      },
    ],
    notes: [
      'Die detaillierte Punktetabelle (Augenöffnung, verbale und motorische Reaktion) ist die allgemein ' +
        'gebräuchliche Originalskala nach Teasdale und Jennett (1974). Im SAA/BPR-PDF steht nur die grobe ' +
        'Schweregrad-Einteilung 15 bis 13, 12 bis 9 und 8 bis 3 Punkte.',
    ],
    sourceNote:
      'WASB-Schema und Schweregrad-Einteilung geprüft gegen SAA und BPR 2025, „Beurteilung der Bewusstseinslage", ' +
      'Seite 77, Stand 30.04.2025, herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, ' +
      'Brandenburg, Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 77,
  },
  {
    id: 'sampler',
    title: 'SAMPLER(S)-Schema',
    category: 'Herangehensweise & Einschätzung',
    minLevel: 'RS',
    summary: 'Strukturiertes Abfrageschema zur Erfassung der akuten Situation und Vorgeschichte.',
    sections: [
      {
        steps: [
          { text: 'S – Symptome/Schmerzen: aktuelle Beschwerden (zur Vertiefung: OPQRST-Schema)' },
          { text: 'A – Allergien: bekannte Allergien' },
          {
            text: 'M – Medikamente: Dauer-/Bedarfsmedikation, planmäßig eingenommen?, gerinnungsaktive Medikamente (Pradaxa®, Xarelto®, Eliquis®, Heparin, ASS, Marcumar® etc.)',
          },
          { text: 'P – Patientengeschichte: aktuelle/frühere Erkrankungen, Operationen, Schwangerschaft, chronische Erkrankungen' },
          {
            text: 'L – Letzte …: letzte Mahlzeit (Zeitpunkt/Art), Stuhlgang/Miktion, Krankenhausaufenthalt, bei Frauen: letzte Regelblutung',
          },
          { text: 'E – Ereignis: Was hat zum Notruf geführt? Wie hat sich die Situation entwickelt?' },
          {
            text: 'R – Risikofaktoren: z. B. Rauchen, Alkohol, Drogen, Schwangerschaft. Leitfrage: Welche Risikofaktoren bestehen für die aktuelle Situation?',
          },
          {
            text: 'S – Schwangerschaft: bei Frauen im gebärfähigen Alter gezielt erfragen (mögliche Schwangerschaft?, Schwangerschaftswoche, Komplikationen). Verändert Lagerung, Medikamentenwahl und Zielklinik',
          },
        ],
      },
    ],
    sourceNote:
      'Die Buchstaben S bis R stammen aus SAA und BPR 2025, „SAMPLER-Schema, Erfassung der akuten Situation", ' +
      'Seite 78, Stand 30.04.2025. Das abschließende „(S)" für Schwangerschaft ist eine in der Ausbildung ' +
      'verbreitete Erweiterung und steht dort nicht. Die Quelle führt die Schwangerschaft unter „Risikofaktoren" ' +
      'und unter „Patientengeschichte".',
    page: 78,
  },
  {
    id: 'opqrst',
    title: 'OPQRST-Schema',
    category: 'Herangehensweise & Einschätzung',
    minLevel: 'SanH',
    summary: 'Strukturiertes Schema zur genaueren Erfassung von Schmerzen/Symptomen.',
    sections: [
      {
        steps: [
          { text: 'O – Onset (Beginn): Wann begann das Symptom? Akut oder schleichend? Was wurde gerade gemacht?' },
          { text: 'P – Provocation/Palliation: Was verstärkt oder lindert das Symptom?' },
          {
            text: 'Q – Quality (Qualität), Charakteristik: z. B. Dreh- oder Schwankschwindel, Tinnitus, Taubheitsgefühle, Kribbelparästhesien',
          },
          {
            text: 'Q – Quality (Qualität), Schmerzqualität: hell (z. B. stechend, brennend), dumpf (z. B. drückend, klopfend), wechselnd (z. B. an- und abschwellend, kolikartig)',
          },
          { text: 'R – Radiation (Lokalisation/Ausstrahlung): Wo genau? Strahlt der Schmerz aus?' },
          { text: 'S – Severity (Schwere): Stärke auf NRS 0–10, wie belastend?' },
          { text: 'T – Time (Zeit): Wie war der zeitliche Verlauf?' },
        ],
      },
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „OPQRST-Schema, Erfassung der akuten Symptomatik", Seite 79, ' +
      'Stand 30.04.2025, herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, ' +
      'Brandenburg, Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 79,
  },
  {
    id: 'atemwegsmanagement',
    title: 'Atemwegsmanagement',
    category: 'Atemweg',
    minLevel: 'RS',
    summary:
      'Eskalierendes Vorgehen bei insuffizienter Atmung oder Bewusstlosigkeit. Erst einfache Maßnahmen, ' +
      'dann Stufe für Stufe eskalieren, nach jedem Schritt neu bewerten.',
    sections: [
      {
        heading: 'Wann ist die Spontanatmung insuffizient?',
        steps: [
          { text: 'SpO2 unter 90 Prozent', minLevel: 'SanH' },
          { text: 'Zyanose', minLevel: 'SanH' },
          { text: 'Atemfrequenz unter 8 oder über 30 pro Minute', minLevel: 'SanH' },
          { text: 'Pathologische Thoraxexkursion, etwa einseitig oder paradox', minLevel: 'RS' },
          {
            text: 'Trifft eines davon zu oder ist der Patient bewusstlos, beginnt der Algorithmus. Zuerst wird geprüft, ob eine Atemwegsverlegung durch einen Fremdkörper vorliegt',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Einfache Maßnahmen (zuerst)',
        illustrationId: 'atemweg-freimachen',
        steps: [
          { text: 'Sauerstoffgabe nach SAA Sauerstoff', minLevel: 'RS' },
          { text: 'Bei Stridor Epinephrin vernebeln nach SAA Epinephrin', minLevel: 'RS' },
          {
            text: 'Atemweg freimachen durch Reklination des Kopfes. Vorsicht bei Verdacht auf ein Trauma der Halswirbelsäule',
            minLevel: 'SanH',
          },
          { text: 'Esmarch-Handgriff', minLevel: 'SanH' },
          { text: 'Bei Bedarf oral absaugen und Fremdkörper ausräumen', minLevel: 'RS' },
          { text: 'Bei Bedarf nasopharyngealer Tubus', minLevel: 'RS' },
          {
            text: 'Greifen die einfachen Maßnahmen, folgt die weitere Versorgung, bei Bedarf mit Notarzt. Sonst wird eskaliert',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Wenn Ventilation oder Oxygenierung weiter unzureichend sind',
        steps: [
          { text: 'Hochdosierte Sauerstoffgabe', minLevel: 'RS' },
          { text: 'Bei Bedarf naso- oder oropharyngeale Hilfsmittel einlegen', minLevel: 'RS' },
          { text: 'Kapnografie anschließen', minLevel: 'RS' },
          { text: 'Beutel-Masken-Beatmung beginnen', minLevel: 'RS' },
          {
            text: 'Gelingt die Maskenbeatmung nicht: Kopflagerung optimieren, auf die Zwei-Hand-Technik mit doppeltem C-Griff wechseln, bei Bedarf Hilfsmittel einlegen und technische Fehler ausschließen',
            minLevel: 'RS',
          },
          {
            text: 'Bei Verdacht auf eine Atemwegsverlegung durch einen Fremdkörper gilt stattdessen der BPR „A-Problem bei Fremdkörperaspiration"',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Bei weiterhin insuffizienter Atmung und fehlenden Schutzreflexen',
        illustrationId: 'larynxtubus',
        steps: [
          { text: 'Anlage eines extraglottischen Atemwegs nach SAA Extraglottischer Atemweg', minLevel: 'NotSan' },
          {
            text: 'Sind die Schutzreflexe noch vorhanden, wird kein extraglottischer Atemweg angelegt. Dann wird die Maskenbeatmung bis zum Eintreffen des Notarztes fortgesetzt',
            minLevel: 'NotSan',
          },
        ],
      },
      {
        heading: 'Erfolgskontrolle nach jedem Eskalationsschritt',
        steps: [
          { text: 'Der Thorax hebt und senkt sich seitengleich', minLevel: 'RS' },
          { text: 'Typisches Kapnografie-Signal', minLevel: 'RS' },
          { text: 'Niedriger Beatmungsdruck', minLevel: 'RS' },
          { text: 'Die SpO2 steigt adäquat an', minLevel: 'RS' },
        ],
      },
    ],
    notes: [
      'Weiterführende invasive Maßnahmen wie die endotracheale Intubation oder die Koniotomie liegen laut ' +
        'S1-Leitlinie „Prähospitales Atemwegsmanagement" grundsätzlich nicht im Kompetenzbereich des ' +
        'nichtärztlichen Rettungsdienstpersonals. Die Koniotomie steht dort als letzte Möglichkeit am Ende ' +
        'des Algorithmus, wenn weder Intubation noch Oxygenierung noch Ventilation gelingen.',
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „Atemwegsmanagement", Seite 80, Stand 30.04.2025, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 80,
  },
  {
    id: 'patientenanmeldung',
    title: 'Patientenanmeldung (ZOABCDE)',
    category: 'Kommunikation & Übergabe',
    minLevel: 'RS',
    summary: 'Strukturierte telefonische Voranmeldung in der Zielklinik.',
    sections: [
      {
        steps: [
          { text: 'Z – Zeiten: Anmeldezeit und voraussichtliche Ankunftszeit' },
          {
            text: 'O – Opening: Name, Alter und Geschlecht, seit wann die Symptome bestehen, in einem Satz „Was ist passiert?", Trauma oder Erkrankung, Verdachtsdiagnose, Dringlichkeit',
          },
          { text: 'A – Airway (Atemweg): spontan frei, gefährdet, Tracheostoma oder gesichert (intubiert oder supraglottisch)' },
          {
            text: 'B – Breathing (Belüftung): sauerstoffpflichtig, nicht invasiv beatmet oder CPAP, invasiv beatmet, Verdacht auf Pneumothorax mit der Frage nach erfolgter Entlastung',
          },
          {
            text: 'C – Circulation (Kreislauf): stabil oder instabil, Schock, Herzrhythmusstörung, katecholaminpflichtig, Blutung, Reanimation mit ROSC oder laufend',
          },
          {
            text: 'D – Disability (Defizite): wach und orientiert, neurologisches Defizit nach BE-FAST, erweckbar auf Ansprache oder auf Schmerzreiz, Koma',
          },
          {
            text: 'E – Extras: Verletzungsmuster, Infektion oder Isolationsbedarf, Antikoagulation, Schwangerschaft, Demenz, Eigen- und Fremdgefährdung, Erbrechen oder Durchfall, sonstige Besonderheiten',
          },
        ],
      },
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „Handreichung Patientenanmeldung", Seite 82, Stand 30.04.2025, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 82,
  },
  {
    id: 'sinnhaft',
    title: 'Übergabe – SINNHAFT',
    category: 'Kommunikation & Übergabe',
    minLevel: 'RS',
    summary: 'Strukturierte mündliche Übergabe am Zielort, Schritt für Schritt.',
    sections: [
      {
        heading: 'Die acht Schritte',
        steps: [
          {
            text: 'S – Start: Ruhe. Sind alle bereit für die Übergabe? Face-to-Face-Kommunikation, Manipulationen und Tätigkeiten am Patienten möglichst vermeiden',
          },
          { text: 'I – Identifikation: Geschlecht, Nachname und Alter. Bei Kindern zusätzlich die Gewichtsangabe' },
          {
            text: 'N – Notfallereignis: 1. Was? (Leitsymptom oder Verdachtsdiagnose), 2. Wie? (Ursache), 3. Wann? (Zeitpunkt des Ereignisses). Optional Wo oder Woher (Ort und Auffindesituation)',
          },
          {
            text: 'N – Notfallpriorität: anhand des cABCDE-Schemas mit den pathologischen Untersuchungsbefunden und den pathologischen Vitalparametern',
          },
          {
            text: 'H – Handlung: durchgeführte Maßnahmen mit Dosis, Umfang, Zeitpunkt und Wirkung. Bewusst unterlassene Handlungen werden ebenfalls genannt, falls zutreffend',
          },
          {
            text: 'A – Anamnese: Allergien, Medikation, Vorerkrankungen, Infektionen, Soziales und Organisatorisches, Besonderheiten',
          },
          {
            text: 'F – Fazit: Wiederholung durch das aufnehmende Personal mit Identifikation, Notfallereignis und Notfallpriorität ohne Vitalparameter, gekoppelt an die Handlung ohne Wirkung',
          },
          { text: 'T – Teamfragen: Möglichkeit für zusätzliche wesentliche Fragen des aufnehmenden Personals' },
        ],
      },
      {
        heading: 'Erläuterungen aus der Handreichung',
        steps: [
          {
            text: 'Allgemein: stakkatoartiger Übergabestil mit ausdrücklicher Nennung der einzelnen Teilaspekte, die jeweils den nächsten Übergabeschritt einleiten',
          },
          { text: 'Liegen Informationen nicht vor, wird auch dieser Sachverhalt bei der Übergabe mitgeteilt' },
          {
            text: 'Notfallpriorität: ein Problem im cABCDE-Schema, etwa ein C-Problem, wird übergeben, wenn Maßnahmen zur Behebung erforderlich waren oder noch sind',
          },
          {
            text: 'Besteht kein A- bis E-Problem und liegen alle Vitalparameter im Normbereich, wird genau das gesagt: „kein A-E-Problem" und „unauffällige Vitalparameter"',
          },
          {
            text: 'Pathologische Vitalparameter ohne Bezug zum Krankheitsbild werden trotzdem erwähnt, etwa ein Blutzucker von 300 mg/dl bei einem Supinationstrauma',
          },
          {
            text: 'Begleitverletzungen aus dem Bodycheck und zusätzliche Maßnahmen wie Analgesie oder Wärmemanagement gehören unter „Extras"',
          },
          {
            text: 'Handlung: durchgeführte Handlungen werden direkt an die zugehörige Notfallpriorität gekoppelt. Liegt ein A-Problem vor, folgt die zugehörige Handlung, bevor zu B übergegangen wird',
          },
          {
            text: 'Anamnese: Allergien, Medikation und Vorerkrankungen werden mündlich übermittelt, wenn sie mit der Behandlungspriorität zusammenhängen oder für die unmittelbare Versorgung bedeutsam sind',
          },
          {
            text: 'Liegt in einem Punkt nichts vor, wird auch die leere Anamnese in allen Bestandteilen erwähnt, bei Bedarf zusammengefasst',
          },
          {
            text: 'Ein Infektionsverdacht oder eine bestätigte Infektion wird genannt, wenn sie die Infrastruktur des Krankenhauses betrifft, etwa eine Isolierung, oder das Personal gefährdet',
          },
          { text: 'Soziale Aspekte wie Patientenverfügungen oder häusliche Gewalt gehören ebenfalls in die Anamnese' },
          { text: 'Besonderheiten sind etwa die Ablehnung einer Transfusion oder eine DNR- oder DNI-Verfügung' },
          { text: 'Fazit: ist die Wiederholung durch die Notaufnahme fehlerhaft, korrigiert der Rettungsdienst sofort' },
        ],
      },
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „Handreichung Übergabe, SINNHAFT", Seite 83, Stand 30.04.2025, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt. Die Erläuterungen stammen aus ' +
      'derselben Handreichung, erarbeitet mit dem Universitätsklinikum Bonn und dem DGINA-Notfallcampus.',
    page: 83,
  },
  {
    id: 'reanimation-erwachsene',
    title: 'Reanimation Erwachsene (BLS und ALS)',
    category: 'Kreislaufstillstand',
    minLevel: 'SanH',
    summary:
      'Vom Erkennen des Kreislaufstillstands über Basismaßnahmen (die jede Qualifikationsstufe beherrschen ' +
      'sollte) bis zur erweiterten Reanimation (ALS) durch NotSan.',
    sections: [
      {
        heading: 'Erkennen & Basismaßnahmen (alle Stufen)',
        steps: [
          { text: 'Eigenschutz beachten, dann das Bewusstsein prüfen durch Ansprechen und Rütteln', minLevel: 'SanH' },
          { text: 'Atemkontrolle: Atemweg freimachen (Kopf überstrecken), max. 10 Sek. auf normale Atmung prüfen', minLevel: 'SanH' },
          {
            text: 'Keine Reaktion und keine normale Atmung bedeutet Kreislaufstillstand. Notruf 112 veranlassen und sofort mit der Herzdruckmassage beginnen',
            minLevel: 'SanH',
          },
          {
            text: 'Thoraxkompression mit einer Frequenz von 100 bis 120 pro Minute und einer Tiefe von 5 bis 6 cm, zwischen den Kompressionen den Brustkorb vollständig zurückfedern lassen',
            minLevel: 'SanH',
          },
          { text: 'Herzdruckmassage zu Beatmung im Verhältnis 30:2, sofern Beatmung durchführbar und geschult ist', minLevel: 'SanH' },
          { text: 'AED sobald verfügbar anlegen und den Sprachanweisungen folgen', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Erweiterte Versorgung (RS/NotSan)',
        illustrationId: 'aed-elektroden',
        steps: [
          { text: 'Defibrillator vorbereiten, einschalten, Defi-Elektroden kleben, laden', minLevel: 'RS' },
          {
            text: 'Erste EKG-Rhythmusbeurteilung. Bei VF oder pVT wird defibrilliert. Bei Asystolie, PEA oder auswurffähigem Rhythmus wird nicht defibrilliert, der Defibrillator wird entladen',
            minLevel: 'RS',
          },
          { text: 'Zwei Minuten CPR, danach erneute Rhythmusbeurteilung. Der Zyklus wiederholt sich, dabei möglichst die Helfer für die Kompression wechseln', minLevel: 'RS' },
          { text: 'EGA einlegen, Kapnografie anschließen', minLevel: 'NotSan' },
          { text: 'i.v.- oder i.o.-Zugang legen, Infusion vorbereiten', minLevel: 'NotSan' },
          { text: 'Bei Asystolie oder PEA wird Epinephrin so früh wie möglich gegeben, siehe SAA Epinephrin', minLevel: 'NotSan' },
          { text: 'Nach der dritten erfolglosen Defibrillation wird Amiodaron gegeben, alternativ Lidocain. Danach folgt Epinephrin alle 4 Minuten', minLevel: 'NotSan' },
          { text: 'Ebenfalls nach drei erfolglosen Schocks empfiehlt der ERC 2025, die Position der Defibrillationselektroden zu wechseln, etwa von anterolateral auf anterior-posterior', minLevel: 'NotSan' },
          {
            text: 'Reversible Ursachen bedenken. Die vier „Hs" stehen für Hypoxie, Hypovolämie, Hypokaliämie oder Hyperkaliämie und Hypothermie. „HITS" steht für Herzbeuteltamponade, Intoxikation, Thromboembolie und Spannungspneumothorax',
            minLevel: 'NotSan',
          },
        ],
      },
    ],
    notes: [
      'Die Hands-off-Zeit vor und während der Defibrillation bleibt unter 10 Sekunden. Danach wird die Thoraxkompression sofort fortgesetzt.',
      'Eine Pulskontrolle erfolgt nur bei auswurffähigem EKG-Rhythmus und dauert höchstens 10 Sekunden.',
      'Oberste Priorität haben qualitativ hochwertige Thoraxkompressionen mit minimalen Unterbrechungen, eine schnellstmögliche Defibrillation und die Therapie reversibler Ursachen.',
    ],
    sourceNote:
      'Der Teil zu den Basismaßnahmen (Erkennen, Notruf, Herzdruckmassage 30:2, AED) folgt den Leitlinien des European Resuscitation Council in der Fassung von 2025 und steht nicht im SAA/BPR-PDF. ' +
      'Frequenz 100 bis 120 pro Minute, Tiefe 5 bis 6 cm und das Verhältnis 30:2 sind gegenüber der Vorfassung unverändert. ' +
      'Die erweiterte Versorgung stammt aus SAA/BPR „Reanimation Erwachsene, ALS", Seite 85 bis 86.',
    page: 85,
  },
  {
    id: 'reanimation-kinder',
    title: 'Reanimation Kinder (PLS)',
    category: 'Kreislaufstillstand',
    minLevel: 'SanH',
    summary:
      'Reanimation bei Kindern von 0 bis 18 Jahren, ausgenommen Neugeborene bei der Geburt. Der Unterschied ' +
      'zu Erwachsenen liegt in den 5 initialen Beatmungen, dem Verhältnis 15:2 und der gewichtsadaptierten Defibrillationsenergie.',
    sections: [
      {
        heading: 'Basismaßnahmen',
        steps: [
          {
            text: 'Bewusstsein und Atmung prüfen. Bei Säuglingen und Kleinkindern mit hypoxie- oder ischämiebedingter Bradykardie unter 60 Schlägen pro Minute wird ebenfalls reanimiert, auch wenn noch ein Puls tastbar ist',
            minLevel: 'SanH',
          },
          {
            text: '5 initiale Beatmungen mit Sauerstoff (FiO2 1,0). Erst danach wird bei fehlenden Lebenszeichen mit der Thoraxkompression begonnen',
            minLevel: 'RS',
          },
          {
            text: 'Das Kind liegt auf einer harten Unterlage, der Druckpunkt ist die untere Sternumhälfte',
            minLevel: 'SanH',
          },
          {
            text: 'Thoraxkompression mit einer Frequenz von 100 bis 120 pro Minute, zwischen den Kompressionen vollständig entlasten',
            minLevel: 'SanH',
          },
          {
            text: 'Kompressionstiefe mindestens ein Drittel des Thoraxdurchmessers. Beim Säugling unter einem Jahr bevorzugt die thoraxumfassende 2-Daumen-Technik, beim Kind ab einem Jahr die 1-Handballen-Technik, bei Jugendlichen die 2-Hand-Technik mit etwa 5 cm und höchstens 6 cm',
            minLevel: 'SanH',
          },
          { text: 'Thoraxkompression zu Beatmung im Verhältnis 15:2, solange kein extraglottischer Atemweg liegt oder es unter Kompression stark undicht wird', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Erweiterte Versorgung (RS/NotSan)',
        illustrationId: 'intraossaerer-zugang',
        steps: [
          { text: 'Manuelle Defibrillation mit 4 Joule pro Kilogramm Körpergewicht biphasisch. Bei refraktärem VF oder pVT nach mehr als 6 Schocks kann schrittweise auf höchstens 8 Joule pro Kilogramm erhöht werden', minLevel: 'RS' },
          { text: 'Die Rhythmusanalyse macht die anwendende Person selbst. Nur bei Unsicherheit wird der AED-Modus genutzt', minLevel: 'RS' },
          { text: 'Einen extraglottischen Atemweg erwägen, insbesondere wenn die Beutel-Masken-Beatmung trotz optimierter Kopfposition und Atemwegshilfen schwierig bleibt. Rückfallebene ist die Beutel-Masken-Beatmung', minLevel: 'NotSan' },
          { text: 'Ein intraossärer Zugang folgt, wenn der intravenöse Zugang nach zwei Versuchen in höchstens 5 Minuten nicht gelingt oder von vornherein aussichtslos ist', minLevel: 'NotSan' },
          {
            text: 'Bei Asystolie oder PEA wird Epinephrin so früh wie möglich nach dem Zugang gegeben, siehe SAA Epinephrin. Weitere Gaben richten sich nach SAA Amiodaron und SAA Lidocain',
            minLevel: 'NotSan',
          },
          {
            text: 'Reversible Ursachen bedenken. Die vier „Hs" sind Hypoxie, Hypovolämie, Störungen von Kalium oder Blutzucker sowie Hypothermie und Hyperthermie. Die vier „HITS" sind Herzbeuteltamponade, Intoxikation, Thromboembolie und Spannungspneumothorax',
            minLevel: 'NotSan',
          },
        ],
      },
    ],
    notes: [
      'Bei Jugendlichen mit entsprechender Größe und entsprechendem Gewicht kann auch der Erwachsenen-Behandlungspfad angewendet werden.',
      'Die Hands-off-Zeit vor und während der Defibrillation einschließlich Rhythmusanalyse bleibt unter 10 Sekunden. Nach der Defibrillation wird die Thoraxkompression sofort fortgesetzt.',
      'Eine Pulskontrolle erfolgt nur bei auswurffähigem EKG-Rhythmus und dauert höchstens 10 Sekunden.',
      'Atemfrequenz nach endotrachealer Intubation altersabhängig: 25 pro Minute beim Säugling, 20 von 1 bis 8 Jahren, 15 von 8 bis 12 Jahren und 10 ab 12 Jahren.',
    ],
    sourceNote:
      'Inhalte geprüft gegen SAA und BPR 2025, „Reanimation Kinder, PLS", Seite 87 bis 88, Stand 30.04.2025, ' +
      'herausgegeben von den Ärztlichen Leitungen Rettungsdienst in Baden-Württemberg, Brandenburg, ' +
      'Mecklenburg-Vorpommern, Nordrhein-Westfalen, Sachsen und Sachsen-Anhalt.',
    page: 87,
  },
];

export function getAlgorithmById(id: string): AlgorithmEntry | undefined {
  return ALGORITHMEN.find((a) => a.id === id);
}
