import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface StudentProgress {
  studentId: string;
  studentName: string;
  email: string;
  listeningScore: number;
  vocabularyScore: number;
  writingScore: number;
  progressRate: number;
  studyHours: number;
  lastStudyDate: string | null;
  totalAttempts: number;
}

export interface ClassStatistics {
  classId: string;
  className: string;
  totalStudents: number;
  averageScore: number;
  averageProgressRate: number;
  averageStudyHours: number;
  totalStudyMinutes: number;
}

export interface AssignmentItem {
  id: string;
  classId: string;
  title: string;
  description: string;
  type: 'listening' | 'vocabulary' | 'writing';
  dueDate: string;
  createdAt: string;
  completedCount: number;
  totalStudents: number;
}

export interface StudentDetailData {
  studentId: string;
  studentName: string;
  email: string;
  classId: string;
  listeningAttempts: number;
  listeningCorrect: number;
  listeningAccuracy: number;
  vocabularyMastered: number;
  vocabularyTotal: number;
  vocabularyProgress: number;
  writingSubmissions: number;
  writingAverageScore: number;
  studyHoursByDay: Record<string, number>;
  lastActivities: Array<{
    type: string;
    title: string;
    score: number;
    timestamp: string;
  }>;
}

export interface WeeklyProgressData {
  date: string;
  listeningScore: number;
  vocabularyScore: number;
  writingScore: number;
  totalStudyMinutes: number;
}

interface TeacherState {
  // Student Management
  students: StudentProgress[];
  loadStudents: (classId: string) => Promise<void>;

  // Class Statistics
  classStats: ClassStatistics | null;
  loadClassStats: (classId: string) => Promise<void>;

  // Assignments
  assignments: AssignmentItem[];
  loadAssignments: (classId: string) => Promise<void>;
  createAssignment: (
    classId: string,
    title: string,
    description: string,
    type: 'listening' | 'vocabulary' | 'writing',
    dueDate: string
  ) => Promise<void>;

  // Student Detail
  selectedStudent: StudentDetailData | null;
  loadStudentDetail: (studentId: string) => Promise<void>;

  // Weekly Progress
  weeklyProgress: WeeklyProgressData[];
  loadWeeklyProgress: (classId: string, weeks?: number) => Promise<void>;

  // Analytics
  listeningAccuracyByStudent: Record<string, number>;
  vocabularyMasteryByStudent: Record<string, number>;
  writingScoreByStudent: Record<string, number>;
  loadAnalytics: (classId: string) => Promise<void>;

  // CSV Export
  exportStudentData: (classId: string) => Promise<string>;
  exportAnalyticsData: (classId: string) => Promise<string>;

  // Feedback
  submitFeedback: (studentId: string, feedback: string) => Promise<void>;

  // Loading & Error States
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  // Initial states
  students: [],
  classStats: null,
  assignments: [],
  selectedStudent: null,
  weeklyProgress: [],
  listeningAccuracyByStudent: {},
  vocabularyMasteryByStudent: {},
  writingScoreByStudent: {},
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  // Load students
  loadStudents: async (classId: string) => {
    try {
      set({ loading: true, error: null });

      // Fetch students in class
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      // Fetch all profiles in this class
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .eq('class_id', classId)
        .eq('role', 'student');

      if (profileError) throw profileError;

      // Build student progress data
      const studentProgress: StudentProgress[] = (profiles || []).map((profile: any) => ({
        studentId: profile.id,
        studentName: profile.display_name || 'Unknown',
        email: profile.email || '',
        listeningScore: Math.floor(Math.random() * 100), // Mock data - replace with real DB
        vocabularyScore: Math.floor(Math.random() * 100),
        writingScore: Math.floor(Math.random() * 100),
        progressRate: Math.floor(Math.random() * 100),
        studyHours: Math.floor(Math.random() * 50),
        lastStudyDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalAttempts: Math.floor(Math.random() * 100),
      }));

      set({ students: studentProgress, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load students',
        loading: false,
      });
    }
  },

  // Load class statistics
  loadClassStats: async (classId: string) => {
    try {
      set({ loading: true, error: null });

      // Fetch class name
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      if (classError) throw classError;

      // Fetch students count
      const { count: studentCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('class_id', classId)
        .eq('role', 'student');

      if (countError) throw countError;

      const stats: ClassStatistics = {
        classId,
        className: classData?.name || 'Unknown Class',
        totalStudents: studentCount || 0,
        averageScore: Math.floor(Math.random() * 100),
        averageProgressRate: Math.floor(Math.random() * 100),
        averageStudyHours: Math.floor(Math.random() * 50),
        totalStudyMinutes: Math.floor(Math.random() * 10000),
      };

      set({ classStats: stats, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load class statistics',
        loading: false,
      });
    }
  },

  // Load assignments
  loadAssignments: async (classId: string) => {
    try {
      set({ loading: true, error: null });

      const { data: assignments, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const formattedAssignments: AssignmentItem[] = (assignments || []).map((a: any) => ({
        id: a.id,
        classId: a.class_id,
        title: a.title,
        description: a.description,
        type: a.type,
        dueDate: a.due_date,
        createdAt: a.created_at,
        completedCount: Math.floor(Math.random() * 30),
        totalStudents: 30,
      }));

      set({ assignments: formattedAssignments, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load assignments',
        loading: false,
      });
    }
  },

  // Create assignment
  createAssignment: async (
    classId: string,
    title: string,
    description: string,
    type: 'listening' | 'vocabulary' | 'writing',
    dueDate: string
  ) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.from('assignments').insert({
        class_id: classId,
        title,
        description,
        type,
        due_date: dueDate,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Reload assignments
      await get().loadAssignments(classId);
      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Load student detail
  loadStudentDetail: async (studentId: string) => {
    try {
      set({ loading: true, error: null });

      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Mock detailed data
      const detail: StudentDetailData = {
        studentId,
        studentName: profile?.display_name || 'Unknown',
        email: profile?.email || '',
        classId: profile?.class_id || '',
        listeningAttempts: Math.floor(Math.random() * 50),
        listeningCorrect: Math.floor(Math.random() * 50),
        listeningAccuracy: Math.floor(Math.random() * 100),
        vocabularyMastered: Math.floor(Math.random() * 1000),
        vocabularyTotal: 2000,
        vocabularyProgress: Math.floor(Math.random() * 100),
        writingSubmissions: Math.floor(Math.random() * 30),
        writingAverageScore: Math.floor(Math.random() * 100),
        studyHoursByDay: {
          'Mon': Math.random() * 5,
          'Tue': Math.random() * 5,
          'Wed': Math.random() * 5,
          'Thu': Math.random() * 5,
          'Fri': Math.random() * 5,
          'Sat': Math.random() * 5,
          'Sun': Math.random() * 5,
        },
        lastActivities: [
          {
            type: 'listening',
            title: 'Unit 5 - Travel',
            score: Math.floor(Math.random() * 100),
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            type: 'vocabulary',
            title: 'Stage 3 - Business',
            score: Math.floor(Math.random() * 100),
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            type: 'writing',
            title: 'Essay Writing',
            score: Math.floor(Math.random() * 100),
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };

      set({ selectedStudent: detail, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load student details',
        loading: false,
      });
    }
  },

  // Load weekly progress
  loadWeeklyProgress: async (classId: string, weeks = 4) => {
    try {
      set({ loading: true, error: null });

      const weeklyData: WeeklyProgressData[] = [];
      for (let i = weeks - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        weeklyData.push({
          date: date.toISOString().split('T')[0],
          listeningScore: Math.floor(Math.random() * 100),
          vocabularyScore: Math.floor(Math.random() * 100),
          writingScore: Math.floor(Math.random() * 100),
          totalStudyMinutes: Math.floor(Math.random() * 480),
        });
      }

      set({ weeklyProgress: weeklyData, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load weekly progress',
        loading: false,
      });
    }
  },

  // Load analytics
  loadAnalytics: async (classId: string) => {
    try {
      set({ loading: true, error: null });

      const { students } = get();

      const listeningAccuracy: Record<string, number> = {};
      const vocabularyMastery: Record<string, number> = {};
      const writingScores: Record<string, number> = {};

      students.forEach((student) => {
        listeningAccuracy[student.studentId] = Math.floor(Math.random() * 100);
        vocabularyMastery[student.studentId] = Math.floor(Math.random() * 100);
        writingScores[student.studentId] = Math.floor(Math.random() * 100);
      });

      set({
        listeningAccuracyByStudent: listeningAccuracy,
        vocabularyMasteryByStudent: vocabularyMastery,
        writingScoreByStudent: writingScores,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load analytics',
        loading: false,
      });
    }
  },

  // Export student data as CSV
  exportStudentData: async (classId: string) => {
    try {
      const { students } = get();

      let csv = 'Student Name,Email,Listening Score,Vocabulary Score,Writing Score,Progress Rate,Study Hours\n';
      students.forEach((student) => {
        csv += `${student.studentName},${student.email},${student.listeningScore},${student.vocabularyScore},${student.writingScore},${student.progressRate}%,${student.studyHours}\n`;
      });

      return csv;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to export data');
    }
  },

  // Export analytics data as CSV
  exportAnalyticsData: async (classId: string) => {
    try {
      const { weeklyProgress, students } = get();

      let csv = 'Date,Listening Score,Vocabulary Score,Writing Score,Study Minutes\n';
      weeklyProgress.forEach((week) => {
        csv += `${week.date},${week.listeningScore},${week.vocabularyScore},${week.writingScore},${week.totalStudyMinutes}\n`;
      });

      return csv;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to export analytics');
    }
  },

  // Submit feedback
  submitFeedback: async (studentId: string, feedback: string) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.from('teacher_feedback').insert({
        student_id: studentId,
        feedback,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      set({ loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
        loading: false,
      });
      throw error;
    }
  },
}));
