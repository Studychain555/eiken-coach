import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import { realtimeSyncManager } from '@/src/lib/realtimeSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // User context
  userId: string | null;
  setUserId: (userId: string | null) => void;

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

  // Sync methods
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  initializeSync: (userId: string) => Promise<void>;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

  listeningProgress: {
    completedQuestions: 0,
    totalQuestions: 0,
    todayStudyMinutes: 0,
  },
  setListeningProgress: (progress) => {
    set({ listeningProgress: progress });
    // Debounce sync to prevent infinite loops
    setTimeout(() => {
      get().syncToSupabase().catch((err) => console.error('Sync error:', err));
    }, 500);
  },

  vocabularyProgress: {
    masteredWords: 0,
    totalWords: 2000,
    currentStage: 1,
  },
  setVocabularyProgress: (progress) => {
    set({ vocabularyProgress: progress });
    // Debounce sync to prevent infinite loops
    setTimeout(() => {
      get().syncToSupabase().catch((err) => console.error('Sync error:', err));
    }, 500);
  },

  writingProgress: {
    submissions: 0,
    averageScore: 0,
  },
  setWritingProgress: (progress) => {
    set({ writingProgress: progress });
    // Debounce sync to prevent infinite loops
    setTimeout(() => {
      get().syncToSupabase().catch((err) => console.error('Sync error:', err));
    }, 500);
  },

  streakDays: 0,
  setStreakDays: (days) => {
    set({ streakDays: days });
    // Debounce sync to prevent infinite loops
    setTimeout(() => {
      get().syncToSupabase().catch((err) => console.error('Sync error:', err));
    }, 500);
  },

  syncToSupabase: async () => {
    const { userId, listeningProgress, vocabularyProgress, writingProgress, streakDays } = get();

    if (!userId) return;

    try {
      const { error } = await supabase
        .from('learning_progress')
        .upsert(
          {
            id: `${userId}-learning`,
            user_id: userId,
            listening_progress: listeningProgress,
            vocabulary_progress: vocabularyProgress,
            writing_progress: writingProgress,
            streak_days: streakDays,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) throw error;

      // Also cache locally
      await AsyncStorage.setItem(
        `learning:${userId}`,
        JSON.stringify({
          listeningProgress,
          vocabularyProgress,
          writingProgress,
          streakDays,
        })
      );
    } catch (error) {
      console.error('[LearningStore] Sync to Supabase failed:', error);
      // Queue for later sync
      realtimeSyncManager.queueChange('learning_progress', 'UPDATE', {
        id: `${userId}-learning`,
        user_id: userId,
        listening_progress: listeningProgress,
        vocabulary_progress: vocabularyProgress,
        writing_progress: writingProgress,
        streak_days: streakDays,
      });
    }
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        set({
          listeningProgress: data.listening_progress,
          vocabularyProgress: data.vocabulary_progress,
          writingProgress: data.writing_progress,
          streakDays: data.streak_days,
        });
        return;
      }

      // Fallback to local storage
      const cached = await AsyncStorage.getItem(`learning:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    } catch (error) {
      console.error('[LearningStore] Load from Supabase failed:', error);
      // Fallback to local storage silently
      const cached = await AsyncStorage.getItem(`learning:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    }
  },

  initializeSync: async (userId: string) => {
    set({ userId });

    // Load from Supabase
    await get().loadFromSupabase();

    // Subscribe to real-time updates
    realtimeSyncManager.subscribe({
      userId,
      table: 'learning_progress',
      filter: `user_id=eq.${userId}`,
      onUpdate: (data) => {
        if (data) {
          set({
            listeningProgress: data.listening_progress,
            vocabularyProgress: data.vocabulary_progress,
            writingProgress: data.writing_progress,
            streakDays: data.streak_days,
          });
        }
      },
      onError: (error) => {
        console.error('[LearningStore] Real-time sync error:', error);
      },
    });
  },
}));
