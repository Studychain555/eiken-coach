/**
 * Tablet Responsive Utilities
 * Breakpoints and responsive sizing for tablet optimization
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Tablet Breakpoints
export const TABLET_BREAKPOINTS = {
  small: 600,    // iPad mini / small tablets
  medium: 768,   // Standard iPad
  large: 1024,   // iPad Pro 11"
  xlarge: 1366,  // iPad Pro 12.9"
};

// Screen Configuration
export const SCREEN_CONFIG = {
  // Component heights (for layout planning)
  headerHeight: 80,
  statusBarHeight: 40,
  dailyGoalsHeight: 160,
  learningStatsHeight: 300,
  quickActionsHeight: 120,
  totalHeight: 700, // Should fit on tablet landscape (900px)

  // Safe areas
  paddingHorizontal: 24,
  paddingVertical: 16,

  // Card dimensions
  minTouchTarget: 44, // Accessibility minimum
  maxContentWidth: 1000, // Tablet-optimized max width
};

// Responsive Utilities
export const getResponsiveValue = (baseValue: number, tablet?: number, large?: number): number => {
  if (width >= TABLET_BREAKPOINTS.large && large !== undefined) {
    return large;
  }
  if (width >= TABLET_BREAKPOINTS.small && tablet !== undefined) {
    return tablet;
  }
  return baseValue;
};

export const getResponsiveFontSize = (
  base: number,
  tablet?: number,
  large?: number,
): number => {
  return getResponsiveValue(base, tablet, large);
};

export const getResponsiveSpacing = (
  base: number,
  tablet?: number,
  large?: number,
): number => {
  return getResponsiveValue(base, tablet, large);
};

export const isTablet = (): boolean => {
  return width >= TABLET_BREAKPOINTS.small;
};

export const isLargeTablet = (): boolean => {
  return width >= TABLET_BREAKPOINTS.large;
};

export const isLandscape = (): boolean => {
  return width > height;
};

// Responsive Container Width
export const getContainerWidth = (): number => {
  if (isLargeTablet()) {
    return Math.min(SCREEN_CONFIG.maxContentWidth, width - SCREEN_CONFIG.paddingHorizontal * 2);
  }
  return width - SCREEN_CONFIG.paddingHorizontal * 2;
};

// Grid Column Count
export const getGridColumns = (): number => {
  if (isLargeTablet()) {
    return 4;
  }
  if (isTablet()) {
    return 3;
  }
  return 2;
};

// Responsive Text Styles
export const ResponsiveTypography = {
  // Headers
  h1FontSize: getResponsiveFontSize(32, 36, 40),
  h2FontSize: getResponsiveFontSize(28, 32, 36),
  h3FontSize: getResponsiveFontSize(24, 28, 32),
  h4FontSize: getResponsiveFontSize(20, 24, 28),
  h5FontSize: getResponsiveFontSize(18, 20, 24),

  // Body
  bodyFontSize: getResponsiveFontSize(16, 16, 18),
  bodySmallFontSize: getResponsiveFontSize(14, 15, 16),
  captionFontSize: getResponsiveFontSize(12, 13, 14),
};

// Responsive Spacing
export const ResponsiveSpacing = {
  horizontal: getResponsiveSpacing(24, 32, 48),
  vertical: getResponsiveSpacing(16, 20, 24),
  itemGap: getResponsiveSpacing(12, 16, 20),
  cardPadding: getResponsiveSpacing(12, 16, 20),
};

// Safe Area Padding
export const getSafeAreaPadding = () => ({
  horizontal: getResponsiveValue(24, 32, 48),
  vertical: getResponsiveValue(16, 20, 24),
});

// Viewport Characteristics
export const ViewportInfo = {
  width,
  height,
  isTablet: isTablet(),
  isLargeTablet: isLargeTablet(),
  isLandscape: isLandscape(),
  currentBreakpoint:
    width >= TABLET_BREAKPOINTS.xlarge
      ? 'xlarge'
      : width >= TABLET_BREAKPOINTS.large
        ? 'large'
        : width >= TABLET_BREAKPOINTS.medium
          ? 'medium'
          : width >= TABLET_BREAKPOINTS.small
            ? 'small'
            : 'mobile',
};

// Debug Helper (remove in production)
export const logViewportInfo = () => {
  if (__DEV__) {
    console.log('Viewport Info:', ViewportInfo);
  }
};
