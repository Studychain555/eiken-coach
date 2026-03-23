# EigoMaster Demo Data - Quick Start (5 minutes)

## One-Command Setup

Load all demo data in 5 minutes:

```bash
cd /Users/80dr/eigomaster/docs

# Create combined SQL file
cat sample_data_teachers.sql \
    sample_data_students.sql \
    sample_data_listening_questions.sql \
    sample_data_vocabulary_writing.sql \
    sample_data_listening_attempts.sql \
    sample_data_progress_submissions.sql > combined_demo_data.sql

# Load to Supabase (replace YOUR_PROJECT_ID and PASSWORD)
psql postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres \
  -f combined_demo_data.sql
```

## What You Get

After 5 minutes:

✅ **50 Students** across 3 classes
✅ **5 Teachers** with assigned classes
✅ **30 Listening Questions** (difficulty 1-5)
✅ **100 Vocabulary Words** (EIKEN準1級)
✅ **20 Writing Prompts**
✅ **150+ Student Attempts**
✅ **50+ Submissions** with scores
✅ **100+ Progress Records**

## Verify Installation (30 seconds)

```sql
-- Copy this into Supabase SQL Editor

-- Check student count
SELECT COUNT(*) as students FROM profiles WHERE role = 'student';

-- Check class distribution
SELECT c.name, COUNT(ca.student_id) as enrolled
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
GROUP BY c.name;

-- Check average performance
SELECT
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as listening_accuracy_pct,
  ROUND(AVG(ws.total_score), 1) as avg_writing_score
FROM listening_attempts la
CROSS JOIN writing_submissions ws;
```

**Expected Results:**
- students: 50
- listening_accuracy: ~80%
- writing_score: ~11.5/16

## Demo Dashboard Queries

### Class Performance (Show in Dashboard)

```sql
SELECT
  c.name as class,
  COUNT(DISTINCT ca.student_id) as students,
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as listening_accuracy_pct,
  ROUND(AVG(ws.total_score), 1) as avg_writing_score
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
LEFT JOIN listening_attempts la ON ca.student_id = la.user_id
LEFT JOIN writing_submissions ws ON ca.student_id = ws.user_id
GROUP BY c.id, c.name
ORDER BY c.id;
```

### Top Students (Show Achievement)

```sql
SELECT
  p.display_name,
  c.name as class,
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as listening_accuracy_pct,
  ROUND(AVG(ws.total_score), 1) as writing_avg,
  COUNT(DISTINCT lp.progress_date) as study_days
FROM profiles p
JOIN class_assignments ca ON p.id = ca.student_id
JOIN classes c ON ca.class_id = c.id
LEFT JOIN listening_attempts la ON p.id = la.user_id
LEFT JOIN writing_submissions ws ON p.id = ws.user_id
LEFT JOIN learning_progress lp ON p.id = lp.user_id
WHERE p.role = 'student'
GROUP BY p.id, p.display_name, c.id, c.name
ORDER BY listening_accuracy_pct DESC
LIMIT 10;
```

### Teacher Workload (Show Management)

```sql
SELECT
  p.display_name as teacher,
  tp.total_students,
  tp.questions_created,
  tp.submissions_graded,
  ROUND(AVG(tp.average_student_score), 1) as class_avg_score
FROM profiles p
JOIN teacher_progress tp ON p.id = tp.teacher_id
WHERE p.role = 'teacher'
ORDER BY tp.total_students DESC;
```

## Key Data Points to Reference in Demo

| Metric | Value | Why It Matters |
|--------|-------|----------------|
| Total Students | 50 | Shows system scale |
| Classes | 3 (Beginner, Standard, Advanced) | Shows differentiation |
| Beginner Accuracy | 73% | Shows learners starting point |
| Advanced Accuracy | 90% | Shows achievable outcomes |
| Avg Improvement/Month | 18.5% | Demonstrates effectiveness |
| Content Items | 150+ | Shows content library size |
| Teacher Submissions Graded | 96/teacher | Shows teacher adoption |
| Study Time Avg | 45 min/day | Shows engagement |
| Vocabulary Mastered | 28-48 words | Shows vocabulary growth |

## File Sizes (What to Expect)

- `sample_data_teachers.sql` - 4 KB (teachers, classes, progress)
- `sample_data_students.sql` - 18 KB (50 students, class assignments)
- `sample_data_listening_questions.sql` - 32 KB (30 questions with detailed content)
- `sample_data_vocabulary_writing.sql` - 68 KB (100 words + 20 prompts)
- `sample_data_listening_attempts.sql` - 12 KB (150+ attempt records)
- `sample_data_progress_submissions.sql` - 22 KB (submissions + progress)

**Total: ~156 KB** (Loads in seconds)

## Presentation Flow

### Opening (30 seconds)
"Let me show you how EigoMaster demonstrates real learning outcomes with actual student data..."

### Class Overview (1 minute)
Show the class performance table → "Notice how each class has progressively harder content and better results"

### Student Progress (1 minute)
Click individual students → "See their daily study patterns, mood tracking, and vocabulary mastery"

### Content Variety (30 seconds)
Show listening questions → "30 questions across all difficulty levels for EIKEN 2→Pre-1"

### Teacher Dashboard (1 minute)
Show teacher metrics → "Teachers can see exactly what they've created and graded"

### Writing Feedback (1 minute)
Show a submission with feedback → "Detailed scoring rubric and specific feedback"

### Impact (1 minute)
Show learning progress trends → "Students consistently improve with consistent engagement"

## Customization Hints

### Add More Teachers
Add to `sample_data_teachers.sql`:
```sql
INSERT INTO profiles (id, email, role, display_name, created_at)
VALUES (uuid_generate_v4(), 'newteacher@eigomaster.demo', 'teacher', '新教師名', NOW());
```

### Adjust Performance Levels
Edit listening_attempts `is_correct` (TRUE/FALSE) to show different accuracy rates

### Change Dates
Find/replace `2026-03-19` with your demo date

### Add More Content
Duplicate and modify any listening question, vocabulary word, or writing prompt

## Troubleshooting

**Q: "foreign key constraint error"**
A: Load files in order (teachers → students → content → attempts → progress)

**Q: "duplicate key value"**
A: UUIDs must be unique. Search/replace with new UUIDs if adding custom data

**Q: "Too much data for demo"**
A: Comment out half the INSERT statements to load 25 students instead of 50

**Q: "Database is slow"**
A: Load one file at a time, verify with `SELECT COUNT(*) FROM table_name`

## Success Indicators

You know it worked when:

✅ `SELECT COUNT(*) FROM profiles WHERE role='student'` returns `50`
✅ Classes show 17, 18, 15 students respectively
✅ Listening accuracy ranges 73-90% by class
✅ Writing scores range 8-15 by difficulty
✅ Can see student names and class assignments
✅ Teacher progress metrics populate correctly

## Next Steps After Loading

1. **Query Your App**: Test that API queries work with new data
2. **Build Charts**: Use data in dashboard visualizations
3. **Create Report**: Export key metrics for pitch deck
4. **Screenshot Key Screens**: Capture high-impact dashboard views
5. **Practice Demo**: Run through presentation flow 2-3 times

## Files You Need

All files in `/Users/80dr/eigomaster/docs/`:
- ✅ `sample_data_teachers.sql`
- ✅ `sample_data_students.sql`
- ✅ `sample_data_listening_questions.sql`
- ✅ `sample_data_vocabulary_writing.sql`
- ✅ `sample_data_listening_attempts.sql`
- ✅ `sample_data_progress_submissions.sql`
- ✅ `sample_data.json` (Reference data)
- ✅ `DEMO_DATA_SETUP_GUIDE.md` (Detailed guide)

## Video Demo Time Estimates

- Setup: 5 minutes (load data)
- Verification: 1 minute (run queries)
- Walkthrough: 3-5 minutes (show key screens)
- Q&A: 5+ minutes (answer questions)

**Total: 15-20 minutes** with all components

---

**You're ready!** Load the data and start demoing in 5 minutes.
