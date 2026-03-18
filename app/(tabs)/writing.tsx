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
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>✍️ ライティング練習</Text>
            <Text style={styles.subtitle}>英検準1級形式</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>提出済み</Text>
              <Text style={styles.statValue}>{getTotalSubmissions()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>平均スコア</Text>
              <Text style={styles.statValue}>{getAverageScore()}/16</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>今日</Text>
              <Text style={styles.statValue}>{stats.attempted}</Text>
            </View>
          </View>

          {/* Prompts */}
          <View style={styles.promptsSection}>
            <Text style={styles.sectionTitle}>問題を選択</Text>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptCard}
                onPress={() => handleStartPrompt(prompt)}
              >
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
                    目安: {prompt.wordLimit}語
                  </Text>
                  <Text style={styles.actionText}>開く →</Text>
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
    backgroundColor: '#f5f9ff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  promptsSection: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  promptCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promptTopic: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  difficulty: {
    fontSize: 12,
    color: '#666',
  },
  promptDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  promptCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordLimit: {
    fontSize: 12,
    color: '#999',
  },
  actionText: {
    fontSize: 12,
    color: '#0066cc',
    fontWeight: '600',
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
