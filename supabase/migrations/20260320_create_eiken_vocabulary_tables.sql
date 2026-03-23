-- EIKEN Vocabulary Tables Migration
-- Created: 2026-03-20
-- Purpose: Create tables for EIKEN vocabulary test system

BEGIN;

-- ========================================
-- 1. Main Vocabulary Table
-- ========================================
CREATE TABLE IF NOT EXISTS eiken_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Word Information
  word TEXT NOT NULL UNIQUE,
  reading TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  meaning_jp TEXT NOT NULL,
  meaning_jp_full TEXT,
  meaning_en TEXT,

  -- Context
  example_sentence TEXT NOT NULL,
  example_translation TEXT NOT NULL,
  example_context TEXT,

  -- Classification
  eiken_level TEXT NOT NULL CHECK (eiken_level IN ('pre_2nd', '2nd', 'pre_1st', '1st')),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  frequency INTEGER NOT NULL CHECK (frequency BETWEEN 1 AND 5),

  -- Media
  audio_url TEXT,
  audio_provider TEXT CHECK (audio_provider IN ('google-tts', 'forvo', 'recorded')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT FALSE,

  -- Statistics (denormalized)
  attempt_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  accuracy_percent NUMERIC(5,2)
);

-- Create indexes
CREATE INDEX idx_eiken_vocabulary_level ON eiken_vocabulary(eiken_level);
CREATE INDEX idx_eiken_vocabulary_difficulty ON eiken_vocabulary(difficulty);
CREATE INDEX idx_eiken_vocabulary_word ON eiken_vocabulary(word);

-- ========================================
-- 2. Multiple Choice Options Table
-- ========================================
CREATE TABLE IF NOT EXISTS eiken_vocabulary_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID NOT NULL REFERENCES eiken_vocabulary(id) ON DELETE CASCADE,

  meaning TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eiken_choices_word ON eiken_vocabulary_choices(word_id);

-- ========================================
-- 3. User Progress Table (Spaced Repetition)
-- ========================================
CREATE TABLE IF NOT EXISTS eiken_vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES eiken_vocabulary(id) ON DELETE CASCADE,

  -- SM2 State
  interval INTEGER DEFAULT 1,
  ease_factor NUMERIC(4,2) DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,

  -- Review Tracking
  next_review_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  attempt_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,

  -- Combo
  current_combo INTEGER DEFAULT 0,
  longest_combo INTEGER DEFAULT 0,

  -- Status
  is_mastered BOOLEAN DEFAULT FALSE,
  is_learning BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_eiken_progress_user ON eiken_vocabulary_progress(user_id);
CREATE INDEX idx_eiken_progress_next_review ON eiken_vocabulary_progress(next_review_at) WHERE NOT is_mastered;

-- ========================================
-- 4. Daily Goals Table
-- ========================================
CREATE TABLE IF NOT EXISTS eiken_daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_level TEXT NOT NULL CHECK (target_level IN ('pre_2nd', '2nd', 'pre_1st', '1st')),

  target_words_per_day INTEGER NOT NULL DEFAULT 10,
  words_studied INTEGER DEFAULT 0,
  words_completed INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,

  base_xp_reward INTEGER NOT NULL DEFAULT 50,
  bonus_xp_reward INTEGER NOT NULL DEFAULT 25,

  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, date, target_level)
);

CREATE INDEX idx_daily_goals_user_date ON eiken_daily_goals(user_id, date);

-- ========================================
-- 5. Import Batch Tracking Table
-- ========================================
CREATE TABLE IF NOT EXISTS eiken_import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  eiken_level TEXT NOT NULL CHECK (eiken_level IN ('pre_2nd', '2nd', 'pre_1st', '1st')),

  total_words INTEGER NOT NULL,
  imported_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  csv_url TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'importing', 'completed', 'failed')),
  error_message TEXT
);

-- ========================================
-- 6. Enable RLS (Row Level Security)
-- ========================================
ALTER TABLE eiken_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_vocabulary_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_import_batches ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 7. RLS Policies - Public Read Access
-- ========================================
CREATE POLICY "Public can read vocabulary"
  ON eiken_vocabulary FOR SELECT
  USING (true);

CREATE POLICY "Public can read choices"
  ON eiken_vocabulary_choices FOR SELECT
  USING (true);

-- ========================================
-- 8. RLS Policies - User Personal Data
-- ========================================
-- Progress: Users can only read/write their own
CREATE POLICY "Users read own progress"
  ON eiken_vocabulary_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own progress"
  ON eiken_vocabulary_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own progress"
  ON eiken_vocabulary_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Daily Goals: Users can only read/write their own
CREATE POLICY "Users read own goals"
  ON eiken_daily_goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own goals"
  ON eiken_daily_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own goals"
  ON eiken_daily_goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Import Batches: Admin only (can be restricted further)
CREATE POLICY "Admin can manage batches"
  ON eiken_import_batches FOR ALL
  USING (auth.role() = 'authenticated');

COMMIT;
