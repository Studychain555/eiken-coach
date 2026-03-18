import { create } from 'zustand';
import type { ListeningQuestion } from '@/src/lib/listeningData';

export interface ListeningAttempt {
  id: string;
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  createdAt: Date;
}

export interface ListeningProgress {
  questionId: string;
  isCompleted: boolean;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
  completedAt: Date | null;
}

interface ListeningState {
  // 問題データ
  questions: ListeningQuestion[];
  setQuestions: (questions: ListeningQuestion[]) => void;

  // 現在の学習状態
  currentQuestion: ListeningQuestion | null;
  setCurrentQuestion: (question: ListeningQuestion | null) => void;

  currentAttempt: {
    questionId: string;
    selectedAnswer: number | null;
    answered: boolean;
  } | null;

  // 進捗データ
  progress: Record<string, ListeningProgress>;
  loadProgress: (data: Record<string, ListeningProgress>) => void;

  // 試行履歴
  attempts: ListeningAttempt[];

  // 操作
  selectAnswer: (questionId: string, answerIndex: number) => void;
  moveToQuestion: (question: ListeningQuestion) => void;
  recordAttempt: (
    questionId: string,
    selectedAnswer: number,
    isCorrect: boolean
  ) => void;
  resetCurrentQuestion: () => void;

  // 統計
  completedCount: number;
  totalCount: number;
  correctCount: number;
  getAccuracy: () => number;
  getTodayStats: () => { attempted: number; correct: number; accuracy: number };
}

export const useListeningStore = create<ListeningState>((set, get) => ({
  questions: [],
  setQuestions: (questions) =>
    set({
      questions,
      totalCount: questions.length,
    }),

  currentQuestion: null,
  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  currentAttempt: null,

  progress: {},
  loadProgress: (data) => set({ progress: data }),

  attempts: [],

  selectAnswer: (questionId, answerIndex) => {
    set({
      currentAttempt: {
        questionId,
        selectedAnswer: answerIndex,
        answered: true,
      },
    });
  },

  moveToQuestion: (question) => {
    set({
      currentQuestion: question,
      currentAttempt: {
        questionId: question.id,
        selectedAnswer: null,
        answered: false,
      },
    });
  },

  recordAttempt: (questionId, selectedAnswer, isCorrect) => {
    const { attempts, progress } = get();

    const newAttempt: ListeningAttempt = {
      id: `attempt_${Date.now()}`,
      questionId,
      selectedAnswer,
      isCorrect,
      createdAt: new Date(),
    };

    const newAttempts = [...attempts, newAttempt];
    const newProgress = {
      ...progress,
      [questionId]: {
        questionId,
        isCompleted: true,
        selectedAnswer,
        isCorrect,
        completedAt: new Date(),
      },
    };

    set({
      attempts: newAttempts,
      progress: newProgress,
      completedCount: Object.values(newProgress).filter((p) => p.isCompleted)
        .length,
      correctCount: newAttempts.filter((a) => a.isCorrect).length,
    });
  },

  resetCurrentQuestion: () => {
    set({
      currentQuestion: null,
      currentAttempt: null,
    });
  },

  completedCount: 0,
  totalCount: 0,
  correctCount: 0,

  getAccuracy: () => {
    const { attempts } = get();
    if (attempts.length === 0) return 0;
    return (
      Math.round(
        (attempts.filter((a) => a.isCorrect).length / attempts.length) * 100
      ) || 0
    );
  },

  getTodayStats: () => {
    const { attempts } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttempts = attempts.filter((a) => {
      const date = new Date(a.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    const correct = todayAttempts.filter((a) => a.isCorrect).length;
    const attempted = todayAttempts.length;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    return {
      attempted,
      correct,
      accuracy: Math.round(accuracy),
    };
  },
}));
