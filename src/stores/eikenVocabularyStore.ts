/**
 * EIKEN Vocabulary Store (Extended)
 * Zustand store for EIKEN vocabulary testing with level selection
 */

import { create } from 'zustand';
import { EIKENLevel, EIKENLevelLabels } from '@/src/lib/eiken-vocabulary-schema';
import { EIKENVocabWord, getVocabularyByLevel } from '@/src/lib/eiken-vocabulary-data';
import { calculateSM2 } from '@/src/lib/sm2Algorithm';
import type { SM2State } from '@/src/lib/sm2Algorithm';

export interface EIKENVocabProgress {
  wordId: string;
  correctCount: number;
  totalAttempts: number;
  lastAttemptAt: Date | null;
  isMastered: boolean;
  sm2State: SM2State;
}

interface EIKENVocabState {
  // Level Selection
  selectedLevel: EIKENLevel;
  setSelectedLevel: (level: EIKENLevel) => void;

  // Vocabulary Data
  currentWords: EIKENVocabWord[];
  loadWordsForLevel: (level: EIKENLevel) => void;

  // Current Test
  currentWordIndex: number;
  currentWord: EIKENVocabWord | null;
  currentChoices: Array<{ id: string; meaning: string; isCorrect: boolean }>;
  setCurrentWord: (index: number) => void;
  moveToNextWord: () => boolean; // Returns true if more words available

  // Progress
  progress: Record<string, EIKENVocabProgress>;
  selectAnswer: (choiceId: string) => { isCorrect: boolean };
  resetProgress: () => void;

  // Statistics
  getTodayStats: () => {
    attempted: number;
    correct: number;
    accuracy: number;
    masteredCount: number;
  };

  // Test Session
  testHistory: Array<{
    wordId: string;
    isCorrect: boolean;
    selectedAnswer: string;
    timestamp: Date;
  }>;
  resetTestSession: () => void;

  // Gamification
  totalXPToday: number;
  addXP: (amount: number) => void;
  comboCount: number;
  resetCombo: () => void;
  incrementCombo: () => void;
}

const XP_REWARDS = {
  correct: 10,
  correctStreak: { 5: 25, 10: 50 },
};

export const useEIKENVocabStore = create<EIKENVocabState>((set, get) => ({
  // Level Selection
  selectedLevel: EIKENLevel.PRE_2ND,
  setSelectedLevel: (level: EIKENLevel) => {
    set({ selectedLevel: level });
    get().loadWordsForLevel(level);
    get().resetTestSession();
  },

  // Vocabulary Data
  currentWords: [],
  loadWordsForLevel: (level: EIKENLevel) => {
    const words = getVocabularyByLevel(level);
    set({ currentWords: words, currentWordIndex: 0 });
    get().setCurrentWord(0);
  },

  // Current Test
  currentWordIndex: 0,
  currentWord: null,
  currentChoices: [],

  setCurrentWord: (index: number) => {
    const { currentWords } = get();
    if (index >= 0 && index < currentWords.length) {
      const word = currentWords[index];
      const choices = word.choices.map(c => ({
        id: c.id,
        meaning: c.meaning,
        isCorrect: c.isCorrect,
      }));

      // Shuffle choices
      const shuffledChoices = [...choices].sort(() => Math.random() - 0.5);

      set({
        currentWordIndex: index,
        currentWord: word,
        currentChoices: shuffledChoices,
      });
    }
  },

  moveToNextWord: () => {
    const { currentWordIndex, currentWords } = get();
    const nextIndex = currentWordIndex + 1;

    if (nextIndex < currentWords.length) {
      get().setCurrentWord(nextIndex);
      return true;
    }
    return false;
  },

  // Progress
  progress: {},

  selectAnswer: (choiceId: string) => {
    const { currentWord, currentChoices, progress, comboCount } = get();

    if (!currentWord) return { isCorrect: false };

    const selectedChoice = currentChoices.find(c => c.id === choiceId);
    const isCorrect = selectedChoice?.isCorrect ?? false;

    // Update progress
    const currentProgress = progress[currentWord.id] || {
      wordId: currentWord.id,
      correctCount: 0,
      totalAttempts: 0,
      lastAttemptAt: null,
      isMastered: false,
      sm2State: {
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      },
    };

    const newProgress: EIKENVocabProgress = {
      ...currentProgress,
      totalAttempts: currentProgress.totalAttempts + 1,
      correctCount: isCorrect ? currentProgress.correctCount + 1 : currentProgress.correctCount,
      lastAttemptAt: new Date(),
      sm2State: calculateSM2(
        isCorrect,
        isCorrect ? 5 : 1,
        currentProgress.sm2State
      ),
      isMastered: isCorrect && currentProgress.correctCount >= 3,
    };

    const newProgress_record = { ...progress, [currentWord.id]: newProgress };
    set({
      progress: newProgress_record,
      testHistory: [
        ...get().testHistory,
        {
          wordId: currentWord.id,
          isCorrect,
          selectedAnswer: selectedChoice?.meaning || 'Unknown',
          timestamp: new Date(),
        },
      ],
      comboCount: isCorrect ? comboCount + 1 : 0,
      totalXPToday: get().totalXPToday + (isCorrect ? XP_REWARDS.correct : 0),
    });

    return { isCorrect };
  },

  resetProgress: () => {
    set({ progress: {} });
  },

  // Statistics
  getTodayStats: () => {
    const { testHistory, progress } = get();
    const attempted = testHistory.length;
    const correct = testHistory.filter(h => h.isCorrect).length;
    const masteredCount = Object.values(progress).filter(p => p.isMastered).length;

    return {
      attempted,
      correct,
      accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
      masteredCount,
    };
  },

  // Test Session
  testHistory: [],
  resetTestSession: () => {
    set({
      testHistory: [],
      totalXPToday: 0,
      comboCount: 0,
    });
  },

  // Gamification
  totalXPToday: 0,
  addXP: (amount: number) => {
    set({ totalXPToday: get().totalXPToday + amount });
  },

  comboCount: 0,
  resetCombo: () => {
    set({ comboCount: 0 });
  },

  incrementCombo: () => {
    set({ comboCount: get().comboCount + 1 });
  },
}));
