#!/bin/bash

###############################################################################
# EigoMaster Supabase Setup Verification Script
#
# This script verifies that all Supabase migrations and configurations
# have been properly applied.
#
# Usage: bash scripts/verify_supabase_setup.sh
#
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Configuration
PROJECT_ID="ziqskxtpypyhbqfmbmhi"
DB_HOST="ziqskxtpypyhbqfmbmhi.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"

###############################################################################
# Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  EigoMaster Supabase Setup Verification${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
  echo -e "\n${BLUE}▶ $1${NC}"
}

pass() {
  echo -e "${GREEN}✓ $1${NC}"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗ $1${NC}"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
  ((WARNINGS++))
}

check_command() {
  if command -v "$1" &> /dev/null; then
    pass "$1 is installed"
  else
    warn "$1 is not installed (optional)"
  fi
}

check_env_variable() {
  if [ -z "${!1}" ]; then
    fail "$1 environment variable is not set"
  else
    pass "$1 is set (value: ${!1:0:20}...)"
  fi
}

check_file() {
  if [ -f "$1" ]; then
    pass "$1 exists"
  else
    fail "$1 does not exist"
  fi
}

###############################################################################
# Main Verification
###############################################################################

print_header

# 1. Check Prerequisites
print_section "1. Checking Prerequisites"

if [ -f ".env.local" ]; then
  pass ".env.local file exists"
  source .env.local
else
  fail ".env.local file not found"
fi

check_command "node"
check_command "npm"
check_command "psql"
check_command "aws"

# 2. Check Environment Variables
print_section "2. Checking Environment Variables"

if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
  fail "EXPO_PUBLIC_SUPABASE_URL not set"
else
  if [[ "$EXPO_PUBLIC_SUPABASE_URL" == *"$PROJECT_ID"* ]]; then
    pass "EXPO_PUBLIC_SUPABASE_URL is correct"
  else
    warn "EXPO_PUBLIC_SUPABASE_URL may be incorrect (Project ID mismatch)"
  fi
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
  fail "EXPO_PUBLIC_SUPABASE_ANON_KEY not set"
else
  pass "EXPO_PUBLIC_SUPABASE_ANON_KEY is set"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_SECRET" ]; then
  warn "SUPABASE_SERVICE_ROLE_SECRET not set (needed for admin operations)"
else
  pass "SUPABASE_SERVICE_ROLE_SECRET is set"
fi

# 3. Check Migration Files
print_section "3. Checking Migration Files"

check_file "supabase/migrations/001_initial_schema.sql"
check_file "supabase/migrations/002_enhanced_schema.sql"
check_file "supabase/migrations/003_sample_data.sql"

# 4. Check Documentation Files
print_section "4. Checking Documentation Files"

check_file "SUPABASE_SETUP_GUIDE.md"
check_file "SUPABASE_SQL_REFERENCE.md"
check_file "SUPABASE_BACKUP_AND_RECOVERY.md"
check_file "SUPABASE_IMPLEMENTATION_CHECKLIST.md"
check_file "SUPABASE_SUMMARY.md"

# 5. Check Database Connection (if psql available)
print_section "5. Checking Database Connection"

if command -v psql &> /dev/null; then
  if [ -z "$PGPASSWORD" ]; then
    warn "Cannot test database connection - PGPASSWORD not set"
  else
    export PGPASSWORD
    if psql -h "$DB_HOST" -U "$DB_USER" -c "SELECT 1" &> /dev/null; then
      pass "Database connection successful"

      # Check if migrations have been applied
      TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)

      if [ "$TABLE_COUNT" -gt 0 ]; then
        pass "Database has $TABLE_COUNT tables (migrations applied)"

        # Verify expected tables
        EXPECTED_TABLES=("profiles" "classes" "listening_questions" "vocabulary_words" \
                        "writing_prompts" "teacher_progress" "class_assignments" "learning_progress")

        for table in "${EXPECTED_TABLES[@]}"; do
          TABLE_EXISTS=$(psql -h "$DB_HOST" -U "$DB_USER" -t -c \
            "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" 2>/dev/null)

          if [ -n "$TABLE_EXISTS" ]; then
            pass "  Table '$table' exists"
          else
            fail "  Table '$table' missing"
          fi
        done
      else
        fail "Database has no tables (migrations not applied)"
      fi

      # Check sample data
      PROFILE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -t -c \
        "SELECT COUNT(*) FROM profiles;" 2>/dev/null)

      if [ "$PROFILE_COUNT" -gt 0 ]; then
        pass "Sample data exists ($PROFILE_COUNT profiles)"
      else
        warn "No sample data found (run migration 003)"
      fi

    else
      fail "Cannot connect to database (check credentials)"
    fi
  fi
else
  warn "psql not installed - skipping database checks"
fi

# 6. Check Supabase CLI
print_section "6. Checking Supabase CLI"

if command -v supabase &> /dev/null; then
  pass "Supabase CLI is installed"
  SUPABASE_VERSION=$(supabase --version 2>/dev/null || echo "unknown")
  echo "  Version: $SUPABASE_VERSION"
else
  warn "Supabase CLI not installed (optional, for advanced operations)"
fi

# 7. Check Node Dependencies
print_section "7. Checking Node Dependencies"

if [ -f "package.json" ]; then
  pass "package.json exists"

  if grep -q "@supabase/supabase-js" package.json; then
    pass "@supabase/supabase-js is in dependencies"
  else
    fail "@supabase/supabase-js missing from dependencies"
  fi

  if [ -d "node_modules" ]; then
    pass "node_modules directory exists"
  else
    warn "node_modules not installed (run: npm install)"
  fi
else
  fail "package.json not found"
fi

# 8. Check Backup Configuration
print_section "8. Checking Backup Configuration"

if [ -d "backups" ]; then
  pass "Backups directory exists"
  BACKUP_COUNT=$(find backups -name "*.dump" 2>/dev/null | wc -l)
  if [ "$BACKUP_COUNT" -gt 0 ]; then
    pass "  Found $BACKUP_COUNT backup file(s)"
  else
    warn "  No backup files found yet"
  fi
else
  warn "Backups directory not created"
fi

if [ -f "scripts/backup.sh" ]; then
  pass "Backup script exists"
else
  warn "Backup script not found"
fi

# 9. Check Logs Directory
print_section "9. Checking Logs Directory"

if [ -d "logs" ]; then
  pass "Logs directory exists"
else
  warn "Logs directory not created"
fi

# 10. Summary
print_section "Summary"

echo -e "\n${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"

if [ $FAILED -eq 0 ]; then
  if [ $WARNINGS -eq 0 ]; then
    echo -e "\n${GREEN}✓ All checks passed! System is ready for deployment.${NC}\n"
    exit 0
  else
    echo -e "\n${YELLOW}⚠ All critical checks passed, but some optional components missing.${NC}"
    echo -e "${YELLOW}  Review warnings above and install missing components as needed.${NC}\n"
    exit 0
  fi
else
  echo -e "\n${RED}✗ Some checks failed. Please review errors above.${NC}"
  echo -e "${RED}  Refer to SUPABASE_SETUP_GUIDE.md for troubleshooting.${NC}\n"
  exit 1
fi
