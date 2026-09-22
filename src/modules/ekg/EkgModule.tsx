import { useEffect, useState } from 'react';
import { StudyMode } from './StudyMode';
import { QuizMode } from './QuizMode';
import { ProgressView } from './ProgressView';
import { ElectrodesTab } from './electrodes/ElectrodesTab';
import { useNavigation } from '../../app/NavigationContext';

type Tab = 'study' | 'electrodes' | 'quiz' | 'progress';

export function EkgModule() {
  const [tab, setTab] = useState<Tab>('study');
  const { pending, clearPending } = useNavigation();

  useEffect(() => {
    if (pending?.moduleId === 'ekg') {
      setTab('study');
      if (!pending.itemId) clearPending();
    }
  }, [pending, clearPending]);

  return (
    <div className="module ekg-module">
      <header className="page-header">
        <h1>EKG-Trainer</h1>
        <nav className="tab-bar">
          <button className={tab === 'study' ? 'active' : ''} onClick={() => setTab('study')}>
            Lernen
          </button>
          <button className={tab === 'electrodes' ? 'active' : ''} onClick={() => setTab('electrodes')}>
            Elektroden legen
          </button>
          <button className={tab === 'quiz' ? 'active' : ''} onClick={() => setTab('quiz')}>
            Quiz
          </button>
          <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>
            Fortschritt
          </button>
        </nav>
      </header>

      {tab === 'study' && <StudyMode />}
      {tab === 'electrodes' && <ElectrodesTab />}
      {tab === 'quiz' && <QuizMode />}
      {tab === 'progress' && <ProgressView />}
    </div>
  );
}
