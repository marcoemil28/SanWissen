import raw from '../../../content/quiz.json';
import type { QuizQuestion } from './types';

/**
 * Kuratierter Startbestand an Quizfragen, module- und itemId-verknüpft mit den
 * jeweiligen Themenmodulen. Kein Anspruch auf vollständige Abdeckung jedes
 * einzelnen Eintrags — wachsender Fragenpool, der bei Bedarf ergänzt werden kann.
 */
export const QUIZ_QUESTIONS = raw.questions as unknown as QuizQuestion[];
