import { create } from 'zustand';
import type { VocabularyWord } from '@/src/lib/vocabularyData';
import type { SM2State } from '@/src/lib/sm2Algorithm';
import { calculateSM2 } from '@/src/lib/sm2Algorithm';
import { supabase } from '@/src/lib/supabase';
import { realtimeSyncManager } from '@/src/lib/realtimeSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VocabularyProgress {
  wordId: string;
  correctStreak: number;
  isMastered: boolean;
  nextReviewAt: Date | null;
  lastReviewedAt: Date | null;
  state: SM2State;
}

interface VocabularyState {
  // User context
  userId: string | null;
  setUserId: (userId: string | null) => void;

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

  // ==========================================
  // Duolingo-Style Gamification
  // ==========================================
  dailyGoal: {
    target: number;
    completed: number;
  };
  setDailyGoal: (target: number) => void;
  incrementDailyGoal: () => void;

  xpToday: number;
  totalXP: number;
  addXP: (amount: number) => void;

  currentLevel: number;
  xpForNextLevel: number;
  calculateLevel: (totalXP: number) => { level: number; xpToNext: number };

  hearts: number;
  maxHearts: number;
  addHeart: () => void;
  reduceHeart: () => void;

  streakDays: number;
  lastStudyDate: Date | null;
  updateStreak: () => void;

  comboCount: number;
  resetCombo: () => void;

  // Sync methods
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  initializeSync: (userId: string) => Promise<void>;
}

// XP thresholds for levels (vocabulary)
const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

  words: [],
  setWords: (words) => set({ words, totalCount: words.length }),

  progress: {},
  loadProgress: (data) => {
    set({ progress: data });
    get().syncToSupabase();
  },

  currentStage: 1,
  setCurrentStage: (stage) => set({ currentStage: stage }),

  currentWord: null,
  setCurrentWord: (word) => set({ currentWord: word }),

  currentOptions: [],
  setCurrentOptions: (options) => set({ currentOptions: options }),

  testHistory: [],

  selectAnswer: (selectedAnswer) => {
    const { currentWord, currentOptions, testHistory, progress, dailyGoal, comboCount } = get();
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

    const xpGain = isCorrect ? 10 : 0;
    const newCombo = isCorrect ? comboCount + 1 : 0;
    const newXpToday = get().xpToday + xpGain;
    const newDailyCompleted = Math.min(dailyGoal.completed + 1, dailyGoal.target);

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
      xpToday: newXpToday,
      comboCount: newCombo,
      dailyGoal: {
        ...dailyGoal,
        completed: newDailyCompleted,
      },
    });

    get().addXP(xpGain);
    get().updateStreak();
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

  // ==========================================
  // Duolingo-Style Gamification Implementation
  // ==========================================
  dailyGoal: { target: 5, completed: 0 },
  setDailyGoal: (target) =>
    set((state) => ({
      dailyGoal: {
        ...state.dailyGoal,
        target,
      },
    })),
  incrementDailyGoal: () =>
    set((state) => ({
      dailyGoal: {
        ...state.dailyGoal,
        completed: Math.min(state.dailyGoal.completed + 1, state.dailyGoal.target),
      },
    })),

  xpToday: 0,
  totalXP: 0,
  addXP: (amount: number) => {
    set((state) => {
      const newTotalXP = state.totalXP + amount;
      const { level: newLevel } = get().calculateLevel(newTotalXP);
      return {
        xpToday: state.xpToday + amount,
        totalXP: newTotalXP,
        currentLevel: newLevel,
      };
    });
  },

  currentLevel: 1,
  xpForNextLevel: 100,
  calculateLevel: (totalXP: number) => {
    let level = 1;
    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
      if (totalXP >= XP_THRESHOLDS[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    const currentThreshold = XP_THRESHOLDS[level - 1] || 0;
    const nextThreshold = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1] + 500;
    const xpToNext = nextThreshold - totalXP;
    return { level, xpToNext };
  },

  hearts: 3,
  maxHearts: 3,
  addHeart: () =>
    set((state) => ({
      hearts: Math.min(state.hearts + 1, state.maxHearts),
    })),
  reduceHeart: () =>
    set((state) => ({
      hearts: Math.max(state.hearts - 1, 0),
    })),

  streakDays: 0,
  lastStudyDate: null,
  updateStreak: () => {
    const { streakDays, lastStudyDate } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastStudyDate) {
      set({ streakDays: 1, lastStudyDate: today });
      return;
    }

    const last = new Date(lastStudyDate);
    last.setHours(0, 0, 0, 0);

    const timeDiff = today.getTime() - last.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff === 1) {
      set({ streakDays: streakDays + 1, lastStudyDate: today });
    } else if (daysDiff === 0) {
      return;
    } else {
      set({ streakDays: 1, lastStudyDate: today });
    }
  },

  comboCount: 0,
  resetCombo: () => set({ comboCount: 0 }),

  syncToSupabase: async () => {
    const { userId, progress, testHistory, totalXP, currentLevel, streakDays, hearts } = get();
    if (!userId) return;

    try {
      // Save progress
      const progressArray = Object.entries(progress).map(([wordId, prog]) => ({
        id: `${userId}-${wordId}`,
        user_id: userId,
        word_id: wordId,
        ...prog,
        updated_at: new Date().toISOString(),
      }));

      if (progressArray.length > 0) {
        const { error } = await supabase
          .from('vocabulary_progress')
          .upsert(progressArray, { onConflict: 'id' });

        if (error) throw error;
      }

      // Cache locally with gamification data
      await AsyncStorage.setItem(
        `vocabulary:${userId}`,
        JSON.stringify({
          progress,
          testHistory,
          totalXP,
          currentLevel,
          streakDays,
          hearts,
        })
      );
    } catch (error) {
      console.error('[VocabularyStore] Sync to Supabase failed:', error);
      realtimeSyncManager.queueChange('vocabulary_progress', 'UPDATE', {
        user_id: userId,
        progress,
      });
    }
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('vocabulary_progress')
        .select('*')
        .eq('user_id', userId);

      if (data && data.length > 0) {
        const progressMap: Record<string, VocabularyProgress> = {};
        data.forEach((item: any) => {
          progressMap[item.word_id] = {
            wordId: item.word_id,
            correctStreak: item.correct_streak,
            isMastered: item.is_mastered,
            nextReviewAt: item.next_review_at ? new Date(item.next_review_at) : null,
            lastReviewedAt: item.last_reviewed_at ? new Date(item.last_reviewed_at) : null,
            state: item.state,
          };
        });
        set({ progress: progressMap });
        return;
      }

      // Fallback to local cache
      const cached = await AsyncStorage.getItem(`vocabulary:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    } catch (error) {
      console.error('[VocabularyStore] Load from Supabase failed:', error);
      const cached = await AsyncStorage.getItem(`vocabulary:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    }
  },

  initializeSync: async (userId: string) => {
    set({ userId });
    await get().loadFromSupabase();

    realtimeSyncManager.subscribe({
      userId,
      table: 'vocabulary_progress',
      filter: `user_id=eq.${userId}`,
      onUpdate: (data) => {
        if (data) {
          const { progress } = get();
          progress[data.word_id] = {
            wordId: data.word_id,
            correctStreak: data.correct_streak,
            isMastered: data.is_mastered,
            nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
            lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null,
            state: data.state,
          };
          set({ progress: { ...progress } });
        }
      },
    });
  },
}));
