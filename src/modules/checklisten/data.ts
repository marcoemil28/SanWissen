import type { Checklist } from './types';

const GENERAL_SOURCE_NOTE =
  'Abgeleitet aus den entsprechenden Themenmodulen dieser App. Als praktische Checkliste für den echten ' +
  'Dienst gedacht, nicht als vollständiger Ersatz für die ausführliche Handlungsanweisung dort.';

export const CHECKLISTEN: Checklist[] = [
  {
    id: 'notfallrucksack-check',
    title: 'Notfallrucksack-Check (Dienstbeginn)',
    description: 'Vollständigkeitsprüfung des Notfallrucksacks vor Dienstantritt.',
    items: [
      { id: '1', text: 'Handschuhe und Verbandsmaterial vollständig?' },
      { id: '2', text: 'Beatmungsbeutel/-maske vorhanden und vollständig?' },
      { id: '3', text: 'Absauggerät funktionsfähig?' },
      { id: '4', text: 'Blutdruckmessgerät und Stethoskop vorhanden?' },
      { id: '5', text: 'Sauerstoff ausreichend gefüllt?' },
      { id: '6', text: 'Guedel-/Wendl-Tuben in allen Größen vorhanden?' },
      { id: '7', text: 'Verfallsdaten von Medikamenten/sterilem Material geprüft?' },
      { id: '8', text: 'Inventarliste mit Ist-Bestand abgeglichen?' },
    ],
    sourceNote: GENERAL_SOURCE_NOTE + ' Siehe Rettungstechnik-Modul: „Notfallrucksack & Checkliste".',
  },
  {
    id: 'reanimation-erwachsene-ablauf',
    title: 'Reanimation Erwachsene – Ablauf (BLS)',
    description: 'Basismaßnahmen der Erwachsenenreanimation, Schritt für Schritt.',
    items: [
      { id: '1', text: 'Eigenschutz geprüft?' },
      { id: '2', text: 'Bewusstsein geprüft (Ansprechen, Rütteln)?' },
      { id: '3', text: 'Atemweg freigemacht (Kopf überstreckt)?' },
      { id: '4', text: 'Atemkontrolle max. 10 Sekunden durchgeführt?' },
      { id: '5', text: 'Notruf 112 veranlasst (lassen)?' },
      { id: '6', text: 'Herzdruckmassage begonnen (Frequenz 100–120/min, Tiefe 5–6 cm)?' },
      { id: '7', text: 'Verhältnis 30:2 (Kompression:Beatmung) eingehalten, sofern Beatmung möglich?' },
      { id: '8', text: 'AED sobald verfügbar angelegt?' },
    ],
    sourceNote: GENERAL_SOURCE_NOTE + ' Siehe Algorithmen-Modul: „Reanimation Erwachsene (BLS → ALS)".',
  },
  {
    id: 'manv-sichtung-ablauf',
    title: 'MANV – Sichtungsablauf',
    description: 'Schritte der Sichtung bei einem Massenanfall von Verletzten.',
    items: [
      { id: '1', text: 'Eigenschutz und Lageübersicht verschafft?' },
      { id: '2', text: 'Gehfähige Patienten zum Sammelpunkt geleitet (SK III)?' },
      { id: '3', text: 'Atmung nach Freimachen der Atemwege geprüft?' },
      { id: '4', text: 'Atemfrequenz beurteilt (< 10 oder > 29/min → SK I)?' },
      { id: '5', text: 'Kreislauf beurteilt (Rekapillarisierungszeit/Radialispuls)?' },
      { id: '6', text: 'Bewusstsein beurteilt (folgt Aufforderungen?)?' },
      { id: '7', text: 'Sichtungskategorie gekennzeichnet (Sichtungskarte/-anhänger)?' },
      { id: '8', text: 'Nachsichtung eingeplant?' },
    ],
    sourceNote: GENERAL_SOURCE_NOTE + ' Siehe Sanitätsdienst-Modul: „MANV & Sichtung (Triage)".',
  },
  {
    id: 'notgeburt-ablauf-checkliste',
    title: 'Notgeburt – Ablauf-Checkliste',
    description: 'Schritte bei einer Geburt ohne rechtzeitigen Klinik-Transport.',
    items: [
      { id: '1', text: 'Notarzt nachgefordert?' },
      { id: '2', text: 'Ruhe bewahrt, Sichtschutz/Privatsphäre geschaffen?' },
      { id: '3', text: 'Mutter in geeigneter Position (halbsitzend/liegend, Beine angewinkelt)?' },
      { id: '4', text: 'Sauberes Material bereitgelegt?' },
      { id: '5', text: 'Kopf beim Durchtritt vorsichtig unterstützt, nicht gezogen?' },
      { id: '6', text: 'Nabelschnur um den Hals kontrolliert?' },
      { id: '7', text: 'Kind abgetrocknet und warmgehalten?' },
      { id: '8', text: 'Atmung/Reaktion des Kindes geprüft?' },
      { id: '9', text: 'Abgenabelt (erst wenn Nabelschnur nicht mehr pulsiert)?' },
      { id: '10', text: 'Plazentageburt abgewartet, nicht gezogen?' },
      { id: '11', text: 'Fundusstand/Blutungsmenge der Mutter beobachtet?' },
    ],
    sourceNote: GENERAL_SOURCE_NOTE + ' Siehe Pädiatrie-Modul: „Notgeburt — Ablauf für den Sanitätsdienst".',
  },
  {
    id: 'uebergabe-sinnhaft-checkliste',
    title: 'Übergabe (SINNHAFT) – Checkliste',
    description: 'Strukturierte mündliche Übergabe am Zielort, Punkt für Punkt.',
    items: [
      { id: '1', text: 'S – Start: Ruhe, Face-to-Face-Kommunikation hergestellt?' },
      { id: '2', text: 'I – Identifikation: Geschlecht, Name, Alter genannt?' },
      { id: '3', text: 'N – Notfallereignis: Was, Wie, Wann genannt?' },
      { id: '4', text: 'N – Notfallpriorität nach xABCDE benannt?' },
      { id: '5', text: 'H – Handlung: durchgeführte Maßnahmen genannt?' },
      { id: '6', text: 'A – Anamnese: Allergien, Medikation, Vorerkrankungen genannt?' },
      { id: '7', text: 'F – Fazit vom aufnehmenden Personal wiederholt?' },
      { id: '8', text: 'T – Raum für Teamfragen gegeben?' },
    ],
    sourceNote: GENERAL_SOURCE_NOTE + ' Siehe Algorithmen-Modul: „Übergabe – SINNHAFT".',
  },
];

export function getChecklistById(id: string): Checklist | undefined {
  return CHECKLISTEN.find((c) => c.id === id);
}
