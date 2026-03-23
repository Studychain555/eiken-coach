-- Teacher Dashboard & Analytics Schema
-- Run this script in Supabase SQL Editor to create necessary tables

-- 1. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('listening', 'vocabulary', 'writing')),
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Indexes for better query performance
  CONSTRAINT assignments_class_id_idx UNIQUE (class_id, id)
);

CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
CREATE INDEX idx_assignments_created_by ON assignments(created_by);

-- 2. Teacher Feedback Table
CREATE TABLE IF NOT EXISTS teacher_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teacher_feedback_student_id ON teacher_feedback(student_id);
CREATE INDEX idx_teacher_feedback_teacher_id ON teacher_feedback(teacher_id);
CREATE INDEX idx_teacher_feedback_created_at ON teacher_feedback(created_at DESC);

-- 3. Learning Progress Table (Daily tracking)
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  listening_attempts INTEGER DEFAULT 0,
  listening_correct INTEGER DEFAULT 0,
  vocabulary_mastered INTEGER DEFAULT 0,
  vocabulary_total INTEGER DEFAULT 0,
  writing_submissions INTEGER DEFAULT 0,
  writing_average_score DECIMAL(5,2) DEFAULT 0.00,
  study_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one record per student per day
  UNIQUE(student_id, date)
);

CREATE INDEX idx_learning_progress_student_id ON learning_progress(student_id);
CREATE INDEX idx_learning_progress_date ON learning_progress(date);
CREATE INDEX idx_learning_progress_student_date ON learning_progress(student_id, date DESC);

-- 4. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded')),
  submission_date TIMESTAMP,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- One submission per student per assignment
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(status);

-- 5. Class Statistics View (for quick dashboard queries)
CREATE OR REPLACE VIEW class_statistics AS
SELECT
  c.id as class_id,
  c.name as class_name,
  COUNT(DISTINCT p.id) as total_students,
  ROUND(AVG(lp.listening_correct::DECIMAL / NULLIF(lp.listening_attempts, 0) * 100)::NUMERIC, 1) as avg_listening_accuracy,
  ROUND(AVG(lp.vocabulary_mastered::DECIMAL / NULLIF(lp.vocabulary_total, 0) * 100)::NUMERIC, 1) as avg_vocabulary_progress,
  ROUND(AVG(lp.writing_average_score)::NUMERIC, 1) as avg_writing_score,
  ROUND(AVG(lp.study_minutes)::NUMERIC, 1) as avg_study_minutes,
  SUM(lp.study_minutes) as total_study_minutes
FROM classes c
LEFT JOIN profiles p ON c.id = p.class_id AND p.role = 'student'
LEFT JOIN learning_progress lp ON p.id = lp.student_id
GROUP BY c.id, c.name;

-- 6. Student Performance View (for ranking and comparison)
CREATE OR REPLACE VIEW student_performance AS
SELECT
  p.id as student_id,
  p.display_name,
  p.email,
  p.class_id,
  ROUND(AVG(lp.listening_correct::DECIMAL / NULLIF(lp.listening_attempts, 0) * 100)::NUMERIC, 1) as listening_accuracy,
  ROUND(AVG(lp.vocabulary_mastered::DECIMAL / NULLIF(lp.vocabulary_total, 0) * 100)::NUMERIC, 1) as vocabulary_progress,
  ROUND(AVG(lp.writing_average_score)::NUMERIC, 1) as writing_score,
  SUM(lp.study_minutes) as total_study_minutes,
  MAX(lp.date) as last_study_date,
  ROUND((AVG(lp.listening_correct::DECIMAL / NULLIF(lp.listening_attempts, 0)) +
          AVG(lp.vocabulary_mastered::DECIMAL / NULLIF(lp.vocabulary_total, 0)) +
          AVG(lp.writing_average_score) / 100) / 3 * 100)::INTEGER as overall_score
FROM profiles p
LEFT JOIN learning_progress lp ON p.id = lp.student_id
WHERE p.role = 'student'
GROUP BY p.id, p.display_name, p.email, p.class_id;

-- 7. Enable RLS (Row Level Security)
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for Assignments
-- Teachers can manage assignments for their classes
CREATE POLICY "Teachers can create assignments for their classes"
ON assignments FOR INSERT
WITH CHECK (
  created_by IN (SELECT id FROM profiles WHERE role = 'teacher')
);

CREATE POLICY "Teachers can view assignments for their classes"
ON assignments FOR SELECT
USING (
  class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  OR
  auth.uid() IN (SELECT id FROM profiles WHERE class_id = assignments.class_id)
);

-- 9. RLS Policies for Teacher Feedback
CREATE POLICY "Teachers can write feedback for their students"
ON teacher_feedback FOR INSERT
WITH CHECK (
  teacher_id = auth.uid()
  AND
  student_id IN (
    SELECT p.id FROM profiles p
    INNER JOIN classes c ON p.class_id = c.id
    WHERE c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view feedback for themselves"
ON teacher_feedback FOR SELECT
USING (
  student_id = auth.uid() OR
  teacher_id = auth.uid()
);

-- 10. RLS Policies for Learning Progress
CREATE POLICY "Students can write their own progress"
ON learning_progress FOR INSERT
WITH CHECK (
  student_id = auth.uid()
);

CREATE POLICY "Students can view their own progress"
ON learning_progress FOR SELECT
USING (
  student_id = auth.uid()
);

CREATE POLICY "Teachers can view progress of their students"
ON learning_progress FOR SELECT
USING (
  student_id IN (
    SELECT p.id FROM profiles p
    INNER JOIN classes c ON p.class_id = c.id
    WHERE c.teacher_id = auth.uid()
  )
);

-- 11. RLS Policies for Assignment Submissions
CREATE POLICY "Students can submit their own assignments"
ON assignment_submissions FOR INSERT
WITH CHECK (
  student_id = auth.uid()
);

CREATE POLICY "Teachers can grade submissions for their assignments"
ON assignment_submissions FOR UPDATE
USING (
  assignment_id IN (SELECT id FROM assignments WHERE created_by = auth.uid())
);

CREATE POLICY "Students can view their own submissions"
ON assignment_submissions FOR SELECT
USING (
  student_id = auth.uid()
);

CREATE POLICY "Teachers can view submissions for their assignments"
ON assignment_submissions FOR SELECT
USING (
  assignment_id IN (SELECT id FROM assignments WHERE created_by = auth.uid())
);

-- 12. Utility Functions

-- Function to calculate student's current week stats
CREATE OR REPLACE FUNCTION get_weekly_stats(student_id UUID, weeks INT DEFAULT 4)
RETURNS TABLE(
  date DATE,
  listening_accuracy NUMERIC,
  vocabulary_progress NUMERIC,
  writing_score NUMERIC,
  total_study_minutes INTEGER
) AS $$
SELECT
  date,
  ROUND(listening_correct::DECIMAL / NULLIF(listening_attempts, 0) * 100, 1),
  ROUND(vocabulary_mastered::DECIMAL / NULLIF(vocabulary_total, 0) * 100, 1),
  writing_average_score,
  study_minutes
FROM learning_progress
WHERE learning_progress.student_id = $1
  AND date >= CURRENT_DATE - (weeks * 7 || ' days')::INTERVAL
ORDER BY date DESC;
$$ LANGUAGE SQL STABLE;

-- Function to get class summary
CREATE OR REPLACE FUNCTION get_class_summary(class_id UUID)
RETURNS TABLE(
  total_students BIGINT,
  avg_listening_accuracy NUMERIC,
  avg_vocabulary_progress NUMERIC,
  avg_writing_score NUMERIC,
  engagement_rate NUMERIC
) AS $$
SELECT
  COUNT(DISTINCT p.id),
  ROUND(AVG(lp.listening_correct::DECIMAL / NULLIF(lp.listening_attempts, 0) * 100), 1),
  ROUND(AVG(lp.vocabulary_mastered::DECIMAL / NULLIF(lp.vocabulary_total, 0) * 100), 1),
  ROUND(AVG(lp.writing_average_score), 1),
  ROUND(COUNT(DISTINCT CASE WHEN lp.date >= CURRENT_DATE - 7 THEN p.id END)::DECIMAL /
        NULLIF(COUNT(DISTINCT p.id), 0) * 100, 1)
FROM profiles p
LEFT JOIN learning_progress lp ON p.id = lp.student_id
WHERE p.class_id = $1 AND p.role = 'student'
GROUP BY p.class_id;
$$ LANGUAGE SQL STABLE;

-- Indexes for views
CREATE INDEX idx_student_performance_class_id ON profiles(class_id) WHERE role = 'student';

-- Grant permissions
GRANT ALL ON assignments TO authenticated;
GRANT ALL ON teacher_feedback TO authenticated;
GRANT ALL ON learning_progress TO authenticated;
GRANT ALL ON assignment_submissions TO authenticated;
GRANT SELECT ON class_statistics TO authenticated;
GRANT SELECT ON student_performance TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_stats(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_class_summary(UUID) TO authenticated;
