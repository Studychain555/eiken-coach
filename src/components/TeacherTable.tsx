import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface TableRow {
  id: string;
  class: string;
  title: string;
  dueDate: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface TeacherTableProps {
  data: TableRow[];
  onRowPress?: (row: TableRow) => void;
  columns?: Array<{ key: keyof TableRow; label: string; width?: number }>;
}

const defaultColumns = [
  { key: 'class' as const, label: 'クラス', width: 80 },
  { key: 'title' as const, label: '課題名', width: 150 },
  { key: 'dueDate' as const, label: '締切', width: 100 },
  { key: 'progress' as const, label: '進捗', width: 80 },
  { key: 'status' as const, label: 'ステータス', width: 100 },
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: '#C8E6C9', text: '#2E7D32' };
    case 'in-progress':
      return { bg: '#FFF9C4', text: '#F57F17' };
    case 'pending':
      return { bg: '#FFCCBC', text: '#D84315' };
    default:
      return { bg: '#E0E0E0', text: '#424242' };
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'completed':
      return '完了';
    case 'in-progress':
      return '進行中';
    case 'pending':
      return '未開始';
    default:
      return status;
  }
};

export const TeacherTable: React.FC<TeacherTableProps> = ({
  data,
  onRowPress,
  columns = defaultColumns,
}) => {
  return (
    <View style={styles.container}>
      {data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tableScroll}
        >
          <View>
            {/* Header Row */}
            <View style={styles.headerRow}>
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[styles.headerCell, { width: col.width || 100 }]}
                >
                  <Text style={styles.headerText}>{col.label}</Text>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            {data.map((row, index) => (
              <TouchableOpacity
                key={row.id}
                style={[
                  styles.dataRow,
                  index % 2 === 0 && styles.dataRowEven,
                ]}
                onPress={() => onRowPress?.(row)}
                activeOpacity={0.7}
              >
                {columns.map((col) => {
                  let cellContent: React.ReactNode = '';

                  if (col.key === 'progress') {
                    const progress = row.progress || 0;
                    return (
                      <View
                        key={col.key}
                        style={[styles.dataCell, { width: col.width || 100 }]}
                      >
                        <View style={styles.progressContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${progress}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                      </View>
                    );
                  }

                  if (col.key === 'status') {
                    const colors = getStatusBadgeColor(row.status);
                    return (
                      <View
                        key={col.key}
                        style={[styles.dataCell, { width: col.width || 100 }]}
                      >
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: colors.bg },
                          ]}
                        >
                          <Text style={[styles.statusBadgeText, { color: colors.text }]}>
                            {formatStatus(row.status)}
                          </Text>
                        </View>
                      </View>
                    );
                  }

                  cellContent = row[col.key];

                  return (
                    <View
                      key={col.key}
                      style={[styles.dataCell, { width: col.width || 100 }]}
                    >
                      <Text
                        style={styles.dataText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cellContent}
                      </Text>
                    </View>
                  );
                })}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>データがありません</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    backgroundColor: Colors.light.surfaceCard,
  },
  tableScroll: {
    flexGrow: 0,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E8EEF7',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.border,
  },
  headerCell: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E5090',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dataRowEven: {
    backgroundColor: '#F9FBFF',
  },
  dataCell: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    justifyContent: 'center',
    minHeight: 48,
  },
  dataText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: '400',
  },
  progressContainer: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '400',
  },
});
