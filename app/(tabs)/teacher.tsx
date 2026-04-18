import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import TeacherAccessGuard from '@/src/components/TeacherAccessGuard';
import { useTeacherStore } from '@/src/stores/teacherStore';
import { TeacherAnalytics } from '@/src/components/TeacherAnalytics';
import { TeacherLayout, type TabType } from '@/src/components/TeacherLayout';

export default function TeacherDashboard() {
  const {
    students,
    classStats,
    assignments,
    selectedStudent,
    weeklyProgress,
    loading,
    error,
    loadStudents,
    loadClassStats,
    loadAssignments,
    loadStudentDetail,
    loadWeeklyProgress,
    loadAnalytics,
    createAssignment,
    submitFeedback,
    setError,
  } = useTeacherStore();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    type: 'listening' as 'listening' | 'vocabulary' | 'writing',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [feedbackForm, setFeedbackForm] = useState('');

  // Mock class ID - in real app, get from user's profile
  const classId = 'class_001';

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadStudents(classId),
        loadClassStats(classId),
        loadAssignments(classId),
        loadWeeklyProgress(classId),
      ]);
      await loadAnalytics(classId);
    };

    initializeData();
  }, []);

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.description) {
      Alert.alert('エラー', 'タイトルと説明を入力してください');
      return;
    }

    try {
      await createAssignment(
        classId,
        assignmentForm.title,
        assignmentForm.description,
        assignmentForm.type,
        assignmentForm.dueDate
      );

      setAssignmentForm({
        title: '',
        description: '',
        type: 'listening',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setShowAssignmentModal(false);
      Alert.alert('成功', '課題を作成しました');
    } catch (error) {
      Alert.alert('エラー', '課題の作成に失敗しました');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedStudentId || !feedbackForm) {
      Alert.alert('エラー', 'フィードバックを入力してください');
      return;
    }

    try {
      await submitFeedback(selectedStudentId, feedbackForm);
      setFeedbackForm('');
      setShowFeedbackModal(false);
      Alert.alert('成功', 'フィードバックを送信しました');
    } catch (error) {
      Alert.alert('エラー', 'フィードバックの送信に失敗しました');
    }
  };

  const handleViewStudentDetail = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadStudentDetail(studentId);
  };

  if (loading && students.length === 0) {
    return (
      <TeacherAccessGuard>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>データを読み込み中...</Text>
          </View>
        </SafeAreaView>
      </TeacherAccessGuard>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    // Map new tabs to old ones for content display
    const displayTab = activeTab === 'materials' || activeTab === 'tests' ? 'assignments' : activeTab;

    if (error) {
      return (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.errorDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Dashboard Tab
    if (displayTab === 'dashboard') {
      return (
        <>
          {/* Class Overview */}
          {classStats && (
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>クラス概要</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>生徒数</Text>
                  <Text style={styles.overviewValue}>{classStats.totalStudents}</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>平均スコア</Text>
                  <Text style={styles.overviewValue}>{classStats.averageScore.toFixed(0)}</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>進捗率</Text>
                  <Text style={styles.overviewValue}>{classStats.averageProgressRate}%</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewLabel}>学習時間</Text>
                  <Text style={styles.overviewValue}>
                    {Math.round(classStats.totalStudyMinutes / 60)}h
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Assignments */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>最近の課題</Text>
              <TouchableOpacity onPress={() => setShowAssignmentModal(true)}>
                <Text style={styles.addButton}>+ 追加</Text>
              </TouchableOpacity>
            </View>

            {assignments.length > 0 ? (
              assignments.slice(0, 3).map((assignment) => (
                <View key={assignment.id} style={styles.assignmentCard}>
                  <View>
                    <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                    <Text style={styles.assignmentDescription}>{assignment.description}</Text>
                    <Text style={styles.assignmentDue}>
                      期限: {new Date(assignment.dueDate).toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                  <View style={styles.assignmentProgress}>
                    <Text style={styles.progressText}>
                      {assignment.completedCount}/{assignment.totalStudents}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>課題がありません</Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowAssignmentModal(true)}
                >
                  <Text style={styles.emptyStateButtonText}>課題を作成</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Top Students */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>成績優秀者</Text>
            {students.length > 0 ? (
              students
                .sort(
                  (a, b) =>
                    (b.listeningScore + b.vocabularyScore + b.writingScore) / 3 -
                    (a.listeningScore + a.vocabularyScore + a.writingScore) / 3
                )
                .slice(0, 3)
                .map((student, index) => (
                  <TouchableOpacity
                    key={student.studentId}
                    style={styles.studentCard}
                    onPress={() => handleViewStudentDetail(student.studentId)}
                  >
                    <View style={styles.studentRank}>
                      <Text style={styles.rankBadge}>{index + 1}</Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.studentName}</Text>
                      <Text style={styles.studentEmail}>{student.email}</Text>
                    </View>
                    <View style={styles.studentScore}>
                      <Text style={styles.score}>
                        {(
                          (student.listeningScore +
                            student.vocabularyScore +
                            student.writingScore) /
                          3
                        ).toFixed(0)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
            ) : (
              <Text style={styles.emptyStateText}>生徒データがありません</Text>
            )}
          </View>
        </>
      );
    }

    // Students Tab
    if (displayTab === 'students') {
      return (
        <>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>担当生徒一覧</Text>

          {students.length > 0 ? (
            students.map((student) => (
              <TouchableOpacity
                key={student.studentId}
                style={styles.studentListCard}
                onPress={() => handleViewStudentDetail(student.studentId)}
              >
                <View style={styles.studentListInfo}>
                  <Text style={styles.studentListName}>{student.studentName}</Text>
                  <Text style={styles.studentListEmail}>{student.email}</Text>
                  <View style={styles.studentListStats}>
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeLabel}>リスニング</Text>
                      <Text style={styles.statBadgeValue}>{student.listeningScore}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeLabel}>単語</Text>
                      <Text style={styles.statBadgeValue}>{student.vocabularyScore}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeLabel}>ライティング</Text>
                      <Text style={styles.statBadgeValue}>{student.writingScore}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.studentListProgress}>
                  <Text style={styles.progressPercentage}>{student.progressRate}%</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${student.progressRate}%` },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>生徒がいません</Text>
            </View>
          )}
        </>
      );
    }

    // Assignments Tab (materials/tests map to this)
    if (displayTab === 'assignments') {
      return (
        <>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowAssignmentModal(true)}
          >
            <Text style={styles.createButtonText}>+ 新しい課題を作成</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginVertical: 16 }]}>課題一覧</Text>

          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <View key={assignment.id} style={styles.assignmentListCard}>
                <View style={styles.assignmentListHeader}>
                  <Text style={styles.assignmentListTitle}>{assignment.title}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {assignment.type === 'listening'
                        ? '🎧'
                        : assignment.type === 'vocabulary'
                          ? '📚'
                          : '✍️'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.assignmentListDescription}>{assignment.description}</Text>
                <View style={styles.assignmentListFooter}>
                  <Text style={styles.dueDate}>
                    期限: {new Date(assignment.dueDate).toLocaleDateString('ja-JP')}
                  </Text>
                  <Text style={styles.completionText}>
                    完了: {assignment.completedCount}/{assignment.totalStudents}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>課題がありません</Text>
            </View>
          )}
        </>
      );
    }

    // Analytics Tab
    if (displayTab === 'analytics') {
      return <TeacherAnalytics classStats={classStats} students={students} weeklyProgress={weeklyProgress} />;
    }

    // Placeholder for settings/reports
    return (
      <View style={styles.emptyState}>
        <Text style={styles.sectionTitle}>準備中</Text>
        <Text style={styles.emptyStateText}>{activeTab}機能は準備中です</Text>
      </View>
    );
  };

  return (
    <TeacherAccessGuard>
      <TeacherLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        classStats={classStats}
      >
        {renderContent()}

        {/* Assignment Modal */}
        <Modal visible={showAssignmentModal} animationType="slide" transparent={true}>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>課題を作成</Text>
                <TouchableOpacity onPress={() => setShowAssignmentModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalForm}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>タイトル</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="課題のタイトルを入力"
                    value={assignmentForm.title}
                    onChangeText={(text) =>
                      setAssignmentForm({ ...assignmentForm, title: text })
                    }
                  />
                </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>説明</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline]}
                  placeholder="課題の説明を入力"
                  value={assignmentForm.description}
                  onChangeText={(text) =>
                    setAssignmentForm({ ...assignmentForm, description: text })
                  }
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>タイプ</Text>
                <View style={styles.typeSelector}>
                  {(['listening', 'vocabulary', 'writing'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        assignmentForm.type === type && styles.typeOptionActive,
                      ]}
                      onPress={() => setAssignmentForm({ ...assignmentForm, type })}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          assignmentForm.type === type && styles.typeOptionTextActive,
                        ]}
                      >
                        {type === 'listening' ? '🎧 リスニング' : type === 'vocabulary' ? '📚 単語' : '✍️ ライティング'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>期限</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  value={assignmentForm.dueDate}
                  onChangeText={(text) =>
                    setAssignmentForm({ ...assignmentForm, dueDate: text })
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateAssignment}
              >
                <Text style={styles.submitButtonText}>課題を作成</Text>
              </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Feedback Modal */}
        {selectedStudent && (
          <Modal visible={showFeedbackModal} animationType="slide" transparent={true}>
            <SafeAreaView style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedStudent.studentName}へのフィードバック
                  </Text>
                  <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalForm}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <View style={styles.studentDetailCard}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>リスニング:</Text>
                      <Text style={styles.detailValue}>{selectedStudent.listeningAccuracy}%</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>単語習熟度:</Text>
                      <Text style={styles.detailValue}>{selectedStudent.vocabularyProgress}%</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>ライティング:</Text>
                      <Text style={styles.detailValue}>{selectedStudent.writingAverageScore}</Text>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>フィードバック</Text>
                    <TextInput
                      style={[styles.textInput, styles.textInputMultiline]}
                      placeholder="生徒へのフィードバックを入力"
                      value={feedbackForm}
                      onChangeText={setFeedbackForm}
                      multiline
                      numberOfLines={6}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitFeedback}
                  >
                    <Text style={styles.submitButtonText}>フィードバックを送信</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </TeacherLayout>
    </TeacherAccessGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 4,
  },
  errorText: {
    flex: 1,
    color: '#c62828',
    fontSize: 13,
  },
  errorDismiss: {
    fontSize: 18,
    color: '#c62828',
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  overviewCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addButton: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
  assignmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  assignmentDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  assignmentDue: {
    fontSize: 11,
    color: '#999',
  },
  assignmentProgress: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  studentRank: {
    marginRight: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066cc',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
    overflow: 'hidden',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 12,
    color: '#666',
  },
  studentScore: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  emptyStateButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  studentListCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  studentListInfo: {
    flex: 1,
  },
  studentListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentListEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  studentListStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: '#f0f7ff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statBadgeLabel: {
    fontSize: 10,
    color: '#666',
  },
  statBadgeValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  studentListProgress: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 8,
  },
  progressBar: {
    width: 50,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066cc',
  },
  createButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 0,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  assignmentListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 16,
  },
  assignmentListDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  assignmentListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  dueDate: {
    fontSize: 11,
    color: '#999',
  },
  completionText: {
    fontSize: 11,
    color: '#0066cc',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#f5f9ff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 24,
    color: '#666',
  },
  modalForm: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
  },
  textInputMultiline: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  typeOptionActive: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f7ff',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeOptionTextActive: {
    color: '#0066cc',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  studentDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
});
