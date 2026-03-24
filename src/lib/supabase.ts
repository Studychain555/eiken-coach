import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate required environment variables for runtime
const isConfigured = process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!isConfigured) {
  console.warn('⚠️ Supabase environment variables not configured. The app will not function properly.');
  console.warn('📋 To fix: Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages environment settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'student' | 'teacher' | 'admin';
          display_name: string;
          class_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          teacher_id: string;
          school_name: string | null;
          invite_code: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      assignments: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          description: string;
          type: 'listening' | 'vocabulary' | 'writing';
          due_date: string;
          created_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['assignments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['assignments']['Insert']>;
      };
      teacher_feedback: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          feedback: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['teacher_feedback']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['teacher_feedback']['Insert']>;
      };
      learning_progress: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          listening_attempts: number;
          listening_correct: number;
          vocabulary_mastered: number;
          vocabulary_total: number;
          writing_submissions: number;
          writing_average_score: number;
          study_minutes: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['learning_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['learning_progress']['Insert']>;
      };
    };
  };
};
