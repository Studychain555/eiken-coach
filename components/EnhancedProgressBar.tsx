import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface EnhancedProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  height?: number;
  animated?: boolean;
  style?: any;
}

/**
 * Enhanced Progress Bar Component
 * Shows learning progress with smooth animation and labels
 */
export function EnhancedProgressBar({
  percentage,
  label,
  showPercentage = true,
  color = Colors.light.primary,
  backgroundColor = Colors.light.border,
  height = 8,
  animated = true,
  style,
}: EnhancedProgressBarProps) {
  const widthAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnim, {
        toValue: percentage,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [percentage, widthAnim, animated]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={style}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={[styles.percentage, { color }]}>
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.barContainer,
          {
            height,
            backgroundColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.barFill,
            {
              width,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  color?: string;
  style?: any;
}

/**
 * Step Progress Component
 * Shows progress through multiple steps (e.g., lesson stages)
 */
export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  color = Colors.light.primary,
  style,
}: StepProgressProps) {
  return (
    <View style={style}>
      <View style={styles.stepContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    index < currentStep ? color : Colors.light.border,
                  borderColor: index <= currentStep ? color : Colors.light.border,
                },
              ]}
            >
              {index < currentStep && (
                <Text style={styles.stepCheckmark}>✓</Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor: index < currentStep ? color : Colors.light.border,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
      {labels && (
        <View style={styles.stepLabelsContainer}>
          {labels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.stepLabel,
                {
                  color: index <= currentStep ? color : Colors.light.textTertiary,
                  fontWeight: index === currentStep ? '600' : '400',
                },
              ] as any}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

interface MilestoneProps {
  milestone: number;
  current: number;
  unit: string;
  icon?: string;
  color?: string;
}

/**
 * Milestone Component
 * Shows progress toward a goal (e.g., 50 words learned)
 */
export function Milestone({
  milestone,
  current,
  unit,
  icon = '🎯',
  color = Colors.light.primary,
}: MilestoneProps) {
  const percentage = Math.min((current / milestone) * 100, 100);
  const isCompleted = current >= milestone;

  return (
    <View style={styles.milestoneContainer}>
      <View style={styles.milestoneHeader}>
        <Text style={styles.milestoneIcon}>{icon}</Text>
        <View style={styles.milestoneTitle}>
          <Text style={styles.milestoneLabelText}>
            {milestone} {unit}
          </Text>
          {isCompleted && (
            <Text style={styles.completedBadge}>完達！</Text>
          )}
        </View>
      </View>
      <EnhancedProgressBar
        percentage={percentage}
        color={isCompleted ? Colors.light.success : color}
        label={`${current} / ${milestone}`}
        showPercentage={false}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
}

/**
 * Circular Progress Component
 * Visual progress indicator for comprehensive metrics
 */
export function CircularProgress({
  percentage,
  size = 100,
  strokeWidth = 8,
  color = Colors.light.primary,
  backgroundColor = Colors.light.border,
  showLabel = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: '-90deg' }] } as any}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <View style={styles.circularLabel}>
          <Text style={[styles.circularPercentage, { color }]}>
            {Math.round(percentage)}%
          </Text>
          {label && (
            <Text style={styles.circularLabelText as any}>{label}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  percentage: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  barContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stepCheckmark: {
    color: '#fff',
    fontWeight: '700',
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    flex: 1,
    top: 15,
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  stepLabel: {
    ...Typography.caption,
    textAlign: 'center',
    flex: 1,
  },
  milestoneContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.light.surfaceCard,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  milestoneTitle: {
    flex: 1,
  },
  milestoneLabelText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.light.text,
  },
  completedBadge: {
    ...Typography.caption,
    color: Colors.light.success,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularPercentage: {
    ...Typography.h4,
    fontWeight: '700',
  },
  circularLabelText: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
});
