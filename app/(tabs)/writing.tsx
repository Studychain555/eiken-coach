import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWritingStore } from '@/src/stores/writingStore';
import { WRITING_SAMPLE_PROMPTS } from '@/src/lib/writingData';
import { scoreWritingSubmission } from '@/src/lib/aiScoringService';
import WritingResultScreen from '@/src/components/WritingResultScreen';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { OptimizedButton, ButtonGroup } from '@/components/OptimizedButton';
import { EnhancedProgressBar } from '@/components/EnhancedProgressBar';

type Screen = 'prompt-select' | 'editor' | 'result';

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '★☆☆☆☆',
  2: '★★☆☆☆',
  3: '★★★☆☆',
  4: '★★★★☆',
  5: '★★★★★',
};

export default function WritingScreen() {
  const {
    prompts,
    setPrompts,
    currentPrompt,
    setCurrentPrompt,
    currentContent,
    setCurrentContent,
    currentImageUrl,
    setCurrentImageUrl,
    addSubmission,
    getTodayStats,
    getTotalSubmissions,
    getAverageScore,
  } = useWritingStore();

  const [screen, setScreen] = useState<Screen>('prompt-select');
  const [isScoring, setIsScoring] = useState(false);

  useEffect(() => {
    if (prompts.length === 0) {
      setPrompts(WRITING_SAMPLE_PROMPTS);
    }
  }, []);

  const handleStartPrompt = (prompt: any) => {
    setCurrentPrompt(prompt);
    setCurrentContent('');
    setCurrentImageUrl(undefined);
    setScreen('editor');
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCurrentImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('エラー', 'カメラアクセスが失敗しました');
    }
  };

  const handleSubmitEssay = async () => {
    if (!currentPrompt) return;

    if (!currentContent.trim() && !currentImageUrl) {
      Alert.alert('エラー', 'テキストを入力するか、画像を撮影してください');
      return;
    }

    setIsScoring(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
      const scoreResult = await scoreWritingSubmission(
        currentPrompt.topic,
        currentContent,
        apiKey
      );

      const submission = {
        id: `submission_${Date.now()}`,
        promptId: currentPrompt.id,
        content: currentContent,
        imageUrl: currentImageUrl,
        score: scoreResult,
        submittedAt: new Date(),
      };

      addSubmission(submission);
      setScreen('result');
    } catch (error) {
      Alert.alert('エラー', '採点に失敗しました');
    } finally {
      setIsScoring(false);
    }
  };

  const handleBackToSelect = () => {
    setCurrentPrompt(null);
    setCurrentContent('');
    setCurrentImageUrl(undefined);
    setScreen('prompt-select');
  };

  if (screen === 'prompt-select') {
    const stats = getTodayStats();
    const totalSubmissions = getTotalSubmissions();

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✍️ ライティング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>

          {/* Stats */}
          <View style={styles.section}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>📝</Text>
                <Text style={styles.statValue}>{totalSubmissions}</Text>
                <Text style={styles.statLabel}>提出済み</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>⭐</Text>
                <Text style={styles.statValue}>{getAverageScore()}</Text>
                <Text style={styles.statLabel}>平均スコア</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statValue}>{stats.attempted}</Text>
                <Text style={styles.statLabel}>今日</Text>
              </View>
            </View>
          </View>

          {/* Scoring Guide */}
          <View style={styles.section}>
            <View style={styles.scoringGuide}>
              <Text style={styles.scoringTitle}>採点基準</Text>
              <View style={styles.scoringItem}>
                <Text style={styles.scoringLabel}>内容</Text>
                <Text style={styles.scoringPoint}>4点</Text>
              </View>
              <View style={styles.scoringItem}>
                <Text style={styles.scoringLabel}>構成</Text>
                <Text style={styles.scoringPoint}>4点</Text>
              </View>
              <View style={styles.scoringItem}>
                <Text style={styles.scoringLabel}>語彙</Text>
                <Text style={styles.scoringPoint}>4点</Text>
              </View>
              <View style={styles.scoringItem}>
                <Text style={styles.scoringLabel}>文法</Text>
                <Text style={styles.scoringPoint}>4点</Text>
              </View>
            </View>
          </View>

          {/* Prompts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>問題を選択</Text>
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptCard}
                onPress={() => handleStartPrompt(prompt)}
                activeOpacity={0.7}
              >
                <View style={styles.promptNumber}>
                  <Text style={styles.promptNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.promptCardContent}>
                  <View style={styles.promptCardHeader}>
                    <Text style={styles.promptTopic}>{prompt.topic}</Text>
                    <Text style={styles.difficulty}>
                      {DIFFICULTY_LABELS[prompt.difficulty]}
                    </Text>
                  </View>
                  <Text style={styles.promptDescription}>
                    {prompt.description}
                  </Text>
                  <View style={styles.promptCardFooter}>
                    <Text style={styles.wordLimit}>
                      {prompt.wordLimit}語程度
                    </Text>
                    <Text style={styles.actionText}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'editor' && currentPrompt) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={handleBackToSelect}>
              <Text style={styles.backButton}>← 戻る</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>{currentPrompt.topic}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>問題</Text>
            <Text style={styles.instructionsText}>
              {currentPrompt.description}
            </Text>
            <Text style={styles.instructionsDetails}>
              {currentPrompt.instructions}
            </Text>
          </View>

          {/* Input Tabs */}
          <View style={styles.inputTabsContainer}>
            <TouchableOpacity style={styles.inputTab}>
              <Text style={styles.inputTabText}>📝 テキスト入力</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputTab}
              onPress={handlePickImage}
            >
              <Text style={styles.inputTabText}>📸 手書き撮影</Text>
            </TouchableOpacity>
          </View>

          {/* Text Editor */}
          <View style={styles.editorContainer}>
            <View style={styles.editorHeader2}>
              <Text style={styles.editorLabel}>エッセイを入力</Text>
              <Text style={styles.wordCount}>
                {currentContent.length} / {currentPrompt.wordLimit * 1.5}文字
              </Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="ここにエッセイを入力してください..."
              placeholderTextColor="#999"
              multiline
              value={currentContent}
              onChangeText={setCurrentContent}
              maxLength={currentPrompt.wordLimit * 2}
            />
          </View>

          {/* Image Preview */}
          {currentImageUrl && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewLabel}>撮影済み</Text>
              <View style={styles.imagePreview}>
                <Text style={styles.imagePlaceholder}>📸 画像が撮影されました</Text>
              </View>
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setCurrentImageUrl(undefined)}
              >
                <Text style={styles.removeImageButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isScoring && styles.submitButtonDisabled]}
            onPress={handleSubmitEssay}
            disabled={isScoring}
          >
            {isScoring ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonIcon}>✓</Text>
                <Text style={styles.submitButtonText}>AI 採点に送信</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 内容（4点）・構成（4点）・語彙（4点）・文法（4点）で評価されます。
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WritingResultScreen
        onBack={handleBackToSelect}
        onResubmit={() => {
          setCurrentContent('');
          setCurrentImageUrl(undefined);
          setScreen('editor');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statBox: {
    flex: 1,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  scoringGuide: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    ...Shadows.xs,
  },
  scoringTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  scoringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  scoringLabel: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '500',
  },
  scoringPoint: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  promptCard: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
    ...Shadows.xs,
  },
  promptNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  promptNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  promptCardContent: {
    flex: 1,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  promptTopic: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  difficulty: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  promptDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  promptCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  wordLimit: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '700',
  },

  // Editor Screen
  editorHeader: {
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
  editorTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionsContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  instructionsDetails: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  inputTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  inputTab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#e6f4ff',
    borderRadius: 6,
    alignItems: 'center',
  },
  inputTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
  editorContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  editorHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  wordCount: {
    fontSize: 12,
    color: '#999',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#333',
    minHeight: 200,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imagePreviewContainer: {
    marginHorizontal: 24,
    marginTop: 16,
  },
  imagePreviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  imagePreview: {
    height: 150,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  removeImageButton: {
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  removeImageButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 12,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonIcon: {
    fontSize: 18,
    color: '#fff',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoBox: {
    marginHorizontal: 24,
    marginBottom: 40,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
