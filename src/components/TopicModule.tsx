import { useEffect, useMemo, useState, type ReactNode } from 'react';
import modulesContent from '../../content/modules.json';
import { topicModuleById, type RawTopic } from '../app/content';
import { useNavigation } from '../app/NavigationContext';
import { FavoriteButton } from './FavoriteButton';
import { SectionIllustration } from './SectionIllustration';
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
  const [selectedId, setSelectedId] = useState(topics[0].id);
  const { pending, clearPending } = useNavigation();

  // Module ohne Kategorien bestehen aus einem einzigen Thema und brauchen
  // weder Liste noch Favoriten-Stern (der Modul-Link führt ohnehin dorthin).
  const isSingle = mod.categoryOrder.length === 0;
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

  const selected = topics.find((t) => t.id === selectedId) ?? topics[0];

  const detail = (
    <TopicDetail
      topic={selected}
      moduleId={moduleId}
      heading={heading}
      icon={icon}
      notesHeading={notesHeading}
      withFavorite={!isSingle}
    />
  );

  return (
    <div className={`module ${moduleId}-module`}>
      <header className="module-header">
        <h1>{heading}</h1>
      </header>

      <div className="med-disclaimer">
        ℹ️ {disclaimer} Inhaltlicher Stand: {formatStand(mod.contentStand ?? '')}.
      </div>

      {isSingle ? (
        detail
      ) : (
        <div className="med-layout">
          <aside className="med-list">
            {mod.categoryOrder
              .filter((category) => grouped.has(category))
              .map((category) => (
                <div key={category} className="med-group">
                  <h4>{category}</h4>
                  <ul>
                    {grouped.get(category)!.map((topic) => (
                      <li key={topic.id}>
                        <button
                          className={topic.id === selectedId ? 'active' : ''}
                          onClick={() => setSelectedId(topic.id)}
                        >
                          {topic.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </aside>
          {detail}
        </div>
      )}
    </div>
  );
}
