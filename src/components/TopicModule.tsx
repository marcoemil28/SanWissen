import { useEffect, useMemo, useState, type ReactNode } from 'react';
import modulesContent from '../../content/modules.json';
import { topicModuleById, type RawTopic } from '../app/content';
import { useNavigation } from '../app/NavigationContext';
import { FavoriteButton } from './FavoriteButton';
import { SectionIllustration } from './SectionIllustration';
import { DisclaimerBox, RowGroup, RowLink, SectionBox } from './SectionBox';
import { formatStand } from '../app/formatDate';

/**
 * Gemeinsame Ansicht für die zehn Themenmodule.
 *
 * Bis 1.1.0 hatte jedes Modul einen eigenen Renderer von rund 120 Zeilen,
 * von denen gut die Hälfte identisch war. Die iOS-App kam für dieselben
 * Module mit einer einzigen Ansicht aus; das ist hier nachgezogen.
 *
 * Was sich zwischen den Modulen unterscheidet, steht in den Inhalten:
 * Kategorien und ihre Reihenfolge, der Stand, die Seitenzahl je Eintrag.
 * Als Eigenschaft bleibt nur, was Text im Code ist.
 *
 * Seit der Angleichung an iOS zeigt das Modul zuerst nur die Themenliste;
 * ein Thema öffnet sich als eigene Seite mit Zurück-Schaltfläche. Vorher
 * standen Liste und Inhalt nebeneinander, was auf einem Telefon nicht
 * aufgeht und auf dem iPad auch nicht dem entspricht, was die iOS-App
 * macht.
 */
interface TopicModuleProps {
  /** Muss zu einer Datei `content/topics-<moduleId>.json` passen. */
  moduleId: string;
  /** Überschrift der Seite; zugleich der Modulname in den Favoriten. */
  heading: string;
  /** Hinweisblock über der Liste, mit Quellenlage und Stand. */
  disclaimer: ReactNode;
  /** Überschrift über `notes`. Die Schemamodule nennen das „Hinweise". */
  notesHeading?: string;
}

function TopicDetail({
  topic,
  moduleId,
  heading,
  icon,
  notesHeading,
  withFavorite,
}: {
  topic: RawTopic;
  moduleId: string;
  heading: string;
  icon: string;
  notesHeading: string;
  withFavorite: boolean;
}) {
  return (
    <div className="algo-detail">
      <div className="algo-detail-header">
        <div>
          <h2>
            {topic.title}
            {withFavorite && (
              <>
                {' '}
                <FavoriteButton
                  moduleId={moduleId}
                  itemId={topic.id}
                  title={topic.title}
                  moduleTitle={heading}
                  icon={icon}
                />
              </>
            )}
          </h2>
          <p className="algo-summary">{topic.summary}</p>
        </div>
        {topic.page && <span className="med-page-ref">SAA und BPR 2025, S. {topic.page}</span>}
      </div>

      {topic.sections.map((section, i) => (
        <div key={i} className="algo-section">
          {section.heading && <h4>{section.heading}</h4>}
          <SectionIllustration id={section.illustration ?? undefined} />
          <ul>
            {section.items.map((item, j) => (
              <li key={j}>{item.text}</li>
            ))}
          </ul>
        </div>
      ))}

      {topic.notes && topic.notes.length > 0 && (
        <div className="algo-notes">
          <h4>{notesHeading}</h4>
          <ul>
            {topic.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {topic.sourceNote && <p className="algo-source-note">ℹ️ {topic.sourceNote}</p>}
    </div>
  );
}

export function TopicModule({ moduleId, heading, disclaimer, notesHeading = 'Hinweise' }: TopicModuleProps) {
  const mod = topicModuleById(moduleId);
  const topics = mod.topics;
  const { pending, clearPending } = useNavigation();

  // Module ohne Kategorien bestehen aus einem einzigen Thema und brauchen
  // weder Liste noch Favoriten-Stern (der Modul-Link führt ohnehin dorthin).
  const isSingle = mod.categoryOrder.length === 0;
  const [selectedId, setSelectedId] = useState<string | null>(isSingle ? topics[0].id : null);
  const icon = modulesContent.modules.find((m) => m.id === moduleId)?.icon ?? '';

  useEffect(() => {
    if (pending?.moduleId === moduleId && pending.itemId && topics.some((t) => t.id === pending.itemId)) {
      setSelectedId(pending.itemId);
      clearPending();
    }
  }, [pending, clearPending, moduleId, topics]);

  const grouped = useMemo(() => {
    const map = new Map<string, RawTopic[]>();
    for (const topic of topics) {
      const key = topic.category ?? '';
      const list = map.get(key) ?? [];
      list.push(topic);
      map.set(key, list);
    }
    return map;
  }, [topics]);

  const selected = selectedId ? topics.find((t) => t.id === selectedId) ?? null : null;

  if (selected) {
    return (
      <div className={`module ${moduleId}-module`}>
        {!isSingle && (
          <button type="button" className="back-link" onClick={() => setSelectedId(null)}>
            <span aria-hidden="true">‹</span> {heading}
          </button>
        )}

        {isSingle && (
          <header className="page-header">
            <h1>{heading}</h1>
          </header>
        )}

        <TopicDetail
          topic={selected}
          moduleId={moduleId}
          heading={heading}
          icon={icon}
          notesHeading={notesHeading}
          withFavorite={!isSingle}
        />
      </div>
    );
  }

  return (
    <div className={`module ${moduleId}-module`}>
      <header className="page-header">
        <h1>{heading}</h1>
      </header>

      <DisclaimerBox>{disclaimer} Inhaltlicher Stand: {formatStand(mod.contentStand ?? '')}.</DisclaimerBox>

      {mod.categoryOrder
        .filter((category) => grouped.has(category))
        .map((category) => (
          <SectionBox key={category} title={category}>
            <RowGroup>
              {grouped.get(category)!.map((topic) => (
                <RowLink
                  key={topic.id}
                  title={topic.title}
                  subtitle={topic.summary}
                  onClick={() => setSelectedId(topic.id)}
                />
              ))}
            </RowGroup>
          </SectionBox>
        ))}
    </div>
  );
}
