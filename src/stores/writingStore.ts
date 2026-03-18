import { create } from 'zustand';
import type { WritingPrompt, WritingScore } from '@/src/lib/writingData';

export interface WritingSubmission {
  id: string;
  promptId: string;
  content: string;
  imageUrl?: string;
  score?: WritingScore;
  submittedAt: Date;
}

interface WritingState {
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
}

export const useWritingStore = create<WritingState>((set, get) => ({
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
}));
