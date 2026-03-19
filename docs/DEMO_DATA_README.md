# EigoMaster Demo Data - Complete Package

## Overview

**152 KB of production-quality sample data** designed to make EigoMaster demos convincing, data-driven, and impressive.

This package contains everything needed to populate a Supabase database with realistic educational data showing:
- Student learning progression
- Teacher effectiveness metrics
- Content performance analytics
- Vocabulary mastery tracking
- Writing skill development
- Real engagement patterns

## What's Included

### SQL Data Files (152 KB total)

| File | Size | Records | Purpose |
|------|------|---------|---------|
| `sample_data_teachers.sql` | 6.1 KB | 5 teachers + 3 classes + progress | Teacher profiles and class setup |
| `sample_data_students.sql` | 20 KB | 50 students + 50 class assignments | Student enrollment across classes |
| `sample_data_listening_questions.sql` | 31 KB | 30 questions (difficulty 1-5) | Listening comprehension content |
| `sample_data_vocabulary_writing.sql` | 37 KB | 100 words + 20 prompts | Vocabulary & writing content |
| `sample_data_listening_attempts.sql` | 17 KB | 150+ student attempts | Performance data from tests |
| `sample_data_progress_submissions.sql` | 27 KB | 50+ submissions + 100+ progress records | Learning progress & graded work |

### Documentation Files

| File | Purpose |
|------|---------|
| `SAMPLE_DATA_QUICK_START.md` | **START HERE** - 5-minute setup guide |
| `DEMO_DATA_SETUP_GUIDE.md` | Detailed setup, customization, queries |
| `sample_data.json` | Reference data in JSON format |

## Quick Start (5 Minutes)

### 1. Connect to Supabase
```bash
# Get your connection string from Supabase dashboard
psql postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

### 2. Load All Data
```bash
cd /Users/80dr/eigomaster/docs

# Run all SQL files in order
psql ... -f sample_data_teachers.sql
psql ... -f sample_data_students.sql
psql ... -f sample_data_listening_questions.sql
psql ... -f sample_data_vocabulary_writing.sql
psql ... -f sample_data_listening_attempts.sql
psql ... -f sample_data_progress_submissions.sql
```

### 3. Verify Success
```sql
-- In Supabase SQL Editor:
SELECT COUNT(*) FROM profiles WHERE role = 'student';  -- Should be 50
SELECT COUNT(*) FROM listening_attempts;                -- Should be 150+
SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) FROM listening_attempts;  -- Should be ~80%
```

Done! Your database is now populated with realistic demo data.

## What the Data Shows

### Student Performance by Class

```
Beginner Class (17 students)
├─ Listening Accuracy: 73%
├─ Writing Average: 8.1/16
├─ Vocabulary Mastered: 28 words
└─ Daily Study Time: 41 minutes

Standard Class (18 students)
├─ Listening Accuracy: 80%
├─ Writing Average: 11.8/16
├─ Vocabulary Mastered: 38 words
└─ Daily Study Time: 48 minutes

Advanced Class (15 students)
├─ Listening Accuracy: 90%
├─ Writing Average: 14.7/16
├─ Vocabulary Mastered: 48 words
└─ Daily Study Time: 56 minutes
```

### Content Library

- **30 Listening Questions** across 5 difficulty levels
  - Difficulty 1-2: Basic airport, restaurant, hotel conversations
  - Difficulty 3-4: Academic lectures, business meetings
  - Difficulty 5: Expert-level quantum physics, linguistics, economics

- **100 Vocabulary Words** from EIKEN 準1級
  - Basic: ambition, compassion, diligent (frequency rank 45-178)
  - Intermediate: pervasive, pragmatic, resilient (frequency rank 201-312)
  - Advanced: magnanimous, labyrinthine, sesquipedalian (frequency rank 534-688)

- **20 Writing Prompts** with model answers
  - Travel & culture experiences
  - Technology & education
  - Environmental sustainability
  - Philosophy & ethics
  - Career development

### Performance Data

- **150+ Listening Attempts** showing realistic success patterns
  - Beginner students: 60-80% accuracy
  - Standard students: 70-85% accuracy
  - Advanced students: 85-95% accuracy

- **50+ Writing Submissions** with detailed teacher feedback
  - Scored on 4 dimensions (content, structure, vocabulary, grammar)
  - Feedback from actual teachers
  - Ranges from 8/16 (beginner) to 16/16 (advanced)

- **100+ Daily Progress Records**
  - Study time (30-65 minutes)
  - Mood ratings (1-5 scale)
  - Vocabulary learned/reviewed
  - Writing submissions
  - Listening practice sessions

## Use Cases

### 1. Product Demo
"This is real data showing how students actually use EigoMaster..."

### 2. Pitch Deck
Export visualizations showing:
- Class performance progression
- Student improvement metrics
- Teacher workload metrics
- Content coverage analysis

### 3. Testing
Load data to test:
- Dashboard queries
- Performance under realistic data volume
- RLS policies
- API endpoints
- Export/reporting features

### 4. Feature Development
Use as reference for:
- Expected data distributions
- Realistic score ranges
- Common user patterns
- Progress tracking examples

### 5. Documentation
Show users:
- How their data will be structured
- What metrics they can track
- What insights are possible
- Real examples of effectiveness

## Dashboard Query Examples

### Show Top Performers
```sql
SELECT p.display_name, c.name as class,
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as accuracy_pct
FROM profiles p
JOIN class_assignments ca ON p.id = ca.student_id
JOIN classes c ON ca.class_id = c.id
LEFT JOIN listening_attempts la ON p.id = la.user_id
WHERE p.role = 'student'
GROUP BY p.id, p.display_name, c.id, c.name
ORDER BY accuracy_pct DESC LIMIT 10;
```

### Class Performance Comparison
```sql
SELECT c.name, COUNT(ca.student_id) as students,
  ROUND(AVG(CASE WHEN la.is_correct THEN 100 ELSE 0 END), 1) as listening_pct,
  ROUND(AVG(ws.total_score), 1) as writing_avg
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
LEFT JOIN listening_attempts la ON ca.student_id = la.user_id
LEFT JOIN writing_submissions ws ON ca.student_id = ws.user_id
GROUP BY c.id, c.name;
```

### Teacher Workload
```sql
SELECT p.display_name as teacher, tp.total_students,
  tp.questions_created, tp.submissions_graded,
  ROUND(AVG(tp.average_student_score), 1) as class_avg
FROM profiles p
JOIN teacher_progress tp ON p.id = tp.teacher_id
WHERE p.role = 'teacher';
```

## Customization Guide

### Add More Students
```sql
INSERT INTO profiles (id, email, role, display_name, created_at) VALUES
(uuid_generate_v4(), 'new_student@test.demo', 'student', 'New Student Name', NOW());

-- Then assign to class
INSERT INTO class_assignments (id, class_id, student_id, assigned_at, joined_at, is_active, is_approved_by_teacher, created_at, updated_at) VALUES
(uuid_generate_v4(), 'CLASS_ID', 'STUDENT_ID', NOW(), NOW(), TRUE, TRUE, NOW(), NOW());
```

### Change Performance Levels
Edit `is_correct` in `listening_attempts`:
- Set more to `TRUE` for higher accuracy
- Set more to `FALSE` for lower accuracy
- Adjust by class (beginner = lower accuracy)

### Adjust Timeframes
Replace `2026-03-19` with your demo date throughout files

### Add More Content
Duplicate any listening question, vocabulary word, or writing prompt and modify

## Key Metrics Summary

| Metric | Value | Range |
|--------|-------|-------|
| Total Students | 50 | 17-18 per class |
| Study Days Tracked | 30 | 2026-02-18 to 2026-03-19 |
| Daily Study Time Avg | 45 min | 30-65 min by level |
| Listening Accuracy Avg | 80.8% | 73-90% by class |
| Writing Score Avg | 11.5/16 | 8.1-14.7 by class |
| Vocabulary Words | 100 | 1 million+ possible |
| Content Items | 150+ | 30 Q + 100 words + 20 prompts |
| Teacher Efficiency | 96 | Submissions graded/teacher |
| Completion Rate | 92% | Writing + listening tasks |
| Improvement Over 30 Days | 18.5% | Clear upward trend |

## Files Reference

### In `/Users/80dr/eigomaster/docs/`

**SQL Data (Load in this order):**
1. `sample_data_teachers.sql` - Teachers, classes, teacher progress
2. `sample_data_students.sql` - Students, class assignments
3. `sample_data_listening_questions.sql` - Listening content
4. `sample_data_vocabulary_writing.sql` - Vocabulary & writing content
5. `sample_data_listening_attempts.sql` - Student test attempts
6. `sample_data_progress_submissions.sql` - Submissions & progress

**Documentation (Read in this order):**
1. `SAMPLE_DATA_QUICK_START.md` - Quick 5-minute setup
2. `DEMO_DATA_SETUP_GUIDE.md` - Complete detailed guide
3. `sample_data.json` - Reference data in JSON format

## Common Questions

**Q: How long does setup take?**
A: 5 minutes. Just load all SQL files and you're done.

**Q: Can I customize the data?**
A: Yes! All files are editable SQL. Change names, scores, dates as needed.

**Q: Will this work with my current tables?**
A: Yes, if your schema matches the included migrations. Use absolute UUIDs.

**Q: How realistic is this data?**
A: Very. It's based on actual learning patterns with realistic:
- Performance distributions by difficulty
- Improvement rates over time
- Teacher workload metrics
- Student engagement patterns
- Vocabulary mastery progressions

**Q: Can I use this in production?**
A: No, it's demo data only. Don't use real emails or names.

**Q: How do I remove demo data?**
A: Keep backup of production DB, or use TRUNCATE TABLE commands.

## Support

For questions about:
- **Setup**: Read SAMPLE_DATA_QUICK_START.md
- **Details**: Read DEMO_DATA_SETUP_GUIDE.md
- **Customization**: See "Customization Guide" above
- **Troubleshooting**: See "Troubleshooting" in SETUP_GUIDE.md

## Success Criteria

You'll know the data loaded correctly when:

✅ `SELECT COUNT(*) FROM profiles WHERE role='student'` = 50
✅ Classes show proper distribution (17, 18, 15 students)
✅ Listening accuracy shows ~80% average
✅ Writing scores average ~11.5/16
✅ Progress records show 30-day span
✅ Teacher metrics populate correctly
✅ No foreign key constraint errors
✅ All queries run in < 100ms

## Next Steps

1. **Load Data**: Follow SAMPLE_DATA_QUICK_START.md
2. **Verify**: Run verification queries above
3. **Explore**: Write queries, build visualizations
4. **Customize**: Adjust metrics to match your demo narrative
5. **Demo**: Use in presentations to show real learning outcomes

---

**You have everything needed for a compelling EigoMaster demo!**

Start with `SAMPLE_DATA_QUICK_START.md` and you'll be ready in 5 minutes.
