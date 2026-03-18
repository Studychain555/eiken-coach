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

  // Sync methods
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  initializeSync: (userId: string) => Promise<void>;
}

export const useWritingStore = create<WritingState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

  prompts: [],
  setPrompts: (prompts) => set({ prompts }),

  currentPrompt: null,
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  currentContent: '',
  setCurrentContent: (content) => set({ currentContent: content }),

  currentImageUrl: undefined,
  setCurrentImageUrl: (url) => set({ currentImageUrl: url }),

  submissions: [],

  addSubmission: (submission) => {
    set((state) => ({
      submissions: [...state.submissions, submission],
    }));
    get().syncToSupabase();
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

  syncToSupabase: async () => {
    const { userId, submissions } = get();
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
        JSON.stringify({ submissions })
      );
    } catch (error) {
      console.error('[WritingStore] Sync to Supabase failed:', error);
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
}));
