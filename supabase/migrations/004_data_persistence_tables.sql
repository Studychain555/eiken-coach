-- P0-2: Data Persistence Tables
-- Created: 2026-03-19
-- Purpose: Support offline-first data persistence with user_id filtering

-- Learning Progress Table
CREATE TABLE IF NOT EXISTS learning_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listening_progress JSONB NOT NULL DEFAULT '{"completedQuestions": 0, "totalQuestions": 0, "todayStudyMinutes": 0}',
  vocabulary_progress JSONB NOT NULL DEFAULT '{"masteredWords": 0, "totalWords": 2000, "currentStage": 1}',
  writing_progress JSONB NOT NULL DEFAULT '{"submissions": 0, "averageScore": 0}',
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vocabulary Progress Table (per-word tracking)
CREATE TABLE IF NOT EXISTS vocabulary_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  is_mastered BOOLEAN NOT NULL DEFAULT FALSE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  state JSONB NOT NULL DEFAULT '{"interval": 1, "easeFactor": 2.5, "repetitions": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, word_id)
);

-- Listening Attempts Table
CREATE TABLE IF NOT EXISTS listening_attempts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Writing Submissions Table
CREATE TABLE IF NOT EXISTS writing_submissions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  score JSONB, -- { totalScore: number, spelling: number, grammar: number, vocabulary: number }
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shadowing Records Table
CREATE TABLE IF NOT EXISTS shadowing_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempt_id TEXT NOT NULL,
  question_id TEXT,
  round_number INTEGER NOT NULL, -- 1-7
  audio_url TEXT NOT NULL,
  transcript TEXT,
  accuracy_score NUMERIC(3,1), -- 0-10
  rhythm_score NUMERIC(3,1), -- 0-10
  pronunciation_score NUMERIC(3,1), -- 0-10
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync Queue Table (for offline-first conflict resolution)
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_word_id ON vocabulary_progress(word_id);
CREATE INDEX IF NOT EXISTS idx_listening_attempts_user_id ON listening_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_attempts_created_at ON listening_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_user_id ON writing_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_submissions_submitted_at ON writing_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_shadowing_records_user_id ON shadowing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_shadowing_records_attempt_id ON shadowing_records(attempt_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_synced_at ON sync_queue(synced_at);

-- Enable RLS (Row Level Security)
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow users to only access their own data
CREATE POLICY "Users can view their own learning progress"
  ON learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress"
  ON learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress"
  ON learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own vocabulary progress"
  ON vocabulary_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary progress"
  ON vocabulary_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary progress"
  ON vocabulary_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own listening attempts"
  ON listening_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listening attempts"
  ON listening_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own writing submissions"
  ON writing_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own writing submissions"
  ON writing_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shadowing records"
  ON shadowing_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own shadowing records"
  ON shadowing_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync queue"
  ON sync_queue FOR ALL
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at column
CREATE TRIGGER learning_progress_updated_at BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vocabulary_progress_updated_at BEFORE UPDATE ON vocabulary_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER listening_attempts_updated_at BEFORE UPDATE ON listening_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER writing_submissions_updated_at BEFORE UPDATE ON writing_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shadowing_records_updated_at BEFORE UPDATE ON shadowing_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
