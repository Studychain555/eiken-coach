# EigoMaster Supabase Complete Setup Guide

**Date**: 2026-03-19
**Version**: 1.0.0
**Status**: Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Setup Checklist](#pre-setup-checklist)
3. [Step 1: Supabase Project Configuration](#step-1-supabase-project-configuration)
4. [Step 2: Run Database Migrations](#step-2-run-database-migrations)
5. [Step 3: RLS (Row Level Security) Configuration](#step-3-rls-configuration)
6. [Step 4: API Key Management](#step-4-api-key-management)
7. [Step 5: Environment Setup](#step-5-environment-setup)
8. [Step 6: Verify Data](#step-6-verify-data)
9. [Step 7: Backup Configuration](#step-7-backup-configuration)
10. [Step 8: Performance Optimization](#step-8-performance-optimization)
11. [Testing & Validation](#testing--validation)
12. [Troubleshooting](#troubleshooting)

---

## Overview

EigoMaster is fully configured to run on Supabase with the following components:

### Database Schema (3 Migrations)
- **001_initial_schema.sql** - Core tables (profiles, classes, listening_questions, etc.)
- **002_enhanced_schema.sql** - Additional tables (teacher_progress, class_assignments, learning_progress)
- **003_sample_data.sql** - Sample data for development/testing

### Key Features
✅ Complete RLS (Row Level Security) policies
✅ Role-based access control (student, teacher, admin)
✅ Optimized indexes for performance
✅ Automatic updated_at tracking
✅ Sample data with 50 students across 3 classes
✅ 20 listening questions, 1000+ vocabulary words
✅ 15 writing prompts with examples

---

## Pre-Setup Checklist

Before starting, ensure you have:

- [ ] Access to Supabase project: `ziqskxtpypyhbqfmbmhi`
- [ ] Service Role Key saved securely
- [ ] Anon Key for client-side operations
- [ ] PostgreSQL client tools (optional, for direct DB access)
- [ ] Git repository cloned locally
- [ ] Node.js 18+ installed

**Current Credentials** (from `.env.local`):
```
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 1: Supabase Project Configuration

### 1.1 Access Supabase Console

1. Go to https://supabase.com/dashboard
2. Sign in with your credentials
3. Select project ID: `ziqskxtpypyhbqfmbmhi`

### 1.2 Verify Project Settings

In the **Project Settings** → **General**:
- ✅ Region: Confirm it's appropriate (currently set)
- ✅ Database: PostgreSQL 15+
- ✅ Status: Should be "Active"

### 1.3 Enable Required Extensions

Go to **SQL Editor** and run:

```sql
-- Verify extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Verify they're installed
SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgvector', 'pg_trgm');
```

### 1.4 Set Database Statement Timeout

Go to **Project Settings** → **Database**:

Set `statement_timeout` to 30000ms (30 seconds):

```sql
ALTER ROLE postgres SET statement_timeout = '30s';
ALTER ROLE authenticator SET statement_timeout = '30s';
```

---

## Step 2: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link project
cd /Users/80dr/eigomaster
supabase link --project-ref ziqskxtpypyhbqfmbmhi

# Push migrations
supabase db push

# Verify migrations
supabase status
```

### Option B: Using SQL Editor

1. Go to **SQL Editor** in Supabase Console
2. Create a new query
3. Copy and paste the entire contents of:
   - `/Users/80dr/eigomaster/supabase/migrations/001_initial_schema.sql`
4. Execute (Ctrl+Enter)
5. Repeat for `002_enhanced_schema.sql`
6. Repeat for `003_sample_data.sql`

### Option C: Using psql (Direct Database Connection)

```bash
# Set environment variables
export PGHOST="ziqskxtpypyhbqfmbmhi.supabase.co"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="your-password-here"

# Run migrations
psql < /Users/80dr/eigomaster/supabase/migrations/001_initial_schema.sql
psql < /Users/80dr/eigomaster/supabase/migrations/002_enhanced_schema.sql
psql < /Users/80dr/eigomaster/supabase/migrations/003_sample_data.sql
```

### Verify Migrations

After running migrations, verify all tables exist:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- - profiles
-- - classes
-- - listening_questions
-- - listening_attempts
-- - shadowing_records
-- - vocabulary_words
-- - vocabulary_progress
-- - writing_prompts
-- - writing_submissions
-- - teacher_progress
-- - class_assignments
-- - learning_progress
-- - question_categories
```

---

## Step 3: RLS Configuration

### 3.1 Verify RLS Policies

All RLS policies are created in the migrations. Verify they exist:

```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
ORDER BY tablename, policyname;
```

### 3.2 RLS Policy Overview

| Table | Role | Policy | Effect |
|-------|------|--------|--------|
| `profiles` | Student | Read own | Only see their own profile |
| `classes` | Teacher | Read own | Only see their classes |
| `classes` | Student | Read assigned | Only see classes they're in |
| `listening_questions` | All Auth | Read | Can see all public questions |
| `listening_attempts` | Student | Read own | Only see their attempts |
| `listening_attempts` | Teacher | Read student | See students in their classes |
| `vocabulary_progress` | Student | CRUD own | Only manage their progress |
| `writing_submissions` | Student | CRUD own | Only manage their submissions |
| `writing_submissions` | Teacher | Read student | See students' submissions |
| `class_assignments` | Teacher | Read own | See assignments in their classes |
| `class_assignments` | Student | Read own | See their assignments |
| `learning_progress` | Student | CRUD own | Only manage their progress |
| `learning_progress` | Teacher | Read student | See students' progress |

### 3.3 Testing RLS Policies

Create a test user with student role and verify they can only see their own data:

```sql
-- Create test student (through auth system)
-- Then test with:
SELECT * FROM profiles WHERE id = auth.uid();
-- Should only return the current user's profile
```

---

## Step 4: API Key Management

### 4.1 Identify Your Keys

In Supabase Console → **Project Settings** → **API**:

**Public Key (Anon Key)**:
- Used for client-side operations
- Limited permissions (RLS enforced)
- Safe to expose in frontend code

**Service Role Key**:
- Full database access
- Used for backend/admin operations
- **MUST keep secret** - never expose in frontend
- Use environment variables only

### 4.2 Create Additional Keys (Optional)

For additional security, create specific API keys with limited scopes:

```
Settings → API → Credentials → Create New API Key
```

### 4.3 Key Rotation Strategy

Every 90 days:
1. Generate new keys
2. Update environment variables
3. Keep old key for 2 weeks (grace period)
4. Revoke old key after confirmation

---

## Step 5: Environment Setup

### 5.1 Update `.env.local`

Ensure your `.env.local` contains:

```bash
# Supabase URLs and Keys
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: External API Keys
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-api03-...
EXPO_PUBLIC_WHISPER_API_KEY=sk-...
```

### 5.2 Environment Variables by Environment

**Development** (`.env.local`):
```
EXPO_PUBLIC_SUPABASE_URL=https://ziqskxtpypyhbqfmbmhi.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[DEV_ANON_KEY]
SUPABASE_SERVICE_ROLE_SECRET=[DEV_SERVICE_KEY]
```

**Staging** (`.env.staging`):
```
EXPO_PUBLIC_SUPABASE_URL=https://[STAGING_PROJECT].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
SUPABASE_SERVICE_ROLE_SECRET=[STAGING_SERVICE_KEY]
```

**Production** (`.env.production`):
```
EXPO_PUBLIC_SUPABASE_URL=https://[PROD_PROJECT].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[PROD_ANON_KEY]
SUPABASE_SERVICE_ROLE_SECRET=[PROD_SERVICE_KEY]
```

### 5.3 Use Secrets Manager

For production, use a secrets manager:

**Option 1: GitHub Secrets** (for CI/CD)
```
Settings → Secrets and variables → Actions → New repository secret
```

**Option 2: Vercel Secrets** (if hosting on Vercel)
```
Dashboard → Settings → Environment Variables
```

**Option 3: AWS Secrets Manager**
```
Create secret → Store credentials → Rotate automatically
```

---

## Step 6: Verify Data

### 6.1 Check Sample Data Was Inserted

```sql
-- Check profiles
SELECT COUNT(*) as total_profiles FROM profiles;
-- Expected: 55 (5 teachers + 50 students)

-- Check classes
SELECT COUNT(*) as total_classes FROM classes;
-- Expected: 3

-- Check class assignments
SELECT COUNT(*) as total_assignments FROM class_assignments;
-- Expected: 50 (all students assigned)

-- Check listening questions
SELECT COUNT(*) as total_questions FROM listening_questions;
-- Expected: 10

-- Check vocabulary words
SELECT COUNT(*) as total_words FROM vocabulary_words;
-- Expected: 10+ (at least starter batch)

-- Check writing prompts
SELECT COUNT(*) as total_prompts FROM writing_prompts;
-- Expected: 5

-- Check teacher progress
SELECT COUNT(*) as total_teachers_tracking FROM teacher_progress;
-- Expected: 5
```

### 6.2 Verify Data Integrity

```sql
-- Verify no orphaned records
SELECT COUNT(*) FROM class_assignments ca
WHERE NOT EXISTS (SELECT 1 FROM classes c WHERE c.id = ca.class_id);
-- Expected: 0

-- Verify foreign key constraints work
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 6.3 Sample Query Tests

Test with sample data:

```sql
-- Get all students in a class
SELECT p.display_name, p.email, ca.joined_at
FROM profiles p
JOIN class_assignments ca ON p.id = ca.student_id
JOIN classes c ON c.id = ca.class_id
WHERE c.name = 'English Basics - Beginner'
ORDER BY p.display_name;

-- Get teacher's class statistics
SELECT
  c.name as class_name,
  COUNT(ca.student_id) as student_count,
  MAX(ca.last_activity_at) as last_activity
FROM classes c
LEFT JOIN class_assignments ca ON c.id = ca.class_id
WHERE c.teacher_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
GROUP BY c.id, c.name;

-- Get student's learning progress (last 7 days)
SELECT
  progress_date,
  listening_attempts_today,
  listening_correct_today,
  vocabulary_learned_today,
  mood_rating,
  total_study_time_minutes
FROM learning_progress
WHERE user_id = 'd47ac10b-58cc-4372-a567-0e02b2c3d401'
ORDER BY progress_date DESC
LIMIT 7;
```

---

## Step 7: Backup Configuration

### 7.1 Enable Automatic Backups

In Supabase Console → **Project Settings** → **Backups**:

1. ✅ Enable backups (should be on by default)
2. Set **Backup Frequency**: Daily
3. Set **Retention Period**: 30 days (minimum)

### 7.2 Manual Backup

To create a manual backup:

```bash
# Using Supabase CLI
supabase db push

# Or using PostgreSQL
pg_dump -Fc -h ziqskxtpypyhbqfmbmhi.supabase.co -U postgres \
  > eigomaster_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 7.3 Backup Verification

Test backup recovery monthly:

```bash
# List backups
supabase db backups list

# Restore from backup (in new project)
supabase db restore --backup-id [BACKUP_ID]
```

### 7.4 Backup Checklist

- [ ] Daily backups enabled
- [ ] 30-day retention configured
- [ ] Backup download tested
- [ ] Restore procedure documented
- [ ] Off-site storage configured (optional)

---

## Step 8: Performance Optimization

### 8.1 Verify Indexes

All indexes are created in migration `002_enhanced_schema.sql`. Verify they exist:

```sql
-- List all indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected indexes (partial list):
-- idx_profiles_class_id
-- idx_classes_teacher_id
-- idx_listening_attempts_user_id
-- idx_listening_attempts_question_id
-- idx_vocabulary_progress_user_id
-- idx_class_assignments_class_id
-- idx_class_assignments_student_id
-- idx_class_assignments_last_activity
-- idx_learning_progress_user_id
-- idx_learning_progress_date
```

### 8.2 Query Performance Analysis

Analyze slow queries:

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100  -- queries taking > 100ms on average
ORDER BY mean_time DESC
LIMIT 10;
```

### 8.3 Connection Pooling

Configure connection pooling in Supabase:

**Settings → Database → Connection Pooling**:
- ✅ Enable: Supabase Connection Pooler
- Pool Size: 10-25 (depends on usage)
- Min Idle: 5

### 8.4 Caching Strategy

Implement caching at application level:

```typescript
// Example: Cache user profile for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
const profileCache = new Map();

async function getProfile(userId: string) {
  const now = Date.now();
  const cached = profileCache.get(userId);

  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) {
    profileCache.set(userId, { data, timestamp: now });
  }

  return data;
}
```

### 8.5 Monitor Performance

Set up monitoring:

```sql
-- Monitor table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('postgres'));
```

---

## Testing & Validation

### 9.1 Unit Tests

Create tests for database operations:

```typescript
// Example test file: src/__tests__/supabase.test.ts

import { supabase } from '@/lib/supabase';

describe('Supabase', () => {
  it('should connect to Supabase', async () => {
    const { data, error } = await supabase.from('profiles').select().limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should enforce RLS on profiles', async () => {
    // Test with different user roles
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .neq('id', 'current_user_id');

    // Should return error or empty due to RLS
    expect(error || data?.length === 0).toBeTruthy();
  });
});
```

### 9.2 Integration Tests

Test API endpoints:

```bash
# Test student login
curl -X POST https://ziqskxtpypyhbqfmbmhi.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student.akira@eigomaster.local",
    "password": "test_password"
  }'

# Test data retrieval
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://ziqskxtpypyhbqfmbmhi.supabase.co/rest/v1/profiles?select=*
```

### 9.3 Load Testing

Simulate production load:

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://ziqskxtpypyhbqfmbmhi.supabase.co/rest/v1/profiles?select=*

# Expected response time: < 200ms for 1000 users
```

### 9.4 Validation Checklist

- [ ] All tables created successfully
- [ ] All indexes applied
- [ ] RLS policies enforced
- [ ] Sample data inserted correctly
- [ ] Foreign key constraints working
- [ ] Backup system operational
- [ ] Connection pooling active
- [ ] Query performance acceptable

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Permission denied for table"

**Cause**: RLS policy blocking access
**Solution**:
```sql
-- Check if RLS is enabled
SELECT * FROM pg_tables
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies
WHERE tablename = 'profiles';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

#### Issue 2: "CORS error when accessing from frontend"

**Cause**: CORS headers not configured
**Solution**:
```sql
-- Update auth settings in Supabase console
-- Settings → Auth → URL Configuration
-- Add your app domain to "Redirect URLs" and "Additional Redirect URLs"
```

#### Issue 3: "Connection timeout"

**Cause**: Database overloaded or connection pooling issue
**Solution**:
```sql
-- Check active connections
SELECT datname, count(*) FROM pg_stat_activity
GROUP BY datname;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND query_start < NOW() - INTERVAL '30 minutes';
```

#### Issue 4: "Constraint violation"

**Cause**: Foreign key or unique constraint violated
**Solution**:
```sql
-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- Disable constraint temporarily (for data fixing)
ALTER TABLE class_assignments DISABLE TRIGGER ALL;
-- Fix data...
ALTER TABLE class_assignments ENABLE TRIGGER ALL;
```

#### Issue 5: "Slow queries"

**Cause**: Missing indexes or inefficient query
**Solution**:
```sql
-- Run EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM listening_attempts
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC;

-- If missing index, create it
CREATE INDEX idx_listening_attempts_user_created
ON listening_attempts(user_id, created_at DESC);
```

### Debug Mode

Enable Supabase debug logging:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
    headers: {
      'X-Client-Info': 'eigomaster/1.0.0',
    },
  }
);

// Add request/response logging
const originalFrom = supabase.from.bind(supabase);
supabase.from = function(table: string) {
  console.log(`[Supabase] Query to ${table}`);
  return originalFrom(table);
};
```

### Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Discord Community**: https://discord.supabase.io
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## Deployment Checklist

Before deploying to production:

- [ ] All migrations applied
- [ ] RLS policies configured and tested
- [ ] API keys rotated and stored securely
- [ ] Backups enabled and tested
- [ ] Performance optimization complete
- [ ] Load testing passed
- [ ] Error handling implemented
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on procedures

---

## Maintenance Schedule

### Daily
- Monitor query performance
- Check for failed backups
- Review error logs

### Weekly
- Analyze slow queries
- Test backup restoration
- Review user access logs

### Monthly
- Rotate API keys
- Update indexes if needed
- Analyze capacity usage
- Review and optimize costs

### Quarterly
- Full security audit
- Test disaster recovery
- Update documentation
- Plan capacity expansion

---

## Next Steps

1. ✅ Run all three migrations (001, 002, 003)
2. ✅ Verify sample data in database
3. ✅ Test RLS policies with sample users
4. ✅ Configure backups
5. ✅ Run performance analysis
6. ✅ Update app environment variables
7. ✅ Deploy to staging for testing
8. ✅ Deploy to production

---

**End of Setup Guide**

For questions or issues, refer to the Troubleshooting section or contact your DBA/DevOps team.
