/**
 * Celebration Animation Utilities
 * Provides functions to trigger confetti, XP float, heart pop, and other celebration effects
 * Uses React Native Animated API for smooth performance
 */

import { Animated, Easing } from 'react-native';

// Animation instances for reuse
let confettiAnimations: Animated.Value[] = [];
let xpFloatAnimations: Animated.Value[] = [];
let heartPopAnimations: Animated.Value[] = [];

/**
 * Play confetti celebration animation
 * Creates multiple falling particles with opacity fade
 */
export const playConfetti = (): Animated.CompositeAnimation[] => {
  const animations: Animated.CompositeAnimation[] = [];

  // Create 8-12 confetti pieces
  for (let i = 0; i < 10; i++) {
    const animatedValue = new Animated.Value(0);
    confettiAnimations.push(animatedValue);

    animations.push(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
  }

  Animated.parallel(animations).start();
  return animations;
};

/**
 * Play heart pop animation
 * Scale up then fade out - indicates life/heart lost or gained
 */
export const playHeartPop = (onComplete?: () => void): Animated.CompositeAnimation => {
  const scaleAnim = new Animated.Value(1);
  const opacityAnim = new Animated.Value(1);
  heartPopAnimations.push(scaleAnim);
  heartPopAnimations.push(opacityAnim);

  const animation = Animated.parallel([
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
    ]),
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);

  animation.start(() => {
    onComplete?.();
  });

  return animation;
};

/**
 * Play XP float up animation
 * Text floats upward with opacity fade - indicates points earned
 */
export const playXPFloat = (
  amount: number = 10,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const translateYAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(1);
  xpFloatAnimations.push(translateYAnim);
  xpFloatAnimations.push(opacityAnim);

  const animation = Animated.parallel([
    Animated.timing(translateYAnim, {
      toValue: -100, // Float up 100 points
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 800,
      delay: 200, // Start fading after 200ms
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);

  animation.start(() => {
    onComplete?.();
  });

  return animation;
};

/**
 * Play combo counter animation
 * Pulse effect with number increment feedback
 */
export const playComboAnimation = (
  comboCount: number,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const scaleAnim = new Animated.Value(0.8);
  const opacityAnim = new Animated.Value(0);

  const animation = Animated.parallel([
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }),
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);

  // After peak, settle back down
  animation.start(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      onComplete?.();
    });
  });

  return animation;
};

/**
 * Play tap feedback animation
 * Quick scale down and back up for button press feedback
 */
export const playTapFeedback = (): Animated.CompositeAnimation => {
  const scaleAnim = new Animated.Value(1);

  const animation = Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 50,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1.0,
      duration: 50,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);

  animation.start();
  return animation;
};

/**
 * Play level up celebration animation
 * Full celebration with stars and bounce effect
 */
export const playLevelUpAnimation = (
  newLevel: number,
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const scaleAnim = new Animated.Value(0);
  const rotateAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  const animation = Animated.parallel([
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
  ]);

  animation.start(() => {
    onComplete?.();
  });

  return animation;
};

/**
 * Play correct answer flash animation
 * Green flash background then fade
 */
export const playCorrectFlash = (
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const opacityAnim = new Animated.Value(0);

  const animation = Animated.sequence([
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
  ]);

  animation.start(() => {
    onComplete?.();
  });

  return animation;
};

/**
 * Play incorrect answer flash animation
 * Red flash background with shake effect
 */
export const playIncorrectFlash = (
  onComplete?: () => void
): Animated.CompositeAnimation => {
  const opacityAnim = new Animated.Value(0);
  const translateXAnim = new Animated.Value(0);

  const animation = Animated.parallel([
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
    // Shake effect
    Animated.sequence([
      Animated.timing(translateXAnim, {
        toValue: -10,
        duration: 50,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 10,
        duration: 50,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -10,
        duration: 50,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 50,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]),
  ]);

  animation.start(() => {
    onComplete?.();
  });

  return animation;
};

/**
 * Clean up all animation instances (call on component unmount)
 */
export const cleanupAnimations = (): void => {
  confettiAnimations = [];
  xpFloatAnimations = [];
  heartPopAnimations = [];
};

/**
 * Stop all running animations
 */
export const stopAllAnimations = (): void => {
  confettiAnimations.forEach((anim) => anim.removeAllListeners());
  xpFloatAnimations.forEach((anim) => anim.removeAllListeners());
  heartPopAnimations.forEach((anim) => anim.removeAllListeners());
};
