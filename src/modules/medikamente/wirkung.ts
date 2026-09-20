/**
 * Kurze, laienverständliche Wirkungsbeschreibungen ("was macht das Medikament
 * im Körper und warum hilft das hier").
 *
 * WICHTIG: Diese Texte stammen NICHT aus dem SAA/BPR-PDF (dort steht nur
 * "Arzneimittelgruppe", keine erklärende Wirkbeschreibung), sondern sind
 * allgemeines pharmakologisches Grundwissen, das hier ergänzt wurde, um
 * Indikationen besser einordnen zu können. Bei Detailfragen zählt die
 * Fachinformation des jeweiligen Präparats.
 */
export const WIRKUNG: Record<string, string> = {
  'acetylsalicylsaeure-ass':
    'Hemmt die Verklumpung der Blutplättchen (Thrombozytenaggregation) und wirkt dadurch gerinnungshemmend. Verhindert, dass ein Blutgerinnsel im Herzkranzgefäß weiterwächst.',
  amiodaron:
    'Stabilisiert die elektrische Erregungsleitung am Herzen (Klasse-III-Antiarrhythmikum) und hilft, lebensbedrohliche Kammerrhythmusstörungen zu durchbrechen.',
  atropin:
    'Blockiert den dämpfenden Einfluss des Parasympathikus (Vagus) auf das Herz und lässt dadurch die Herzfrequenz ansteigen.',
  butylscopolamin:
    'Löst Krämpfe der glatten Muskulatur, u. a. im Magen-Darm-Trakt, und lindert dadurch kolikartige Bauchschmerzen.',
  dimenhydrinat: 'Blockiert Histamin-Rezeptoren im Brechzentrum des Gehirns und wirkt dadurch gegen Übelkeit und Erbrechen.',
  dimetinden: 'Blockiert Histamin-Rezeptoren und mildert dadurch allergische Reaktionen, z. B. begleitend bei Anaphylaxie.',
  'epinephrin-adrenalin':
    'Wirkt an Alpha- und Beta-Rezeptoren: verengt Blutgefäße, steigert Herzfrequenz und -kraft und erweitert die Bronchien. Zentrales Medikament bei Reanimation, Anaphylaxie und instabiler Bradykardie.',
  esketamin:
    'Wirkt stark schmerzstillend (niedrig dosiert) bis narkotisierend (höher dosiert) und regt dabei. Anders als viele andere Narkosemittel. Den Kreislauf eher an, statt ihn zu dämpfen.',
  fentanyl: 'Sehr potentes Opioid, wirkt stark schmerzstillend über µ-Opioidrezeptoren, mit schnellem Wirkeintritt und kurzer Wirkdauer.',
  furosemid:
    'Schleifendiuretikum, entwässert stark und schnell über die Niere. Entlastet das Herz bei Lungenödem durch Volumenreduktion.',
  glucagon:
    'Körpereigenes Hormon, setzt Zuckerreserven aus der Leber frei (Glykogenolyse) und hebt dadurch den Blutzucker an. Alternative zu Glucose i.v., z. B. wenn kein venöser Zugang gelingt.',
  glucose: 'Führt dem Körper direkt Traubenzucker zu und hebt den Blutzucker unmittelbar an. Therapie der Hypoglykämie.',
  glyceroltrinitrat:
    'Organisches Nitrat, erweitert vor allem die venösen Gefäße, senkt dadurch die Vorlast des Herzens und den Blutdruck. Entlastet das Herz bei Lungenödem/Angina pectoris.',
  heparin:
    'Verstärkt die Wirkung von Antithrombin und hemmt dadurch die Blutgerinnung. Verhindert das Weiterwachsen von Blutgerinnseln, z. B. beim akuten Koronarsyndrom.',
  ibuprofen:
    'Nichtsteroidales Schmerzmittel (NSAR), hemmt die Cyclooxygenase und wirkt dadurch schmerzstillend, fiebersenkend und entzündungshemmend.',
  ipratropiumbromid:
    'Blockiert Acetylcholin-Rezeptoren in den Bronchien und wirkt dadurch bronchienerweiternd. Ergänzt Salbutamol bei Atemwegsverengung.',
  lidocain: 'Stabilisiert die Zellmembranen der Herzmuskelzellen (Klasse-Ib-Antiarrhythmikum). Alternative zu Amiodaron bei defibrillierbaren Rhythmen.',
  metoprolol: 'Betablocker, senkt Herzfrequenz und myokardialen Sauerstoffbedarf. Bei bestimmten tachykarden Rhythmusstörungen im Rahmen eines Herzinfarkts.',
  midazolam:
    'Benzodiazepin, wirkt beruhigend, angstlösend und krampflösend über GABA-Rezeptoren im Gehirn. U. a. bei Krampfanfällen und zur Sedierung.',
  morphin:
    'Starkes Opioid, wirkt schmerzstillend über µ-Opioidrezeptoren und senkt zusätzlich über eine venöse Gefäßerweiterung die Vorlast des Herzens.',
  nalbuphin:
    'Opioid mit „Ceiling-Effekt“ (Partialagonist/-antagonist), wirkt stark schmerzstillend bei tendenziell geringerem Atemdepressions-Risiko als reine µ-Agonisten.',
  naloxon: 'Verdrängt Opioide von ihren Rezeptoren (Antagonist) und hebt dadurch eine opioidbedingte Atemdepression akut auf.',
  paracetamol:
    'Wirkt zentral schmerzstillend und fiebersenkend (genauer Mechanismus nicht vollständig geklärt). Alternative zu NSAR ohne deren Magen-/Blutungsrisiko.',
  prednisolon:
    'Glukokortikoid, dämpft überschießende Immun- und Entzündungsreaktionen. Bei Anaphylaxie und Bronchialobstruktion, Wirkung setzt verzögert ein.',
  salbutamol: 'β2-Sympathomimetikum, entspannt die glatte Muskulatur der Bronchien und wirkt dadurch bronchienerweiternd.',
  sauerstoff: 'Erhöht den Sauerstoffpartialdruck im Blut und verbessert die Gewebeoxygenierung. Basistherapie bei Hypoxämie.',
  tranexamsaeure:
    'Antifibrinolytikum, hemmt den körpereigenen Abbau von Blutgerinnseln (Fibrinolyse) und reduziert dadurch den Blutverlust bei schweren Traumablutungen.',
  urapidil: 'Blockiert Alpha-1-Rezeptoren und wirkt dadurch gefäßerweiternd/blutdrucksenkend, mit zusätzlicher zentral dämpfender Komponente.',
  'vollelektrolytloesung-vel': 'Kristalloide Infusionslösung, füllt das Gefäßvolumen auf und ersetzt Flüssigkeits-/Elektrolytverluste.',
};
