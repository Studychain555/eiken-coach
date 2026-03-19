import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, Shadows, ShadotenColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ShadotenColors.headerTeal,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
          paddingTop: Spacing.sm,
          height: Platform.OS === 'ios' ? 60 : 56,
          ...Shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          display: 'none', // ラベル非表示
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="listening"
        options={{
          title: 'リスニング',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="headphones" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: '単語',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="writing"
        options={{
          title: 'ライティング',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="pencil" color={color} />,
        }}
      />
      <Tabs.Screen
        name="teacher"
        options={{
          title: '講師',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
