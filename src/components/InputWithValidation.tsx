/**
 * InputWithValidation Component
 * バリデーション表示付きテキスト入力
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface InputWithValidationProps {
  value: string;
  onChangeText: (text: string) => void;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  label?: string;
}

export const InputWithValidation: React.FC<InputWithValidationProps> = ({
  value,
  onChangeText,
  minLength = 0,
  maxLength = 500,
  placeholder,
  label,
}) => {
  const isBelowMin = value.length < minLength && value.length > 0;
  const isWarning = value.length > maxLength * 0.8;
  const isError = value.length >= maxLength;

  const getBorderColor = () => {
    if (isError) return '#f44336';
    if (isWarning) return '#ff9800';
    return Colors.light.border;
  };

  const getCountColor = () => {
    if (isError) return '#f44336';
    if (isWarning) return '#ff9800';
    return Colors.light.textSecondary;
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: getBorderColor() },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textSecondary}
        maxLength={maxLength}
        multiline
      />
      <View style={styles.footer}>
        {isBelowMin && (
          <Text style={styles.error}>
            最低 {minLength}文字必要です
          </Text>
        )}
        <Text style={[styles.count, { color: getCountColor() }]}>
          {value.length} / {maxLength}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    minHeight: 100,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  error: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
  },
});
