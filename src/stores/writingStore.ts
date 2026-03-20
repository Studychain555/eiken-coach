import { create } from 'zustand';
import type { WritingPrompt, WritingScore } from '@/src/lib/writingData';
import { supabase } from '@/src/lib/supabase';
import { realtimeSyncManager } from '@/src/lib/realtimeSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WritingSubmission {
  id: string;
  promptId: string;
  content: string;
  imageUrl?: string;
  score?: WritingScore;
  submittedAt: Date;
}

interface WritingState {
  // User context
  userId: string | null;
  setUserId: (userId: string | null) => void;

  // ローディング状態
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 問題データ
  prompts: WritingPrompt[];
  setPrompts: (prompts: WritingPrompt[]) => void;

  // 現在の作成中エッセイ
  currentPrompt: WritingPrompt | null;
  setCurrentPrompt: (prompt: WritingPrompt | null) => void;

  currentContent: string;
  setCurrentContent: (content: string) => void;

  currentImageUrl?: string;
  setCurrentImageUrl: (url?: string) => void;

  // 提出履歴
  submissions: WritingSubmission[];
  addSubmission: (submission: WritingSubmission) => void;
  getSubmissionsByPrompt: (promptId: string) => WritingSubmission[];

  // 統計
  getTotalSubmissions: () => number;
  getAverageScore: () => number;
  getTodayStats: () => { attempted: number; averageScore: number };

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

  // Error handling
  syncError: string | null;
  setSyncError: (error: string | null) => void;
  retry: () => Promise<void>;
}

// XP thresholds for levels (writing)
const XP_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];

export const useWritingStore = create<WritingState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  prompts: [],
  setPrompts: (prompts) => set({ prompts, isLoading: false }),

  currentPrompt: null,
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  currentContent: '',
  setCurrentContent: (content) => set({ currentContent: content }),

  currentImageUrl: undefined,
  setCurrentImageUrl: (url) => set({ currentImageUrl: url }),

  submissions: [],

  addSubmission: (submission) => {
    const { dailyGoal } = get();
    const xpGain = submission.score?.totalScore ? Math.round(submission.score.totalScore * 5) : 50;
    const newDailyCompleted = Math.min(dailyGoal.completed + 1, dailyGoal.target);

    set((state) => ({
      submissions: [...state.submissions, submission],
      dailyGoal: {
        ...state.dailyGoal,
        completed: newDailyCompleted,
      },
      xpToday: state.xpToday + xpGain,
    }));
    get().addXP(xpGain);
    get().updateStreak();
    setTimeout(() => { get().syncToSupabase().catch(err => console.error("Sync error:", err)); }, 500);
  },

  getSubmissionsByPrompt: (promptId) => {
    const { submissions } = get();
    return submissions.filter((s) => s.promptId === promptId);
  },

  getTotalSubmissions: () => {
    const { submissions } = get();
    return submissions.length;
  },

  getAverageScore: () => {
    const { submissions } = get();
    const scoredSubmissions = submissions.filter((s) => s.score);

    if (scoredSubmissions.length === 0) return 0;

    const totalScore = scoredSubmissions.reduce(
      (sum, s) => sum + (s.score?.totalScore || 0),
      0
    );

    return Math.round((totalScore / scoredSubmissions.length) * 10) / 10;
  },

  getTodayStats: () => {
    const { submissions } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySubmissions = submissions.filter((s) => {
      const date = new Date(s.submittedAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    });

    const scoredSubmissions = todaySubmissions.filter((s) => s.score);
    const averageScore =
      scoredSubmissions.length > 0
        ? Math.round(
            (scoredSubmissions.reduce((sum, s) => sum + (s.score?.totalScore || 0), 0) /
              scoredSubmissions.length) *
              10
          ) / 10
        : 0;

    return {
      attempted: todaySubmissions.length,
      averageScore,
    };
  },

  // ==========================================
  // Duolingo-Style Gamification Implementation
  // ==========================================
  dailyGoal: { target: 3, completed: 0 },
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
    const { userId, submissions, totalXP, currentLevel, streakDays, hearts } = get();
    if (!userId) return;

    try {
      const submissionsToSave = submissions.map((sub) => ({
        id: sub.id,
        user_id: userId,
        prompt_id: sub.promptId,
        content: sub.content,
        image_url: sub.imageUrl,
        score: sub.score,
        submitted_at: sub.submittedAt.toISOString(),
      }));

      if (submissionsToSave.length > 0) {
        await supabase.from('writing_submissions').upsert(submissionsToSave, {
          onConflict: 'id',
        });
      }

      await AsyncStorage.setItem(
        `writing:${userId}`,
        JSON.stringify({
          submissions,
          totalXP,
          currentLevel,
          streakDays,
          hearts,
        })
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'サーバーに接続できません';
      console.error('[WritingStore] Sync to Supabase failed:', error);
      set({ syncError: errorMessage });
      realtimeSyncManager.queueChange('writing_submissions', 'INSERT', {
        user_id: userId,
        submissions,
      });
    }
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('writing_submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (data && data.length > 0) {
        const submissions: WritingSubmission[] = data.map((item: any) => ({
          id: item.id,
          promptId: item.prompt_id,
          content: item.content,
          imageUrl: item.image_url,
          score: item.score,
          submittedAt: new Date(item.submitted_at),
        }));
        set({ submissions });
        return;
      }

      const cached = await AsyncStorage.getItem(`writing:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    } catch (error) {
      console.error('[WritingStore] Load from Supabase failed:', error);
      const cached = await AsyncStorage.getItem(`writing:${userId}`);
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
      table: 'writing_submissions',
      filter: `user_id=eq.${userId}`,
      onUpdate: (data) => {
        if (data) {
          const { submissions } = get();
          const newSubmission: WritingSubmission = {
            id: data.id,
            promptId: data.prompt_id,
            content: data.content,
            imageUrl: data.image_url,
            score: data.score,
            submittedAt: new Date(data.submitted_at),
          };
          set({ submissions: [newSubmission, ...submissions] });
        }
      },
    });
  },

  // Error handling
  syncError: null,
  setSyncError: (error) => set({ syncError: error }),

  retry: async () => {
    const { syncError } = get();
    if (syncError) {
      set({ syncError: null });
      try {
        await get().syncToSupabase();
      } catch (error) {
        console.error('Retry failed:', error);
        set({ syncError: error instanceof Error ? error.message : '再度お試しに失敗しました' });
      }
    }
  },
}));
