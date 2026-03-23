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
  type?: 'card' | 'list' | 'text' | 'form' | 'result';
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

  const renderForm = () => (
    <Animated.View style={[formResultStyles.form, { opacity }]}>
      <View style={formResultStyles.formField}>
        <View style={[styles.skeletonLine, { height: 14, marginBottom: 8 }]} />
        <View style={[formResultStyles.formInput]} />
      </View>
      <View style={formResultStyles.formField}>
        <View style={[styles.skeletonLine, { height: 14, marginBottom: 8 }]} />
        <View style={[formResultStyles.formInput, { height: 100 }]} />
      </View>
      <View style={formResultStyles.formButton} />
    </Animated.View>
  );

  const renderResult = () => (
    <Animated.View style={[formResultStyles.result, { opacity }]}>
      <View style={formResultStyles.resultHeader} />
      <View style={formResultStyles.resultContent}>
        <View style={[styles.skeletonLine, { height: 16, marginBottom: 12 }]} />
        <View style={[styles.skeletonLine, { width: '80%', marginBottom: 12 }]} />
        <View style={[styles.skeletonLine, { width: '90%', marginBottom: 20 }]} />
        <View style={formResultStyles.resultBar} />
      </View>
    </Animated.View>
  );

  const renderItem = () => {
    switch (type) {
      case 'list':
        return renderList();
      case 'text':
        return renderText();
      case 'form':
        return renderForm();
      case 'result':
        return renderResult();
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
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

// Add form and result skeleton styles to the main styles
const formResultStyles = StyleSheet.create({
  form: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formInput: {
    height: 40,
    backgroundColor: '#ddd',
    borderRadius: 4,
  },
  formButton: {
    height: 44,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginTop: 12,
  },
  result: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  resultHeader: {
    height: 120,
    backgroundColor: '#ddd',
  },
  resultContent: {
    padding: 16,
  },
  resultBar: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
});
