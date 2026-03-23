# EigoMaster Supabase SQL Reference

**Quick SQL queries for common operations**

---

## Table of Contents

1. [Authentication & Profiles](#authentication--profiles)
2. [Classes & Students](#classes--students)
3. [Listening Questions & Attempts](#listening-questions--attempts)
4. [Vocabulary Management](#vocabulary-management)
5. [Writing Submissions](#writing-submissions)
6. [Learning Progress](#learning-progress)
7. [Teacher Management](#teacher-management)
8. [Analytics Queries](#analytics-queries)
9. [Maintenance Queries](#maintenance-queries)

---

## Authentication & Profiles

### Get Current User Profile
```sql
SELECT * FROM profiles
WHERE id = auth.uid();
```

### Create Student Profile
```sql
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  uuid_generate_v4(),
  'student@example.com',
  'student',
  'John Doe'
)
RETURNING *;
```

### Create Teacher Profile
```sql
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  uuid_generate_v4(),
  'teacher@example.com',
  'teacher',
  'Jane Smith'
)
RETURNING *;
```

### Update Profile
```sql
UPDATE profiles
SET display_name = 'New Name',
    updated_at = NOW()
WHERE id = auth.uid()
RETURNING *;
```

### Get All Users by Role
```sql
SELECT id, email, display_name, role, created_at
FROM profiles
WHERE role = 'student'  -- or 'teacher', 'admin'
ORDER BY display_name;
```

### Delete User Profile (Cascade)
```sql
DELETE FROM profiles
WHERE id = 'user-id-here'
-- This will cascade delete all related records
RETURNING *;
```

---

## Classes & Students

### Get All Classes (Teacher View)
```sql
SELECT
  c.id,
  c.name,
  c.school_name,
  c.invite_code,
  COUNT(ca.student_id) as student_count,
  c.created_at
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
WHERE c.teacher_id = auth.uid()
GROUP BY c.id, c.name, c.school_name, c.invite_code, c.created_at
ORDER BY c.created_at DESC;
```

### Create New Class
```sql
INSERT INTO classes (name, teacher_id, school_name, invite_code)
VALUES (
  'English Basics',
  'teacher-id-here',
  'Tokyo Language Academy',
  'CLASS-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 8)
)
RETURNING *;
```

### Get Classes (Student View)
```sql
SELECT
  c.id,
  c.name,
  c.school_name,
  p.display_name as teacher_name,
  c.created_at
FROM classes c
JOIN class_assignments ca ON c.id = ca.class_id
JOIN profiles p ON c.teacher_id = p.id
WHERE ca.student_id = auth.uid()
  AND ca.is_active = TRUE
ORDER BY c.name;
```

### Add Student to Class
```sql
INSERT INTO class_assignments (class_id, student_id, joined_at, is_active)
VALUES (
  'class-id-here',
  'student-id-here',
  NOW(),
  TRUE
)
RETURNING *;
```

### Get Students in Class
```sql
SELECT
  p.id,
  p.display_name,
  p.email,
  ca.joined_at,
  ca.is_active,
  ca.total_listening_attempts,
  ca.total_writing_submissions,
  ca.average_listening_score
FROM class_assignments ca
JOIN profiles p ON ca.student_id = p.id
WHERE ca.class_id = 'class-id-here'
  AND ca.is_active = TRUE
ORDER BY p.display_name;
```

### Remove Student from Class
```sql
UPDATE class_assignments
SET is_active = FALSE,
    updated_at = NOW()
WHERE class_id = 'class-id-here'
  AND student_id = 'student-id-here'
RETURNING *;
```

### Invite Code Lookup
```sql
SELECT id, name, teacher_id
FROM classes
WHERE invite_code = 'INVITE-CODE'
LIMIT 1;
```

---

## Listening Questions & Attempts

### Get All Listening Questions
```sql
SELECT
  lq.id,
  lq.title,
  qc.name as category,
  lq.difficulty,
  lq.times_attempted,
  lq.average_accuracy,
  lq.is_public,
  lq.created_at
FROM listening_questions lq
LEFT JOIN question_categories qc ON lq.category_id = qc.id
WHERE lq.is_public = TRUE
ORDER BY lq.difficulty, qc.name;
```

### Get Questions by Category
```sql
SELECT
  lq.id,
  lq.title,
  lq.difficulty,
  lq.times_attempted,
  lq.average_accuracy
FROM listening_questions lq
WHERE lq.category_id = (
  SELECT id FROM question_categories WHERE name = 'Daily Conversations'
)
ORDER BY lq.difficulty;
```

### Get Difficulty-Based Questions
```sql
SELECT
  lq.id,
  lq.title,
  lq.difficulty,
  lq.average_accuracy
FROM listening_questions lq
WHERE lq.difficulty = 2  -- 1-5
ORDER BY lq.title;
```

### Record Listening Attempt
```sql
INSERT INTO listening_attempts (user_id, question_id, selected_answer, is_correct)
VALUES (
  auth.uid(),
  'question-id-here',
  1,  -- 0-3 (multiple choice option index)
  TRUE
)
RETURNING *;
```

### Get Student's Listening Attempts
```sql
SELECT
  la.id,
  lq.title,
  la.selected_answer,
  lq.choices->>la.selected_answer as selected_text,
  la.is_correct,
  qc.name as category,
  lq.difficulty,
  la.created_at
FROM listening_attempts la
JOIN listening_questions lq ON la.question_id = lq.id
LEFT JOIN question_categories qc ON lq.category_id = qc.id
WHERE la.user_id = auth.uid()
ORDER BY la.created_at DESC;
```

### Get Student's Accuracy by Category
```sql
SELECT
  qc.name as category,
  COUNT(la.id) as attempts,
  COUNT(CASE WHEN la.is_correct THEN 1 END) as correct,
  ROUND(100.0 * COUNT(CASE WHEN la.is_correct THEN 1 END) / COUNT(la.id), 1) as accuracy_percent
FROM listening_attempts la
JOIN listening_questions lq ON la.question_id = lq.id
LEFT JOIN question_categories qc ON lq.category_id = qc.id
WHERE la.user_id = auth.uid()
GROUP BY qc.name
ORDER BY accuracy_percent DESC;
```

### Get Question Statistics
```sql
SELECT
  lq.id,
  lq.title,
  lq.difficulty,
  lq.times_attempted,
  lq.average_accuracy,
  CASE
    WHEN lq.average_accuracy >= 80 THEN 'Easy'
    WHEN lq.average_accuracy >= 60 THEN 'Medium'
    ELSE 'Hard'
  END as difficulty_level
FROM listening_questions lq
WHERE lq.times_attempted > 0
ORDER BY lq.average_accuracy DESC;
```

### Update Question Stats (Trigger-like behavior)
```sql
-- This would be done by application logic, but here's the concept
UPDATE listening_questions
SET times_attempted = (
  SELECT COUNT(*) FROM listening_attempts WHERE question_id = 'q-id'
),
average_accuracy = (
  SELECT ROUND(100.0 * COUNT(CASE WHEN is_correct THEN 1 END) / COUNT(*), 2)
  FROM listening_attempts
  WHERE question_id = 'q-id'
)
WHERE id = 'q-id';
```

---

## Vocabulary Management

### Get All Vocabulary by Stage
```sql
SELECT
  id,
  word,
  meaning,
  part_of_speech,
  example_sentence,
  stage,
  difficulty,
  frequency_rank
FROM vocabulary_words
WHERE stage = 1  -- 1-20
ORDER BY frequency_rank, difficulty;
```

### Get Vocabulary with Student Progress
```sql
SELECT
  vw.id,
  vw.word,
  vw.meaning,
  vw.example_sentence,
  vp.correct_streak,
  vp.is_mastered,
  vp.next_review_at,
  vp.last_reviewed_at
FROM vocabulary_words vw
LEFT JOIN vocabulary_progress vp ON vw.id = vp.word_id AND vp.user_id = auth.uid()
WHERE vw.stage = 1
ORDER BY vw.frequency_rank;
```

### Add Word to Student's Vocabulary
```sql
INSERT INTO vocabulary_progress (user_id, word_id, correct_streak)
VALUES (auth.uid(), 'word-id-here', 0)
ON CONFLICT (user_id, word_id) DO NOTHING
RETURNING *;
```

### Update Word Mastery Status
```sql
UPDATE vocabulary_progress
SET correct_streak = correct_streak + 1,
    is_mastered = (correct_streak >= 5),
    last_reviewed_at = NOW(),
    next_review_at = NOW() + INTERVAL '1 day'
WHERE user_id = auth.uid()
  AND word_id = 'word-id-here'
RETURNING *;
```

### Get Student's Mastered Vocabulary
```sql
SELECT
  vw.word,
  vw.meaning,
  vp.last_reviewed_at,
  vp.correct_streak
FROM vocabulary_progress vp
JOIN vocabulary_words vw ON vp.word_id = vw.id
WHERE vp.user_id = auth.uid()
  AND vp.is_mastered = TRUE
ORDER BY vp.last_reviewed_at DESC;
```

### Get Words Due for Review (Spaced Repetition)
```sql
SELECT
  vw.id,
  vw.word,
  vw.meaning,
  vp.correct_streak,
  vp.next_review_at
FROM vocabulary_progress vp
JOIN vocabulary_words vw ON vp.word_id = vw.id
WHERE vp.user_id = auth.uid()
  AND vp.is_mastered = FALSE
  AND (vp.next_review_at IS NULL OR vp.next_review_at <= NOW())
ORDER BY vp.next_review_at
LIMIT 20;
```

### Get Vocabulary Statistics
```sql
SELECT
  COUNT(*) as total_words,
  COUNT(CASE WHEN vp.is_mastered THEN 1 END) as mastered,
  COUNT(CASE WHEN vp.is_mastered THEN 1 END) * 100.0 / COUNT(*) as mastery_percent,
  AVG(vp.correct_streak) as avg_streak
FROM vocabulary_words vw
LEFT JOIN vocabulary_progress vp ON vw.id = vp.word_id AND vp.user_id = auth.uid()
WHERE vw.stage <= 5;
```

---

## Writing Submissions

### Get Writing Prompts
```sql
SELECT
  id,
  topic,
  description,
  word_limit,
  difficulty,
  category,
  example_answer,
  time_limit_minutes,
  times_assigned,
  average_score,
  created_at
FROM writing_prompts
WHERE is_public = TRUE
ORDER BY difficulty;
```

### Submit Writing Task
```sql
INSERT INTO writing_submissions (user_id, prompt_id, content)
VALUES (
  auth.uid(),
  'prompt-id-here',
  'The content of the essay...'
)
RETURNING *;
```

### Submit with Image
```sql
INSERT INTO writing_submissions (user_id, prompt_id, content, image_url)
VALUES (
  auth.uid(),
  'prompt-id-here',
  'Essay content',
  'https://bucket.com/image.jpg'
)
RETURNING *;
```

### Grade Writing Submission (Teacher)
```sql
UPDATE writing_submissions
SET score_content = 3,
    score_structure = 4,
    score_vocabulary = 3,
    score_grammar = 2,
    total_score = 3 + 4 + 3 + 2,
    feedback = 'Good work! Try to use more complex sentences.',
    updated_at = NOW()
WHERE id = 'submission-id-here'
  AND prompt_id IN (
    SELECT id FROM writing_prompts
    WHERE created_by = auth.uid()
  )
RETURNING *;
```

### Get Student's Writing Submissions
```sql
SELECT
  ws.id,
  wp.topic,
  wp.difficulty,
  ws.content,
  ws.total_score,
  ws.feedback,
  ws.created_at,
  ws.updated_at
FROM writing_submissions ws
JOIN writing_prompts wp ON ws.prompt_id = wp.id
WHERE ws.user_id = auth.uid()
ORDER BY ws.created_at DESC;
```

### Get Graded Submissions
```sql
SELECT
  ws.id,
  wp.topic,
  ws.content,
  ws.score_content,
  ws.score_structure,
  ws.score_vocabulary,
  ws.score_grammar,
  ws.total_score,
  ws.feedback,
  ws.updated_at
FROM writing_submissions ws
JOIN writing_prompts wp ON ws.prompt_id = wp.id
WHERE ws.user_id = auth.uid()
  AND ws.total_score IS NOT NULL
ORDER BY ws.updated_at DESC;
```

### Get Class Writing Performance
```sql
SELECT
  p.display_name,
  COUNT(ws.id) as submissions_count,
  COUNT(CASE WHEN ws.total_score IS NOT NULL THEN 1 END) as graded_count,
  ROUND(AVG(ws.total_score), 2) as avg_score,
  MAX(ws.total_score) as best_score
FROM class_assignments ca
JOIN profiles p ON ca.student_id = p.id
LEFT JOIN writing_submissions ws ON p.id = ws.user_id
WHERE ca.class_id = 'class-id-here'
GROUP BY p.id, p.display_name
ORDER BY avg_score DESC;
```

---

## Learning Progress

### Insert Daily Progress
```sql
INSERT INTO learning_progress (
  user_id, class_id, progress_date,
  listening_attempts_today, listening_correct_today, listening_time_minutes,
  writing_submissions_today, vocabulary_learned_today, vocabulary_reviewed_today,
  total_study_time_minutes, mood_rating, notes
)
VALUES (
  auth.uid(),
  'class-id-here',
  NOW()::date,
  5, 4, 25,
  1, 10, 15,
  40, 5,
  'Great progress on listening comprehension!'
)
ON CONFLICT (user_id, progress_date) DO UPDATE SET
  listening_attempts_today = EXCLUDED.listening_attempts_today,
  listening_correct_today = EXCLUDED.listening_correct_today,
  listening_time_minutes = EXCLUDED.listening_time_minutes,
  updated_at = NOW()
RETURNING *;
```

### Get Weekly Progress Summary
```sql
SELECT
  progress_date,
  SUM(listening_attempts_today) as total_listening,
  SUM(writing_submissions_today) as total_writing,
  SUM(vocabulary_learned_today) as total_vocab_learned,
  AVG(mood_rating) as avg_mood,
  SUM(total_study_time_minutes) as total_study_time
FROM learning_progress
WHERE user_id = auth.uid()
  AND progress_date >= NOW()::date - INTERVAL '7 days'
GROUP BY progress_date
ORDER BY progress_date DESC;
```

### Get Monthly Statistics
```sql
SELECT
  DATE_TRUNC('month', progress_date)::date as month,
  COUNT(DISTINCT progress_date) as study_days,
  SUM(total_study_time_minutes) as total_minutes,
  AVG(mood_rating) as avg_mood,
  SUM(vocabulary_learned_today) as vocab_learned
FROM learning_progress
WHERE user_id = auth.uid()
GROUP BY DATE_TRUNC('month', progress_date)
ORDER BY month DESC;
```

### Get Student Streak
```sql
WITH daily_study AS (
  SELECT progress_date, total_study_time_minutes
  FROM learning_progress
  WHERE user_id = auth.uid()
    AND total_study_time_minutes > 0
  ORDER BY progress_date DESC
)
SELECT
  COUNT(*) as current_streak_days
FROM daily_study
WHERE progress_date >= NOW()::date - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY progress_date DESC);
```

---

## Teacher Management

### Get Teacher Statistics
```sql
SELECT
  tp.teacher_id,
  p.display_name,
  tp.total_classes,
  tp.total_students,
  tp.questions_created,
  tp.prompts_created,
  tp.submissions_graded,
  tp.last_activity_at
FROM teacher_progress tp
JOIN profiles p ON tp.teacher_id = p.id
ORDER BY tp.total_students DESC;
```

### Update Teacher Progress
```sql
UPDATE teacher_progress
SET total_classes = (
  SELECT COUNT(*) FROM classes WHERE teacher_id = 'teacher-id'
),
total_students = (
  SELECT COUNT(*) FROM class_assignments ca
  WHERE ca.class_id IN (
    SELECT id FROM classes WHERE teacher_id = 'teacher-id'
  )
),
last_activity_at = NOW()
WHERE teacher_id = 'teacher-id'
RETURNING *;
```

### Get Teacher's Ungraded Submissions
```sql
SELECT
  ws.id,
  p.display_name as student_name,
  wp.topic,
  ws.created_at,
  DATEDIFF(day, ws.created_at, NOW()) as days_since_submission
FROM writing_submissions ws
JOIN writing_prompts wp ON ws.prompt_id = wp.id
JOIN profiles p ON ws.user_id = p.id
WHERE wp.created_by = auth.uid()
  AND ws.total_score IS NULL
ORDER BY ws.created_at;
```

---

## Analytics Queries

### Student Engagement Score
```sql
SELECT
  p.display_name,
  DATE(lp.progress_date) as date,
  lp.listening_attempts_today,
  lp.writing_submissions_today,
  lp.vocabulary_learned_today,
  lp.total_study_time_minutes,
  CASE
    WHEN lp.total_study_time_minutes >= 60 THEN 'High'
    WHEN lp.total_study_time_minutes >= 30 THEN 'Medium'
    ELSE 'Low'
  END as engagement_level
FROM learning_progress lp
JOIN profiles p ON lp.user_id = p.id
WHERE DATE(lp.progress_date) >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY lp.progress_date DESC;
```

### Class Performance Comparison
```sql
SELECT
  c.name as class_name,
  COUNT(DISTINCT ca.student_id) as student_count,
  ROUND(AVG(ca.average_listening_score), 2) as avg_listening,
  ROUND(AVG(ca.average_writing_score), 2) as avg_writing,
  COUNT(DISTINCT lp.progress_date) / COUNT(DISTINCT ca.student_id) as avg_days_studied
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
LEFT JOIN learning_progress lp ON ca.student_id = lp.user_id
WHERE c.teacher_id = auth.uid()
GROUP BY c.id, c.name
ORDER BY avg_listening DESC;
```

### Question Difficulty Analysis
```sql
SELECT
  difficulty,
  COUNT(*) as question_count,
  ROUND(AVG(times_attempted), 0) as avg_attempts,
  ROUND(AVG(average_accuracy), 1) as avg_accuracy,
  MIN(average_accuracy) as min_accuracy,
  MAX(average_accuracy) as max_accuracy
FROM listening_questions
WHERE is_public = TRUE
GROUP BY difficulty
ORDER BY difficulty;
```

### Student Progress Timeline
```sql
SELECT
  DATE(lp.progress_date) as date,
  COUNT(DISTINCT lp.user_id) as active_students,
  SUM(lp.listening_attempts_today) as total_listening,
  SUM(lp.writing_submissions_today) as total_writing,
  ROUND(AVG(lp.mood_rating), 2) as avg_mood
FROM learning_progress lp
WHERE lp.progress_date >= NOW()::date - INTERVAL '30 days'
GROUP BY DATE(lp.progress_date)
ORDER BY date DESC;
```

---

## Maintenance Queries

### Cleanup: Remove Inactive Students
```sql
-- First, identify inactive students (no activity in 90 days)
SELECT p.id, p.display_name, MAX(ca.last_activity_at) as last_activity
FROM class_assignments ca
JOIN profiles p ON ca.student_id = p.id
WHERE ca.is_active = TRUE
GROUP BY p.id, p.display_name
HAVING MAX(ca.last_activity_at) < NOW() - INTERVAL '90 days'
ORDER BY last_activity;

-- Then, mark as inactive
UPDATE class_assignments
SET is_active = FALSE
WHERE student_id IN (
  SELECT p.id
  FROM class_assignments ca
  JOIN profiles p ON ca.student_id = p.id
  WHERE ca.is_active = TRUE
  GROUP BY p.id
  HAVING MAX(ca.last_activity_at) < NOW() - INTERVAL '90 days'
);
```

### Verify Data Integrity
```sql
-- Check for orphaned records
SELECT 'orphaned_listening_attempts' as issue, COUNT(*) as count
FROM listening_attempts
WHERE user_id NOT IN (SELECT id FROM profiles)
UNION ALL
SELECT 'orphaned_writing_submissions', COUNT(*)
FROM writing_submissions
WHERE user_id NOT IN (SELECT id FROM profiles)
UNION ALL
SELECT 'orphaned_vocabulary_progress', COUNT(*)
FROM vocabulary_progress
WHERE user_id NOT IN (SELECT id FROM profiles)
UNION ALL
SELECT 'orphaned_class_assignments', COUNT(*)
FROM class_assignments
WHERE class_id NOT IN (SELECT id FROM classes);
```

### Reset Study Data (for Testing)
```sql
-- Delete all learning data for a student
DELETE FROM listening_attempts WHERE user_id = 'student-id';
DELETE FROM vocabulary_progress WHERE user_id = 'student-id';
DELETE FROM writing_submissions WHERE user_id = 'student-id';
DELETE FROM learning_progress WHERE user_id = 'student-id';
DELETE FROM shadowing_records
WHERE attempt_id NOT IN (SELECT id FROM listening_attempts);

-- Confirm deletion
SELECT 'listening_attempts', COUNT(*) FROM listening_attempts WHERE user_id = 'student-id'
UNION ALL
SELECT 'vocabulary_progress', COUNT(*) FROM vocabulary_progress WHERE user_id = 'student-id'
UNION ALL
SELECT 'writing_submissions', COUNT(*) FROM writing_submissions WHERE user_id = 'student-id';
```

### Database Health Check
```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index bloat
SELECT
  indexrelname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check total database size
SELECT pg_size_pretty(pg_database_size('postgres')) as total_size;
```

---

## Export Data

### Export to CSV

```sql
-- Using COPY command (PostgreSQL)
COPY (
  SELECT
    p.display_name,
    p.email,
    COUNT(ca.student_id) as classes,
    COUNT(DISTINCT lp.progress_date) as study_days
  FROM profiles p
  LEFT JOIN class_assignments ca ON p.id = ca.student_id
  LEFT JOIN learning_progress lp ON p.id = lp.user_id
  WHERE p.role = 'student'
  GROUP BY p.id, p.display_name, p.email
)
TO '/tmp/students_report.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
```

---

**End of SQL Reference**

Use these queries as templates for your own database operations. Always test in development before running on production!
