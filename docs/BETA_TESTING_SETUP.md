# EigoMaster Beta Testing Phase 1 Setup Guide

**Date**: 2026-03-20
**Status**: Ready for Launch
**Phase**: 1 (Internal Testing)
**Target Testers**: 100 internal users
**Expected Duration**: 2-3 weeks

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Vocabulary Data Import](#vocabulary-data-import)
4. [Audio Generation](#audio-generation)
5. [Tester Enrollment](#tester-enrollment)
6. [Feedback Collection](#feedback-collection)
7. [Phase Progression](#phase-progression)
8. [Monitoring & Reporting](#monitoring--reporting)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Being Tested?

**Phase 1** tests the core learning functionality with 1,482 EIKEN vocabulary words across 4 proficiency levels:

- **準2級** (Pre-2nd Grade): 370 words
- **2級** (2nd Grade): 444 words
- **準1級** (Pre-1st Grade): 370 words
- **1級** (1st Grade): 298 words

### Key Features Being Tested

- ✅ Vocabulary learning with spaced repetition (SM2+)
- ✅ Daily goals and streak tracking
- ✅ Gamification (XP, achievements, levels)
- ✅ Audio pronunciation (TTS)
- ✅ Progress tracking and analytics
- ✅ Parent dashboard
- ✅ Offline support

### Success Criteria

- **Stability**: < 0.1% crash rate
- **Performance**: Page load < 2 seconds (average)
- **User Satisfaction**: Average rating >= 4.2/5.0
- **Bugs Found**: <= 10 critical bugs
- **Feature Requests**: Documentation and prioritization

---

## Infrastructure Setup

### 1. Supabase Schema Migration

The Supabase schema has been prepared with all necessary tables for beta testing.

**Verify tables exist:**

```bash
# Connect to Supabase and verify tables
psql -h <supabase-host> -U postgres -d postgres -c "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public';
"
```

**Expected tables:**
- `eiken_vocabulary` - Vocabulary database (1,482 items)
- `user_vocabulary_progress` - Learner progress tracking
- `daily_goals` - Daily learning goals
- `user_achievements` - Gamification achievements
- `beta_testers` - Tester management

**Migration file:**
```
supabase/migrations/20260320_beta_testing_schema.sql
```

### 2. Environment Variables

Verify these are set in `.env.production`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://tbtwegsiumpiskeuhgfjs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Feature Flags
FEATURE_BETA_TESTING=true
FEATURE_EIKEN_VOCABULARY=true
FEATURE_TTS_AUDIO=true

# Beta Configuration
BETA_TESTING_ENABLED=true
BETA_USER_GROUP_SIZE=1000
BETA_FEEDBACK_COLLECTION=true
```

---

## Vocabulary Data Import

### Import 1,482 Words to Supabase

**Step 1: Generate vocabulary CSV**

```bash
python3 scripts/expand_to_1482_vocabulary.py
```

This creates: `/tmp/eiken_vocabulary_1482.csv`

**Step 2: Import to Supabase**

Option A - Using Supabase Dashboard:
1. Go to Supabase Dashboard → `eiken_vocabulary` table
2. Click "Import data" → "CSV"
3. Select `/tmp/eiken_vocabulary_1482.csv`
4. Verify: Should show 1,482 rows imported

Option B - Using CLI:
```bash
supabase db push
```

Then import CSV:
```bash
psql -h <supabase-host> -U postgres -d postgres \
  -c "COPY eiken_vocabulary FROM STDIN CSV HEADER;" \
  < /tmp/eiken_vocabulary_1482.csv
```

**Verify import:**
```sql
SELECT COUNT(*) as total,
       COUNT(DISTINCT level) as levels
FROM eiken_vocabulary;

-- Expected: total=1482, levels=4
```

---

## Audio Generation

### Generate TTS Audio Files

**Prerequisites:**
- Google Cloud Text-to-Speech API key (optional for demo)
- Internet connection
- ~2-3 hours for full generation

**Step 1: Run TTS Generator**

```bash
# Demo mode (creates placeholder files)
python3 scripts/generate_tts_audio.py

# Production mode (requires Google Cloud API key)
python3 scripts/generate_tts_audio.py \
  --api-key "YOUR_GOOGLE_CLOUD_API_KEY"
```

**Options:**
```bash
python3 scripts/generate_tts_audio.py \
  --csv /tmp/eiken_vocabulary_1482.csv \
  --output-dir public/audio/eiken \
  --workers 4 \
  --dry-run  # Show what would happen
```

**Output:**
- MP3 files: `public/audio/eiken/*.mp3`
- Results CSV: `/tmp/tts_generation_results.csv`
- Stats: Success rate, failed words, skipped items

**Step 2: Upload to CDN (Optional)**

```bash
# Upload to Cloudflare CDN
aws s3 cp public/audio/eiken/ s3://eigomaster-cdn/audio/eiken/ --recursive

# Or use Cloudflare API
curl -X POST https://api.cloudflare.com/client/v4/accounts/XXX/r2/buckets/eigomaster/objects
```

**Step 3: Update Database URLs**

```python
# Update audio_url in eiken_vocabulary table
UPDATE eiken_vocabulary
SET audio_url = CONCAT('https://cdn.eigomaster.com/audio/eiken/', id, '.mp3')
WHERE audio_url IS NULL;
```

**Fallback:** If TTS generation fails, system uses IPA pronunciation as fallback.

---

## Tester Enrollment

### Enroll 100 Internal Testers

**Step 1: Generate Tester List**

```bash
python3 scripts/manage_beta_testers.py enroll \
  --phase 1 \
  --count 100 \
  --group internal \
  --output /tmp/testers_phase_1.csv
```

**Output:**
```
/tmp/testers_phase_1.csv

Columns:
- ID: unique tester identifier
- Email: tester email address
- User ID: Supabase user ID
- Phase: beta phase (1)
- Group: tester group (internal)
- Status: enrollment status (active)
- Enrolled At: enrollment date
```

**Step 2: Create Tester Accounts**

For each tester in `/tmp/testers_phase_1.csv`:

```python
import requests

testers = load_csv('/tmp/testers_phase_1.csv')

for tester in testers:
    # Create Supabase auth user
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": SUPABASE_KEY},
        json={
            "email": tester['email'],
            "password": generate_temp_password(),
            "user_metadata": {
                "beta_phase": 1,
                "tester_id": tester['id']
            }
        }
    )

    # Insert into beta_testers table
    insert_beta_tester(tester['id'], tester['email'], response['user']['id'])
```

**Step 3: Send Invitations**

```bash
python3 scripts/send_beta_invites.py \
  --phase 1 \
  --tester-list /tmp/testers_phase_1.csv \
  --template-type welcome
```

**Invitation Content:**
- Welcome message
- Download/access link
- Test guidelines
- Feedback URL
- Support contact

---

## Feedback Collection

### Record Tester Feedback

**Method 1: CLI**

```bash
# Record feedback from a tester
python3 scripts/manage_beta_testers.py feedback \
  --tester-id tester_1_0001 \
  --rating 4.5 \
  --bugs 2 \
  --text "Great app! Found some UI issues." \
  --features "Would love word lists export"
```

**Method 2: API Endpoint**

```bash
curl -X POST http://localhost:3000/api/beta/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "tester_id": "tester_1_0001",
    "rating": 4.5,
    "bugs_count": 2,
    "feedback_text": "Great app!",
    "feature_requests": "Word export feature"
  }'
```

**Method 3: In-App Feedback Form**

Users can submit feedback directly from the app (if implemented).

**Feedback Fields:**
- **Rating** (1-5): Overall experience
- **Bugs Count** (0-99): Number of critical bugs found
- **Feedback Text**: Comments and observations
- **Features**: Requested features

---

## Phase Progression

### Move Testers to Phase 2

**Progression Criteria (Configurable):**

```python
criteria = {
    'min_rating': 4.0,        # Minimum average rating
    'max_bugs': 5,            # Maximum critical bugs found
    'feedback_count': 1       # At least 1 feedback submission
}
```

**Step 1: Review Phase 1 Data**

```bash
python3 scripts/manage_beta_testers.py report --phase 1 --output /tmp/phase1_report.json
```

**Report contents:**
```json
{
  "phase": 1,
  "total_testers": 100,
  "active": 95,
  "completed": 5,
  "avg_rating": 4.3,
  "critical_bugs_found": 12,
  "testers_with_feedback": 87,
  "feedback_rate": 87.0
}
```

**Step 2: Progress Qualified Testers**

```bash
python3 scripts/manage_beta_testers.py progress \
  --from-phase 1 \
  --to-phase 2 \
  --min-rating 4.0 \
  --max-bugs 5
```

**Step 3: Enroll New Phase 2 Testers**

```bash
python3 scripts/manage_beta_testers.py enroll \
  --phase 2 \
  --count 200 \
  --group beta \
  --output /tmp/testers_phase_2.csv
```

---

## Monitoring & Reporting

### View Real-Time Statistics

**Tester List:**
```bash
python3 scripts/manage_beta_testers.py list --phase 1 --status active
```

**Phase Report:**
```bash
python3 scripts/manage_beta_testers.py report --phase 1
```

**Specific Tester Details:**
```sql
SELECT * FROM beta_testers
WHERE phase = 1 AND overall_rating > 4.0
ORDER BY overall_rating DESC;
```

### Key Metrics to Track

| Metric | Target | Threshold |
|--------|--------|-----------|
| **Testers Active** | 95+ | < 80% = concern |
| **Avg Rating** | >= 4.2 | < 4.0 = critical |
| **Critical Bugs** | < 10 | > 20 = critical |
| **Feedback Rate** | >= 80% | < 60% = concern |
| **Crash Rate** | < 0.1% | > 1% = critical |
| **Load Time** | < 2s | > 5s = concern |

### Dashboard Setup (Optional)

```bash
# Create real-time dashboard
npm install -g json-server
json-server --watch /tmp/beta_report.json
```

Then visit: `http://localhost:3000`

---

## Troubleshooting

### Common Issues

#### 1. CSV Import Fails

**Problem:** "Invalid UTF-8 encoding"

**Solution:**
```bash
# Convert CSV to UTF-8
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv
```

#### 2. TTS Generation Times Out

**Problem:** "Request timeout"

**Solution:**
```bash
# Reduce concurrent requests
python3 scripts/generate_tts_audio.py --workers 2
```

#### 3. Testers Can't Login

**Problem:** Auth error

**Solution:**
```bash
# Verify Supabase configuration
curl https://tbtwegsiumpiskeuhgfjs.supabase.co/rest/v1/beta_testers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Missing Audio Files

**Problem:** Audio URLs return 404

**Solution:**
```bash
# Check if files exist
ls -la public/audio/eiken/ | wc -l

# If empty, regenerate with:
python3 scripts/generate_tts_audio.py
```

#### 5. Database Connection Issues

**Problem:** "Connection refused"

**Solution:**
```bash
# Check Supabase status
curl https://status.supabase.io/api/v2/status.json

# Verify connection string
psql "postgresql://user:pass@host:5432/db"
```

---

## Quick Start Checklist

- [ ] Supabase schema created (`migrations/20260320_beta_testing_schema.sql`)
- [ ] 1,482 vocabulary words imported to `eiken_vocabulary` table
- [ ] Audio files generated (or demo placeholders created)
- [ ] 100 testers enrolled in `beta_testers` table
- [ ] Tester CSV exported to `/tmp/testers_phase_1.csv`
- [ ] Feedback tracking system verified
- [ ] Phase progression logic tested
- [ ] Monitoring dashboard configured
- [ ] Documentation reviewed
- [ ] Invitations ready to send (not sent yet)

---

## Next Steps

1. **Run TTS Generation** (can be background):
   ```bash
   python3 scripts/generate_tts_audio.py &
   ```

2. **Deploy to Beta Servers**:
   ```bash
   npm run build:web
   ```

3. **Send Tester Invitations**:
   ```bash
   python3 scripts/send_beta_invites.py --phase 1 --count 100
   ```

4. **Monitor Phase 1**:
   - Check reports daily: `python3 scripts/manage_beta_testers.py report --phase 1`
   - Review critical bugs
   - Update feature roadmap

5. **Plan Phase 2** (after 2-3 weeks):
   - Progress qualified testers
   - Enroll 200 additional testers
   - Deploy Phase 2 features

---

## Support & Contact

- **Issues**: GitHub Issues (internal repo)
- **Questions**: Slack #beta-testing
- **Bugs**: Submit via in-app feedback form
- **Features**: Product roadmap discussion

---

**Generated**: 2026-03-20
**Version**: 1.0
**Status**: Ready for Launch
