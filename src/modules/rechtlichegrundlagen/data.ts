import type { RechtlicheGrundlagenTopic } from './types';

const GENERAL_SOURCE_NOTE =
  'Allgemeines rechtliches Grundlagenwissen für den Rettungsdienst. Keine SAA/BPR-Quelle und keine ' +
  'Rechtsberatung. Konkrete Rechtsvorschriften (Rettungsdienstgesetze, Delegationsumfang, ' +
  'Dokumentationsvorgaben) sind bundeslandspezifisch geregelt; im Einzelfall zählt immer die aktuelle ' +
  'Gesetzeslage bzw. lokale Dienstanweisung.';

/** Zuletzt inhaltlich geprüft/aktualisiert. */
export const CONTENT_STAND = '2026-09-17';

export const RECHTLICHEGRUNDLAGEN_THEMEN: RechtlicheGrundlagenTopic[] = [
  {
    id: 'garantenstellung-hilfeleistung',
    title: 'Garantenstellung & unterlassene Hilfeleistung',
    category: 'Grundrechte & Pflichten',
    minLevel: 'SanH',
    summary: 'Warum man eine einmal begonnene Versorgung nicht einfach abbrechen darf.',
    sections: [
      {
        heading: 'Garantenstellung',
        facts: [
          { text: 'Eine Rechtspflicht zum Handeln, die über die allgemeine Pflicht zur Hilfeleistung hinausgeht' },
          { text: 'Entsteht z. B. durch Übernahme der Behandlung, ein Dienstverhältnis oder ein bestehendes Vertrauensverhältnis' },
          {
            text: 'Konsequenz: Wer die Versorgung eines Patienten übernommen hat, darf sich nicht ohne gleichwertige Übergabe oder Abschluss der Maßnahme entfernen',
            minLevel: 'RS',
          },
        ],
      },
      {
        heading: 'Unterlassene Hilfeleistung (§ 323c StGB)',
        facts: [
          { text: 'Jede Person ist zur zumutbaren Hilfeleistung bei Unglücksfällen verpflichtet' },
          { text: 'Das Unterlassen zumutbarer Hilfe ist strafbar' },
          { text: 'Zumutbarkeit hat Grenzen: die eigene Sicherheit geht vor. Niemand muss sich selbst in Gefahr bringen' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'schweigepflicht',
    title: 'Schweigepflicht',
    category: 'Grundrechte & Pflichten',
    minLevel: 'SanH',
    summary: 'Was unter die Schweigepflicht fällt und welche Ausnahmen es gibt.',
    sections: [
      {
        heading: 'Grundprinzip',
        facts: [
          { text: 'Alle im Rahmen der Tätigkeit bekannt gewordenen Patienteninformationen unterliegen der Schweigepflicht' },
          { text: 'Gilt gegenüber Dritten, Angehörigen ohne Einwilligung des Patienten sowie Presse/Öffentlichkeit' },
          { text: 'Gilt auch nach Beendigung der Tätigkeit weiter' },
        ],
      },
      {
        heading: 'Ausnahmen',
        facts: [
          { text: 'Einwilligung des Patienten' },
          { text: 'Gesetzliche Meldepflichten (z. B. bestimmte Infektionskrankheiten)', minLevel: 'RS' },
          { text: 'Rechtfertigender Notstand. Z. B. akute Gefahr für Leib und Leben Dritter', minLevel: 'RS' },
        ],
      },
      {
        heading: 'In der Praxis',
        facts: [
          { text: 'Keine Patientendaten im Klartext über offene Funkkanäle' },
          { text: 'Keine Weitergabe von Einsatzdetails in sozialen Medien oder privaten Chats' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'patientenwille',
    title: 'Patientenverfügung, Patientenwille & mutmaßlicher Wille',
    category: 'Grundrechte & Pflichten',
    minLevel: 'RS',
    summary: 'Der Wille des Patienten hat Vorrang. Auch wenn er einer lebensrettenden Behandlung widerspricht.',
    sections: [
      {
        heading: 'Patientenwille hat Vorrang',
        facts: [
          { text: 'Ein einwilligungsfähiger, aufgeklärter Patient kann jede Behandlung ablehnen. Auch eine lebensrettende' },
        ],
      },
      {
        heading: 'Patientenverfügung',
        facts: [
          { text: 'Schriftlich festgelegter Wille für den Fall der eigenen Einwilligungsunfähigkeit' },
          { text: 'Grundsätzlich bindend, wenn sie konkret auf die vorliegende Situation zutrifft' },
        ],
      },
      {
        heading: 'Mutmaßlicher Wille',
        facts: [
          {
            text: 'Ist der Patient nicht einwilligungsfähig und liegt keine anwendbare Patientenverfügung vor, muss der mutmaßliche Wille ermittelt werden. Z. B. über Angehörige oder frühere Äußerungen',
          },
        ],
      },
      {
        heading: 'Im Zweifel',
        facts: [
          { text: 'Im akuten Notfall ohne Zeit zur Klärung gilt: im Zweifel für das Leben behandeln, die Klärung der Willenslage erfolgt sekundär' },
        ],
      },
    ],
    notes: ['Die rechtssichere Bewertung einer Patientenverfügung im Einsatz ist komplex und im Zweifel Aufgabe des Notarztes bzw. der Klinik.'],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'delegation-kompetenzabgrenzung',
    title: 'Delegation ärztlicher Maßnahmen – Abgrenzung RS vs. NotSan',
    category: 'Delegation & Kompetenz',
    minLevel: 'RS',
    summary: 'Warum bestimmte Maßnahmen nur mit ärztlicher Delegation durchgeführt werden dürfen.',
    sections: [
      {
        heading: 'Grundprinzip',
        facts: [
          { text: 'Invasive und medikamentöse Maßnahmen nach SAA/BPR sind grundsätzlich NotSan-Kompetenz mit ärztlicher Delegation durch die Ärztliche Leitung Rettungsdienst' },
        ],
      },
      {
        heading: 'RS-Kompetenz',
        facts: [
          { text: 'Nicht-invasive Basismaßnahmen, Beobachtung und Dokumentation' },
          { text: 'Unterstützung bei der Behandlung' },
          { text: 'Keine eigenständige Medikamentengabe, siehe Medikamente-Modul' },
        ],
      },
      {
        heading: 'Warum diese Trennung besteht',
        facts: [
          { text: 'Delegation setzt eine entsprechende Ausbildung und eine konkrete Freigabe durch die Ärztliche Leitung voraus' },
          { text: 'Ohne diese Freigabe ist eine Maßnahme auch für ausgebildetes Personal nicht zulässig' },
        ],
      },
      {
        heading: 'Regionale Unterschiede',
        facts: [
          { text: 'Welche Maßnahmen im Einzelnen delegiert sind, regelt die jeweilige Ärztliche Leitung Rettungsdienst. Das kann sich zwischen Bundesländern/Organisationen unterscheiden' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
  {
    id: 'dokumentation-einsatzprotokoll',
    title: 'Dokumentation: Einsatzprotokoll & DIVI-Protokoll',
    category: 'Dokumentation',
    minLevel: 'SanH',
    summary: 'Was in ein Einsatzprotokoll gehört und wofür das DIVI-Protokoll steht.',
    sections: [
      {
        heading: 'Zweck der Dokumentation',
        facts: [
          { text: 'Rechtliche Absicherung' },
          { text: 'Qualitätssicherung' },
          { text: 'Informationsweitergabe an Klinik/Notarzt' },
        ],
      },
      {
        heading: 'Was ins Einsatzprotokoll gehört',
        facts: [
          { text: 'Zeiten: Alarmierung, Eintreffen, Behandlungsbeginn, Transport, Übergabe' },
          { text: 'Patientendaten und Befunde, inkl. Vitalwerte im Verlauf' },
          { text: 'Durchgeführte Maßnahmen und Verlauf' },
          { text: 'Übergabe: an wen und wann' },
        ],
      },
      {
        heading: 'DIVI-Protokoll',
        facts: [
          { text: 'Bundesweit standardisiertes Notarzteinsatzprotokoll', minLevel: 'RS' },
          { text: 'Dokumentiert u. a. NACA-Score sowie Maßnahmen und Medikamente strukturiert', minLevel: 'RS' },
        ],
      },
      {
        heading: 'Grundsatz',
        facts: [
          { text: 'Zeitnah, vollständig und wahrheitsgemäß dokumentieren' },
          { text: 'Nachträgliche Änderungen müssen als solche erkennbar sein' },
        ],
      },
    ],
    sourceNote: GENERAL_SOURCE_NOTE,
  },
];

export function getRechtlicheGrundlagenTopicById(id: string): RechtlicheGrundlagenTopic | undefined {
  return RECHTLICHEGRUNDLAGEN_THEMEN.find((t) => t.id === id);
}
