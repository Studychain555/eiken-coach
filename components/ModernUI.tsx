/**
 * Modern UI Components - Reusable Design System
 * Used across all pages for consistent modern design
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Modern Header
interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onBack?: () => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  icon,
  onBack,
}) => {
  return (
    <View style={styles.header}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}
      <View style={styles.headerContent}>
        {icon && <Text style={styles.headerIcon}>{icon}</Text>}
        <View>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

// Modern Card
interface ModernCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  highlight?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  onPress,
  style,
  highlight = false,
}) => {
  const cardStyle = [
    styles.card,
    highlight && styles.cardHighlight,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

// Modern Button
interface ModernButtonProps {
  label: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  icon?: string;
  style?: any;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  label,
  onPress,
  type = 'primary',
  disabled = false,
  icon,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    type === 'primary' && styles.buttonPrimary,
    type === 'secondary' && styles.buttonSecondary,
    type === 'danger' && styles.buttonDanger,
    disabled && styles.buttonDisabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {icon && <Text style={styles.buttonIcon}>{icon}</Text>}
      <Text
        style={[
          styles.buttonText,
          type === 'secondary' && styles.buttonTextSecondary,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Modern Progress Bar
interface ModernProgressBarProps {
  progress: number; // 0-100
  label?: string;
  color?: string;
}

export const ModernProgressBar: React.FC<ModernProgressBarProps> = ({
  progress,
  label,
  color = '#2BBCB3',
}) => {
  return (
    <View style={styles.progressContainer}>
      {label && (
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
      )}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

// Modern Stat Box
interface ModernStatBoxProps {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}

export const ModernStatBox: React.FC<ModernStatBoxProps> = ({
  icon,
  value,
  label,
  color = '#2BBCB3',
}) => {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Modern Section
interface ModernSectionProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  children,
  style,
}) => {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2BBCB3',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Card
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHighlight: {
    borderColor: '#2BBCB3',
    borderWidth: 2,
    backgroundColor: '#F8FFFE',
  },

  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: '#2BBCB3',
  },
  buttonSecondary: {
    backgroundColor: '#F0F0F0',
  },
  buttonDanger: {
    backgroundColor: '#FF6B6B',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  buttonTextSecondary: {
    color: '#222',
  },
  buttonIcon: {
    fontSize: 18,
  },

  // Progress Bar
  progressContainer: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2BBCB3',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Stat Box
  statBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12,
  },
});
