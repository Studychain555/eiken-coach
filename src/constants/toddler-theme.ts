/**
 * Toddler-Friendly Theme for EigoMaster
 * Warm, friendly colors and typography for young learners
 */

export const ToddlerTheme = {
  // Warm color palette
  colors: {
    // Primary brand colors - warm and inviting
    primary: '#FF9E64', // Warm orange
    primaryLight: '#FFB88C',
    primaryDark: '#E67E50',

    // Secondary colors
    secondary: '#FFB74D', // Golden orange
    secondaryLight: '#FFCC80',
    secondaryDark: '#E89B3C',

    // Accent colors
    accent1: '#FF6B6B', // Warm red
    accent2: '#FFD700', // Golden yellow
    accent3: '#FF8C42', // Warm coral
    accent4: '#95E1D3', // Soft teal (gentle, not harsh blue)

    // Neutral colors
    background: '#FFF9F5', // Warm white/cream
    surface: '#FFFBF7', // Slightly warmer white
    paper: '#FFFFFF', // Pure white for content

    // Text colors
    textPrimary: '#4A4A4A', // Dark gray (warm)
    textSecondary: '#8B7D7D', // Medium gray (warm)
    textLight: '#D4C4C4', // Light warm gray
    textInverse: '#FFFFFF', // White for contrast

    // Semantic colors
    success: '#95E1D3', // Soft green-teal
    warning: '#FFD700', // Golden
    error: '#FF6B6B', // Warm red
    info: '#FF8C42', // Warm orange

    // UI elements
    border: '#E8D5D5', // Warm light border
    divider: '#F0E0E0', // Warm divider
    overlay: 'rgba(74, 74, 74, 0.4)', // Warm dark overlay
  },

  // Typography - friendly and clear
  typography: {
    // Headings - Large and friendly
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
      fontFamily: 'System', // Use system font for better readability
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },

    // Subheadings
    subtitle1: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    subtitle2: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 26,
    },

    // Body text - clear and readable
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },

    // Labels and small text
    label: {
      fontSize: 12,
      fontWeight: '600',
      lineHeight: 16,
    },
    caption: {
      fontSize: 11,
      fontWeight: '400',
      lineHeight: 14,
    },

    // Button text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
  },

  // Spacing - comfortable and generous
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Border radius - rounded and friendly
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // Shadows - soft and warm
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#4A4A4A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#4A4A4A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#4A4A4A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // Interactive elements
  interactive: {
    pressOpacity: 0.7,
    disabledOpacity: 0.5,
  },
};

/**
 * Friendly message tones for young learners
 */
export const FriendlyMessages = {
  // Positive feedback
  correct: [
    'すごい！正解です！',
    'よくできました！',
    'その通り！',
    'ばんざーい！',
    '素晴らしい！',
    'どんどん上達してる！',
    'その調子！',
  ],

  // Encouraging messages
  incorrect: [
    'もう一度挑戦してみてね',
    '大丈夫。次頑張ろう！',
    'もう少しだったね',
    '上手になってるよ',
    'また挑戦してね',
    '繰り返すとわかるよ',
  ],

  // Progress messages
  milestone: [
    '10個覚えましたね！',
    '50個も覚えた！',
    '100個達成！すごい！',
    'レベルアップ！',
    'あなたは天才！',
  ],

  // Motivational
  motivation: [
    '毎日少しずつ頑張ろう',
    '英語は楽しい！',
    '世界が広がるよ',
    '友達と英語で話そう',
    'あなたはできる！',
  ],
};

/**
 * Interaction patterns for young learners
 */
export const ToddlerInteractions = {
  buttonPressScale: 0.95,
  hapticFeedback: true,
  soundEffects: true,
  animationDuration: 300,
  longPressDelay: 500,
};

/**
 * Icons and emojis suitable for young learners
 */
export const ToddlerEmojis = {
  correct: '✅',
  incorrect: '❌',
  thinking: '🤔',
  happy: '😊',
  excited: '🎉',
  star: '⭐',
  heart: '❤️',
  flower: '🌸',
  sun: '☀️',
  cloud: '☁️',
  book: '📚',
  pencil: '✏️',
};

export default ToddlerTheme;
