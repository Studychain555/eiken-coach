import { create } from 'zustand';

export interface ShadowingRecord {
  id: string;
  attemptId: string;
  roundNumber: number; // 1-7
  audioUrl: string;
  transcript: string | null;
  accuracyScore: number | null; // 0-10
  rhythmScore: number | null; // 0-10
  pronunciationScore: number | null; // 0-10
  feedback: string | null;
  createdAt: Date;
}

export interface ShadowingSession {
  attemptId: string;
  questionId: string;
  script: string;
  records: ShadowingRecord[];
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

interface ShadowingState {
  // 現在のセッション
  currentSession: ShadowingSession | null;
  startSession: (attemptId: string, questionId: string, script: string) => void;
  endSession: () => void;

  // 現在のラウンド
  currentRound: number;
  setCurrentRound: (round: number) => void;

  // 録音状態
  isRecording: boolean;
  recordingTime: number;
  setIsRecording: (recording: boolean) => void;
  setRecordingTime: (time: number) => void;

  // ラウンド操作
  addRecord: (record: ShadowingRecord) => void;
  getRecords: () => ShadowingRecord[];

  // スコア計算
  getAverageScores: () => {
    accuracy: number;
    rhythm: number;
    pronunciation: number;
    overall: number;
  };
  getImprovement: () => number; // ラウンド1から7への改善率
}

export const useShadowingStore = create<ShadowingState>((set, get) => ({
  currentSession: null,
  startSession: (attemptId, questionId, script) => {
    set({
      currentSession: {
        attemptId,
        questionId,
        script,
        records: [],
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
      },
      currentRound: 1,
      recordingTime: 0,
      isRecording: false,
    });
  },

  endSession: () => {
    const { currentSession } = get();
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  },

  currentRound: 1,
  setCurrentRound: (round) => set({ currentRound: round }),

  isRecording: false,
  recordingTime: 0,
  setIsRecording: (recording) => set({ isRecording: recording }),
  setRecordingTime: (time) => set({ recordingTime: time }),

  addRecord: (record) => {
    const { currentSession } = get();
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        records: [...currentSession.records, record],
      };
      set({ currentSession: updatedSession });
    }
  },

  getRecords: () => {
    const { currentSession } = get();
    return currentSession?.records || [];
  },

  getAverageScores: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.records.length === 0) {
      return { accuracy: 0, rhythm: 0, pronunciation: 0, overall: 0 };
    }

    const records = currentSession.records.filter(
      (r) => r.accuracyScore !== null && r.rhythmScore !== null && r.pronunciationScore !== null
    );

    if (records.length === 0) {
      return { accuracy: 0, rhythm: 0, pronunciation: 0, overall: 0 };
    }

    const accuracy =
      Math.round(
        (records.reduce((sum, r) => sum + (r.accuracyScore || 0), 0) / records.length) * 10
      ) / 10;
    const rhythm =
      Math.round(
        (records.reduce((sum, r) => sum + (r.rhythmScore || 0), 0) / records.length) * 10
      ) / 10;
    const pronunciation =
      Math.round(
        (records.reduce((sum, r) => sum + (r.pronunciationScore || 0), 0) / records.length) * 10
      ) / 10;
    const overall = Math.round(((accuracy + rhythm + pronunciation) / 3) * 10) / 10;

    return { accuracy, rhythm, pronunciation, overall };
  },

  getImprovement: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.records.length < 2) return 0;

    const first = currentSession.records[0];
    const last = currentSession.records[currentSession.records.length - 1];

    if (
      !first.accuracyScore ||
      !last.accuracyScore
    ) {
      return 0;
    }

    return Math.max(0, last.accuracyScore - first.accuracyScore);
  },
}));
