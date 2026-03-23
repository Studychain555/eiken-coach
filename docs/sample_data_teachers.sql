-- =====================================================================
-- EigoMaster Demo Data: Teachers (5 teachers)
-- =====================================================================
-- This file contains sample teacher profiles for demonstration purposes
-- All timestamps are realistic based on demo context (as of 2026-03-19)
-- =====================================================================

-- Teacher 1: 田中明美 (Akemi Tanaka) - English Department Head
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'akemi.tanaka@eigomaster.demo',
  'teacher',
  '田中明美',
  '2025-09-10 10:15:00+09'
);

-- Teacher 2: 鈴木洋一 (Yoichi Suzuki) - Senior Teacher
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'yoichi.suzuki@eigomaster.demo',
  'teacher',
  '鈴木洋一',
  '2025-10-05 14:30:00+09'
);

-- Teacher 3: 山本由紀 (Yuki Yamamoto) - Listening Specialist
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'yuki.yamamoto@eigomaster.demo',
  'teacher',
  '山本由紀',
  '2025-11-12 09:00:00+09'
);

-- Teacher 4: 伊藤健太 (Kenta Ito) - Writing Instructor
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  'kenta.ito@eigomaster.demo',
  'teacher',
  '伊藤健太',
  '2025-11-20 15:45:00+09'
);

-- Teacher 5: 佐藤美咲 (Misaki Sato) - Vocabulary & Reading
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'misaki.sato@eigomaster.demo',
  'teacher',
  '佐藤美咲',
  '2025-12-08 11:20:00+09'
);

-- =====================================================================
-- Classes: 3 classes with different difficulty levels
-- =====================================================================

-- Class 1: 基礎クラス (Beginner Class) - Teacher: Tanaka (田中明美)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655450001',
  '基礎クラス',
  '550e8400-e29b-41d4-a716-446655440001',
  '進学高等学校',
  'KISO-2024-ABC123',
  '2025-09-15 10:00:00+09'
);

-- Class 2: 標準クラス (Standard Class) - Teacher: Suzuki (鈴木洋一)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655450002',
  '標準クラス',
  '550e8400-e29b-41d4-a716-446655440002',
  '進学高等学校',
  'HYOJ-2024-DEF456',
  '2025-09-16 10:00:00+09'
);

-- Class 3: 発展クラス (Advanced Class) - Teacher: Yamamoto (山本由紀)
INSERT INTO classes (id, name, teacher_id, school_name, invite_code, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655450003',
  '発展クラス',
  '550e8400-e29b-41d4-a716-446655440003',
  '進学高等学校',
  'HATEN-2024-GHI789',
  '2025-09-17 10:00:00+09'
);

-- =====================================================================
-- Teacher Progress Tracking
-- =====================================================================

-- Teacher 1: 田中明美 - Beginner Class
INSERT INTO teacher_progress (
  id, teacher_id, total_classes, total_students,
  questions_created, prompts_created, vocabulary_batches_created,
  submissions_graded, average_grading_time,
  average_student_score, last_activity_at, last_grading_at,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655460001',
  '550e8400-e29b-41d4-a716-446655440001',
  1, 17,
  45, 28, 12,
  87, 420,
  72.3, '2026-03-19 16:45:00+09', '2026-03-19 15:30:00+09',
  '2025-09-15 10:00:00+09', '2026-03-19 16:45:00+09'
);

-- Teacher 2: 鈴木洋一 - Standard Class
INSERT INTO teacher_progress (
  id, teacher_id, total_classes, total_students,
  questions_created, prompts_created, vocabulary_batches_created,
  submissions_graded, average_grading_time,
  average_student_score, last_activity_at, last_grading_at,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655460002',
  '550e8400-e29b-41d4-a716-446655440002',
  1, 18,
  52, 35, 15,
  124, 385,
  78.6, '2026-03-19 17:20:00+09', '2026-03-19 16:15:00+09',
  '2025-09-16 10:00:00+09', '2026-03-19 17:20:00+09'
);

-- Teacher 3: 山本由紀 - Advanced Class
INSERT INTO teacher_progress (
  id, teacher_id, total_classes, total_students,
  questions_created, prompts_created, vocabulary_batches_created,
  submissions_graded, average_grading_time,
  average_student_score, last_activity_at, last_grading_at,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655460003',
  '550e8400-e29b-41d4-a716-446655440003',
  1, 15,
  68, 42, 18,
  156, 365,
  85.2, '2026-03-19 18:00:00+09', '2026-03-19 17:45:00+09',
  '2025-09-17 10:00:00+09', '2026-03-19 18:00:00+09'
);

-- Teacher 4: 伊藤健太 (not assigned to a class in this demo)
INSERT INTO teacher_progress (
  id, teacher_id, total_classes, total_students,
  questions_created, prompts_created, vocabulary_batches_created,
  submissions_graded, average_grading_time,
  average_student_score, last_activity_at, last_grading_at,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655460004',
  '550e8400-e29b-41d4-a716-446655440004',
  0, 0,
  35, 20, 8,
  45, 400,
  75.8, '2026-03-19 14:00:00+09', '2026-03-19 13:30:00+09',
  '2025-11-20 15:45:00+09', '2026-03-19 14:00:00+09'
);

-- Teacher 5: 佐藤美咲 (not assigned to a class in this demo)
INSERT INTO teacher_progress (
  id, teacher_id, total_classes, total_students,
  questions_created, prompts_created, vocabulary_batches_created,
  submissions_graded, average_grading_time,
  average_student_score, last_activity_at, last_grading_at,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655460005',
  '550e8400-e29b-41d4-a716-446655440005',
  0, 0,
  28, 15, 6,
  32, 420,
  73.5, '2026-03-18 10:30:00+09', '2026-03-18 10:00:00+09',
  '2025-12-08 11:20:00+09', '2026-03-18 10:30:00+09'
);

-- =====================================================================
-- END: Teachers and Classes Setup
-- =====================================================================
