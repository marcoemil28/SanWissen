import { useEffect, useMemo, useState } from 'react';
import { QUIZ_QUESTIONS } from './questions';
import { getProgress, pickWeighted, recordAttempt, resetProgress } from './progress';
import type { QuizQuestion } from './types';
import { ConfirmButton } from '../../components/ConfirmButton';
import { useNavigation } from '../NavigationContext';
import type { ModuleProps } from '../registry';
import { DisclaimerBox } from '../../components/SectionBox';

const MODULE_FILTERS = Array.from(new Map(QUIZ_QUESTIONS.map((q) => [q.moduleId, q.moduleTitle])).entries());

function pickQuestion(pool: QuizQuestion[], progress: ReturnType<typeof getProgress>, exclude?: string): QuizQuestion {
  return pickWeighted(pool, progress, exclude);
}

export function QuizModule({ onNavigateModule }: ModuleProps) {
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [progress, setProgress] = useState(getProgress);
  const { goTo } = useNavigation();

  const pool = useMemo(
    () => (moduleFilter === 'all' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter((q) => q.moduleId === moduleFilter)),
    [moduleFilter]
  );

  const [current, setCurrent] = useState<QuizQuestion>(() => pickQuestion(pool, progress));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sessionScore, setSessionScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    setCurrent(pickQuestion(pool, progress));
    setSelectedIndex(null);
    setSessionScore({ correct: 0, total: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter]);

  function handleAnswer(index: number) {
    if (selectedIndex !== null) return;
    setSelectedIndex(index);
    const wasCorrect = index === current.correctIndex;
    setSessionScore((s) => ({ correct: s.correct + (wasCorrect ? 1 : 0), total: s.total + 1 }));
    setProgress(recordAttempt(current.id, wasCorrect));
  }

  function nextQuestion() {
    setCurrent(pickQuestion(pool, progress, current.id));
    setSelectedIndex(null);
  }

  function handleReset() {
    setProgress(resetProgress());
  }

  function handleJump() {
    if (!current.itemId) return;
    goTo({ moduleId: current.moduleId, itemId: current.itemId });
    onNavigateModule?.(current.moduleId);
  }

  const stat = progress[current.id];
  const accuracy = stat && stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : null;

  return (
    <div className="module quiz-module-page">
      <header className="page-header">
        <h1>Prüfungsvorbereitung (Quiz)</h1>
      </header>

      <DisclaimerBox>
        Generalisierter Quiz-Modus über alle Themenmodule hinweg (Multiple-Choice, gewichtete Wiederholung wie
        beim EKG-Quiz). Kuratierter Startbestand an Fragen, kein Anspruch auf vollständige Abdeckung jedes
        einzelnen Eintrags.
      </DisclaimerBox>

      <div className="quiz-header">
        <select className="quiz-module-select" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
          <option value="all">Alle Module</option>
          {MODULE_FILTERS.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <div className="quiz-score">
          Session: {sessionScore.correct}/{sessionScore.total} richtig
        </div>
        <ConfirmButton label="Fortschritt zurücksetzen" className="secondary" onConfirm={handleReset} />
      </div>

      <p className="quiz-question">
        <span className="quiz-question-tag">
          {current.icon} {current.moduleTitle}
        </span>
        {current.question}
      </p>

      <div className="quiz-options">
        {current.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOpt = i === current.correctIndex;
          let cls = 'quiz-option';
          if (selectedIndex !== null) {
            if (isCorrectOpt) cls += ' correct';
            else if (isSelected) cls += ' incorrect';
          }
          return (
            <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={selectedIndex !== null}>
              {opt}
            </button>
          );
        })}
      </div>

      {selectedIndex !== null && (
        <div className="quiz-feedback">
          {current.explanation && <p className="clinical-note">{current.explanation}</p>}
          {accuracy !== null && (
            <p className="stat-line">
              Deine Trefferquote bei dieser Frage: {accuracy}% ({stat!.correct}/{stat!.attempts})
            </p>
          )}
          <div className="quiz-feedback-actions">
            {current.itemId && (
              <button className="secondary" onClick={handleJump}>
                Zum Eintrag springen
              </button>
            )}
            <button className="primary" onClick={nextQuestion}>
              Nächste Frage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
