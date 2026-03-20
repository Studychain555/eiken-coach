import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import { realtimeSyncManager } from '@/src/lib/realtimeSyncManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhraseFeedback, WordFeedback } from '@/src/lib/aiScoringService';

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
  phraseFeedbacks?: PhraseFeedback[]; // フレーズ単位の詳細分析
  wordFeedbacks?: WordFeedback[]; // ワード単位の分析
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
  // User context
  userId: string | null;
  setUserId: (userId: string | null) => void;

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

  // Sync methods
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<void>;
  initializeSync: (userId: string) => Promise<void>;
}

export const useShadowingStore = create<ShadowingState>((set, get) => ({
  userId: null,
  setUserId: (userId) => set({ userId }),

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
      setTimeout(() => { get().syncToSupabase().catch(err => console.error("Sync error:", err)); }, 500);
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

  syncToSupabase: async () => {
    const { userId, currentSession } = get();
    if (!userId || !currentSession) return;

    try {
      const recordsToSave = currentSession.records.map((record) => ({
        id: record.id,
        user_id: userId,
        attempt_id: record.attemptId,
        round_number: record.roundNumber,
        audio_url: record.audioUrl,
        transcript: record.transcript,
        accuracy_score: record.accuracyScore,
        rhythm_score: record.rhythmScore,
        pronunciation_score: record.pronunciationScore,
        feedback: record.feedback,
        phrase_feedbacks: record.phraseFeedbacks ? JSON.stringify(record.phraseFeedbacks) : null,
        word_feedbacks: record.wordFeedbacks ? JSON.stringify(record.wordFeedbacks) : null,
        created_at: record.createdAt.toISOString(),
      }));

      if (recordsToSave.length > 0) {
        await supabase.from('shadowing_records').upsert(recordsToSave, {
          onConflict: 'id',
        });
      }

      await AsyncStorage.setItem(
        `shadowing:${userId}`,
        JSON.stringify({ currentSession })
      );
    } catch (error) {
      console.error('[ShadowingStore] Sync to Supabase failed:', error);
      realtimeSyncManager.queueChange('shadowing_records', 'INSERT', {
        user_id: userId,
        attempt_id: currentSession.attemptId,
        records: currentSession.records,
      });
    }
  },

  loadFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('shadowing_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        const records: ShadowingRecord[] = data.map((item: any) => {
          let phraseFeedbacks: PhraseFeedback[] | undefined;
          let wordFeedbacks: WordFeedback[] | undefined;

          try {
            if (item.phrase_feedbacks && typeof item.phrase_feedbacks === 'string') {
              phraseFeedbacks = JSON.parse(item.phrase_feedbacks);
            } else if (item.phrase_feedbacks) {
              phraseFeedbacks = item.phrase_feedbacks;
            }
          } catch (e) {
            console.error('Failed to parse phrase_feedbacks:', e);
          }

          try {
            if (item.word_feedbacks && typeof item.word_feedbacks === 'string') {
              wordFeedbacks = JSON.parse(item.word_feedbacks);
            } else if (item.word_feedbacks) {
              wordFeedbacks = item.word_feedbacks;
            }
          } catch (e) {
            console.error('Failed to parse word_feedbacks:', e);
          }

          return {
            id: item.id,
            attemptId: item.attempt_id,
            roundNumber: item.round_number,
            audioUrl: item.audio_url,
            transcript: item.transcript,
            accuracyScore: item.accuracy_score,
            rhythmScore: item.rhythm_score,
            pronunciationScore: item.pronunciation_score,
            feedback: item.feedback,
            phraseFeedbacks,
            wordFeedbacks,
            createdAt: new Date(item.created_at),
          };
        });

        if (records.length > 0) {
          const lastAttemptId = records[records.length - 1].attemptId;
          const lastRecords = records.filter((r) => r.attemptId === lastAttemptId);

          set({
            currentSession: {
              attemptId: lastAttemptId,
              questionId: data[data.length - 1].question_id || '',
              script: '',
              records: lastRecords,
              isCompleted: true,
              startedAt: new Date(lastRecords[0].createdAt),
              completedAt: new Date(lastRecords[lastRecords.length - 1].createdAt),
            },
          });
        }
        return;
      }

      const cached = await AsyncStorage.getItem(`shadowing:${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
    } catch (error) {
      console.error('[ShadowingStore] Load from Supabase failed:', error);
      const cached = await AsyncStorage.getItem(`shadowing:${userId}`);
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
      table: 'shadowing_records',
      filter: `user_id=eq.${userId}`,
      onUpdate: (data) => {
        if (data) {
          const { currentSession } = get();

          let phraseFeedbacks: PhraseFeedback[] | undefined;
          let wordFeedbacks: WordFeedback[] | undefined;

          try {
            if (data.phrase_feedbacks && typeof data.phrase_feedbacks === 'string') {
              phraseFeedbacks = JSON.parse(data.phrase_feedbacks);
            } else if (data.phrase_feedbacks) {
              phraseFeedbacks = data.phrase_feedbacks;
            }
          } catch (e) {
            console.error('Failed to parse phrase_feedbacks:', e);
          }

          try {
            if (data.word_feedbacks && typeof data.word_feedbacks === 'string') {
              wordFeedbacks = JSON.parse(data.word_feedbacks);
            } else if (data.word_feedbacks) {
              wordFeedbacks = data.word_feedbacks;
            }
          } catch (e) {
            console.error('Failed to parse word_feedbacks:', e);
          }

          const newRecord: ShadowingRecord = {
            id: data.id,
            attemptId: data.attempt_id,
            roundNumber: data.round_number,
            audioUrl: data.audio_url,
            transcript: data.transcript,
            accuracyScore: data.accuracy_score,
            rhythmScore: data.rhythm_score,
            pronunciationScore: data.pronunciation_score,
            feedback: data.feedback,
            phraseFeedbacks,
            wordFeedbacks,
            createdAt: new Date(data.created_at),
          };

          if (currentSession && currentSession.attemptId === data.attempt_id) {
            set({
              currentSession: {
                ...currentSession,
                records: [...currentSession.records, newRecord],
              },
            });
          }
        }
      },
    });
  },
}));
