import { create } from 'zustand';
import type { ListeningQuestion } from '@/src/lib/listeningData';
import { supabase } from '@/src/lib/supabase';
import { realtimeSyncManager } from '@/src/lib/realtimeSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // User context
  userId: string | null;
  setUserId: (userId: string | null) => void;

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

  // Sync methods
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  initializeSync: (userId: string) => Promise<void>;
}

export const useListeningStore = create<ListeningState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

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
  loadProgress: (data) => {
    set({ progress: data });
    get().syncToSupabase();
  },

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

  syncToSupabase: async () => {
    const { userId, attempts, progress } = get();
    if (!userId) return;

    try {
      // Save attempts
      const attemptsToSave = attempts.map((attempt) => ({
        id: attempt.id,
        user_id: userId,
        question_id: attempt.questionId,
        selected_answer: attempt.selectedAnswer,
        is_correct: attempt.isCorrect,
        created_at: attempt.createdAt.toISOString(),
      }));

      if (attemptsToSave.length > 0) {
        await supabase.from('listening_attempts').upsert(attemptsToSave, {
          onConflict: 'id',
        });
      }

      // Cache locally
      await AsyncStorage.setItem(
        `listening:${userId}`,
        JSON.stringify({ attempts, progress })
      );
    } catch (error) {
      console.error('[ListeningStore] Sync to Supabase failed:', error);
      realtimeSyncManager.queueChange('listening_attempts', 'INSERT', {
        user_id: userId,
        attempts,
      });
    }
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('listening_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (data && data.length > 0) {
        const attempts: ListeningAttempt[] = data.map((item: any) => ({
          id: item.id,
          questionId: item.question_id,
          selectedAnswer: item.selected_answer,
          isCorrect: item.is_correct,
          createdAt: new Date(item.created_at),
        }));
        set({ attempts });
        return;
      }

      const cached = await AsyncStorage.getItem(`listening:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    } catch (error) {
      console.error('[ListeningStore] Load from Supabase failed:', error);
      const cached = await AsyncStorage.getItem(`listening:${userId}`);
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
      table: 'listening_attempts',
      filter: `user_id=eq.${userId}`,
      onUpdate: (data) => {
        if (data) {
          const { attempts } = get();
          const newAttempt: ListeningAttempt = {
            id: data.id,
            questionId: data.question_id,
            selectedAnswer: data.selected_answer,
            isCorrect: data.is_correct,
            createdAt: new Date(data.created_at),
          };
          set({ attempts: [newAttempt, ...attempts] });
        }
      },
    });
  },
}));
