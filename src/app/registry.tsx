import type { ComponentType } from 'react';
import { EkgModule } from '../modules/ekg/EkgModule';
import { MedikamenteModule } from '../modules/medikamente/MedikamenteModule';
import { AlgorithmenModule } from '../modules/algorithmen/AlgorithmenModule';
import { AnatomieModule } from '../modules/anatomie/AnatomieModule';
import { WerkzeugeModule } from '../modules/werkzeuge/WerkzeugeModule';
import { TraumatologieModule } from '../modules/traumatologie/TraumatologieModule';
import { MedikamentenvorbereitungModule } from '../modules/medikamentenvorbereitung/MedikamentenvorbereitungModule';
import { SanitaetsdienstModule } from '../modules/sanitaetsdienst/SanitaetsdienstModule';
import { InternistischeNotfaelleModule } from '../modules/internistischenotfaelle/InternistischeNotfaelleModule';
import { PaediatrieModule } from '../modules/paediatrie/PaediatrieModule';
import { PsychiatrieNotfaelleModule } from '../modules/psychiatrienotfaelle/PsychiatrieNotfaelleModule';
import { RettungstechnikModule } from '../modules/rettungstechnik/RettungstechnikModule';
import { RechtlicheGrundlagenModule } from '../modules/rechtlichegrundlagen/RechtlicheGrundlagenModule';
import { GlossarModule } from '../modules/glossar/GlossarModule';
import { QuizModule } from './quiz/QuizModule';
import { ChecklistenModule } from '../modules/checklisten/ChecklistenModule';
import { CheatSheetModule } from '../modules/cheatsheet/CheatSheetModule';
import { GeprueftModule } from '../modules/geprueft/GeprueftModule';

import modulesContent from '../../content/modules.json';

/**
 * Thematische Kategorien für die Sidebar-Gruppierung. Ersetzt die frühere
 * Gruppierung nach Qualifikationsstufe (SanH/RS/NotSan) — die Inhalte
 * bleiben für alle einsehbar, die Navigation richtet sich jetzt nach Thema
 * statt nach Kompetenzstufe.
 */
export type ModuleCategory =
  | 'Grundlagenwissen'
  | 'Krankheitsbilder & Algorithmen'
  | 'Medikamente'
  | 'Diagnostik & Training'
  | 'Einsatz & Organisation';

export const MODULE_CATEGORIES: ModuleCategory[] = [
  'Grundlagenwissen',
  'Krankheitsbilder & Algorithmen',
  'Medikamente',
  'Diagnostik & Training',
  'Einsatz & Organisation',
];

/**
 * Optionale Props, die jede Modul-Hauptkomponente erhalten kann. Module, die
 * keinen modulübergreifenden Wechsel benötigen, ignorieren `onNavigateModule`
 * einfach (z. B. indem sie gar keine Props deklarieren).
 */
export interface ModuleProps {
  onNavigateModule?: (moduleId: string) => void;
}

export interface LearningModule {
  id: string;
  title: string;
  icon: string;
  status: 'available' | 'coming-soon';
  component?: ComponentType<ModuleProps>;
  /** Thematische Kategorie für die Sidebar-Gruppierung. Wird bei `pinned: true` ignoriert. */
  category: ModuleCategory;
  /**
   * Erscheint fest oben in der Sidebar (direkt unter der Startseite) statt
   * in einer Themen-Gruppe — für Module, die kategorieübergreifend gleich
   * relevant sind (z. B. Werkzeuge & Scores).
   */
  pinned?: boolean;
}

/**
 * Zentrale Modul-Registry.
 *
 * Um ein neues Lernmodul hinzuzufügen:
 * 1. Neuen Ordner unter src/modules/<name>/ anlegen.
 * 2. Eine Hauptkomponente exportieren (siehe modules/ekg/EkgModule.tsx als Vorlage).
 * 3. Hier einen Eintrag mit status: 'available' und component hinzufügen.
 */
/**
 * Zuordnung Modul-ID → Hauptkomponente. Titel, Icon, Kategorie und
 * Anpinnung stehen in `content/modules.json`; hier bleibt nur die
 * Verdrahtung, die sich nicht als Inhalt ausdrücken lässt.
 */
const COMPONENTS: Record<string, ComponentType<ModuleProps>> = {
  ekg: EkgModule,
  algorithmen: AlgorithmenModule,
  medikamente: MedikamenteModule,
  anatomie: AnatomieModule,
  werkzeuge: WerkzeugeModule,
  traumatologie: TraumatologieModule,
  medikamentenvorbereitung: MedikamentenvorbereitungModule,
  sanitaetsdienst: SanitaetsdienstModule,
  internistischenotfaelle: InternistischeNotfaelleModule,
  paediatrie: PaediatrieModule,
  psychiatrienotfaelle: PsychiatrieNotfaelleModule,
  rettungstechnik: RettungstechnikModule,
  rechtlichegrundlagen: RechtlicheGrundlagenModule,
  glossar: GlossarModule,
  quiz: QuizModule,
  checklisten: ChecklistenModule,
  cheatsheet: CheatSheetModule,
  geprueft: GeprueftModule,
};

/**
 * Zentrale Modul-Registry, zusammengesetzt aus `content/modules.json` und
 * der Komponenten-Zuordnung oben.
 *
 * Um ein neues Lernmodul hinzuzufügen:
 * 1. Neuen Ordner unter src/modules/<name>/ anlegen.
 * 2. Eine Hauptkomponente exportieren (siehe modules/ekg/EkgModule.tsx als Vorlage).
 * 3. In content/modules.json eintragen und hier in COMPONENTS verdrahten.
 */
export const MODULES: LearningModule[] = modulesContent.modules.map((m) => ({
  id: m.id,
  title: m.title,
  icon: m.icon,
  status: m.available ? 'available' : 'coming-soon',
  component: COMPONENTS[m.id],
  category: m.category as ModuleCategory,
  pinned: m.pinned,
}));
