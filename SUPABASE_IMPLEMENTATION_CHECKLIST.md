# EigoMaster Supabase Implementation Checklist

**Complete step-by-step implementation guide for production deployment**

---

## Phase 1: Pre-Implementation (2-3 hours)

### 1.1 Verify Supabase Project
- [ ] Access Supabase Console: https://supabase.com/dashboard
- [ ] Confirm project ID: `ziqskxtpypyhbqfmbmhi`
- [ ] Verify project region (Asia)
- [ ] Confirm database is PostgreSQL 15+
- [ ] Check project status: Active

### 1.2 Secure Credentials
- [ ] Save ANON_KEY from `.env.local`
- [ ] Save SERVICE_ROLE_KEY securely
- [ ] Store credentials in password manager
- [ ] Document key creation date
- [ ] Set key rotation reminder (90 days)

### 1.3 Prepare Environment
- [ ] Install Node.js 18+: `node --version`
- [ ] Install PostgreSQL client tools: `brew install postgresql`
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Install AWS CLI (for S3 backups): `brew install awscli`
- [ ] Verify git repository cloned

### 1.4 Setup Working Directory
```bash
cd /Users/80dr/eigomaster
git status                    # Ensure clean state
mkdir -p backups              # Create backup directory
mkdir -p logs                 # Create logs directory
chmod 700 .env.local          # Secure environment file
```

---

## Phase 2: Database Migrations (30-45 minutes)

### 2.1 Run Migration 001 (Initial Schema)

**Using Supabase Console:**
- [ ] Open SQL Editor in Supabase Console
- [ ] Create new query
- [ ] Copy entire contents of `001_initial_schema.sql`
- [ ] Execute query (Ctrl+Enter or Run button)
- [ ] Verify execution: Check for "Success" message
- [ ] Confirm tables created: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';`

**Expected Tables After 001:**
- [ ] profiles
- [ ] classes
- [ ] listening_questions
- [ ] listening_attempts
- [ ] shadowing_records
- [ ] vocabulary_words
- [ ] vocabulary_progress
- [ ] writing_prompts
- [ ] writing_submissions

### 2.2 Verify Migration 001
```sql
-- Run this in SQL Editor to verify
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```
- [ ] All 9 tables listed
- [ ] No errors in execution

### 2.3 Run Migration 002 (Enhanced Schema)

**Using Supabase Console:**
- [ ] Create new query
- [ ] Copy entire contents of `002_enhanced_schema.sql`
- [ ] Execute query
- [ ] Wait for completion (may take 1-2 minutes)
- [ ] Verify execution message

**Expected New Tables After 002:**
- [ ] teacher_progress
- [ ] class_assignments
- [ ] learning_progress
- [ ] question_categories

**Enhanced Tables:**
- [ ] listening_questions (with new columns)
- [ ] vocabulary_words (with new columns)
- [ ] writing_prompts (with new columns)

### 2.4 Verify Migration 002
```sql
-- Check new tables
SELECT COUNT(*) FROM teacher_progress;       -- Should be 0
SELECT COUNT(*) FROM class_assignments;      -- Should be 0
SELECT COUNT(*) FROM learning_progress;      -- Should be 0
SELECT COUNT(*) FROM question_categories;    -- Should be 0

-- Check indexes created
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
-- Should list 20+ indexes
```
- [ ] All new tables exist
- [ ] Indexes created successfully
- [ ] No errors

### 2.5 Run Migration 003 (Sample Data)

**Using Supabase Console:**
- [ ] Create new query
- [ ] Copy entire contents of `003_sample_data.sql`
- [ ] Execute query
- [ ] Wait for completion (2-3 minutes)
- [ ] Verify execution

**Sample Data Inserted:**
- [ ] 8 question categories
- [ ] 5 teacher profiles
- [ ] 3 classes
- [ ] 50 student profiles (17 + 17 + 16)
- [ ] 50 class assignments
- [ ] 10 listening questions
- [ ] 10 vocabulary words (starter batch)
- [ ] 5 writing prompts
- [ ] 5 teacher progress records

### 2.6 Verify Migration 003
```sql
-- Check data counts
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'listening_questions', COUNT(*) FROM listening_questions
UNION ALL SELECT 'writing_prompts', COUNT(*) FROM writing_prompts
UNION ALL SELECT 'vocabulary_words', COUNT(*) FROM vocabulary_words
UNION ALL SELECT 'teacher_progress', COUNT(*) FROM teacher_progress
UNION ALL SELECT 'class_assignments', COUNT(*) FROM class_assignments
ORDER BY table_name;
```
- [ ] profiles: 55 (5 teachers + 50 students)
- [ ] classes: 3
- [ ] listening_questions: 10
- [ ] writing_prompts: 5
- [ ] vocabulary_words: 10+
- [ ] teacher_progress: 5
- [ ] class_assignments: 50

---

## Phase 3: RLS Configuration (15-20 minutes)

### 3.1 Verify RLS Enabled
```sql
-- Check RLS status
SELECT tablename, (
  SELECT COUNT(*) FROM pg_policies
  WHERE pg_policies.tablename = pg_tables.tablename
) as policy_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
- [ ] All 14 tables have RLS enabled (policy_count > 0)

### 3.2 Verify Specific Policies
```sql
-- Check policies exist
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
- [ ] profiles: "Users can read own profile"
- [ ] classes: Multiple teacher/student policies
- [ ] listening_questions: "All authenticated users can read questions"
- [ ] listening_attempts: User and teacher policies
- [ ] Other tables: Appropriate policies

### 3.3 Test RLS with Sample User
- [ ] Create test student user in Auth
- [ ] Login with test credentials
- [ ] Query `SELECT * FROM profiles WHERE id = auth.uid();`
- [ ] Should return ONLY their own profile
- [ ] Try querying other user profiles
- [ ] Should return error or empty result

---

## Phase 4: API Key Configuration (10 minutes)

### 4.1 Locate Keys in Supabase Console
**Settings → API:**
- [ ] Copy ANON_KEY
- [ ] Copy SERVICE_ROLE_KEY
- [ ] Note PROJECT_REF: ziqskxtpypyhbqfmbmhi
- [ ] Note PROJECT_URL: https://ziqskxtpypyhbqfmbmhi.supabase.co

### 4.2 Update Application Configuration
- [ ] Update `.env.local`:
  ```bash
  EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=[COPY_ANON_KEY]
  SUPABASE_SERVICE_ROLE_SECRET=[COPY_SERVICE_ROLE_KEY]
  ```
- [ ] Save file
- [ ] Set file permissions: `chmod 600 .env.local`

### 4.3 Verify Configuration
```bash
cd /Users/80dr/eigomaster
# Check env variables are loaded
node -e "console.log(process.env.EXPO_PUBLIC_SUPABASE_URL)"
```
- [ ] URL is correct
- [ ] Keys are present

---

## Phase 5: Connection Testing (15 minutes)

### 5.1 Test Supabase Connection
```bash
# Create test script
cat > test_connection.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  try {
    const { data, error } = await supabase.from('profiles').select().limit(1);
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('✓ Connection successful');
      console.log(`✓ Found ${data?.length || 0} profiles`);
    }
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
  }
}

test();
EOF

# Run test
node test_connection.js
```
- [ ] "Connection successful" message
- [ ] Data returned without errors

### 5.2 Test Authentication (Manual)
- [ ] Sign up new test user in app
- [ ] Verify user appears in Supabase Auth
- [ ] Verify profile created in `profiles` table
- [ ] Login with new user
- [ ] Verify token is valid

### 5.3 Test RLS in Application
- [ ] Login as student user
- [ ] Query own profile: Should succeed
- [ ] Try to query other user's profile: Should fail or return empty
- [ ] Login as teacher user
- [ ] View class student list: Should succeed
- [ ] View class they don't teach: Should return empty

---

## Phase 6: Data Validation (20 minutes)

### 6.1 Verify Data Integrity
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

SELECT 'orphaned_class_assignments', COUNT(*)
FROM class_assignments
WHERE student_id NOT IN (SELECT id FROM profiles)
  OR class_id NOT IN (SELECT id FROM classes)

UNION ALL

SELECT 'orphaned_vocabulary_progress', COUNT(*)
FROM vocabulary_progress
WHERE user_id NOT IN (SELECT id FROM profiles)
  OR word_id NOT IN (SELECT id FROM vocabulary_words);
```
- [ ] All counts are 0 (no orphaned records)

### 6.2 Verify Constraints
```sql
-- Test foreign key constraint
INSERT INTO listening_attempts (
  user_id, question_id, selected_answer, is_correct
) VALUES (
  'invalid-uuid', 'invalid-uuid', 0, FALSE
);
-- Should fail with constraint error
```
- [ ] Foreign key constraint enforcement working

### 6.3 Sample Query Tests
```sql
-- Test complex query
SELECT
  c.name as class_name,
  COUNT(ca.student_id) as student_count,
  COUNT(DISTINCT lp.progress_date) as active_days
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
LEFT JOIN learning_progress lp ON ca.student_id = lp.user_id
GROUP BY c.id, c.name;
```
- [ ] Query executes without errors
- [ ] Results look reasonable

---

## Phase 7: Backup Configuration (20 minutes)

### 7.1 Enable Supabase Automatic Backups
**Supabase Console → Settings → Backups:**
- [ ] Toggle "Automated backups" ON
- [ ] Confirm backup frequency: Daily
- [ ] Set retention: 30 days minimum
- [ ] Note backup start time (recommend UTC 02:00)

### 7.2 Configure Manual Backup Script
```bash
# Create backup directory structure
mkdir -p /Users/80dr/eigomaster/backups
mkdir -p /Users/80dr/eigomaster/logs

# Create backup script
cp scripts/backup.sh /usr/local/bin/eigomaster-backup.sh
chmod +x /usr/local/bin/eigomaster-backup.sh

# Test backup script manually
/usr/local/bin/eigomaster-backup.sh
```
- [ ] Backup script runs without errors
- [ ] Backup file created in `/backups` directory
- [ ] Backup file has reasonable size (> 1 MB)

### 7.3 Schedule Automated Backups (macOS)
```bash
# Create LaunchAgent plist
launchctl load ~/Library/LaunchAgents/com.eigomaster.backup.plist

# Verify it loaded
launchctl list | grep eigomaster.backup

# Check logs
tail -20 /Users/80dr/eigomaster/backup.log
```
- [ ] LaunchAgent loaded successfully
- [ ] Scheduled to run daily at 2 AM

### 7.4 Setup S3 Backup Storage (Optional)
```bash
# Create S3 bucket
aws s3 mb s3://eigomaster-backups --region ap-northeast-1

# Test upload
aws s3 cp /Users/80dr/eigomaster/backups/eigomaster_*.dump s3://eigomaster-backups/
```
- [ ] S3 bucket created
- [ ] First backup uploaded successfully

---

## Phase 8: Performance Tuning (15 minutes)

### 8.1 Verify Indexes
```sql
-- List all indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;

-- Should have 20+ indexes for optimal performance
```
- [ ] 20+ indexes listed
- [ ] Indexes on frequently queried columns

### 8.2 Enable Connection Pooling
**Supabase Console → Settings → Database:**
- [ ] Enable "Connection Pooler"
- [ ] Pool size: 15-25
- [ ] Min idle: 5
- [ ] Check "Use Connection Pooler for all connections"

### 8.3 Monitor Query Performance
```sql
-- Check for slow queries
SELECT
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```
- [ ] No queries with mean_time > 1000ms
- [ ] Most queries < 100ms average

---

## Phase 9: Documentation & Knowledge Transfer (30 minutes)

### 9.1 Documentation Created
- [ ] SUPABASE_SETUP_GUIDE.md (Complete setup guide)
- [ ] SUPABASE_SQL_REFERENCE.md (SQL query templates)
- [ ] SUPABASE_BACKUP_AND_RECOVERY.md (Backup procedures)
- [ ] This checklist document

### 9.2 Team Training
- [ ] Demo database access to team
- [ ] Show how to run queries in SQL Editor
- [ ] Explain RLS policies and access control
- [ ] Walkthrough backup and recovery procedures
- [ ] Explain API key management

### 9.3 Documentation Handoff
- [ ] Upload documents to team wiki/Confluence
- [ ] Share backup procedures with ops team
- [ ] Set calendar reminders for key rotation
- [ ] Schedule monthly recovery tests

---

## Phase 10: Production Deployment (30 minutes)

### 10.1 Pre-Deployment Checklist
- [ ] All migrations completed successfully
- [ ] Data integrity verified
- [ ] RLS policies tested
- [ ] Connection pooling enabled
- [ ] Backups configured and tested
- [ ] Performance baseline established
- [ ] Team trained on procedures

### 10.2 Deploy Application
```bash
# Build application
cd /Users/80dr/eigomaster
npm run build

# Test build
npm run start

# Deploy (depends on hosting platform)
# For Vercel: vercel deploy
# For Docker: docker build -t eigomaster . && docker run ...
```
- [ ] Application builds without errors
- [ ] Local test successful
- [ ] Deploy to staging environment
- [ ] Smoke tests pass in staging
- [ ] Deploy to production

### 10.3 Post-Deployment Verification
- [ ] All services operational
- [ ] Users can login
- [ ] Data queries working
- [ ] No errors in application logs
- [ ] Backup job completed successfully

### 10.4 Announce to Users
- [ ] Send announcement about new Supabase backend
- [ ] Provide any new features/improvements
- [ ] Link to help documentation
- [ ] Set up support channel for issues

---

## Phase 11: Ongoing Monitoring (Continuous)

### 11.1 Daily Tasks
- [ ] Check backup logs: `tail -10 /Users/80dr/eigomaster/backup.log`
- [ ] Monitor application error logs
- [ ] Check Supabase project status
- [ ] Verify database connection health

### 11.2 Weekly Tasks
- [ ] Review slow query logs
- [ ] Check disk space usage
- [ ] Verify backup restoration capability
- [ ] Review user access patterns

### 11.3 Monthly Tasks
- [ ] Test backup recovery procedure
- [ ] Review and optimize slow queries
- [ ] Check for data growth trends
- [ ] Plan for capacity expansion if needed

### 11.4 Quarterly Tasks
- [ ] Rotate API keys
- [ ] Security audit of RLS policies
- [ ] Update documentation
- [ ] Team review of procedures

---

## Troubleshooting

### Issue: "Column does not exist" errors
**Solution**: Ensure all migrations ran in order (001 → 002 → 003)
```bash
# Verify tables have all columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'listening_questions'
ORDER BY column_name;
```

### Issue: RLS blocking legitimate access
**Solution**: Review RLS policies and user's role
```sql
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

### Issue: Backup failed to create
**Solution**: Check disk space and database permissions
```bash
df -h /Users/80dr/eigomaster/backups
psql -c "SELECT pg_database_size('postgres');"
```

### Issue: Slow queries
**Solution**: Analyze query plan and add indexes
```sql
EXPLAIN ANALYZE SELECT * FROM listening_attempts WHERE user_id = 'id';
CREATE INDEX IF NOT EXISTS idx_listening_attempts_user_id ON listening_attempts(user_id);
```

---

## Final Checklist Before Going Live

- [ ] All 3 migrations executed successfully
- [ ] 55+ test profiles created
- [ ] RLS policies verified working
- [ ] API keys securely configured
- [ ] Backups running and tested
- [ ] Connection pooling enabled
- [ ] Performance indexes applied
- [ ] Documentation completed
- [ ] Team trained
- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring and alerts configured
- [ ] Incident response plan ready

---

## Success Criteria

✅ **All criteria met when:**
1. Application connects to Supabase without errors
2. Users can complete full signup/login flow
3. Teachers can create classes and manage students
4. Students can view questions and submit answers
5. Learning progress is accurately tracked
6. RLS prevents unauthorized data access
7. Backups complete daily without errors
8. Database performs well under load (< 500ms queries)
9. All team members trained on procedures
10. Monitoring alerts configured and tested

---

**Implementation Status**: Ready to deploy
**Estimated Duration**: 4-6 hours total
**Next Step**: Execute Phase 1 pre-implementation checks

---

For questions or issues during implementation, refer to:
- SUPABASE_SETUP_GUIDE.md (detailed setup)
- SUPABASE_SQL_REFERENCE.md (SQL examples)
- SUPABASE_BACKUP_AND_RECOVERY.md (backup procedures)
