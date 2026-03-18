import { create } from 'zustand';

export interface ListeningProgress {
  completedQuestions: number;
  totalQuestions: number;
  todayStudyMinutes: number;
}

export interface VocabularyProgress {
  masteredWords: number;
  totalWords: number;
  currentStage: number;
}

export interface WritingProgress {
  submissions: number;
  averageScore: number;
}

interface LearningState {
  // Listening
  listeningProgress: ListeningProgress;
  setListeningProgress: (progress: ListeningProgress) => void;

  // Vocabulary
  vocabularyProgress: VocabularyProgress;
  setVocabularyProgress: (progress: VocabularyProgress) => void;

  // Writing
  writingProgress: WritingProgress;
  setWritingProgress: (progress: WritingProgress) => void;

  // Streak
  streakDays: number;
  setStreakDays: (days: number) => void;
}

export const useLearningStore = create<LearningState>((set) => ({
  listeningProgress: {
    completedQuestions: 0,
    totalQuestions: 0,
    todayStudyMinutes: 0,
  },
  setListeningProgress: (progress) =>
    set({ listeningProgress: progress }),

  vocabularyProgress: {
    masteredWords: 0,
    totalWords: 2000,
    currentStage: 1,
  },
  setVocabularyProgress: (progress) =>
    set({ vocabularyProgress: progress }),

  writingProgress: {
    submissions: 0,
    averageScore: 0,
  },
  setWritingProgress: (progress) =>
    set({ writingProgress: progress }),

  streakDays: 0,
  setStreakDays: (days) => set({ streakDays: days }),
}));
