/**
 * ConfirmationModal Component
 * 危険な操作の確認用モーダルダイアログ
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  icon?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  cancelText = 'キャンセル',
  confirmText = '確定',
  isDestructive = false,
  isLoading = false,
  onCancel,
  onConfirm,
  icon = '⚠️',
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          {icon && <Text style={styles.icon}>{icon}</Text>}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                isDestructive && styles.destructiveButton,
                isLoading && styles.loadingButton,
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  isDestructive && styles.destructiveButtonText,
                ]}
              >
                {isLoading ? '処理中...' : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    maxWidth: Math.min(width - 40, 300),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700' as any,
    color: Colors.light.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: Colors.light.border,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600' as any,
    color: Colors.light.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600' as any,
    color: '#fff',
  },
  destructiveButton: {
    backgroundColor: Colors.light.error,
  },
  destructiveButtonText: {
    color: '#fff',
  },
  loadingButton: {
    opacity: 0.6,
  },
});
