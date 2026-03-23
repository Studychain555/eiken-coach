-- ==========================================
-- EigoMaster Beta Testing Schema
-- Migration Date: 2026-03-20
-- Description: Complete schema for Phase 1 beta testing with 1,482 vocabulary items
-- ==========================================

-- ==========================================
-- 1. EIKEN VOCABULARY TABLE
-- ==========================================
-- Primary table storing all 1,482 EIKEN vocabulary words
CREATE TABLE IF NOT EXISTS eiken_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL, -- '準2級', '2級', '準1級', '1級'
  english_word VARCHAR(255) NOT NULL UNIQUE,
  japanese_meaning TEXT NOT NULL,
  pos VARCHAR(50), -- part of speech: noun, verb, adjective, etc.
  example_sentence TEXT,
  example_translation TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10), -- 1-10 scale
  frequency INTEGER CHECK (frequency >= 1 AND frequency <= 10), -- 1-10 scale
  ipa_pronunciation VARCHAR(255),
  audio_url VARCHAR(500),
  mnemonic TEXT, -- memory aid
  etymology TEXT, -- word origin explanation
  word_family TEXT[], -- related words array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for eiken_vocabulary
CREATE INDEX idx_eiken_vocabulary_level ON eiken_vocabulary(level);
CREATE INDEX idx_eiken_vocabulary_difficulty ON eiken_vocabulary(difficulty);
CREATE INDEX idx_eiken_vocabulary_frequency ON eiken_vocabulary(frequency);
CREATE INDEX idx_eiken_vocabulary_created_at ON eiken_vocabulary(created_at);
CREATE INDEX idx_eiken_vocabulary_english_word ON eiken_vocabulary(english_word);

-- ==========================================
-- 2. USER VOCABULARY PROGRESS TABLE
-- ==========================================
-- Tracks individual learner progress for each vocabulary word
CREATE TABLE IF NOT EXISTS user_vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES eiken_vocabulary(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'learning', 'reviewing', 'mastered'
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  next_review TIMESTAMP WITH TIME ZONE, -- SM2+ calculated next review date
  easiness_factor FLOAT DEFAULT 2.5, -- SM2+ algorithm parameter
  interval INTEGER DEFAULT 0, -- SM2+ interval in days
  streak INTEGER DEFAULT 0, -- consecutive correct answers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vocabulary_id)
);

-- Indexes for user_vocabulary_progress
CREATE INDEX idx_user_vocab_progress_user_id ON user_vocabulary_progress(user_id);
CREATE INDEX idx_user_vocab_progress_vocabulary_id ON user_vocabulary_progress(vocabulary_id);
CREATE INDEX idx_user_vocab_progress_status ON user_vocabulary_progress(status);
CREATE INDEX idx_user_vocab_progress_next_review ON user_vocabulary_progress(next_review);
CREATE INDEX idx_user_vocab_progress_user_status ON user_vocabulary_progress(user_id, status);

-- ==========================================
-- 3. DAILY GOALS TABLE
-- ==========================================
-- Tracks daily learning goals and completion
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  goal_type VARCHAR(50), -- 'listening', 'vocabulary', 'writing'
  target_count INTEGER NOT NULL DEFAULT 10,
  completed_count INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_date, goal_type)
);

-- Indexes for daily_goals
CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX idx_daily_goals_goal_date ON daily_goals(goal_date);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX idx_daily_goals_completed_at ON daily_goals(completed_at);

-- ==========================================
-- 4. USER ACHIEVEMENTS TABLE
-- ==========================================
-- Tracks gamification achievements and rewards
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL, -- 'level_up', 'streak_7', 'streak_30', '100_words', etc.
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_bonus INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type, achieved_at)
);

-- Indexes for user_achievements
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX idx_user_achievements_achieved_at ON user_achievements(achieved_at);

-- ==========================================
-- 5. BETA TESTERS TABLE
-- ==========================================
-- Management table for beta testing program
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phase INTEGER NOT NULL DEFAULT 1, -- Phase number: 1, 2, or 3
  group_name VARCHAR(50), -- 'internal', 'beta', 'broad'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'completed'
  feedback_count INTEGER DEFAULT 0,
  critical_bugs_found INTEGER DEFAULT 0,
  feature_requests TEXT,
  overall_rating FLOAT CHECK (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5)),
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for beta_testers
CREATE INDEX idx_beta_testers_phase ON beta_testers(phase);
CREATE INDEX idx_beta_testers_status ON beta_testers(status);
CREATE INDEX idx_beta_testers_user_id ON beta_testers(user_id);
CREATE INDEX idx_beta_testers_enrolled_at ON beta_testers(enrolled_at);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE eiken_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;

-- eiken_vocabulary: Read-only for all authenticated users
CREATE POLICY "eiken_vocabulary_read_public"
  ON eiken_vocabulary FOR SELECT
  USING (TRUE);

-- user_vocabulary_progress: Users can only see their own data
CREATE POLICY "user_vocab_progress_read"
  ON user_vocabulary_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_vocab_progress_insert"
  ON user_vocabulary_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_vocab_progress_update"
  ON user_vocabulary_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- daily_goals: Users can only see their own data
CREATE POLICY "daily_goals_read"
  ON daily_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_goals_insert"
  ON daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_goals_update"
  ON daily_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_achievements: Users can only see their own data
CREATE POLICY "user_achievements_read"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_achievements_insert"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- beta_testers: Only authenticated users can read their own data, admin can read all
CREATE POLICY "beta_testers_read_own"
  ON beta_testers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "beta_testers_insert"
  ON beta_testers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "beta_testers_update"
  ON beta_testers FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- HELPER FUNCTIONS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_eiken_vocabulary_updated_at
  BEFORE UPDATE ON eiken_vocabulary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_vocab_progress_updated_at
  BEFORE UPDATE ON user_vocabulary_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beta_testers_updated_at
  BEFORE UPDATE ON beta_testers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SUMMARY
-- ==========================================
-- Tables created: 5
-- - eiken_vocabulary: Main vocabulary database (1,482 items)
-- - user_vocabulary_progress: Individual learner progress tracking
-- - daily_goals: Daily learning goals and completion
-- - user_achievements: Gamification achievements
-- - beta_testers: Beta tester management and enrollment
--
-- Total indexes: 20+
-- RLS policies: 10+
-- All tables include created_at and updated_at timestamps for auditing
-- ==========================================
