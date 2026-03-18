import { create } from 'zustand';
import type { VocabularyWord } from '@/src/lib/vocabularyData';
import type { SM2State } from '@/src/lib/sm2Algorithm';
import { calculateSM2 } from '@/src/lib/sm2Algorithm';

export interface VocabularyProgress {
  wordId: string;
  correctStreak: number;
  isMastered: boolean;
  nextReviewAt: Date | null;
  lastReviewedAt: Date | null;
  state: SM2State;
}

interface VocabularyState {
  // 単語データ
  words: VocabularyWord[];
  setWords: (words: VocabularyWord[]) => void;

  // 進捗データ
  progress: Record<string, VocabularyProgress>;
  loadProgress: (data: Record<string, VocabularyProgress>) => void;

  // 現在のテスト
  currentStage: number;
  setCurrentStage: (stage: number) => void;

  currentWord: VocabularyWord | null;
  setCurrentWord: (word: VocabularyWord | null) => void;

  currentOptions: { word: string; isCorrect: boolean }[];
  setCurrentOptions: (options: { word: string; isCorrect: boolean }[]) => void;

  testHistory: {
    wordId: string;
    isCorrect: boolean;
    selectedAnswer: string;
    timestamp: Date;
  }[];

  // テスト操作
  selectAnswer: (selectedAnswer: string) => void;
  moveToNextWord: (nextWord: VocabularyWord, options: { word: string; isCorrect: boolean }[]) => void;
  resetTest: () => void;

  // 統計
  masteredCount: number;
  totalCount: number;
  getTodayStats: () => { attempted: number; correct: number; accuracy: number };
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  words: [],
  setWords: (words) => set({ words, totalCount: words.length }),

  progress: {},
  loadProgress: (data) => set({ progress: data }),

  currentStage: 1,
  setCurrentStage: (stage) => set({ currentStage: stage }),

  currentWord: null,
  setCurrentWord: (word) => set({ currentWord: word }),

  currentOptions: [],
  setCurrentOptions: (options) => set({ currentOptions: options }),

  testHistory: [],

  selectAnswer: (selectedAnswer) => {
    const { currentWord, currentOptions, testHistory, progress } = get();
    if (!currentWord) return;

    const isCorrect = currentOptions.find(
      (opt) => opt.word === selectedAnswer && opt.isCorrect
    ) !== undefined;

    // 進捗を更新
    const currentProgress = progress[currentWord.id] || {
      wordId: currentWord.id,
      correctStreak: 0,
      isMastered: false,
      nextReviewAt: null,
      lastReviewedAt: new Date(),
      state: {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    };

    const sm2Result = calculateSM2(
      isCorrect,
      isCorrect ? 5 : 1,
      currentProgress.state
    );

    // テスト履歴に追加
    const newHistory = [
      ...testHistory,
      {
        wordId: currentWord.id,
        isCorrect,
        selectedAnswer,
        timestamp: new Date(),
      },
    ];

    set({
      testHistory: newHistory,
      progress: {
        ...progress,
        [currentWord.id]: {
          ...currentProgress,
          correctStreak: isCorrect ? currentProgress.correctStreak + 1 : 0,
          isMastered: sm2Result.isMastered,
          nextReviewAt: sm2Result.nextReviewDate,
          lastReviewedAt: new Date(),
          state: sm2Result.newState,
        },
      },
      masteredCount: Object.values({
        ...progress,
        [currentWord.id]: {
          ...currentProgress,
          isMastered: sm2Result.isMastered,
        },
      }).filter((p) => p.isMastered).length,
    });
  },

  moveToNextWord: (nextWord, options) => {
    set({
      currentWord: nextWord,
      currentOptions: options,
    });
  },

  resetTest: () => {
    set({
      currentWord: null,
      currentOptions: [],
      testHistory: [],
    });
  },

  masteredCount: 0,
  totalCount: 0,

  getTodayStats: () => {
    const { testHistory } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayHistory = testHistory.filter((h) => {
      const date = new Date(h.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    const correct = todayHistory.filter((h) => h.isCorrect).length;
    const attempted = todayHistory.length;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    return { attempted, correct, accuracy: Math.round(accuracy) };
  },
}));
