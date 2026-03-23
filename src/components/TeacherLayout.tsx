import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { TeacherHeader } from './TeacherHeader';
import { TeacherSidebar } from './TeacherSidebar';
import { TeacherQuickStats } from './TeacherQuickStats';

export type TabType = 'dashboard' | 'materials' | 'tests' | 'analytics' | 'students' | 'settings' | 'reports';

interface TeacherLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  classStats?: any;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  classStats,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const styles = createStyles(isMobile);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TeacherHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <View style={styles.mainContainer}>
        {/* Sidebar */}
        {(sidebarOpen || !isMobile) && (
          <View style={[styles.sidebarWrapper, isMobile && styles.sidebarWrapperMobile]}>
            <TeacherSidebar activeTab={activeTab} onSelect={onTabChange} />
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.contentWrapper}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>{children}</View>
        </ScrollView>

        {/* Quick Stats Sidebar (Right) */}
        {!isMobile && (
          <View style={styles.statsWrapper}>
            <TeacherQuickStats classStats={classStats} />
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (isMobile: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },
    mainContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    sidebarWrapper: {
      width: 220,
      backgroundColor: '#2E5090',
      borderRightWidth: 1,
      borderRightColor: Colors.light.border,
    },
    sidebarWrapperMobile: {
      position: 'absolute',
      height: '100%',
      zIndex: 10,
      left: 0,
      right: 0,
    },
    contentWrapper: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },
    contentContainer: {
      flexGrow: 1,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    content: {
      flex: 1,
    },
    statsWrapper: {
      width: 220,
      backgroundColor: '#F5F9FF',
      borderLeftWidth: 1,
      borderLeftColor: Colors.light.border,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.md,
    },
  });
