-- =====================================================================
-- 002_enhanced_schema.sql - EigoMaster Enhanced Supabase Schema
-- =====================================================================
-- This migration enhances the initial schema with:
-- 1. Additional tables for teacher progress tracking
-- 2. Class assignments management
-- 3. Performance analytics
-- 4. Improved constraints and relationships
--
-- =====================================================================

-- =====================================================================
-- 1. TEACHER PROGRESS TABLE
-- =====================================================================
-- Tracks each teacher's management metrics and class statistics
CREATE TABLE teacher_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Class statistics
  total_classes INT DEFAULT 0,
  total_students INT DEFAULT 0,

  -- Activity metrics
  questions_created INT DEFAULT 0,
  prompts_created INT DEFAULT 0,
  vocabulary_batches_created INT DEFAULT 0,

  -- Grading activity
  submissions_graded INT DEFAULT 0,
  average_grading_time INT DEFAULT 0, -- seconds

  -- Student performance
  average_student_score DECIMAL(5, 2),
  highest_performing_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,

  -- Analytics
  last_activity_at TIMESTAMP WITH TIME ZONE,
  last_grading_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 2. CLASS ASSIGNMENTS TABLE
-- =====================================================================
-- Links students to classes (many-to-many relationship)
CREATE TABLE class_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Assignment metadata
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,

  -- Student status in class
  is_active BOOLEAN DEFAULT TRUE,
  is_approved_by_teacher BOOLEAN DEFAULT TRUE, -- Auto-approve for now

  -- Performance tracking
  total_listening_attempts INT DEFAULT 0,
  total_writing_submissions INT DEFAULT 0,
  total_vocabulary_completed INT DEFAULT 0,
  average_listening_score DECIMAL(5, 2),
  average_writing_score DECIMAL(5, 2),

  last_activity_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(class_id, student_id)
);

-- =====================================================================
-- 3. LEARNING PROGRESS TABLE
-- =====================================================================
-- Comprehensive daily learning progress tracking
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,

  -- Date tracking
  progress_date DATE NOT NULL,

  -- Listening stats
  listening_attempts_today INT DEFAULT 0,
  listening_correct_today INT DEFAULT 0,
  listening_time_minutes INT DEFAULT 0,

  -- Writing stats
  writing_submissions_today INT DEFAULT 0,
  writing_average_score DECIMAL(5, 2),

  -- Vocabulary stats
  vocabulary_learned_today INT DEFAULT 0,
  vocabulary_reviewed_today INT DEFAULT 0,
  vocabulary_mastered_total INT DEFAULT 0,

  -- Overall
  total_study_time_minutes INT DEFAULT 0,
  mood_rating INT CHECK (mood_rating >= 1 AND mood_rating <= 5),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, progress_date)
);

-- =====================================================================
-- 4. QUESTION CATEGORIES TABLE
-- =====================================================================
-- Organize listening questions by topics and categories
CREATE TABLE question_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 5. LISTENING QUESTIONS ENHANCED
-- =====================================================================
-- Add category relationship to listening_questions
ALTER TABLE listening_questions
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS explanation TEXT,
ADD COLUMN IF NOT EXISTS explanation_translation TEXT,
ADD COLUMN IF NOT EXISTS times_attempted INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_accuracy DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================================
-- 6. WRITING PROMPTS ENHANCED
-- =====================================================================
-- Add category and teacher tracking to writing_prompts
ALTER TABLE writing_prompts
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS example_answer TEXT,
ADD COLUMN IF NOT EXISTS time_limit_minutes INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS times_assigned INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================================
-- 7. VOCABULARY WORDS ENHANCED
-- =====================================================================
-- Add more comprehensive vocabulary data
ALTER TABLE vocabulary_words
ADD COLUMN IF NOT EXISTS phonetic TEXT,
ADD COLUMN IF NOT EXISTS pronunciation_url TEXT,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS synonyms JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS antonyms JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS word_family JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS frequency_rank INT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS times_learned INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_mastery_time_seconds INT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================================

-- Teacher progress indexes
CREATE INDEX IF NOT EXISTS idx_teacher_progress_teacher_id ON teacher_progress(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_progress_updated_at ON teacher_progress(updated_at DESC);

-- Class assignments indexes
CREATE INDEX IF NOT EXISTS idx_class_assignments_class_id ON class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_student_id ON class_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_is_active ON class_assignments(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_class_assignments_last_activity ON class_assignments(last_activity_at DESC);

-- Learning progress indexes
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_class_id ON learning_progress(class_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_date ON learning_progress(progress_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_date ON learning_progress(user_id, progress_date DESC);

-- Question categories indexes
CREATE INDEX IF NOT EXISTS idx_question_categories_sort_order ON question_categories(sort_order);

-- Enhanced listening questions indexes
CREATE INDEX IF NOT EXISTS idx_listening_questions_category_id ON listening_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_listening_questions_difficulty_category ON listening_questions(difficulty, category_id);
CREATE INDEX IF NOT EXISTS idx_listening_questions_is_public ON listening_questions(is_public);
CREATE INDEX IF NOT EXISTS idx_listening_questions_created_by ON listening_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_listening_questions_gin_tags ON listening_questions USING GIN(tags);

-- Enhanced vocabulary indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_stage_difficulty ON vocabulary_words(stage, difficulty);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_is_public ON vocabulary_words(is_public);
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_frequency ON vocabulary_words(frequency_rank) WHERE frequency_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_gin_tags ON vocabulary_words USING GIN(tags);

-- Enhanced writing prompts indexes
CREATE INDEX IF NOT EXISTS idx_writing_prompts_category ON writing_prompts(category);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_is_public ON writing_prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_created_by ON writing_prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_writing_prompts_gin_tags ON writing_prompts USING GIN(tags);

-- =====================================================================
-- 9. ENABLE RLS FOR NEW TABLES
-- =====================================================================

ALTER TABLE teacher_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 10. RLS POLICIES FOR ENHANCED TABLES
-- =====================================================================

-- teacher_progress: Teachers can read own progress
CREATE POLICY "Teachers can read own progress" ON teacher_progress
  FOR SELECT USING (auth.uid() = teacher_id);

-- teacher_progress: Teachers can update own progress
CREATE POLICY "Teachers can update own progress" ON teacher_progress
  FOR UPDATE USING (auth.uid() = teacher_id);

-- class_assignments: Teachers can read their class assignments
CREATE POLICY "Teachers can read their class assignments" ON class_assignments
  FOR SELECT USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

-- class_assignments: Students can read their own assignments
CREATE POLICY "Students can read own assignments" ON class_assignments
  FOR SELECT USING (auth.uid() = student_id);

-- learning_progress: Students can read own progress
CREATE POLICY "Students can read own learning progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

-- learning_progress: Teachers can read student progress in their classes
CREATE POLICY "Teachers can read student progress" ON learning_progress
  FOR SELECT USING (
    user_id IN (
      SELECT student_id FROM class_assignments ca
      JOIN classes c ON ca.class_id = c.id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- learning_progress: Students can insert own progress
CREATE POLICY "Students can insert own learning progress" ON learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- learning_progress: Students can update own progress
CREATE POLICY "Students can update own learning progress" ON learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- question_categories: All authenticated users can read
CREATE POLICY "All authenticated users can read categories" ON question_categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================================
-- 11. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_teacher_progress_updated_at BEFORE UPDATE ON teacher_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_assignments_updated_at BEFORE UPDATE ON class_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listening_questions_updated_at BEFORE UPDATE ON listening_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_writing_prompts_updated_at BEFORE UPDATE ON writing_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_words_updated_at BEFORE UPDATE ON vocabulary_words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- END: 002_enhanced_schema.sql
-- =====================================================================
