# EigoMaster Supabase Backup & Disaster Recovery Guide

**Backup Strategy, Recovery Procedures, and Business Continuity Planning**

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Manual Backup Procedures](#manual-backup-procedures)
4. [Automated Backup Setup](#automated-backup-setup)
5. [Disaster Recovery Plan](#disaster-recovery-plan)
6. [Point-in-Time Recovery](#point-in-time-recovery)
7. [Data Validation](#data-validation)
8. [Testing Recovery](#testing-recovery)

---

## Overview

### Backup Objectives

- **RPO (Recovery Point Objective)**: 24 hours
  - Maximum acceptable data loss
  - Daily automated backups ensure < 24-hour data loss window

- **RTO (Recovery Time Objective)**: 4 hours
  - Maximum acceptable downtime
  - Can restore from backup in < 4 hours

### Backup Tiers

| Tier | Frequency | Retention | Use Case |
|------|-----------|-----------|----------|
| Continuous | Real-time WAL | 7 days | Point-in-time recovery |
| Daily | Automated | 30 days | Standard recovery |
| Weekly | Manual | 90 days | Archival |
| Monthly | Manual | 1 year | Compliance |

### Current Setup

- **Primary Database**: PostgreSQL on Supabase (ziqskxtpypyhbqfmbmhi)
- **Backup Storage**: Supabase-managed + local backups
- **Backup Location**: AWS S3 (recommended for offsite storage)

---

## Backup Strategy

### Components to Backup

1. **Database Schema**
   - All tables, indexes, constraints
   - RLS policies and functions
   - Triggers and stored procedures

2. **Data**
   - Production data (profiles, classes, etc.)
   - Learning progress records
   - User submissions and grades

3. **Configuration**
   - Environment variables
   - API keys (encrypted)
   - Database settings

### What NOT to Backup

- Session tokens (short-lived)
- Temporary cache files
- Development/test data
- Authentication secrets (too sensitive)

---

## Manual Backup Procedures

### Using Supabase CLI

#### Install/Update CLI

```bash
# Install globally
npm install -g supabase

# Or upgrade
npm install -g supabase@latest

# Verify installation
supabase --version
```

#### Authenticate

```bash
# Login to Supabase account
supabase login

# Follow the prompts to authenticate
# This creates ~/.supabase/access-token
```

#### Create Backup

```bash
# Using pg_dump (recommended)
export PGPASSWORD="your-password"
pg_dump \
  -h ziqskxtpypyhbqfmbmhi.supabase.co \
  -U postgres \
  -Fc \
  -f eigomaster_backup_$(date +%Y%m%d_%H%M%S).dump \
  postgres

# Using Supabase CLI
supabase link --project-ref ziqskxtpypyhbqfmbmhi
supabase db backup create --linked
```

#### List Available Backups

```bash
# List backups via Supabase CLI
supabase db backups list --linked

# Or check Supabase Console:
# Settings → Backups → View all backups
```

### Using PostgreSQL Tools

#### Create Full Database Dump

```bash
#!/bin/bash
# File: scripts/backup.sh

set -e

# Configuration
DB_HOST="ziqskxtpypyhbqfmbmhi.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"
BACKUP_DIR="/Users/80dr/eigomaster/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/eigomaster_$TIMESTAMP.dump"

# Create backup directory if needed
mkdir -p "$BACKUP_DIR"

# Set password (or use .pgpass file)
export PGPASSWORD="your-password-here"

# Create backup
echo "Creating backup: $BACKUP_FILE"
pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -Fc \
  -v \
  --no-privileges \
  --no-owner \
  $DB_NAME > $BACKUP_FILE

# Verify backup
if [ -f "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✓ Backup created successfully: $SIZE"

  # Compress if > 100MB
  if [ $(stat -f%z "$BACKUP_FILE") -gt 104857600 ]; then
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"
    echo "✓ Compressed to: $BACKUP_FILE.gz"
  fi
else
  echo "✗ Backup failed"
  exit 1
fi

# Upload to S3 (if configured)
if command -v aws &> /dev/null; then
  echo "Uploading to S3..."
  aws s3 cp "$BACKUP_FILE" s3://eigomaster-backups/
  echo "✓ Uploaded to S3"
fi
```

#### Create Schema-Only Backup

```bash
# Backup schema without data (for development)
pg_dump \
  -h ziqskxtpypyhbqfmbmhi.supabase.co \
  -U postgres \
  -Fc \
  --schema-only \
  -f eigomaster_schema_$(date +%Y%m%d_%H%M%S).dump \
  postgres
```

#### Create Data-Only Backup

```bash
# Backup data without schema (for data recovery)
pg_dump \
  -h ziqskxtpypyhbqfmbmhi.supabase.co \
  -U postgres \
  -Fc \
  --data-only \
  -f eigomaster_data_$(date +%Y%m%d_%H%M%S).dump \
  postgres
```

### Using S3 for Offsite Storage

#### Setup AWS S3 Bucket

```bash
# Create S3 bucket (one-time)
aws s3 mb s3://eigomaster-backups \
  --region ap-northeast-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket eigomaster-backups \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket eigomaster-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set lifecycle policy (delete after 90 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket eigomaster-backups \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteOldBackups",
      "Status": "Enabled",
      "Expiration": {"Days": 90}
    }]
  }'
```

#### Upload Backup to S3

```bash
# Manual upload
aws s3 cp eigomaster_backup_20260319_120000.dump \
  s3://eigomaster-backups/

# Sync backups directory
aws s3 sync ./backups s3://eigomaster-backups/ \
  --exclude "*" \
  --include "*.dump"

# List backups in S3
aws s3 ls s3://eigomaster-backups/ --recursive --human-readable --summarize
```

---

## Automated Backup Setup

### Schedule Daily Backups (macOS)

#### Create Backup Script

```bash
#!/bin/bash
# File: /usr/local/bin/eigomaster-backup.sh

set -e

# Configuration
DB_HOST="ziqskxtpypyhbqfmbmhi.supabase.co"
DB_USER="postgres"
BACKUP_DIR="/Users/80dr/eigomaster/backups"
LOG_FILE="/Users/80dr/eigomaster/backup.log"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Log function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "Starting backup process"

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/eigomaster_$TIMESTAMP.dump"

export PGPASSWORD="$SUPABASE_PASSWORD"

if pg_dump \
  -h $DB_HOST \
  -U $DB_USER \
  -Fc \
  --no-privileges \
  --no-owner \
  postgres > "$BACKUP_FILE" 2>> "$LOG_FILE"
then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  log "✓ Backup created: $SIZE"

  # Upload to S3
  if command -v aws &> /dev/null; then
    if aws s3 cp "$BACKUP_FILE" s3://eigomaster-backups/ >> "$LOG_FILE" 2>&1; then
      log "✓ Uploaded to S3"
    else
      log "✗ S3 upload failed"
    fi
  fi

  # Delete old backups (keep 30 days)
  find "$BACKUP_DIR" -name "eigomaster_*.dump" -mtime +30 -delete
  log "✓ Cleaned up old backups"

else
  log "✗ Backup failed"
  exit 1
fi

log "Backup process completed"
```

#### Setup LaunchAgent (macOS)

```bash
# Make script executable
chmod +x /usr/local/bin/eigomaster-backup.sh

# Create plist file
cat > ~/Library/LaunchAgents/com.eigomaster.backup.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.eigomaster.backup</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/eigomaster-backup.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>2</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardErrorPath</key>
  <string>/Users/80dr/eigomaster/backup-error.log</string>
  <key>StandardOutPath</key>
  <string>/Users/80dr/eigomaster/backup-output.log</string>
</dict>
</plist>
EOF

# Load the agent
launchctl load ~/Library/LaunchAgents/com.eigomaster.backup.plist

# Verify it's loaded
launchctl list | grep eigomaster.backup

# Check logs
tail -f /Users/80dr/eigomaster/backup.log
```

#### Setup Cron (Linux/Server)

```bash
# Edit crontab
crontab -e

# Add daily backup (2 AM every day)
0 2 * * * /usr/local/bin/eigomaster-backup.sh >> /var/log/eigomaster-backup.log 2>&1

# List cron jobs
crontab -l
```

### Supabase Managed Backups

Supabase automatically creates daily backups:

1. **Enable automatic backups**:
   - Go to Supabase Console
   - Settings → Backups
   - ✅ Enable "Automated backups"
   - Set retention: 30 days minimum

2. **Backup frequency**:
   - Tier: Daily
   - Time: UTC 00:00 (configurable)
   - Retention: 30 days

3. **Access backups**:
   - Settings → Backups → View all backups
   - Download any backup as SQL file

---

## Disaster Recovery Plan

### Scenarios

#### Scenario 1: Data Corruption

**Symptoms**:
- Queries return invalid data
- Application crashes
- Referential integrity errors

**Recovery Steps**:
1. Identify corruption scope
2. Create emergency backup
3. Restore from last known good backup
4. Validate data integrity
5. Apply data fixes if needed

```bash
# Identify corrupted table
ANALYZE;
SELECT relname, n_live_tup, n_dead_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > n_live_tup;

# Vacuum corrupted table
VACUUM ANALYZE table_name;

# If still corrupted, restore from backup
```

#### Scenario 2: Accidental Data Deletion

**Symptoms**:
- Missing records
- Lower than expected row counts
- Application errors on missing data

**Recovery Steps**:
1. Identify deletion time from logs
2. Find backup from before deletion
3. Restore backup to point-in-time
4. Extract deleted records
5. Merge back into production

```sql
-- Identify missing records
SELECT COUNT(*) FROM profiles;  -- Check against expected count
SELECT * FROM audit_log WHERE action = 'DELETE' ORDER BY created_at DESC;

-- Restore from backup (see Point-in-Time Recovery)
```

#### Scenario 3: Complete Database Failure

**Symptoms**:
- Database completely inaccessible
- Connection refused errors
- "Cannot connect to database"

**Recovery Steps**:
1. Verify Supabase project status
2. Check database logs for errors
3. Try connecting with different credentials
4. If unrecoverable, restore from backup
5. Restore to new project if needed

```bash
# Check database status
supabase status --linked

# View recent logs
supabase logs db --linked --follow

# Restore to new database (if primary unreachable)
supabase db restore --backup-id [BACKUP_ID] --new-project
```

#### Scenario 4: Security Breach

**Symptoms**:
- Unauthorized API access detected
- Compromised credentials
- Suspicious database activity

**Recovery Steps**:
1. Immediately revoke API keys
2. Create new API keys
3. Rotate all secrets
4. Review database audit logs
5. Check for unauthorized data access
6. Consider restoring from backup if data modified

```sql
-- Audit potentially compromised data
SELECT * FROM listening_attempts
WHERE created_at >= '2026-03-19'
  AND user_id NOT IN (
    SELECT id FROM profiles WHERE created_at < '2026-03-19'
  );

-- Check for suspicious queries
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE mean_time > 5000
ORDER BY mean_time DESC;
```

---

## Point-in-Time Recovery (PITR)

### Enable PITR

Supabase keeps Write-Ahead Logs (WAL) for 7 days, enabling recovery to any point in time:

```bash
# Check WAL retention
supabase inspect --linked | grep -i wal

# WAL should be >= 7 days for full PITR capability
```

### Restore to Specific Point in Time

```bash
# Via Supabase console:
# Settings → Backups → Restore to a point in time
# Select date and time, then restore

# Via CLI:
supabase db restore --backup-id [ID] --recovery-target-timeline '2026-03-19 14:30:00'
```

### Restore via Direct SQL

```bash
#!/bin/bash
# Restore to specific point in time

BACKUP_FILE="eigomaster_backup_20260319_120000.dump"
RECOVERY_TIME="2026-03-19 14:30:00"  # Before corruption occurred

# Restore backup
pg_restore \
  -h localhost \
  -U postgres \
  -d postgres \
  --recovery-target-timeline=$RECOVERY_TIME \
  "$BACKUP_FILE"
```

---

## Data Validation

### Pre-Restore Validation

Before restoring, verify backup integrity:

```bash
# Check backup file integrity
pg_restore --list eigomaster_backup.dump | head -20

# Verify it's readable
file eigomaster_backup.dump

# Check file size (shouldn't be 0)
ls -lh eigomaster_backup.dump
```

### Post-Restore Validation

After restoring, validate data:

```sql
-- Check row counts match expected
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'listening_questions', COUNT(*) FROM listening_questions
UNION ALL
SELECT 'listening_attempts', COUNT(*) FROM listening_attempts
UNION ALL
SELECT 'vocabulary_words', COUNT(*) FROM vocabulary_words
UNION ALL
SELECT 'writing_prompts', COUNT(*) FROM writing_prompts
UNION ALL
SELECT 'writing_submissions', COUNT(*) FROM writing_submissions
ORDER BY table_name;

-- Verify referential integrity
SELECT 'orphaned_listening_attempts' as issue, COUNT(*) as count
FROM listening_attempts
WHERE user_id NOT IN (SELECT id FROM profiles)
UNION ALL
SELECT 'orphaned_writing_submissions', COUNT(*)
FROM writing_submissions
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Check for corrupted data
SELECT * FROM profiles WHERE email IS NULL OR email = '';
SELECT * FROM classes WHERE name IS NULL;

-- Verify indexes exist
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;
```

### Application-Level Validation

```typescript
// Test key operations after restore
async function validateRestore() {
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select()
    .limit(1);

  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select()
    .limit(1);

  const { data: questions, error: qError } = await supabase
    .from('listening_questions')
    .select()
    .limit(1);

  if (profileError || classError || qError) {
    console.error('Validation failed:', { profileError, classError, qError });
    return false;
  }

  console.log('✓ Validation passed');
  return true;
}
```

---

## Testing Recovery

### Monthly Recovery Test

Execute monthly to ensure backups work:

```bash
#!/bin/bash
# File: scripts/test-recovery.sh

set -e

echo "=== EigoMaster Backup Recovery Test ==="
echo "Date: $(date)"

# Get latest backup
LATEST_BACKUP=$(ls -t backups/eigomaster_*.dump | head -1)
echo "Testing backup: $LATEST_BACKUP"

# Create test database
TEST_DB="eigomaster_restore_test"

echo "Creating test database: $TEST_DB"
createdb -h localhost -U postgres $TEST_DB

# Restore from backup
echo "Restoring from backup..."
pg_restore \
  -h localhost \
  -U postgres \
  -d $TEST_DB \
  --no-owner \
  --no-privileges \
  "$LATEST_BACKUP"

# Validate
echo "Validating restore..."
PROFILE_COUNT=$(psql -h localhost -U postgres -d $TEST_DB -tc \
  "SELECT COUNT(*) FROM profiles;")
echo "Profiles restored: $PROFILE_COUNT"

# Cleanup
echo "Cleaning up test database..."
dropdb -h localhost -U postgres $TEST_DB

echo "✓ Recovery test completed successfully"
```

### Recovery Test Checklist

- [ ] Latest backup exists and is readable
- [ ] Backup file size is reasonable (not 0 bytes)
- [ ] Restore completes without errors
- [ ] All tables exist in restored database
- [ ] Row counts match expected values
- [ ] Foreign key constraints intact
- [ ] Indexes are present
- [ ] No orphaned records
- [ ] Application can connect and query
- [ ] Sample queries return expected results

---

## Backup Monitoring

### Monitor Backup Success

```bash
# Check if backup ran today
ls -lt backups/ | head -1

# Check backup size
du -h backups/ | tail -1

# Check backup logs
tail -50 backup.log

# Check for errors in logs
grep -i "error\|failed\|warning" backup.log
```

### Set Up Alerts

```bash
#!/bin/bash
# Email alert if backup failed

LOG_FILE="/Users/80dr/eigomaster/backup.log"
TODAY=$(date +%Y-%m-%d)

# Check if today's backup completed successfully
if ! grep -q "$TODAY.*Backup created" "$LOG_FILE"; then
  echo "ALERT: Backup failed on $TODAY" | mail -s "EigoMaster Backup Alert" admin@example.com
fi
```

---

## Compliance & Audit

### Backup Log Template

```
Date: 2026-03-19
Time: 02:00 UTC
Backup Type: Full Database
Backup Size: 256 MB
Duration: 3 minutes
Status: ✓ Success
Uploaded: ✓ S3
Verified: ✓ Yes
Notes: Routine daily backup
Operator: Automated
```

### Retention Policy

| Type | Duration | Purpose |
|------|----------|---------|
| Daily | 30 days | Recovery from recent issues |
| Weekly | 90 days | Multi-week rollback |
| Monthly | 1 year | Compliance/audit |
| Yearly | 7 years | Legal/regulatory |

### Audit Trail

```sql
-- Create audit log table
CREATE TABLE backup_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_date DATE NOT NULL,
  backup_type VARCHAR(50),
  size_mb DECIMAL(10, 2),
  status VARCHAR(20),
  s3_url TEXT,
  verified BOOLEAN,
  operator VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log each backup
INSERT INTO backup_audit (backup_date, backup_type, size_mb, status, operator)
VALUES ('2026-03-19'::date, 'full', 256.5, 'success', 'system');
```

---

## Disaster Recovery Checklist

### Before Disaster
- [ ] Weekly backup verification completed
- [ ] RTO/RPO targets documented
- [ ] Recovery procedures documented
- [ ] Team trained on recovery process
- [ ] Backup location confirmed
- [ ] Credentials secured

### During Disaster
- [ ] Declare incident
- [ ] Assemble recovery team
- [ ] Identify last good backup
- [ ] Begin restore process
- [ ] Monitor progress
- [ ] Validate data

### After Disaster
- [ ] Verify all services operational
- [ ] Notify stakeholders
- [ ] Document incident
- [ ] Update procedures
- [ ] Schedule lessons learned meeting
- [ ] Improve backup/recovery process

---

**End of Backup & Disaster Recovery Guide**

For questions, contact your database administrator or DevOps team.
