import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useShadowingStore } from '@/src/stores/shadowingStore';
import { scoreShaddowingRecording } from '@/src/lib/aiScoringService';
import ShadowingResultScreen from './ShadowingResultScreen';
import { debugLog, debugError } from '@/src/lib/debugUtils';
import { handleError } from '@/src/lib/errorHandler';

interface Props {
  questionId: string;
  attemptId: string;
  script: string;
  audioUrl: string;
  onComplete: () => void;
  onBack: () => void;
}

type Screen = 'recording' | 'result';

const TAG = 'ShadowingScreen';

export default function ShadowingScreen({
  questionId,
  attemptId,
  script,
  audioUrl,
  onComplete,
  onBack,
}: Props) {
  const {
    currentSession,
    startSession,
    currentRound,
    setCurrentRound,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
    addRecord,
    getRecords,
    endSession,
  } = useShadowingStore();

  const [screen, setScreen] = useState<Screen>('recording');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoringRound, setIsScoringRound] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 初期化
  useEffect(() => {
    if (!currentSession) {
      startSession(attemptId, questionId, script);
    }
  }, []);

  // タイマー管理
  useEffect(() => {
    if (isRecording) {
      const timerId = setInterval(() => {
        setRecordingTime(recordingTime + 1);
      }, 1000);
      timerRef.current = timerId as any;
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, recordingTime]);

  const playOriginalAudio = async () => {
    try {
      debugLog(TAG, 'Playing original audio', { audioUrl });

      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (err) {
          debugError(TAG, 'Error unloading previous sound', err);
        }
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        try {
          if (status.isLoaded && !status.isPlaying) {
            setIsPlaying(false);
          }
        } catch (err) {
          debugError(TAG, 'Error in playback status update', err);
        }
      });
    } catch (error) {
      const appError = handleError(error, TAG, { audioUrl });
      debugError(TAG, 'Audio playback error', appError.originalError);
      Alert.alert('エラー', '音声の再生に失敗しました');
    }
  };

  const startRecording = async () => {
    try {
      debugLog(TAG, 'Requesting microphone permissions');

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('エラー', 'マイクへのアクセスが許可されていません');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      debugLog(TAG, 'Recording started');
    } catch (error) {
      const appError = handleError(error, TAG);
      debugError(TAG, 'Recording error', appError.originalError);
      Alert.alert('エラー', '録音の開始に失敗しました');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        debugError(TAG, 'No recording in progress');
        return;
      }

      debugLog(TAG, 'Stopping recording', { round: currentRound });

      setIsRecording(false);
      if (recordingRef.current) {
        await (recordingRef.current as any).stopAndUnloadAsync();
      }

      const uri = recordingRef.current?.getURI();
      if (!uri) {
        throw new Error('Failed to get recording URI');
      }

      // ダミー文字起こし（実際はWhisper APIを使用）
      const dummyTranscript = script
        .split(' ')
        .slice(0, Math.floor(Math.random() * script.split(' ').length) + 1)
        .join(' ');

      // 音読を評価
      setIsScoringRound(currentRound);
      const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

      debugLog(TAG, 'Scoring recording', { round: currentRound });

      const result = await scoreShaddowingRecording(
        script,
        dummyTranscript,
        currentRound,
        apiKey
      );

      // レコードを追加（phraseFeedbacks を含める）
      addRecord({
        id: `record_${currentRound}_${Date.now()}`,
        attemptId,
        roundNumber: currentRound,
        audioUrl: uri,
        transcript: dummyTranscript,
        accuracyScore: Math.round(result.accuracyScore * 10) / 10,
        rhythmScore: Math.round(result.rhythmScore * 10) / 10,
        pronunciationScore: Math.round(result.pronunciationScore * 10) / 10,
        feedback: result.feedback,
        phraseFeedbacks: result.phraseFeedbacks,
        wordFeedbacks: result.wordFeedbacks,
        createdAt: new Date(),
      } as any);

      setIsScoringRound(null);

      // 次のラウンドへ
      if (currentRound < 7) {
        setCurrentRound(currentRound + 1);
      } else {
        endSession();
        setScreen('result');
      }

      recordingRef.current = null;
      debugLog(TAG, 'Recording completed successfully', { round: currentRound });
    } catch (error) {
      const appError = handleError(error, TAG, { round: currentRound });
      debugError(TAG, 'Stop recording error', appError.originalError);
      Alert.alert('エラー', '録音の停止に失敗しました');
      setIsScoringRound(null);
    }
  };

  if (screen === 'result') {
    return (
      <ShadowingResultScreen onBack={onBack} onComplete={onComplete} />
    );
  }

  const records = getRecords();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
          <Text style={styles.roundTitle}>Round {currentRound}/7</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentRound / 7) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentRound} / 7 完了
          </Text>
        </View>

        {/* Script */}
        <View style={[styles.scriptContainer, isRecording && styles.scriptContainerExpanded]}>
          {!isRecording && <Text style={styles.scriptLabel}>スクリプト</Text>}
          <Text style={[styles.scriptText, isRecording && styles.scriptTextExpanded]}>
            {script}
          </Text>
        </View>

        {/* Audio Controls */}
        <View style={styles.audioControlsContainer}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={playOriginalAudio}
            disabled={isPlaying}
          >
            <Text style={styles.playButtonIcon}>🔊</Text>
            <Text style={styles.playButtonText}>
              {isPlaying ? '再生中...' : '音声を再生'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recording Control */}
        <View style={styles.recordingContainer}>
          <Text style={styles.recordingLabel}>
            {isRecording ? '録音中...' : 'あなたの音読を録音'}
          </Text>

          {isRecording && (
            <Text style={styles.recordingTime}>{recordingTime}秒</Text>
          )}

          {isScoringRound === currentRound && (
            <View style={styles.scoringContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={styles.scoringText}>
                AI による評価中...
              </Text>
            </View>
          )}

          {!isRecording && isScoringRound !== currentRound && (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              disabled={isScoringRound !== null}
            >
              <Text style={styles.recordButtonIcon}>🎤</Text>
              <Text style={styles.recordButtonText}>録音開始</Text>
            </TouchableOpacity>
          )}

          {isRecording && (
            <TouchableOpacity
              style={[styles.recordButton, styles.recordButtonStop]}
              onPress={stopRecording}
            >
              <Text style={styles.recordButtonIcon}>⏹️</Text>
              <Text style={styles.recordButtonText}>録音終了</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Previous Rounds */}
        {records.length > 0 && (
          <View style={styles.previousRoundsContainer}>
            <Text style={styles.sectionTitle}>過去のラウンド</Text>
            {records.map((record) => (
              <View
                key={record.id}
                style={styles.roundResultCard}
              >
                <View style={styles.roundResultHeader}>
                  <Text style={styles.roundResultRound}>
                    Round {record.roundNumber}
                  </Text>
                  <View style={styles.roundResultScores}>
                    <Text style={styles.roundScore}>
                      正確性: {record.accuracyScore}/10
                    </Text>
                    <Text style={styles.roundScore}>
                      発音: {record.pronunciationScore}/10
                    </Text>
                  </View>
                </View>
                {record.feedback && (
                  <Text style={styles.roundFeedback}>{record.feedback}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  roundTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  progressContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  scriptContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  scriptLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  scriptText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  scriptContainerExpanded: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0099ff',
  },
  scriptTextExpanded: {
    fontSize: 24,
    fontWeight: '500',
    color: '#111',
    lineHeight: 36,
  },
  audioControlsContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    gap: 8,
  },
  playButtonActive: {
    backgroundColor: '#e6f4ff',
  },
  playButtonIcon: {
    fontSize: 20,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recordingContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 12,
  },
  scoringContainer: {
    alignItems: 'center',
    gap: 12,
  },
  scoringText: {
    fontSize: 14,
    color: '#666',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  recordButtonStop: {
    backgroundColor: '#ff3b30',
  },
  recordButtonIcon: {
    fontSize: 20,
  },
  recordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  previousRoundsContainer: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  roundResultCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  roundResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roundResultRound: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  roundResultScores: {
    alignItems: 'flex-end',
  },
  roundScore: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '500',
  },
  roundFeedback: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  spacer: {
    height: 40,
  },
});
