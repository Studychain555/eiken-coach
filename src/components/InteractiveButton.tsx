/**
 * InteractiveButton Component
 * Enhanced button with tap feedback animation
 * Uses React Native Animated for smooth 60fps response
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { Colors, DuolingoColors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface InteractiveButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  children: string;
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: DuolingoColors.primary,
          textColor: '#FFFFFF',
        };
      case 'success':
        return {
          backgroundColor: DuolingoColors.success,
          textColor: '#FFFFFF',
        };
      case 'danger':
        return {
          backgroundColor: DuolingoColors.error,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: DuolingoColors.lightBg,
          textColor: Colors.light.text,
        };
      default:
        return {
          backgroundColor: DuolingoColors.primary,
          textColor: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontSize: 14,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          fontSize: 18,
        };
      case 'medium':
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: 16,
        };
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const variantColors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: variantColors.backgroundColor,
            opacity: disabled ? 0.5 : 1,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: variantColors.textColor,
              fontSize: sizeStyles.fontSize,
            },
          ]}
        >
          {children}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  text: {
    fontWeight: 600 as unknown as '600',
  },
});
