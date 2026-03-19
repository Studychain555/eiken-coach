/**
 * CelebrationAnimation Component
 * Displays various celebration effects triggered by learning achievements
 * Supports confetti, heart pop, XP float, combo, and level up animations
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { DuolingoColors } from '@/constants/theme';

interface CelebrationAnimationProps {
  type: 'confetti' | 'heartPop' | 'xpFloat' | 'combo' | 'levelUp' | 'correct' | 'incorrect';
  trigger: boolean;
  amount?: number;
  onComplete?: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  type,
  trigger,
  amount = 10,
  onComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const translateYAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const windowHeight = useWindowDimensions().height;

  useEffect(() => {
    if (!trigger) {
      return;
    }

    setIsAnimating(true);

    switch (type) {
      case 'confetti':
        playConfetti();
        break;
      case 'heartPop':
        playHeartPop();
        break;
      case 'xpFloat':
        playXPFloat();
        break;
      case 'combo':
        playCombo();
        break;
      case 'levelUp':
        playLevelUp();
        break;
      case 'correct':
        playCorrect();
        break;
      case 'incorrect':
        playIncorrect();
        break;
    }
  }, [trigger]);

  const playConfetti = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 2400,
        delay: 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -200,
        duration: 2500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onComplete?.();
    });
  };

  const playHeartPop = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 100,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        onComplete?.();
      });
    });
  };

  const playXPFloat = () => {
    Animated.parallel([
      Animated.timing(translateYAnim, {
        toValue: -150,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 900,
          delay: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsAnimating(false);
      onComplete?.();
    });
  };

  const playCombo = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        onComplete?.();
      });
    });
  };

  const playLevelUp = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 360,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onComplete?.();
    });
  };

  const playCorrect = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onComplete?.();
    });
  };

  const playIncorrect = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsAnimating(false);
      onComplete?.();
    });
  };

  const renderContent = () => {
    switch (type) {
      case 'confetti':
        return (
          <Animated.View
            style={[
              styles.confetti,
              {
                opacity: opacityAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            <Text style={styles.confettiText}>🎉 ✨ 🎊</Text>
          </Animated.View>
        );
      case 'heartPop':
        return (
          <Animated.View
            style={[
              styles.heartPop,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.heartText}>❤️</Text>
          </Animated.View>
        );
      case 'xpFloat':
        return (
          <Animated.View
            style={[
              styles.xpFloat,
              {
                opacity: opacityAnim,
                transform: [{ translateY: translateYAnim }],
              },
            ]}
          >
            <Text style={styles.xpText}>+{amount}XP</Text>
          </Animated.View>
        );
      case 'combo':
        return (
          <Animated.View
            style={[
              styles.combo,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.comboText}>x{amount} Combo!</Text>
          </Animated.View>
        );
      case 'levelUp':
        return (
          <Animated.View
            style={[
              styles.levelUp,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
                ],
              },
            ]}
          >
            <Text style={styles.levelUpText}>🌟 Level Up! 🌟</Text>
          </Animated.View>
        );
      case 'correct':
        return (
          <Animated.View
            style={[
              styles.correct,
              {
                opacity: opacityAnim,
              },
            ]}
          >
            <Text style={styles.correctText}>✅ 正解!</Text>
          </Animated.View>
        );
      case 'incorrect':
        return (
          <Animated.View
            style={[
              styles.incorrect,
              {
                opacity: opacityAnim,
              },
            ]}
          >
            <Text style={styles.incorrectText}>❌ もう一度!</Text>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (!isAnimating && !trigger) {
    return null;
  }

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  confetti: {
    alignItems: 'center',
  },
  confettiText: {
    fontSize: 48,
  },
  heartPop: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartText: {
    fontSize: 64,
  },
  xpFloat: {
    alignItems: 'center',
  },
  xpText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DuolingoColors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  combo: {
    alignItems: 'center',
  },
  comboText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DuolingoColors.combo,
  },
  levelUp: {
    alignItems: 'center',
  },
  levelUpText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  correct: {
    alignItems: 'center',
    backgroundColor: `rgba(82, 196, 26, 0.3)`,
    width: '100%',
    height: '100%',
  },
  correctText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DuolingoColors.success,
  },
  incorrect: {
    alignItems: 'center',
    backgroundColor: `rgba(245, 34, 45, 0.2)`,
    width: '100%',
    height: '100%',
  },
  incorrectText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: DuolingoColors.error,
  },
});
