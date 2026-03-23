/**
 * ShadowingOnboarding - Registration前チュートリアル
 * シャドーイングの効果を3ページで説明するオンボーディング画面
 *
 * レスポンシブ対応: モバイル（〜767px）/ タブレット（768-1023px）/ PC（1024px〜）
 * 3層レイアウト: Header（固定） / Main（スクロール） / Footer（固定）
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';

// CSS変数相当のデザイントークン
const TOKENS = {
  colors: {
    primary: '#2BBCB3',
    primaryDark: '#25A8A0',
    primaryLight: '#E6FAF8',
    primaryBorder: '#C4F0EC',
    bg: '#F5F5F5',
    card: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#555555',
    textMuted: '#888888',
    textDisabled: '#AAAAAA',
    border: '#E0E0E0',
    surface: '#F7F7F7',
    surfaceWarm: '#F3F3F0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 3 },
    button: { shadowColor: '#2BBCB3', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 },
  },
};

// ブレークポイント定義
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

// スライドデータ
const SLIDES = [
  {
    id: 1,
    title: '"聞こえない"の正体は\n英語特有の音の変化',
    example: 'I have to join another meeting.',
    highlightWord: 'have to',
    memorizedSound: 'ハブトゥ',
    actualSound: 'ハフタ',
    description:
      'ネイティブは会話の際に単語を１語ずつはっきりと発話せず、自然と音をつなげて話しています。',
  },
  {
    id: 2,
    title: '音の変化を知れば\nリスニング力が上がる',
    example: 'What do you want to do?',
    highlightWord: 'want to',
    memorizedSound: 'ウォントトゥ',
    actualSound: 'ワナ',
    description:
      '音の変化のパターンを知り、繰り返しシャドーイングすることで聞き取れるようになります。',
  },
  {
    id: 3,
    title: 'シャドーイングで\n自然な発音も身につく',
    example: "I'm going to get it done.",
    highlightWord: 'going to',
    memorizedSound: 'ゴーイングトゥ',
    actualSound: 'ガナ',
    description:
      '聞いた音をすぐに真似して声に出すことで、自然な英語のリズムと発音が身につきます。',
  },
];

interface Props {
  onSkip?: () => void;
  onComplete?: () => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const getResponsiveSize = (mobile: number, tablet: number, desktop: number, deviceType: DeviceType): number => {
  switch (deviceType) {
    case 'tablet':
      return tablet;
    case 'desktop':
      return desktop;
    default:
      return mobile;
  }
};

export default function ShadowingOnboarding({ onSkip, onComplete }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { width: windowWidth } = useWindowDimensions();

  const slide = SLIDES[currentPage];
  const isLastPage = currentPage === SLIDES.length - 1;

  // ブレークポイント判定
  const deviceType: DeviceType = useMemo(() => {
    if (windowWidth >= BREAKPOINTS.tablet) return 'desktop';
    if (windowWidth >= BREAKPOINTS.mobile) return 'tablet';
    return 'mobile';
  }, [windowWidth]);

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (isLastPage) {
      onComplete?.();
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const handleDotPress = (index: number) => {
    setCurrentPage(index);
  };

  // ハイライト付きテキスト
  const renderHighlightedText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'i'));
    return (
      <Text style={getStyles(deviceType).exampleText}>
        {parts.map((part, idx) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={idx} style={getStyles(deviceType).highlightText}>
              {part}
            </Text>
          ) : (
            <Text key={idx}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  const headerHeight = getResponsiveSize(60, 70, 80, deviceType);
  const footerHeight = getResponsiveSize(75, 90, 100, deviceType);
  const mainHeight = windowWidth > BREAKPOINTS.mobile ? '100%' : '100%';

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: TOKENS.colors.bg }]}>
      {/* Header - 固定 */}
      <View style={[styles.header, { height: headerHeight }]}>
        <Text style={getStyles(deviceType).headerTitle}>
          なぜシャドーイングが
          <Text style={getStyles(deviceType).headerTitleHighlight}>{'\n'}効果的なのか</Text>
        </Text>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={getStyles(deviceType).infoButtonText}>シャドーイングとは </Text>
          <View style={getStyles(deviceType).infoIcon}>
            <Text style={getStyles(deviceType).infoIconText}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main - スクロール可能 */}
      <ScrollView
        style={styles.main}
        contentContainerStyle={[
          styles.mainContent,
          { paddingBottom: footerHeight + 16 }
        ]}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={[getStyles(deviceType).container, { paddingHorizontal: getResponsiveSize(20, 0, 0, deviceType) }]}>
          {/* Card */}
          <View style={getStyles(deviceType).card}>
            {/* Card Title */}
            <Text style={getStyles(deviceType).cardTitle}>{slide.title}</Text>

            {/* Audio Player */}
            <View style={getStyles(deviceType).audioSection}>
              <TouchableOpacity
                style={getStyles(deviceType).playButton}
                onPress={handlePlayAudio}
              >
                <Text style={styles.playButtonIcon}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
              <View style={styles.exampleContainer}>
                {renderHighlightedText(slide.example, slide.highlightWord)}
              </View>
            </View>

            {/* Sound Comparison */}
            <View style={getStyles(deviceType).comparisonSection}>
              <View style={getStyles(deviceType).soundBox}>
                <Text style={getStyles(deviceType).soundLabel}>覚えている音</Text>
                <Text style={getStyles(deviceType).soundValue}>{slide.memorizedSound}</Text>
              </View>

              <Text style={getStyles(deviceType).notEqualSign}>≠</Text>

              <View style={[getStyles(deviceType).soundBox, getStyles(deviceType).soundBoxActual]}>
                <Text style={getStyles(deviceType).soundLabel}>実際に聞こえる音</Text>
                <Text style={[getStyles(deviceType).soundValue, getStyles(deviceType).soundValueActual]}>
                  {slide.actualSound}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={getStyles(deviceType).description}>{slide.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer - 固定 */}
      <View style={[styles.footer, { height: footerHeight }]}>
        {/* Page Indicator */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dot,
                currentPage === idx
                  ? getStyles(deviceType).dotActive
                  : styles.dotInactive,
              ]}
              onPress={() => handleDotPress(idx)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={getStyles(deviceType).buttonContainer}>
          <TouchableOpacity
            style={getStyles(deviceType).skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={getStyles(deviceType).skipButtonText}>スキップ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getStyles(deviceType).nextButton}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={getStyles(deviceType).nextButtonText}>
              {isLastPage ? '始める' : '次へ'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// レスポンシブスタイル取得関数
function getStyles(deviceType: DeviceType) {
  if (deviceType === 'tablet') {
    return tabletStyles;
  }
  if (deviceType === 'desktop') {
    return desktopStyles;
  }
  return mobileStyles;
}

// モバイルスタイル
const mobileStyles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 30,
  },
  headerTitleHighlight: {
    color: TOKENS.colors.textPrimary,
    fontWeight: '700',
  },
  infoButtonText: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
  },
  infoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 3,
  },
  infoIconText: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radius.lg,
    padding: 16,
    ...TOKENS.shadows.card,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TOKENS.colors.primary,
    marginBottom: 12,
    lineHeight: 24,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  exampleText: {
    fontSize: 13,
    color: TOKENS.colors.textPrimary,
    fontWeight: '500',
    lineHeight: 18,
  },
  highlightText: {
    color: TOKENS.colors.primary,
    fontWeight: '700',
  },
  comparisonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 6,
  },
  soundBox: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  soundBoxActual: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: TOKENS.colors.primaryBorder,
  },
  soundLabel: {
    fontSize: 11,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  soundValue: {
    fontSize: 14,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
  },
  soundValueActual: {
    color: TOKENS.colors.primary,
  },
  notEqualSign: {
    fontSize: 16,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: 3,
  },
  description: {
    fontSize: 13,
    color: TOKENS.colors.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
  dotActive: {
    width: 24,
    height: 6,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: 3,
  },
  skipButton: {
    flex: 0.32,
    paddingVertical: 10,
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: TOKENS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
});

// タブレットスタイル
const tabletStyles = StyleSheet.create({
  container: {
    width: 520,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 36,
  },
  headerTitleHighlight: {
    color: TOKENS.colors.textPrimary,
    fontWeight: '800',
  },
  infoButtonText: {
    fontSize: 13,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  infoIconText: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radius.lg,
    padding: 20,
    ...TOKENS.shadows.card,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TOKENS.colors.primary,
    marginBottom: 14,
    lineHeight: 28,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  exampleText: {
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  highlightText: {
    color: TOKENS.colors.primary,
    fontWeight: '700',
  },
  comparisonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  soundBox: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 11,
    padding: 11,
    alignItems: 'center',
  },
  soundBoxActual: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: TOKENS.colors.primaryBorder,
  },
  soundLabel: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 5,
  },
  soundValue: {
    fontSize: 15,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
  },
  soundValueActual: {
    color: TOKENS.colors.primary,
  },
  notEqualSign: {
    fontSize: 18,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  description: {
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  dotActive: {
    width: 24,
    height: 6,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: 3,
  },
  skipButton: {
    flex: 0.32,
    paddingVertical: 11,
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: TOKENS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: 14,
  },
});

// デスクトップスタイル
const desktopStyles = StyleSheet.create({
  container: {
    width: 600,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 38,
  },
  headerTitleHighlight: {
    color: TOKENS.colors.textPrimary,
    fontWeight: '800',
  },
  infoButtonText: {
    fontSize: 14,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
  },
  infoIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D4D4D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  infoIconText: {
    fontSize: 13,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: TOKENS.colors.card,
    borderRadius: 20,
    padding: 24,
    ...TOKENS.shadows.card,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TOKENS.colors.primary,
    marginBottom: 16,
    lineHeight: 30,
  },
  audioSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
    flexShrink: 0,
  },
  exampleText: {
    fontSize: 15,
    color: TOKENS.colors.textPrimary,
    fontWeight: '500',
    lineHeight: 22,
  },
  highlightText: {
    color: TOKENS.colors.primary,
    fontWeight: '700',
  },
  comparisonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  soundBox: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
  },
  soundBoxActual: {
    backgroundColor: TOKENS.colors.primaryLight,
    borderWidth: 1.5,
    borderColor: TOKENS.colors.primaryBorder,
  },
  soundLabel: {
    fontSize: 12,
    color: TOKENS.colors.textSecondary,
    fontWeight: '500',
    marginBottom: 5,
  },
  soundValue: {
    fontSize: 16,
    fontWeight: '700',
    color: TOKENS.colors.textPrimary,
  },
  soundValueActual: {
    color: TOKENS.colors.primary,
  },
  notEqualSign: {
    fontSize: 20,
    color: TOKENS.colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  description: {
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    lineHeight: 21,
    fontWeight: '500',
  },
  dotActive: {
    width: 24,
    height: 6,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: 3,
  },
  skipButton: {
    flex: 0.32,
    paddingVertical: 11,
    backgroundColor: TOKENS.colors.card,
    borderRadius: TOKENS.radius.md,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: TOKENS.colors.textSecondary,
  },
  nextButton: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: TOKENS.colors.primary,
    borderRadius: TOKENS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: 14,
  },
});

// 共通スタイル
const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: TOKENS.colors.bg,
  },
  header: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: TOKENS.colors.bg,
  },
  main: {
    flex: 1,
    overflow: 'scroll',
  },
  mainContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  footer: {
    flexShrink: 0,
    justifyContent: 'flex-end',
    paddingVertical: 16,
    backgroundColor: TOKENS.colors.bg,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.border,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exampleContainer: {
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
  },
  dot: {
    borderRadius: 4,
    cursor: 'pointer',
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: '#D4D4D4',
    borderRadius: 4,
  },
});
