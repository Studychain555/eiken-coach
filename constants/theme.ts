/**
 * Educational App Theme System
 * Optimized for learning experience with eye-friendly colors and typography
 */

import { Platform } from 'react-native';

// Primary Brand Colors (Educational Blue)
const primaryBlue = '#2563eb'; // Vibrant, trust-inspiring blue
const primaryBlueDark = '#1e40af';
const primaryBlueLight = '#eff6ff';

// Accent Colors (Learning Engagement)
const accentGreen = '#16a34a'; // Success, achievement
const accentOrange = '#ea580c'; // Motivation, streak
const accentPurple = '#7c3aed'; // Learning progress
const accentPink = '#db2777'; // Challenge achieved

// Semantic Colors
const successGreen = '#10b981';
const warningOrange = '#f59e0b';
const errorRed = '#ef4444';
const infoBlue = '#0ea5e9';

const tintColorLight = primaryBlue;
const tintColorDark = '#e0e7ff';

export const Colors = {
  light: {
    // Core
    text: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    background: '#f9fafb',
    backgroundAlt: '#f3f4f6',
    surfaceCard: '#ffffff',

    // Brand
    tint: primaryBlue,
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    primaryLight: primaryBlueLight,

    // Accents
    accent: accentOrange,
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,

    // Interactive
    icon: '#6b7280',
    tabIconDefault: '#d1d5db',
    tabIconSelected: primaryBlue,

    // Semantic
    streak: accentOrange,
    achievement: accentGreen,
    progress: accentPurple,
    challenge: accentPink,

    // Teacher Dashboard (新規)
    sidebar: '#2E5090',
    sidebarText: '#FFFFFF',
    sidebarActive: '#4CAF50',
    sidebarHover: 'rgba(76, 175, 80, 0.2)',
    statsBackground: '#F5F9FF',
    tableHeaderBg: '#E8EEF7',
    accentGreen: '#4CAF50',
    accentPink: '#E91E63',

    // Borders & Shadows
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // Core
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    background: '#111827',
    backgroundAlt: '#1f2937',
    surfaceCard: '#374151',

    // Brand
    tint: tintColorDark,
    primary: '#60a5fa',
    primaryDark: primaryBlue,
    primaryLight: primaryBlueLight,

    // Accents
    accent: '#fbbf24',
    success: '#6ee7b7',
    warning: '#fcd34d',
    error: '#f87171',
    info: '#38bdf8',

    // Interactive
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#60a5fa',

    // Semantic
    streak: '#fbbf24',
    achievement: '#6ee7b7',
    progress: '#c084fc',
    challenge: '#f472b6',

    // Borders & Shadows
    border: '#4b5563',
    borderLight: '#1f2937',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Typography Scale
export const Typography = {
  // Display & Headlines
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
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
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },

  // Captions & Labels
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
  },
};

// Spacing System
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadow System (Education-friendly, subtle)
export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
};

// ==========================================
// Duolingo-Style Gamification Colors
// ==========================================
export const DuolingoColors = {
  primary: '#3498DB',           // Bright, friendly blue
  success: '#52C41A',           // Fresh, satisfying green
  warning: '#FAAD14',           // Gold (hearts, level-up)
  error: '#F5222D',             // Clear red (incorrect)
  accent: '#FA541C',            // Vibrant orange (XP, bonus)
  streak: '#FF7A45',            // Fire orange-red (momentum)
  background: '#FFFFFF',        // Clean white
  cardBackground: '#FFFFFF',    // Card white
  lightBg: '#F5F5F5',           // Soft gray background
  tapFeedback: 'rgba(0,0,0,0.1)',
  correct: '#52C41A',           // Correct answer flash
  incorrect: '#F5222D',         // Incorrect answer flash
  combo: '#FAAD14',             // Combo counter
};

// ==========================================
// Shadoten App Color Scheme
// ==========================================
export const ShadotenColors = {
  // Header & Primary
  headerTeal: '#1B9BA4',         // Teal header background
  teal: '#1B9BA4',               // Primary teal
  tealLight: '#2DB3BA',          // Light teal accents

  // Content Areas
  brown: '#8B6F47',              // Brown/tan content background
  brownLight: '#A0826D',         // Light brown accents

  // Feedback Colors
  goodPointsTeal: '#1B9BA4',     // Good Points section (teal)
  goodPointsText: '#FFFFFF',     // White text on good points
  developmentPointsRed: '#E85D6F', // Development Points section (red/pink)
  developmentPointsText: '#FFFFFF', // White text on development points

  // Interactive Elements
  timeBonus: '#FAAD14',          // Time bonus indicator (yellow/gold)
  timeBonusBackground: 'rgba(250, 173, 20, 0.1)', // Light gold background

  // Highlighting & Feedback
  correctCircle: '#52C41A',      // Circle for correct answer (green)
  incorrectX: '#F5222D',         // X mark for incorrect (red)

  // Backgrounds
  cardWhite: '#FFFFFF',          // Large interactive card background
  contentBg: '#F5F5F5',          // Light background
  textDark: '#333333',           // Dark text on white
  textLight: '#666666',          // Light text on white
};

// ==========================================
// React Native Animation Timings
// ==========================================
export const AnimationTimings = {
  // Tap feedback: Quick scale response
  TAP_SCALE: {
    duration: 100,
    from: 0.95,
    to: 1.0,
  },
  // Slide in: Screen transitions
  SLIDE_IN: {
    duration: 300,
    easing: 'easeOut',
  },
  // Bounce: Spring-like celebration
  BOUNCE: {
    duration: 400,
    easing: 'spring',
  },
  // Confetti: Long celebration
  CONFETTI: {
    duration: 2500,
    easing: 'linear',
  },
  // Heart pop: Quick pop animation
  HEART_POP: {
    duration: 200,
    easing: 'easeOut',
  },
  // XP float: Floating text upward
  XP_FLOAT_UP: {
    duration: 1000,
    easing: 'easeOut',
  },
  // Combo counter: Visible feedback
  COMBO_POP: {
    duration: 300,
    easing: 'spring',
  },
  // Level up: Full celebration
  LEVEL_UP: {
    duration: 1500,
    easing: 'linear',
  },
};
