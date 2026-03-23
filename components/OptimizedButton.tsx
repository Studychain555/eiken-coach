import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography, NaturalColors } from '@/constants/theme';

interface OptimizedButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Optimized Button Component
 * Accessibility-focused button with proper touch target size (min 44x44pt)
 */
export function OptimizedButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: OptimizedButtonProps) {
  const sizeMap = {
    sm: {
      padding: Spacing.sm,
      fontSize: 14,
      minHeight: 36,
      iconSize: 16,
    },
    md: {
      padding: Spacing.md,
      fontSize: 16,
      minHeight: 44, // Minimum accessibility standard
      iconSize: 20,
    },
    lg: {
      padding: Spacing.lg,
      fontSize: 18,
      minHeight: 52,
      iconSize: 24,
    },
  };

  const variantStyles = {
    primary: {
      background: NaturalColors.primary,
      text: '#ffffff',
      border: NaturalColors.primary,
      shadow: { width: 0, height: 2, opacity: 0.15, radius: 8 },
    },
    secondary: {
      background: NaturalColors.cardBg,
      text: NaturalColors.primary,
      border: NaturalColors.secondary,
      shadow: { width: 0, height: 1, opacity: 0.08, radius: 4 },
    },
    success: {
      background: NaturalColors.success,
      text: '#ffffff',
      border: NaturalColors.success,
      shadow: { width: 0, height: 2, opacity: 0.15, radius: 8 },
    },
    warning: {
      background: NaturalColors.warning,
      text: '#ffffff',
      border: NaturalColors.warning,
      shadow: { width: 0, height: 2, opacity: 0.15, radius: 8 },
    },
    danger: {
      background: NaturalColors.error,
      text: '#ffffff',
      border: NaturalColors.error,
      shadow: { width: 0, height: 2, opacity: 0.15, radius: 8 },
    },
    outline: {
      background: 'transparent',
      text: NaturalColors.primary,
      border: NaturalColors.primary,
      shadow: null,
    },
  };

  const config = sizeMap[size];
  const variantConfig = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          paddingHorizontal: config.padding,
          paddingVertical: config.padding,
          minHeight: config.minHeight,
          backgroundColor: disabled ? Colors.light.border : variantConfig.background,
          width: fullWidth ? '100%' : 'auto',
          borderColor: variantConfig.border,
          ...(variantConfig.shadow || {}),
        },
        style,
      ]}
    >
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color={variantConfig.text} size={config.iconSize} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Text style={{ fontSize: config.iconSize, marginRight: Spacing.sm }}>
                {icon}
              </Text>
            )}
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: config.fontSize,
                  color: disabled ? Colors.light.textTertiary : variantConfig.text,
                  fontWeight: '600',
                },
                textStyle,
              ]}
            >
              {label}
            </Text>
            {icon && iconPosition === 'right' && (
              <Text style={{ fontSize: config.iconSize, marginLeft: Spacing.sm }}>
                {icon}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface ButtonGroupProps {
  buttons: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  selectedId: string;
  onSelect: (id: string) => void;
  size?: 'sm' | 'md';
}

/**
 * Button Group Component
 * Toggle between multiple options
 */
export function ButtonGroup({ buttons, selectedId, onSelect, size = 'md' }: ButtonGroupProps) {
  const sizeMap = {
    sm: { padding: Spacing.sm, fontSize: 13 },
    md: { padding: Spacing.md, fontSize: 14 },
  };

  const config = sizeMap[size];

  return (
    <View style={styles.buttonGroup}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={button.id}
          onPress={() => onSelect(button.id)}
          style={[
            styles.groupButton,
            {
              paddingHorizontal: config.padding,
              paddingVertical: config.padding,
              backgroundColor:
                selectedId === button.id
                  ? Colors.light.primary
                  : Colors.light.backgroundAlt,
              borderTopLeftRadius: index === 0 ? BorderRadius.lg : 0,
              borderBottomLeftRadius: index === 0 ? BorderRadius.lg : 0,
              borderTopRightRadius: index === buttons.length - 1 ? BorderRadius.lg : 0,
              borderBottomRightRadius: index === buttons.length - 1 ? BorderRadius.lg : 0,
            },
          ]}
        >
          {button.icon && (
            <Text style={{ fontSize: 16, marginRight: Spacing.xs }}>
              {button.icon}
            </Text>
          )}
          <Text
            style={{
              fontSize: config.fontSize,
              fontWeight: '500',
              color:
                selectedId === button.id
                  ? '#ffffff'
                  : Colors.light.text,
            }}
          >
            {button.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  groupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
