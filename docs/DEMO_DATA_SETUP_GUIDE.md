# EigoMaster Demo Data Setup Guide

## Overview

This guide provides comprehensive instructions for loading realistic sample data into the EigoMaster Supabase database. The demo dataset includes:

- **50 High School Students** across 3 classes (基礎/標準/発展)
- **5 Teachers** with realistic class assignments
- **30 Listening Questions** across all difficulty levels (1-5)
- **150+ Listening Attempts** with realistic success patterns
- **100+ Vocabulary Words** at EIKEN Pre-1 level
- **20 Writing Prompts** covering diverse topics
- **50+ Writing Submissions** with teacher scores
- **Learning Progress Records** spanning last 30 days
- **Vocabulary Mastery Tracking** across all students

## Why This Data Matters for Demo

This sample dataset demonstrates real application value:

1. **Realistic Student Progression**: Shows improvement over time with varied skill levels
2. **Convincing Metrics**: Average scores, mastery rates, and engagement patterns look authentic
3. **Clear Class Differentiation**: Different performance patterns by difficulty level
4. **Complete Workflow**: From assignment creation → student attempts → teacher grading → progress tracking
5. **Visual Dashboard Impact**: Charts, statistics, and progress bars show meaningful variation

## Data Files

| File | Records | Purpose |
|------|---------|---------|
| `sample_data_teachers.sql` | 5 teachers + 3 classes | Teacher setup, class management, teacher progress |
| `sample_data_students.sql` | 50 students + 50 assignments | Student profiles, class enrollment |
| `sample_data_listening_questions.sql` | 30 questions + metadata | Listening content for assessment |
| `sample_data_listening_attempts.sql` | 150+ attempts | Student test performance data |
| `sample_data_vocabulary_writing.sql` | 100 words + 20 prompts | Vocabulary and writing task content |
| `sample_data_progress_submissions.sql` | 50+ submissions + 100+ progress records | Student progress and grading data |

## Setup Instructions

### Step 1: Connect to Supabase

```bash
# Via psql
psql postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Or use Supabase Dashboard → SQL Editor
```

### Step 2: Load Data in Order

**Important**: Load in this order to respect foreign key constraints.

```bash
# 1. Teachers and Classes (foundational)
psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_teachers.sql

# 2. Students and Assignments
psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_students.sql

# 3. Content (questions, vocabulary, prompts)
psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_listening_questions.sql

psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_vocabulary_writing.sql

# 4. Student Performance Data
psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_listening_attempts.sql

# 5. Final: Progress and Submissions
psql -h db.[PROJECT-ID].supabase.co -U postgres -d postgres \
  -f sample_data_progress_submissions.sql
```

### Step 3: Verify Data

```sql
-- Check record counts
SELECT COUNT(*) as total_students FROM profiles WHERE role = 'student';
SELECT COUNT(*) as total_teachers FROM profiles WHERE role = 'teacher';
SELECT COUNT(*) as total_questions FROM listening_questions;
SELECT COUNT(*) as total_submissions FROM writing_submissions;
SELECT COUNT(*) as total_attempts FROM listening_attempts;
SELECT COUNT(*) as total_progress FROM learning_progress;

-- Check class enrollment
SELECT c.name, COUNT(ca.student_id) as enrolled_students
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
GROUP BY c.id, c.name;

-- Check average scores
SELECT
  p.role,
  ROUND(AVG(CASE WHEN ws.total_score IS NOT NULL THEN ws.total_score ELSE 0 END), 2) as avg_writing_score,
  ROUND(AVG(CASE WHEN la.is_correct THEN 1 ELSE 0 END)::numeric * 100, 2) as listening_accuracy_pct
FROM profiles p
LEFT JOIN writing_submissions ws ON p.id = ws.user_id
LEFT JOIN listening_attempts la ON p.id = la.user_id
GROUP BY p.role;
```

## Data Patterns Explained

### Class Performance Variation

| Class | Level | Listening Accuracy | Writing Avg | Notes |
|-------|-------|-------------------|-------------|-------|
| 基礎クラス (Beginner) | Difficulty 1-2 | 70-80% | 8-10 | High repetition, basic concepts |
| 標準クラス (Standard) | Difficulty 2-3 | 75-85% | 11-13 | Balanced mix, some advanced content |
| 発展クラス (Advanced) | Difficulty 3-5 | 85-95% | 14-16 | Complex questions, sophisticated writing |

### Learning Progress Patterns

- **Daily study time**: 30-65 minutes (increases for advanced students)
- **Questions attempted per day**: 3-8 (increases by class level)
- **Vocabulary learned daily**: 5-12 words
- **Mood ratings**: 2-5 (correlates with performance)

### Writing Submission Scores

**Scoring Rubric** (0-4 per dimension, total 0-16):

- **Content (0-4)**: Relevance, depth, supporting details
- **Structure (0-4)**: Organization, transitions, cohesion
- **Vocabulary (0-4)**: Word choice, variety, sophistication
- **Grammar (0-4)**: Accuracy, sentence complexity, style

**Score Interpretation**:
- 8-10: Beginner level, basic competency
- 11-13: Intermediate, developing proficiency
- 14-16: Advanced, strong command

### Realistic Feedback Examples

```
Score 8: "Good basic content. Work on sentence variety and deeper reflection. Expand with more specific examples."

Score 12: "Well-structured essay. Good examples of soft skills. Strengthen conclusion with specific recommendations."

Score 16: "Outstanding essay. Sophisticated philosophical analysis with clear framework. Excellent vocabulary and argumentation."
```

## Using Data in Demo

### Dashboard Metrics
- Total students: 50
- Total teachers: 5
- Classes: 3
- Total content items: 150+ (30 questions + 100 words + 20 prompts)
- Student attempts: 150+
- Submissions graded: 50+
- Average student score: 72.3% (Beginner) → 85.2% (Advanced)

### Sample Queries for Dashboard

```sql
-- Student performance by class
SELECT
  c.name as class_name,
  COUNT(DISTINCT ca.student_id) as students,
  ROUND(AVG(la.is_correct::int)::numeric * 100, 1) as listening_accuracy_pct,
  ROUND(AVG(ws.total_score), 1) as avg_writing_score
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
LEFT JOIN listening_attempts la ON ca.student_id = la.user_id
LEFT JOIN writing_submissions ws ON ca.student_id = ws.user_id
GROUP BY c.id, c.name;

-- Teacher workload metrics
SELECT
  p.display_name as teacher_name,
  tp.total_students,
  tp.questions_created,
  tp.prompts_created,
  tp.submissions_graded,
  ROUND(AVG(tp.average_student_score), 1) as class_average_score
FROM profiles p
JOIN teacher_progress tp ON p.id = tp.teacher_id
WHERE p.role = 'teacher';

-- Top performing students
SELECT
  p.display_name,
  c.name as class,
  COUNT(DISTINCT la.id) as listening_attempts,
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as accuracy_pct,
  ROUND(AVG(ws.total_score), 1) as writing_avg
FROM profiles p
JOIN class_assignments ca ON p.id = ca.student_id
JOIN classes c ON ca.class_id = c.id
LEFT JOIN listening_attempts la ON p.id = la.user_id
LEFT JOIN writing_submissions ws ON p.id = ws.user_id
WHERE p.role = 'student'
GROUP BY p.id, p.display_name, c.id, c.name
ORDER BY accuracy_pct DESC
LIMIT 10;

-- Progress trends
SELECT
  EXTRACT(MONTH FROM progress_date) as month,
  EXTRACT(YEAR FROM progress_date) as year,
  COUNT(*) as total_study_days,
  ROUND(AVG(total_study_time_minutes), 1) as avg_daily_time,
  ROUND(AVG(mood_rating), 2) as avg_mood,
  COUNT(DISTINCT user_id) as active_students
FROM learning_progress
GROUP BY year, month
ORDER BY year DESC, month DESC;
```

## Demo Presentation Tips

### What to Show

1. **Class Dashboard**: Click into each class to show differentiated performance
   - Beginner: "See how students are building confidence in basics"
   - Standard: "Progressive improvement toward EIKEN standards"
   - Advanced: "Nearly native-level comprehension and writing"

2. **Student Profile**: Select a promising student to show:
   - Learning progression over 30 days
   - Vocabulary mastery streak
   - Teacher feedback on writing
   - Mood and engagement correlation

3. **Content Analysis**: Display listening questions with:
   - Difficulty distribution (30 questions across levels 1-5)
   - Student attempt patterns
   - Success rates by difficulty

4. **Teacher Dashboard**: Show:
   - Workload metrics (questions created, submissions graded)
   - Class performance averages
   - Time spent on grading per submission

### Key Talking Points

- **"This system actually shows improvement"**: Point to learning_progress data showing steady gains
- **"Teachers can see what's working"**: Show teacher_progress metrics and class averages
- **"Personalized difficulty"**: Compare beginner vs advanced student assignments
- **"Real feedback loops"**: Show specific teacher feedback on writing submissions
- **"Engagement tracking"**: Point to mood_rating correlations with performance
- **"Data-driven insights"**: Show performance by class, time spent, vocabulary mastery rates

## Database Statistics

```sql
-- Total data volume
SELECT
  'profiles' as table_name, COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'listening_questions', COUNT(*) FROM listening_questions
UNION ALL
SELECT 'listening_attempts', COUNT(*) FROM listening_attempts
UNION ALL
SELECT 'vocabulary_words', COUNT(*) FROM vocabulary_words
UNION ALL
SELECT 'vocabulary_progress', COUNT(*) FROM vocabulary_progress
UNION ALL
SELECT 'writing_prompts', COUNT(*) FROM writing_prompts
UNION ALL
SELECT 'writing_submissions', COUNT(*) FROM writing_submissions
UNION ALL
SELECT 'class_assignments', COUNT(*) FROM class_assignments
UNION ALL
SELECT 'learning_progress', COUNT(*) FROM learning_progress
ORDER BY record_count DESC;
```

Expected Output:
- profiles: 55 (50 students + 5 teachers)
- class_assignments: 50
- listening_questions: 30
- listening_attempts: 150+
- vocabulary_words: 100
- vocabulary_progress: 50+
- writing_prompts: 20
- writing_submissions: 50+
- learning_progress: 100+
- classes: 3

## Customization for Your Demo

### Add More Students
Each SQL file is designed for easy expansion. To add more students:

```sql
-- Add 10 more students to beginner class
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
(uuid_generate_v4(), 'studentNEW001@eigomaster.demo', 'student', '新規学生1', NOW()),
-- ... repeat with unique emails and names
;

-- Then add class assignments
INSERT INTO class_assignments (id, class_id, student_id, ...) VALUES
-- ...
;
```

### Adjust Timeframes
Current data spans last 30 days (from 2026-03-19 backward). To use different dates:

1. Modify created_at/updated_at timestamps in SQL files
2. Update progress_date values in learning_progress
3. Adjust created_at timestamps in listening_attempts/submissions

### Focus on Specific Classes
Can filter demo view to show just one class:

```sql
-- Show only Advanced class performance
SELECT * FROM classes c
WHERE c.name = '発展クラス'
-- ... then show students, assignments, progress from this class
```

## Success Metrics

When demo is ready, you should be able to show:

- ✅ 50 active students with realistic profiles
- ✅ 3 classes with differentiated content and performance
- ✅ 30+ listening questions across difficulty levels
- ✅ 100+ vocabulary words with mastery tracking
- ✅ 50+ writing submissions with teacher feedback
- ✅ 150+ listening attempts with varied success rates
- ✅ 100+ daily progress records showing engagement
- ✅ Clear performance improvement patterns over time
- ✅ Class-level differentiation in difficulty and achievement
- ✅ Realistic teacher workload and grading metrics

## Troubleshooting

### Foreign Key Errors
If you get foreign key constraint errors:
1. Ensure data is loaded in the order specified above
2. Check that UUIDs in referenced tables match exactly
3. Verify no data was partially deleted

### UUID Conflicts
If you want to use existing teacher/student IDs:
1. Replace the UUIDs in the SQL files with your actual IDs
2. Ensure IDs exist in profiles table first
3. Test with a single record before bulk insert

### Performance Issues
If loading is slow:
1. Load each file separately and monitor database
2. Use `COPY` instead of INSERT for very large datasets
3. Consider disabling RLS temporarily during bulk import
4. Run `VACUUM ANALYZE` after data load

## Next Steps

After loading demo data:

1. **Test UI Integration**: Verify all components can fetch and display data
2. **Check RLS Policies**: Ensure students only see their own data
3. **Performance Testing**: Query response times with full dataset
4. **Export Screenshots**: Capture key dashboard states for pitch materials
5. **Create Demo Script**: Document click-through path for presentations

---

**Questions?** This data is designed to be realistic and modifiable. Adjust as needed for your specific demo context.
