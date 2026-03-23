/**
 * Leaderboard & Social Learning Component
 * Phase 9 ゲーミフィケーション拡張
 *
 * ランキング表示、友達とのスコア比較、社会的学習機能
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import { NaturalColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xpThisWeek: number;
  totalXP: number;
  level: number;
  streakDays: number;
  masteredWords: number;
  badge: string;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xpThisWeek: number;
  studyTimeToday: number; // minutes
  isOnline: boolean;
}

type LeaderboardType = 'global' | 'friends' | 'school' | 'weekly';
type SocialTab = 'friends' | 'challenges' | 'achievements';

/**
 * LeaderboardAndSocial Component
 */
export const LeaderboardAndSocial = () => {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('weekly');
  const [socialTab, setSocialTab] = useState<SocialTab>('friends');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  // Mock Data
  useEffect(() => {
    // ランキングデータの初期化
    setLeaderboardData([
      {
        id: '1',
        rank: 1,
        name: '田中太郎',
        avatar: '👨‍🎓',
        xpThisWeek: 2850,
        totalXP: 28500,
        level: 15,
        streakDays: 45,
        masteredWords: 487,
        badge: '🏆',
      },
      {
        id: '2',
        rank: 2,
        name: 'あなた',
        avatar: '👤',
        xpThisWeek: 2200,
        totalXP: 22000,
        level: 12,
        streakDays: 23,
        masteredWords: 356,
        badge: '⭐',
      },
      {
        id: '3',
        rank: 3,
        name: '鈴木花子',
        avatar: '👩‍🎓',
        xpThisWeek: 1950,
        totalXP: 19500,
        level: 11,
        streakDays: 18,
        masteredWords: 312,
        badge: '🥈',
      },
      {
        id: '4',
        rank: 4,
        name: '佐藤次郎',
        avatar: '👦',
        xpThisWeek: 1800,
        totalXP: 18000,
        level: 10,
        streakDays: 12,
        masteredWords: 285,
        badge: '🥉',
      },
      {
        id: '5',
        rank: 5,
        name: '伊藤美咲',
        avatar: '👧',
        xpThisWeek: 1650,
        totalXP: 16500,
        level: 9,
        streakDays: 8,
        masteredWords: 248,
        badge: '✨',
      },
    ]);

    // フレンドデータの初期化
    setFriends([
      {
        id: 'f1',
        name: '親友太郎',
        avatar: '👨‍🤝‍👨',
        level: 14,
        xpThisWeek: 1200,
        studyTimeToday: 45,
        isOnline: true,
      },
      {
        id: 'f2',
        name: '学習友子',
        avatar: '👩‍🤝‍👩',
        level: 11,
        xpThisWeek: 980,
        studyTimeToday: 30,
        isOnline: true,
      },
      {
        id: 'f3',
        name: 'チャレンジ次郎',
        avatar: '🧑‍🤝‍🧑',
        level: 10,
        xpThisWeek: 850,
        studyTimeToday: 20,
        isOnline: false,
      },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 ランキング & 友達</Text>
        <Text style={styles.subtitle}>他の学習者と一緒に進化しよう</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Leaderboard Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 週間ランキング</Text>

          {/* Leaderboard Type Tabs */}
          <View style={styles.tabBar}>
            {(['global', 'friends', 'school', 'weekly'] as LeaderboardType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  leaderboardType === tab && styles.tabActive,
                ]}
                onPress={() => setLeaderboardType(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    leaderboardType === tab && styles.tabTextActive,
                  ]}
                >
                  {tab === 'global' && '全国'}
                  {tab === 'friends' && '友達'}
                  {tab === 'school' && '学校'}
                  {tab === 'weekly' && '週間'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Leaderboard List */}
          <View style={styles.leaderboardList}>
            {leaderboardData.map((user) => (
              <LeaderboardRowComponent key={user.id} user={user} />
            ))}
          </View>
        </View>

        {/* Social Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 友達</Text>

          {/* Social Tabs */}
          <View style={styles.socialTabBar}>
            {(['friends', 'challenges', 'achievements'] as SocialTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.socialTab,
                  socialTab === tab && styles.socialTabActive,
                ]}
                onPress={() => setSocialTab(tab)}
              >
                <Text
                  style={[
                    styles.socialTabText,
                    socialTab === tab && styles.socialTabTextActive,
                  ]}
                >
                  {tab === 'friends' && '👥 友達'}
                  {tab === 'challenges' && '⚔️ チャレンジ'}
                  {tab === 'achievements' && '🎖️ 成就'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Friends List */}
          {socialTab === 'friends' && (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <FriendCardComponent key={friend.id} friend={friend} />
              ))}
            </View>
          )}

          {/* Challenges Tab Content */}
          {socialTab === 'challenges' && (
            <View style={styles.challengesContainer}>
              <ChallengeCard
                title="週間対抗戦"
                description="友達と1週間でどちらがXPを多く稼げるか競う"
                opponent="親友太郎"
                status="進行中"
              />
              <ChallengeCard
                title="単語マスターチャレンジ"
                description="30日間で500単語マスター"
                opponent="自分自身"
                status="73%完了"
              />
            </View>
          )}

          {/* Achievements Tab Content */}
          {socialTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              <AchievementBadge icon="🔥" title="7日ストリーク" description="7日連続学習達成" />
              <AchievementBadge icon="🌟" title="100単語マスター" description="100語以上習得" />
              <AchievementBadge icon="🎓" title="レベル10到達" description="総XP 10,000 以上" />
              <AchievementBadge icon="👑" title="ランク10以内" description="週間ランキング10位以内" />
            </View>
          )}
        </View>

        {/* Stats Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 あなたの成績</Text>
          <StatsCard
            label="週間XP"
            value="2,200"
            progress={80}
            goal="2,750"
          />
          <StatsCard
            label="習得単語"
            value="356"
            progress={71}
            goal="500"
          />
          <StatsCard
            label="連続学習日数"
            value="23"
            progress={77}
            goal="30"
          />
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Leaderboard Row Component
 */
const LeaderboardRowComponent = ({ user }: { user: LeaderboardUser }) => {
  const isCurrentUser = user.rank === 2; // "あなた" のデータ

  return (
    <View
      style={[
        styles.leaderboardRow,
        isCurrentUser && styles.leaderboardRowHighlight,
      ]}
    >
      <View style={styles.rankSection}>
        <Text style={[styles.rankNumber, { color: getRankColor(user.rank) }]}>
          #{user.rank}
        </Text>
      </View>

      <View style={styles.userSection}>
        <Text style={styles.userAvatar}>{user.avatar}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLevel}>Lv.{user.level}</Text>
        </View>
      </View>

      <View style={styles.xpSection}>
        <Text style={styles.xpLabel}>週間XP</Text>
        <Text style={styles.xpValue}>{user.xpThisWeek.toLocaleString()}</Text>
      </View>

      <View style={styles.badgeSection}>
        <Text style={styles.badge}>{user.badge}</Text>
      </View>
    </View>
  );
};

/**
 * Friend Card Component
 */
const FriendCardComponent = ({ friend }: { friend: Friend }) => {
  return (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.friendHeader}>
        <View style={styles.friendInfo}>
          <Text style={styles.friendAvatar}>{friend.avatar}</Text>
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{friend.name}</Text>
            <Text style={styles.friendStatus}>
              {friend.isOnline ? '🟢 オンライン' : '🔵 オフライン'}
            </Text>
          </View>
        </View>
        <View style={styles.friendAction}>
          <TouchableOpacity style={styles.challengeButton}>
            <Text style={styles.challengeButtonText}>対戦</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.friendStats}>
        <View style={styles.friendStat}>
          <Text style={styles.friendStatLabel}>レベル</Text>
          <Text style={styles.friendStatValue}>{friend.level}</Text>
        </View>
        <View style={styles.friendStat}>
          <Text style={styles.friendStatLabel}>週XP</Text>
          <Text style={styles.friendStatValue}>{friend.xpThisWeek}</Text>
        </View>
        <View style={styles.friendStat}>
          <Text style={styles.friendStatLabel}>今日の学習</Text>
          <Text style={styles.friendStatValue}>{friend.studyTimeToday}分</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Challenge Card Component
 */
const ChallengeCard = ({
  title,
  description,
  opponent,
  status,
}: {
  title: string;
  description: string;
  opponent: string;
  status: string;
}) => {
  return (
    <View style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View>
          <Text style={styles.challengeTitle}>{title}</Text>
          <Text style={styles.challengeDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.challengeFooter}>
        <Text style={styles.challengeOpponent}>vs {opponent}</Text>
        <Text style={styles.challengeStatus}>{status}</Text>
      </View>
    </View>
  );
};

/**
 * Achievement Badge Component
 */
const AchievementBadge = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => {
  return (
    <View style={styles.achievementBadge}>
      <Text style={styles.achievementIcon}>{icon}</Text>
      <View style={styles.achievementText}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDescription}>{description}</Text>
      </View>
    </View>
  );
};

/**
 * Stats Card Component
 */
const StatsCard = ({
  label,
  value,
  progress,
  goal,
}: {
  label: string;
  value: string;
  progress: number;
  goal: string;
}) => {
  return (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsLabel}>{label}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
          ]}
        />
      </View>
      <Text style={styles.statsGoal}>目標: {goal}</Text>
    </View>
  );
};

/**
 * Utility Functions
 */
const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return '#FFD700'; // Gold
    case 2:
      return '#C0C0C0'; // Silver
    case 3:
      return '#CD7F32'; // Bronze
    default:
      return NaturalColors.textMedium;
  }
};

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NaturalColors.background,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: NaturalColors.shadowLight,
  },

  title: {
    ...Typography.h3,
    color: NaturalColors.textDark,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    ...Typography.bodySmall,
    color: NaturalColors.textMedium,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: NaturalColors.shadowLight,
  },

  sectionTitle: {
    ...Typography.h5,
    color: NaturalColors.textDark,
    marginBottom: Spacing.lg,
  },

  // Leaderboard
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    backgroundColor: NaturalColors.lightBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },

  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },

  tabActive: {
    backgroundColor: NaturalColors.secondary,
  },

  tabText: {
    ...Typography.label,
    color: NaturalColors.textMedium,
  },

  tabTextActive: {
    color: NaturalColors.textDark,
    fontWeight: '600',
  },

  leaderboardList: {
    gap: Spacing.md,
  },

  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: NaturalColors.accent,
  },

  leaderboardRowHighlight: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FFD700',
  },

  rankSection: {
    width: 50,
    alignItems: 'center',
  },

  rankNumber: {
    ...Typography.h5,
    fontWeight: '700',
  },

  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },

  userAvatar: {
    fontSize: 28,
    marginRight: Spacing.md,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    ...Typography.body,
    color: NaturalColors.textDark,
    fontWeight: '600',
  },

  userLevel: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },

  xpSection: {
    alignItems: 'center',
  },

  xpLabel: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },

  xpValue: {
    ...Typography.h6,
    color: NaturalColors.primary,
    fontWeight: '700',
  },

  badgeSection: {
    marginLeft: Spacing.md,
  },

  badge: {
    fontSize: 24,
  },

  // Friends
  socialTabBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  socialTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  socialTabActive: {
    borderBottomColor: NaturalColors.primary,
  },

  socialTabText: {
    ...Typography.label,
    color: NaturalColors.textMedium,
    textAlign: 'center',
  },

  socialTabTextActive: {
    color: NaturalColors.primary,
    fontWeight: '700',
  },

  friendsList: {
    gap: Spacing.lg,
  },

  friendCard: {
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },

  friendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  friendAvatar: {
    fontSize: 32,
    marginRight: Spacing.md,
  },

  friendDetails: {
    flex: 1,
  },

  friendName: {
    ...Typography.body,
    color: NaturalColors.textDark,
    fontWeight: '600',
  },

  friendStatus: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },

  friendAction: {
    marginLeft: Spacing.md,
  },

  challengeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: NaturalColors.primary,
    borderRadius: BorderRadius.full,
  },

  challengeButtonText: {
    ...Typography.label,
    color: '#fff',
  },

  friendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTopBorderTopWidth: 1,
    borderTopColor: NaturalColors.shadowLight,
    paddingTop: Spacing.lg,
  },

  friendStat: {
    alignItems: 'center',
  },

  friendStatLabel: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },

  friendStatValue: {
    ...Typography.h6,
    color: NaturalColors.primary,
    fontWeight: '700',
  },

  // Challenges
  challengesContainer: {
    gap: Spacing.lg,
  },

  challengeCard: {
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: NaturalColors.accent,
  },

  challengeHeader: {
    marginBottom: Spacing.lg,
  },

  challengeTitle: {
    ...Typography.h6,
    color: NaturalColors.textDark,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },

  challengeDescription: {
    ...Typography.bodySmall,
    color: NaturalColors.textMedium,
  },

  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  challengeOpponent: {
    ...Typography.label,
    color: NaturalColors.textMedium,
  },

  challengeStatus: {
    ...Typography.label,
    color: NaturalColors.primary,
    fontWeight: '600',
  },

  // Achievements
  achievementsContainer: {
    gap: Spacing.lg,
  },

  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },

  achievementIcon: {
    fontSize: 40,
    marginRight: Spacing.lg,
  },

  achievementText: {
    flex: 1,
  },

  achievementTitle: {
    ...Typography.h6,
    color: NaturalColors.textDark,
    fontWeight: '700',
  },

  achievementDescription: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },

  // Stats
  statsCard: {
    backgroundColor: NaturalColors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  statsLabel: {
    ...Typography.label,
    color: NaturalColors.textMedium,
  },

  statsValue: {
    ...Typography.h5,
    color: NaturalColors.primary,
    fontWeight: '700',
  },

  progressBar: {
    height: 8,
    backgroundColor: NaturalColors.shadowLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },

  progressFill: {
    height: '100%',
    backgroundColor: NaturalColors.accent,
  },

  statsGoal: {
    ...Typography.caption,
    color: NaturalColors.textMedium,
  },
});

export default LeaderboardAndSocial;
