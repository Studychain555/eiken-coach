# EigoMaster Beta Phase 1 - Launch Guide

**Status**: ✅ READY FOR LAUNCH
**Date**: 2026-03-20
**Target Launch**: 2026-03-20 (today)
**Phase 1 Duration**: 2-3 weeks
**Phase 1 Testers**: 100 internal users
**Vocabulary Size**: 1,482 EIKEN words

---

## Quick Start (5 minutes)

### Verify Everything is Ready

```bash
# 1. Check Supabase migration exists
ls -la supabase/migrations/20260320_beta_testing_schema.sql

# 2. Verify vocabulary data
wc -l /tmp/eiken_vocabulary_1482.csv
# Expected: 1483 lines (1,482 words + 1 header)

# 3. Verify tester list
wc -l /tmp/testers_phase_1.csv
# Expected: 101 lines (100 testers + 1 header)

# 4. Check all scripts exist
ls -la scripts/{expand_to_1482_vocabulary,generate_tts_audio,manage_beta_testers,send_beta_invites}.py
```

### Deploy Supabase Schema

```bash
# Push migration to Supabase
cd /Users/80dr/eigomaster
supabase db push

# Verify tables created
psql -h <supabase-host> -U postgres -d postgres -c "
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name LIKE '%eiken%|%progress%|%goals%|%achievements%|%beta%'
  ORDER BY table_name;"
```

### Import Vocabulary Data

```bash
# Option 1: Using Supabase Dashboard
# 1. Go to https://app.supabase.com
# 2. Select project → eiken_vocabulary table
# 3. Click "Import data" → "CSV"
# 4. Select /tmp/eiken_vocabulary_1482.csv
# 5. Click "Import"

# Option 2: Using CLI
psql -h <supabase-host> -U postgres -d postgres \
  -c "COPY eiken_vocabulary (id, level, english_word, japanese_meaning, pos, example_sentence, example_translation, difficulty, frequency, ipa_pronunciation, mnemonic, etymology, word_family) FROM STDIN CSV HEADER;" \
  < /tmp/eiken_vocabulary_1482.csv

# Verify import
psql -h <supabase-host> -U postgres -d postgres -c "
  SELECT level, COUNT(*) as count FROM eiken_vocabulary GROUP BY level ORDER BY level;"
```

### Build and Deploy

```bash
# Web build
cd /Users/80dr/eigomaster
npm run build:web

# Deploy to production
npm run deploy
```

### Send Invitations

```bash
# IMPORTANT: Review before sending!
# Verify API key is set
export SENDGRID_API_KEY="your-key-here"

# Option 1: Send to CSV list
python3 scripts/send_beta_invites.py \
  --csv /tmp/testers_phase_1.csv \
  --template welcome

# Option 2: Dry run first (recommended!)
python3 scripts/send_beta_invites.py \
  --csv /tmp/testers_phase_1.csv \
  --template welcome \
  --dry-run
```

---

## Complete Phase 1 Workflow

### Day 1: Setup & Deploy

| Time | Task | Command |
|------|------|---------|
| 09:00 | Deploy Supabase schema | `supabase db push` |
| 09:15 | Import vocabulary (1,482) | Dashboard or CLI import |
| 09:30 | Verify vocabulary count | `SELECT COUNT(*) FROM eiken_vocabulary;` |
| 10:00 | Build web version | `npm run build:web` |
| 10:30 | Deploy to production | `npm run deploy` |
| 11:00 | Test app functionality | Manual testing on staging |
| 14:00 | Send beta invitations | `python3 scripts/send_beta_invites.py --csv /tmp/testers_phase_1.csv --template welcome` |
| 15:00 | Monitor email delivery | Check SendGrid dashboard |
| 16:00 | Notify testers via Slack | Post announcement in #beta-testing |

### Days 2-7: Early Phase (Monitoring)

- **Daily**: Monitor crash rates, error logs
- **Daily**: Check tester feedback submissions
- **2-3x**: Review and triage reported bugs
- **Weekly**: Generate phase report

```bash
# Daily monitoring
python3 scripts/manage_beta_testers.py report --phase 1

# Record feedback as received
python3 scripts/manage_beta_testers.py feedback \
  --tester-id tester_1_0001 \
  --rating 4.5 \
  --bugs 2 \
  --text "Found UI issues on settings page"
```

### Days 8-14: Mid Phase (Iteration)

- **Daily**: Bug fixes and deployments
- **2-3x**: Send reminder emails for feedback
- **Weekly**: Review progress against success criteria
- **Analyze**: Feature requests and trends

```bash
# Send reminder email
python3 scripts/send_beta_invites.py \
  --csv /tmp/testers_phase_1.csv \
  --template reminder

# Request specific feedback
python3 scripts/send_beta_invites.py \
  --csv /tmp/testers_phase_1.csv \
  --template feedback
```

### Days 15-21: Late Phase (Wrap-up)

- **Daily**: Finalize critical bug fixes
- **Daily**: Monitor stability metrics
- **Mid-week**: Generate Phase 1 final report
- **Late week**: Plan Phase 2 progression

```bash
# Final report
python3 scripts/manage_beta_testers.py report --phase 1 --output /tmp/phase1_final_report.json

# Review results
cat /tmp/phase1_final_report.json | jq '.'
```

---

## Key Commands Reference

### Vocabulary Management

```bash
# Generate/expand vocabulary
python3 scripts/expand_to_1482_vocabulary.py

# Generate TTS audio (demo mode)
python3 scripts/generate_tts_audio.py

# Generate TTS audio (production with API key)
GOOGLE_CLOUD_API_KEY="xxx" python3 scripts/generate_tts_audio.py
```

### Beta Tester Management

```bash
# Enroll testers
python3 scripts/manage_beta_testers.py enroll --phase 1 --count 100 --group internal --output /tmp/testers.csv

# List testers
python3 scripts/manage_beta_testers.py list --phase 1

# Record feedback
python3 scripts/manage_beta_testers.py feedback --tester-id tester_1_0001 --rating 4.5 --bugs 2

# Generate report
python3 scripts/manage_beta_testers.py report --phase 1 --output /tmp/report.json

# Progress to Phase 2
python3 scripts/manage_beta_testers.py progress --from-phase 1 --to-phase 2 --min-rating 4.0 --max-bugs 5
```

### Email Invitations

```bash
# Send to CSV list (dry run)
python3 scripts/send_beta_invites.py --csv /tmp/testers.csv --template welcome --dry-run

# Send to CSV list (actual)
python3 scripts/send_beta_invites.py --csv /tmp/testers.csv --template welcome

# Send to single email
python3 scripts/send_beta_invites.py --email user@example.com --template welcome

# Send reminder template
python3 scripts/send_beta_invites.py --csv /tmp/testers.csv --template reminder

# Send feedback request template
python3 scripts/send_beta_invites.py --csv /tmp/testers.csv --template feedback

# Send Phase 2 transition template
python3 scripts/send_beta_invites.py --csv /tmp/phase2_testers.csv --template phase2
```

### Supabase Queries

```sql
-- Count vocabulary by level
SELECT level, COUNT(*) as count FROM eiken_vocabulary GROUP BY level;

-- Check learner progress
SELECT user_id, COUNT(*) as words_attempted,
       COUNT(CASE WHEN status = 'mastered' THEN 1 END) as mastered
FROM user_vocabulary_progress
GROUP BY user_id;

-- View daily goals
SELECT user_id, goal_date, goal_type, completed_count, target_count
FROM daily_goals
WHERE goal_date >= CURRENT_DATE - INTERVAL 7 DAY
ORDER BY goal_date DESC;

-- List achievements earned
SELECT user_id, achievement_type, COUNT(*) as count
FROM user_achievements
GROUP BY user_id, achievement_type
ORDER BY user_id;

-- Beta tester metrics
SELECT phase, COUNT(*) as total,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
       AVG(overall_rating) as avg_rating,
       SUM(critical_bugs_found) as total_bugs
FROM beta_testers
GROUP BY phase;
```

---

## Success Metrics

### Stability
- **Target**: < 0.1% crash rate
- **Monitor**: Sentry error tracking
- **Action**: Fix any critical crashes immediately

### Performance
- **Target**: Page load < 2 seconds (average)
- **Monitor**: Cloudflare analytics, Web Vitals
- **Action**: Profile and optimize slow pages

### User Satisfaction
- **Target**: Average rating >= 4.2/5.0
- **Monitor**: Feedback submissions
- **Action**: Address low ratings with follow-up interviews

### Quality
- **Target**: <= 10 critical bugs
- **Monitor**: Bug reports and triage
- **Action**: Fix critical bugs before Phase 2

### Engagement
- **Target**: >= 80% feedback rate
- **Monitor**: Feedback count / total testers
- **Action**: Send reminder emails if below target

---

## File Locations

| Item | Location |
|------|----------|
| **Supabase Migration** | `supabase/migrations/20260320_beta_testing_schema.sql` |
| **Vocabulary Data** | `/tmp/eiken_vocabulary_1482.csv` |
| **Vocabulary JSON** | `/tmp/eiken_vocabulary_1482.json` |
| **Tester List** | `/tmp/testers_phase_1.csv` |
| **Expansion Script** | `scripts/expand_to_1482_vocabulary.py` |
| **TTS Script** | `scripts/generate_tts_audio.py` |
| **Manager Script** | `scripts/manage_beta_testers.py` |
| **Email Script** | `scripts/send_beta_invites.py` |
| **Setup Guide** | `docs/BETA_TESTING_SETUP.md` |
| **Tester Database** | `/tmp/beta_testers.db` |
| **Phase Report** | `/tmp/beta_report.json` |

---

## Troubleshooting

### "Supabase tables not found"
```bash
# Check migration status
supabase migration list

# Push migration
supabase db push

# Check table creation
psql -h <host> -U postgres -d postgres -c "\dt public.*"
```

### "CSV import fails"
```bash
# Check file encoding
file /tmp/eiken_vocabulary_1482.csv

# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 input.csv > output.csv

# Verify CSV format
head -3 /tmp/eiken_vocabulary_1482.csv
tail -3 /tmp/eiken_vocabulary_1482.csv
```

### "Emails not sending"
```bash
# Verify SendGrid API key
echo $SENDGRID_API_KEY

# Test with dry-run first
python3 scripts/send_beta_invites.py --phase 1 --count 5 --dry-run

# Check SendGrid dashboard for bounce/suppression lists
# https://app.sendgrid.com/suppressions
```

### "Tester can't login"
```bash
# Check if tester exists in auth.users
psql -h <host> -U postgres -d postgres -c "
  SELECT id, email FROM auth.users WHERE email LIKE 'beta1%';"

# Check beta_testers table
SELECT * FROM beta_testers WHERE email = 'beta1.tester0001@eigomaster.local';

# Reset user password
# Use Supabase dashboard: Auth → Users → Reset Password
```

---

## What Comes After Phase 1?

### Phase 2 (Weeks 4-6)
- 200 additional beta testers
- Advanced learning features
- Parent dashboard enhancements
- Extended testing duration

### Phase 3 (Weeks 7-9)
- 500+ broader beta testers
- Public beta launch
- Community feedback integration
- Final production preparation

### Production Release
- Public launch on App Store/Google Play
- Full feature set enabled
- Ongoing monitoring and support

---

## Important Notes

⚠️ **Before Sending Invitations**:
1. Verify Supabase tables are created
2. Verify vocabulary is imported
3. Run dry-run of email invitations
4. Test app on staging environment
5. Get team approval to send

⚠️ **Do Not**:
- Send duplicate invitations to same user
- Send invitations without preview
- Skip feedback collection
- Change success criteria mid-phase
- Deploy untested changes during phase

✅ **Do**:
- Monitor metrics daily
- Respond to critical bugs within 24 hours
- Collect and triage feedback regularly
- Communicate status to team
- Document learnings for Phase 2

---

## Support

- **Questions**: Ask in #beta-testing Slack channel
- **Urgent Issues**: Contact product lead
- **Documentation**: See `/Users/80dr/eigomaster/docs/BETA_TESTING_SETUP.md`
- **Scripts Help**: Run `python3 script.py --help`

---

**Ready to launch? Let's go! 🚀**

*Generated: 2026-03-20*
*Version: 1.0 (Phase 1 Ready)*
