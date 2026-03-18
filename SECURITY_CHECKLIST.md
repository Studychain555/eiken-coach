# EigoMaster Security Checklist

**Project**: EigoMaster 英語学習アプリ
**Updated**: 2026-03-19
**Responsibility**: Must complete BEFORE production deployment

---

## P0-1: API Key Security ✅

### Secrets Exposure Prevention
- [x] Removed API keys from `.env.local`
- [x] Removed API keys from `.env.production`
- [x] Updated `.gitignore` with `.env*` patterns
- [x] Created `.github/workflows/setup-env-vars.md` guide

### GitHub Actions Setup
- [ ] Go to GitHub repository → Settings → Secrets and variables → Actions
- [ ] Add secret: `EXPO_PUBLIC_SUPABASE_URL`
  - Get from: Supabase dashboard → Project Settings → API
- [ ] Add secret: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Get from: Supabase dashboard → Project Settings → API
- [ ] Add secret: `SUPABASE_SERVICE_ROLE_SECRET`
  - Get from: Supabase dashboard → Project Settings → API
- [ ] Add secret: `EXPO_PUBLIC_CLAUDE_API_KEY`
  - Get from: https://console.anthropic.com/account/keys
  - Scope: `messages:read` + `messages:write`
- [ ] Add secret: `EXPO_PUBLIC_WHISPER_API_KEY` (optional for now)
  - Get from: https://platform.openai.com/account/api-keys
- [ ] Add secret: `SENTRY_AUTH_TOKEN` (if using Sentry)
  - Get from: Sentry dashboard → Organization → API

### Key Rotation Timeline
```
Claude API Key:      Rotate every 90 days (Last: unknown, set date)
Whisper API Key:     Rotate every 60 days (Last: unknown, set date)
Supabase Anon Key:   Rotate every 120 days (Last: unknown, set date)
Supabase Service:    Rotate every 120 days (Last: unknown, set date)
```

**Rotation Procedure**:
1. Generate new key in API dashboard
2. Update GitHub Actions secret
3. Deploy new version with updated secret
4. Monitor for errors in logs
5. Revoke old key

### Git History Cleanup
- [x] Identified commits with exposed keys (d420566)
- [ ] Before pushing to GitHub:
  ```bash
  git log --all -S 'sk-ant' | head
  git log --all -S 'eyJhbGciOi' | head
  ```
  If results found, run:
  ```bash
  git filter-repo --message-blob-callback '...' # Use script from .git-filter-patterns
  git push origin feature/eigomaster-app --force-with-lease
  ```

### Verification
```bash
# Verify env files are properly ignored
git check-ignore .env.local
git check-ignore .env.production
# Should both print: .env.local, .env.production

# Verify no secrets in current tree
git ls-files | xargs grep -l "sk-ant"
# Should return: (no results)

# Verify no secrets in recent commits
git log -p --all -S 'sk-ant' | head -20
# Should show: (no results if cleaned)
```

---

## P0-2: Data Persistence ✅

### Core Libraries Implemented
- [x] `src/lib/storageMiddleware.ts` (384 lines)
  - AsyncStorage persistence layer
  - Auto-save functionality
  - Restore on app load

- [x] `src/lib/realtimeSyncManager.ts` (248 lines)
  - Supabase real-time subscriptions
  - Offline queue management
  - Auto-sync on reconnect

- [x] `src/lib/conflictResolver.ts` (244 lines)
  - 4 conflict resolution strategies
  - Field-level merge handlers
  - Version tracking

### Store Updates
- [x] `src/stores/learningStore.ts` - Added user_id + sync
- [x] `src/stores/vocabularyStore.ts` - Added user_id + sync
- [x] `src/stores/listeningStore.ts` - Added user_id + sync
- [x] `src/stores/writingStore.ts` - Added user_id + sync
- [x] `src/stores/shadowingStore.ts` - Added user_id + sync
- [x] `src/stores/authStore.ts` - Added initializeAllStores()

### Database Schema
- [x] `supabase/migrations/004_data_persistence_tables.sql`
  - 6 new tables with user_id
  - RLS policies for user isolation
  - Proper indexes for queries
  - Auto-updated_at triggers

### Implementation Verification

**Step 1: Database Migration**
```bash
# Option A: Supabase CLI
supabase migration up

# Option B: Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy and paste 004_data_persistence_tables.sql
# 3. Click "Run"
```

After migration, verify in SQL Editor:
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('learning_progress', 'vocabulary_progress', 'listening_attempts', 'writing_submissions', 'shadowing_records', 'sync_queue');
-- Should return 6 rows

-- Check RLS is enabled
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('learning_progress', 'vocabulary_progress', 'listening_attempts', 'writing_submissions', 'shadowing_records')
AND relrowsecurity = true;
-- Should return 5 rows (all true)

-- Check indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('learning_progress', 'vocabulary_progress', 'listening_attempts', 'writing_submissions', 'shadowing_records')
AND indexname LIKE 'idx_%';
-- Should return 9 indexes
```

**Step 2: App Initialization**
- [ ] Update app root (App.tsx or similar):
  ```typescript
  import { useEffect } from 'react';
  import { useAuthStore } from '@/src/stores/authStore';

  export default function App() {
    useEffect(() => {
      useAuthStore().initializeAuth();
    }, []);

    // ... rest of component
  }
  ```

**Step 3: Test Offline Functionality**
- [ ] Manually turn off WiFi/cellular
- [ ] Use app (make changes)
- [ ] Monitor AsyncStorage:
  ```typescript
  import AsyncStorage from '@react-native-async-storage/async-storage';
  const keys = await AsyncStorage.getAllKeys();
  console.log(keys);
  // Should see: learning:${userId}, vocabulary:${userId}, etc.
  ```
- [ ] Turn network back on
- [ ] Verify changes synced to Supabase:
  ```bash
  # In Supabase dashboard
  SELECT * FROM learning_progress WHERE user_id = '${test_user_id}';
  ```

**Step 4: Test Sync Queue**
- [ ] Enable browser dev tools (in React Native debugger)
- [ ] Monitor offline changes:
  ```typescript
  const queueStatus = realtimeSyncManager.getQueueStatus();
  console.log(queueStatus);
  // Should show queued items when offline
  ```

**Step 5: Test Conflict Resolution**
- [ ] Simulate concurrent edits:
  - Edit data in Supabase directly
  - Edit same data in app
  - Observe conflict resolution
- [ ] Verify "last-write-wins" is applied correctly

### Performance Monitoring
- [ ] Monitor AsyncStorage size (should be < 10MB)
- [ ] Monitor Supabase real-time connections (should be < 200)
- [ ] Check sync_queue cleanup (old entries removed monthly)

---

## P0-3: Multi-User Support ✅

### Store User Context
- [x] `userId: string | null` added to all 5 stores
- [x] `setUserId(userId)` methods added
- [x] `initializeSync(userId)` methods added
- [x] All Supabase queries filter by user_id

### Database Schema
- [x] All tables include `user_id` column
- [x] All tables reference `auth.users(id)` with CASCADE delete
- [x] Unique constraints on (user_id, resource_id) where appropriate

### RLS (Row Level Security)
- [x] RLS enabled on all 6 tables
- [x] SELECT policy: `auth.uid() = user_id`
- [x] INSERT policy: `auth.uid() = user_id`
- [x] UPDATE policy: `auth.uid() = user_id`
- [x] DELETE policy: `auth.uid() = user_id`

### Verification Tests

**Test 1: User Isolation**
```typescript
// Create two test users
const user1 = await createTestUser('user1@test.com');
const user2 = await createTestUser('user2@test.com');

// Login as user1
await authStore.signIn('user1@test.com', 'password');
await learningStore.initializeSync(user1.id);

// Make changes
learningStore.setListeningProgress({ completed: 10, total: 20, minutes: 30 });

// Verify saved with user1.id
const data1 = await supabase
  .from('learning_progress')
  .select()
  .eq('user_id', user1.id);
expect(data1.data[0].user_id).toBe(user1.id);

// Login as user2
await authStore.signOut();
await authStore.signIn('user2@test.com', 'password');

// Verify user2 cannot see user1's data
const data2 = await supabase
  .from('learning_progress')
  .select()
  .eq('user_id', user2.id);
expect(data2.data.length).toBe(0); // user2 has no data
```

**Test 2: RLS Enforcement**
```typescript
// Attempt to bypass RLS with raw SQL (should fail)
const { data, error } = await supabase.rpc('query_all_learning_progress', {});
// Should return: 42501 "Permission denied" (RLS blocks)
```

**Test 3: Class-Based Filtering (Teachers)**
```typescript
// Teacher loads class data
const classId = 'class-123';
const studentData = await teacherStore.loadClassProgress(classId);

// Should only return students in that class
studentData.forEach(student => {
  expect(student.class_id).toBe(classId);
});
```

### Authorization Levels

| User Type | Access | Read | Write |
|-----------|--------|------|-------|
| Student | Own data | ✅ | ✅ |
| Student | Others' data | ❌ | ❌ |
| Teacher | Own data | ✅ | ✅ |
| Teacher | Class data | ✅ | ✅ (grading) |
| Teacher | All data | ❌ | ❌ |
| Admin | All data | ✅ | ✅ |

---

## Production Readiness Checklist

### Pre-Deployment
- [ ] All 3 P0 items completed and tested
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Load testing completed
- [ ] Accessibility testing completed

### Deployment
- [ ] Database migration applied in production
- [ ] GitHub Actions secrets configured
- [ ] CI/CD pipeline tested
- [ ] Environment variables validated
- [ ] SSL/TLS certificates valid
- [ ] CORS configuration correct

### Post-Deployment
- [ ] Monitor error logs (Sentry)
- [ ] Monitor database logs
- [ ] Monitor API usage
- [ ] Monitor real-time connection count
- [ ] Monitor sync queue for backlog
- [ ] Monitor AsyncStorage usage patterns

### Ongoing
- [ ] Review RLS policies weekly
- [ ] Rotate API keys on schedule
- [ ] Archive old data monthly
- [ ] Update security patches
- [ ] Audit user access logs
- [ ] Review API permissions

---

## Security Incident Response

### If API Key Exposed

**Within 5 minutes**:
1. Revoke key in API dashboard
2. Update GitHub Actions secret with new key
3. Monitor logs for unauthorized access

**Within 1 hour**:
1. Deploy new version with updated key
2. Verify old key no longer working
3. Review audit logs for suspicious activity

**Within 24 hours**:
1. Notify users of incident
2. Document incident details
3. Review how key was exposed
4. Implement prevention measures

### If Data Breach Suspected

1. **Immediately**: Stop accepting new connections
2. **Within 30 mins**: Contact Supabase support
3. **Within 1 hour**: Review access logs
4. **Within 24 hours**: Notify users if data compromised
5. **Within 7 days**: Complete post-mortem analysis

### If RLS Policy Bypassed

1. **Immediately**: Disable affected table
2. **Within 30 mins**: Review logs for unauthorized access
3. **Within 1 hour**: Fix RLS policy
4. **Within 24 hours**: Restore data if needed
5. **Within 7 days**: Audit all RLS policies

---

## Monthly Security Tasks

- [ ] Review API usage patterns
- [ ] Rotate API keys (if scheduled)
- [ ] Clean up sync_queue table
- [ ] Archive old data submissions
- [ ] Review RLS policies
- [ ] Check Supabase security advisories
- [ ] Update dependencies
- [ ] Review CloudFlare settings (if applicable)

---

## Security Contacts

- **Security Issues**: Report via GitHub → Security → Advisories
- **Supabase Support**: support@supabase.io
- **Anthropic Support**: support@anthropic.com
- **OpenAI Support**: support@openai.com

---

## Compliance Checklist

### GDPR (If EU users)
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] Data processing agreement signed

### CCPA (If California users)
- [ ] Privacy policy includes CCPA rights
- [ ] User data access functionality
- [ ] User data deletion functionality
- [ ] Do Not Sell My Data option

### Data Retention
- [ ] Define retention period for each data type
- [ ] Implement auto-deletion of old data
- [ ] Create data export backups
- [ ] Document retention policy

---

## Final Sign-Off

| Item | Owner | Status | Date |
|------|-------|--------|------|
| P0-1 Complete | Claude | ✅ | 2026-03-19 |
| P0-2 Complete | Claude | ✅ | 2026-03-19 |
| P0-3 Complete | Claude | ✅ | 2026-03-19 |
| Database Ready | User | 🟡 | TBD |
| App Integration | User | 🟡 | TBD |
| Testing Complete | User | 🔴 | TBD |
| Security Audit | User | 🔴 | TBD |
| Production Deploy | User | 🔴 | TBD |

---

**Document Version**: 1.0
**Last Updated**: 2026-03-19 03:50 UTC
**Status**: Ready for database setup phase
