import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  count?: number;
  type?: 'card' | 'list' | 'text';
}

export function SkeletonLoader({ count = 3, type = 'card' }: Props) {
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animationValue]);

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderCard = () => (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '80%' }]} />
      </View>
    </Animated.View>
  );

  const renderList = () => (
    <Animated.View style={[styles.listItem, { opacity }]}>
      <View style={styles.listIcon} />
      <View style={styles.listContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '70%' }]} />
      </View>
    </Animated.View>
  );

  const renderText = () => (
    <Animated.View style={[{ opacity }]}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '90%', marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { width: '85%', marginTop: 8 }]} />
    </Animated.View>
  );

  const renderItem = () => {
    switch (type) {
      case 'list':
        return renderList();
      case 'text':
        return renderText();
      case 'card':
      default:
        return renderCard();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.itemWrapper}>
          {renderItem()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 12,
  },
  itemWrapper: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 150,
    backgroundColor: '#ddd',
  },
  cardContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  listContent: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginVertical: 4,
  },
});

export function LoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <View style={styles.spinner}>
        <View style={styles.spinnerDot} />
        <View style={styles.spinnerDot} />
        <View style={styles.spinnerDot} />
      </View>
    </View>
  );
}

const spinnerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  spinnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
});
