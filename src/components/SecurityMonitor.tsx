/**
 * セキュリティ監視ダッシュボード
 * 監査ログ、セッション情報、セキュリティメトリクスを表示
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { AuditLogger, SessionManager, TokenManager } from '@/src/lib/securityManager';
import type { AuditLogEntry, SessionData } from '@/src/lib/securityManager';

interface SecurityMetrics {
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  lastActivity: number;
  sessionStatus: 'active' | 'expired' | 'none';
  tokenStatus: 'valid' | 'expired' | 'missing';
}

export const SecurityMonitor: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalRequests: 0,
    failedRequests: 0,
    successRate: 0,
    lastActivity: 0,
    sessionStatus: 'none',
    tokenStatus: 'missing',
  });

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // 監査ログを取得
      const auditLogs = await AuditLogger.getLocalLogs();
      setLogs(auditLogs.slice(-10)); // 最新10件

      // セッション情報を取得
      const currentSession = await SessionManager.getSession();
      setSession(currentSession);

      // トークン情報を取得
      const { accessToken } = await TokenManager.getTokens();

      // メトリクスを計算
      const total = auditLogs.length;
      const failed = auditLogs.filter(log => log.status === 'failure').length;
      const successRate = total > 0 ? ((total - failed) / total) * 100 : 0;

      const latestLog = auditLogs[auditLogs.length - 1];

      setMetrics({
        totalRequests: total,
        failedRequests: failed,
        successRate: Math.round(successRate),
        lastActivity: latestLog?.timestamp || 0,
        sessionStatus: currentSession ? 'active' : 'expired',
        tokenStatus: accessToken ? 'valid' : 'missing',
      });
    } catch (error) {
      console.error('[SecurityMonitor] Failed to load security data:', error);
    }
  };

  const handleClearLogs = () => {
    Alert.alert(
      'ログをクリア',
      '監査ログをすべて削除しますか？この操作は取り消せません。',
      [
        {
          text: 'キャンセル',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'クリア',
          onPress: async () => {
            await AuditLogger.clearLocalLogs();
            await loadSecurityData();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const logsJson = JSON.stringify(logs, null, 2);
      console.log('監査ログをエクスポート:', logsJson);
      Alert.alert('成功', 'ログをエクスポートしました');
    } catch (error) {
      Alert.alert('エラー', 'ログのエクスポートに失敗しました');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'valid':
        return '#4CAF50'; // 緑
      case 'expired':
        return '#FFC107'; // 黄
      default:
        return '#F44336'; // 赤
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      active: 'アクティブ',
      expired: '期限切れ',
      none: 'なし',
      valid: '有効',
      missing: '未検出',
    };
    return labels[status] || status;
  };

  const formatTime = (timestamp: number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('ja-JP');
  };

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>セキュリティ監視ダッシュボード</Text>
        <Text style={styles.subtitle}>リアルタイム監視・監査ログ</Text>
      </View>

      {/* メトリクスカード */}
      <View style={styles.metricsGrid}>
        {/* 成功率 */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>成功率</Text>
          <Text style={styles.metricValue}>{metrics.successRate}%</Text>
          <Text style={styles.metricDetail}>
            成功: {metrics.totalRequests - metrics.failedRequests}
          </Text>
        </View>

        {/* 失敗数 */}
        <View style={[styles.metricCard, { backgroundColor: '#FFE0E0' }]}>
          <Text style={styles.metricLabel}>失敗リクエスト</Text>
          <Text style={styles.metricValue}>{metrics.failedRequests}</Text>
          <Text style={styles.metricDetail}>
            合計: {metrics.totalRequests}
          </Text>
        </View>

        {/* セッションステータス */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>セッション</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(metrics.sessionStatus) },
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusLabel(metrics.sessionStatus)}
            </Text>
          </View>
        </View>

        {/* トークンステータス */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>トークン</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(metrics.tokenStatus) },
              ]}
            />
            <Text style={styles.statusText}>
              {getStatusLabel(metrics.tokenStatus)}
            </Text>
          </View>
        </View>
      </View>

      {/* セッション情報 */}
      {session && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>セッション情報</Text>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ユーザーID</Text>
              <Text style={styles.infoValue}>{session.userId.slice(0, 12)}...</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ロール</Text>
              <Text style={styles.infoValue}>{session.role}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>デバイスID</Text>
              <Text style={styles.infoValue}>{session.deviceId.slice(0, 12)}...</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>作成時刻</Text>
              <Text style={styles.infoValue}>{formatTime(session.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>最終アクティビティ</Text>
              <Text style={styles.infoValue}>{formatTime(session.lastActivityAt)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 監査ログ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>監査ログ（最新10件）</Text>
          <Text style={styles.logCount}>{logs.length}</Text>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>監査ログがありません</Text>
          </View>
        ) : (
          <ScrollView style={styles.logList}>
            {logs.reverse().map((log) => (
              <View key={log.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <Text style={styles.logAction}>{log.action}</Text>
                  <View
                    style={[
                      styles.logStatus,
                      {
                        backgroundColor:
                          log.status === 'success' ? '#E8F5E9' : '#FFEBEE',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.logStatusText,
                        {
                          color:
                            log.status === 'success' ? '#2E7D32' : '#C62828',
                        },
                      ]}
                    >
                      {log.status === 'success' ? '成功' : '失敗'}
                    </Text>
                  </View>
                </View>

                <View style={styles.logDetails}>
                  <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                  <Text style={styles.logResource}>
                    {log.resource}
                    {log.resourceId ? ` > ${log.resourceId.slice(0, 12)}...` : ''}
                  </Text>
                  {log.statusCode && (
                    <Text style={styles.logCode}>ステータス: {log.statusCode}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* アクションボタン */}
      <View style={styles.actionButtons}>
        <View
          style={[
            styles.button,
            { backgroundColor: '#2196F3' },
          ]}
        >
          <Text style={styles.buttonText} onPress={handleExportLogs}>
            ログをエクスポート
          </Text>
        </View>

        <View
          style={[
            styles.button,
            { backgroundColor: '#F44336', marginTop: 12 },
          ]}
        >
          <Text style={styles.buttonText} onPress={handleClearLogs}>
            ログをクリア
          </Text>
        </View>
      </View>

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          更新時刻: {formatTime(Date.now())}
        </Text>
        <Text style={styles.footerNote}>
          本番環境では、監査ログはサーバーに送信されます
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  metricsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  metricDetail: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logCount: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logList: {
    maxHeight: 300,
  },
  logEntry: {
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  logStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  logDetails: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    padding: 8,
  },
  logTime: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  logResource: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Courier New',
  },
  logCode: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 11,
    color: '#BDBDBD',
    fontStyle: 'italic',
  },
});
