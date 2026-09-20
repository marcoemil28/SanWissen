import type { InternistischeNotfaelleTopic } from './types';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rettungsdienstliches Grundlagenwissen zur Erkennung und Erstversorgung internistischer ' +
  'Notfälle. Keine SAA/BPR-Quelle. Medikamentöse Therapie (z. B. ASS/Nitro bei ACS, Glucose i.v. bei ' +
  'Hypoglykämie, Adrenalin bei Anaphylaxie, Naloxon bei Opioid-Überdosierung) ist, sofern invasiv oder ' +
  'verschreibungspflichtig, ärztlich delegierte NotSan-Kompetenz, siehe Medikamente-Modul.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const INTERNISTISCHE_NOTFAELLE_THEMEN: InternistischeNotfaelleTopic[] = [
  {
    id: 'herzinfarkt-acs',
    title: 'Herzinfarkt (ACS)',
    category: 'Herz & Kreislauf',
    minLevel: 'SanH',
    summary: 'Erkennungszeichen und Erstmaßnahmen beim akuten Koronarsyndrom (ACS).',
    sections: [
      {
        heading: 'Erkennungszeichen',
        facts: [
          { text: 'Plötzlicher Brustschmerz. Drückend, brennend oder einschnürend' },
          { text: 'Ausstrahlung in Arm, Kiefer, Rücken oder Oberbauch' },
          { text: 'Angst, Unruhe, Kaltschweißigkeit, Übelkeit' },
          { text: 'Bei Frauen und Diabetiker:innen oft untypische Symptome. Z. B. nur Übelkeit oder Erschöpfung' },
        ],
      },
      {
        heading: 'Sofortmaßnahmen',
        facts: [
          { text: 'Patient körperlich ruhigstellen, jede Anstrengung vermeiden' },
          { text: 'Oberkörper leicht erhöht lagern, beengende Kleidung öffnen' },
          { text: 'Beruhigen, Notruf/Notarzt alarmieren' },
          { text: 'Engmaschige Kontrolle von Bewusstsein, Atmung und Kreislauf' },
        ],
      },
      {
        heading: 'Bei Kreislaufstillstand',
        facts: [{ text: 'Sofort mit der Reanimation beginnen, siehe Algorithmen-Modul' }],
      },
    ],
    notes: ['Medikamentöse Therapie (ASS, Nitro, Sauerstoff nach Bedarf) ist ärztlich delegierte NotSan-Kompetenz.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'lungenoedem',
    title: 'Lungenödem',
    category: 'Herz & Kreislauf',
    minLevel: 'SanH',
    summary: 'Meist kardial bedingte Flüssigkeitsansammlung in der Lunge mit akuter Atemnot.',
    sections: [
      {
        heading: 'Ursachen',
        facts: [{ text: 'Meist kardial (Linksherzinsuffizienz), seltener toxisch oder allergisch bedingt' }],
      },
      {
        heading: 'Erkennungszeichen',
        facts: [
          { text: 'Atemnot, brodelnde Atemgeräusche' },
          { text: 'Schaumiger, evtl. blutig tingierter Auswurf' },
          { text: 'Unruhe, Angst, Zyanose (bläuliche Verfärbung von Lippen/Fingern)' },
        ],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Oberkörperhochlagerung. Sitzend, Beine tief lagern' },
          { text: 'Beruhigen, beengende Kleidung öffnen' },
          { text: 'Sauerstoffgabe nach Verfügbarkeit und Kompetenz', minLevel: 'RS' },
          { text: 'Notarzt alarmieren' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'schlaganfall-fast',
    title: 'Schlaganfall (BE-FAST-Test)',
    category: 'Neurologisch',
    minLevel: 'SanH',
    summary: 'Schneller Check auf Schlaganfall-Anzeichen. Jede Minute zählt.',
    sections: [
      {
        heading: 'FAST-Test',
        illustrationId: 'fazialisparese',
        facts: [
          { text: 'Face. Lächeln lassen: hängt ein Mundwinkel herab?' },
          { text: 'Arms. Beide Arme nach vorne heben lassen: sinkt eine Seite unkontrolliert ab?' },
          { text: 'Speech. Einen Satz nachsprechen lassen: verwaschene oder unverständliche Sprache?' },
          { text: 'Time. Zeitpunkt des Symptombeginns exakt notieren, entscheidend für die Klinikwahl' },
        ],
      },
      {
        heading: 'BE-FAST – erweiterte Fassung',
        facts: [
          { text: 'BE-FAST stellt dem klassischen FAST zwei Zeichen voran, die bei Schlaganfällen im hinteren Stromgebiet (Kleinhirn/Hirnstamm) oft die einzigen Symptome sind und mit FAST allein übersehen werden.' },
          { text: 'Balance. Plötzliche Gang-/Standunsicherheit, Schwindel, Koordinationsstörung, Fallneigung zu einer Seite' },
          { text: 'Eyes. Plötzliche Sehstörung: Doppelbilder, Gesichtsfeldausfall, einseitiger Sehverlust' },
          { text: 'Face, Arms, Speech, Time. Wie beim FAST-Test oben' },
          { text: 'Ein einzelnes auffälliges Zeichen genügt für den Verdacht. Es müssen nicht mehrere zutreffen.' },
        ],
      },
      {
        heading: 'Weitere mögliche Erkennungszeichen',
        facts: [
          { text: 'Plötzliche Schluckstörung' },
          { text: 'Sehr starker, plötzlich einsetzender Kopfschmerz' },
          { text: 'Verwirrtheit, Orientierungslosigkeit' },
        ],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Symptombeginn exakt dokumentieren (Uhrzeit). Beeinflusst mögliche Therapieoptionen in der Klinik' },
          { text: 'Patient nicht essen oder trinken lassen (Aspirationsgefahr bei Schluckstörung)' },
          { text: 'Zügiger Transport in eine geeignete Klinik (Stroke Unit)', minLevel: 'RS' },
          { text: 'Engmaschige Kontrolle von Bewusstsein und Vitalzeichen' },
        ],
      },
    ],
    notes: ['"Time is brain". Jede Verzögerung verschlechtert die Prognose, daher zügiges, aber sicheres Vorgehen.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'krampfanfall-epilepsie',
    title: 'Krampfanfall / Epilepsie',
    category: 'Neurologisch',
    minLevel: 'SanH',
    summary: 'Verhalten während und nach einem generalisierten Krampfanfall.',
    sections: [
      {
        heading: 'Während des Anfalls',
        facts: [
          { text: 'Eigenschutz beachten, Umgebung sichern (Gegenstände wegräumen, gefährliche Kanten polstern)' },
          { text: 'Nichts in den Mund stecken' },
          { text: 'Patient nicht festhalten oder Bewegungen unterdrücken' },
          { text: 'Anfallsdauer messen' },
        ],
      },
      {
        heading: 'Nach dem Anfall',
        facts: [
          { text: 'Stabile Seitenlage. Nach einem Anfall folgt häufig ein Terminalschlaf mit Bewusstseinstrübung' },
          { text: 'Beim Erwachen ruhig und beruhigend ansprechen, Orientierung geben' },
        ],
      },
      {
        heading: 'Alarmierungskriterien',
        facts: [
          { text: 'Erster Krampfanfall im Leben des Patienten' },
          { text: 'Anfall dauert länger als 5 Minuten' },
          { text: 'Mehrere Anfälle hintereinander ohne zwischenzeitliches Erwachen (Status epilepticus)' },
          { text: 'Verletzung während des Anfalls oder Schwangerschaft der Patientin' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'diabetische-notfaelle',
    title: 'Diabetische Notfälle',
    category: 'Stoffwechsel & Allergie',
    minLevel: 'SanH',
    summary: 'Unterzuckerung und Überzuckerung unterscheiden und richtig reagieren.',
    sections: [
      {
        heading: 'Hypoglykämie (Unterzuckerung)',
        facts: [
          { text: 'Beginnt meist schnell (Minuten)' },
          { text: 'Symptome: Zittern, Schwitzen, Heißhunger, Aggressivität/Verwirrtheit, bis hin zur Bewusstlosigkeit' },
        ],
      },
      {
        heading: 'Maßnahmen bei Hypoglykämie',
        facts: [
          { text: 'Bei ansprechbarem Patienten: Traubenzucker oder gesüßtes Getränk verabreichen' },
          { text: 'Bei Bewusstlosigkeit: nichts oral verabreichen, stabile Seitenlage, Notarzt alarmieren' },
          { text: 'Glucose-Gabe i.v. ist ärztlich delegierte NotSan-Kompetenz', minLevel: 'NotSan' },
        ],
      },
      {
        heading: 'Hyperglykämie (Überzuckerung)',
        facts: [
          { text: 'Entwickelt sich meist langsamer (Stunden bis Tage)' },
          { text: 'Symptome: starker Durst, häufiges Wasserlassen, Azetongeruch der Atemluft, Bewusstseinstrübung' },
        ],
      },
      {
        heading: 'Maßnahmen bei Hyperglykämie',
        facts: [
          { text: 'Engmaschige Vitalzeichenkontrolle' },
          { text: 'Notarzt alarmieren. Spezifische Therapie ist nicht durch SanH/RS möglich' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'anaphylaxie',
    title: 'Allergie / Anaphylaxie',
    category: 'Stoffwechsel & Allergie',
    minLevel: 'SanH',
    summary: 'Stadiengerechte Erkennung einer allergischen Reaktion bis zum anaphylaktischen Schock.',
    sections: [
      {
        heading: 'Stadien (grobe Orientierung)',
        facts: [
          { text: 'Stadium I. Haut: Juckreiz, Quaddeln, Hautrötung (Flush)' },
          { text: 'Stadium II. Kreislauf: Tachykardie, Blutdruckabfall, Übelkeit' },
          { text: 'Stadium III. Atemwege: Bronchospasmus, Atemnot, Stridor' },
          { text: 'Stadium IV. Kreislauf- oder Atemstillstand' },
        ],
      },
      {
        heading: 'Erkennungszeichen',
        facts: [{ text: 'Schnelle Symptomentwicklung nach Allergenkontakt (Insektenstich, Nahrungsmittel, Medikament)' }],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Allergenzufuhr stoppen, wenn möglich (z. B. Insektenstachel entfernen)' },
          { text: 'Lagerung symptomorientiert wählen: Schocklage bei Kreislaufproblem, Oberkörperhoch bei Atemnot' },
          { text: 'Notarzt alarmieren' },
          {
            text: 'Bei vorhandenem Adrenalin-Autoinjektor des Patienten: Unterstützung bei der Anwendung möglich, sofern der Patient selbst dazu nicht mehr in der Lage ist. Lokale Kompetenzregelung beachten',
            minLevel: 'RS',
          },
        ],
      },
    ],
    notes: ['Adrenalin-Gabe durch das Rettungsdienstpersonal selbst (i.m./i.v.) ist ärztlich delegierte NotSan-Kompetenz.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'akutes-abdomen',
    title: 'Akutes Abdomen',
    category: 'Abdomen & Vergiftungen',
    minLevel: 'SanH',
    summary: 'Plötzlich einsetzende, starke Bauchschmerzen mit potenziell ernster Ursache.',
    sections: [
      {
        heading: 'Mögliche Ursachen',
        facts: [
          { text: 'Blinddarmentzündung, Gallen- oder Nierenkolik' },
          { text: 'Darmverschluss, geplatzte Zyste' },
          { text: 'Innere Blutung. Z. B. Bauchaortenaneurysma oder Eileiterschwangerschaft' },
        ],
      },
      {
        heading: 'Erkennungszeichen',
        facts: [
          { text: 'Starke Bauchschmerzen. Diffus oder lokalisiert, Abwehrspannung der Bauchdecke' },
          { text: 'Übelkeit, Erbrechen' },
          { text: 'Bei innerer Blutung ggf. Kreislaufinstabilität (Blässe, Tachykardie, Blutdruckabfall)' },
        ],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Lagerung nach Patientenwunsch. Häufig Knierolle zur Entspannung der Bauchdecke' },
          { text: 'Nichts zu essen oder zu trinken geben' },
          { text: 'Engmaschige Kreislaufkontrolle' },
          { text: 'Notarzt bei Verdacht auf akute innere Blutung oder starke Schmerzen' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'intoxikationen',
    title: 'Intoxikationen',
    category: 'Abdomen & Vergiftungen',
    minLevel: 'SanH',
    summary: 'Grundprinzipien bei Vergiftungen, mit Fokus auf Alkohol und Drogen im Sanitätsdienst.',
    sections: [
      {
        heading: 'Allgemeine Prinzipien',
        illustrationId: 'giftaufnahmewege',
        facts: [
          { text: 'Eigenschutz beachten. Z. B. bei unbekannten Substanzen oder aggressivem Patienten' },
          { text: 'Wenn möglich Substanz, Menge und Zeitpunkt erfragen oder Reste/Verpackung sicherstellen' },
        ],
      },
      {
        heading: 'Alkoholintoxikation',
        facts: [
          { text: 'Erkennungsmerkmale: Gangunsicherheit, verwaschene Sprache, Bewusstseinstrübung' },
          { text: 'Gefahr der Unterkühlung und Aspiration bei Erbrechen' },
          { text: 'Bei Bewusstlosigkeit: stabile Seitenlage' },
        ],
      },
      {
        heading: 'Drogenintoxikation',
        facts: [
          { text: 'Sehr unterschiedliches Bild je nach Substanz' },
          { text: 'Opioide: Atemdepression, auffällig enge Pupillen' },
          { text: 'Stimulanzien: Unruhe, Tachykardie, Überhitzung' },
          { text: 'Im Zweifel immer Notarzt alarmieren' },
        ],
      },
      {
        heading: 'Maßnahmen allgemein',
        facts: [
          { text: 'Vitalzeichenüberwachung, Aspirationsschutz' },
          { text: 'Substanzreste/Verpackung nach Möglichkeit für die Klinik mitnehmen' },
        ],
      },
    ],
    notes: ['Für Opioid-Überdosierungen existiert im Medikamente-Modul eine Notfallkarte inkl. Naloxon-Gabe (NotSan-Kompetenz).'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'hitzenotfaelle',
    title: 'Hitzenotfälle',
    category: 'Umweltbedingte Notfälle',
    minLevel: 'SanH',
    summary: 'Hitzeerschöpfung, Hitzschlag und Sonnenstich unterscheiden und richtig behandeln.',
    sections: [
      {
        heading: 'Hitzeerschöpfung',
        facts: [
          { text: 'Durch Flüssigkeits- und Salzverlust' },
          { text: 'Symptome: Schwäche, Kopfschmerz, Übelkeit, blasse und feuchte Haut, Körpertemperatur meist nur leicht erhöht' },
        ],
      },
      {
        heading: 'Hitzschlag – lebensbedrohlich',
        facts: [
          { text: 'Überhitzung des Körperkerns (über ca. 40 °C)' },
          { text: 'Haut oft heiß und trocken, Bewusstseinstrübung bis Bewusstlosigkeit' },
          { text: 'Sofort aktiv kühlen und Notarzt alarmieren' },
        ],
      },
      {
        heading: 'Sonnenstich',
        facts: [
          { text: 'Reizung der Hirnhäute durch direkte Sonneneinstrahlung auf den Kopf' },
          { text: 'Symptome: Kopfschmerz, Übelkeit, gerötetes, heißes Gesicht bei meist normaler Körpertemperatur' },
        ],
      },
      {
        heading: 'Maßnahmen',
        facts: [
          { text: 'Aus der Hitze/Sonne bringen, in den Schatten oder kühle Umgebung' },
          { text: 'Kühlen (feuchte Tücher, ggf. Ventilation)' },
          { text: 'Bei Ansprechbarkeit Flüssigkeit anbieten' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'unterkuehlung-erfrierung',
    title: 'Unterkühlung & Erfrierung',
    category: 'Umweltbedingte Notfälle',
    minLevel: 'SanH',
    summary: 'Stadiengerechter Umgang mit Unterkühlung (Hypothermie) und lokalen Kälteschäden.',
    sections: [
      {
        heading: 'Unterkühlung (Hypothermie) – Stadien (grobe Orientierung)',
        illustrationId: 'zentralisation',
        facts: [
          { text: 'Leicht: Zittern vorhanden, klares Bewusstsein, Körperkerntemperatur ca. 32–35 °C' },
          { text: 'Mittel: kein Zittern mehr, Bewusstseinstrübung, ca. 28–32 °C' },
          { text: 'Schwer: bewusstlos, Kreislaufinstabilität, unter 28 °C' },
        ],
      },
      {
        heading: 'Maßnahmen bei Unterkühlung',
        facts: [
          { text: 'Sehr vorsichtiges Handling. Grobe Bewegungen können in fortgeschrittener Unterkühlung Kammerflimmern auslösen' },
          { text: 'Nasse Kleidung entfernen' },
          { text: 'Passiv wärmen (Decken, Wärmepack am Rumpf, nicht an den Extremitäten)' },
          { text: 'Notarzt bei mittlerer oder schwerer Unterkühlung', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Erfrierung',
        facts: [
          { text: 'Lokale Kälteschädigung, meist an Fingern, Zehen, Nase oder Ohren' },
          { text: 'Erkennungszeichen: Gefühllosigkeit, weiß-graue Hautverfärbung' },
        ],
      },
      {
        heading: 'Maßnahmen bei Erfrierung',
        facts: [
          { text: 'Betroffene Stelle vor weiterer Kälte und Reibung schützen' },
          { text: 'Langsam mit Körperwärme erwärmen, nicht reiben' },
          { text: 'Nicht auftauen, wenn ein erneutes Einfrieren droht' },
        ],
      },
    ],
    notes: [
      'Bei Verdacht auf Unterkühlung ist grobe oder hektische Handhabung (Risiko lebensbedrohlicher Rhythmusstörungen) unbedingt zu vermeiden.',
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getInternistischeNotfaelleTopicById(id: string): InternistischeNotfaelleTopic | undefined {
  return INTERNISTISCHE_NOTFAELLE_THEMEN.find((t) => t.id === id);
}
