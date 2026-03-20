import React from 'react';
import { Dimensions } from 'react-native';
import TabletHomeScreen from '@/components/TabletHomeScreen';
import LegacyHomeScreen from './legacy-home';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

/**
 * Home Screen
 * Routes to tablet-optimized layout (width >= 600px) or legacy mobile layout
 */
export default function HomeScreen() {
  return isTablet ? <TabletHomeScreen /> : <LegacyHomeScreen />;
}
