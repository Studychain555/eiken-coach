/**
 * EIKEN Vocabulary Test Schema
 * Supabase テーブル定義と TypeScript インターフェース
 * サポートレベル: 準2級、2級、準1級、1級
 */

// ==========================================
// EIKEN Levels Enum
// ==========================================
export enum EIKENLevel {
  PRE_2ND = 'pre_2nd',     // 準2級 (Pre-2nd Grade) - 800-1,000 words
  GRADE_2 = '2nd',         // 2級 (2nd Grade) - 1,500-2,000 words
  PRE_1ST = 'pre_1st',     // 準1級 (Pre-1st Grade) - 2,500-3,500 words
  GRADE_1 = '1st',         // 1級 (1st Grade) - 3,500-5,000+ words
}

export const EIKENLevelLabels: Record<EIKENLevel, string> = {
  [EIKENLevel.PRE_2ND]: '英検準2級',
  [EIKENLevel.GRADE_2]: '英検2級',
  [EIKENLevel.PRE_1ST]: '英検準1級',
  [EIKENLevel.GRADE_1]: '英検1級',
};

export const EIKENLevelDescriptions: Record<EIKENLevel, string> = {
  [EIKENLevel.PRE_2ND]: '高校初級程度。基本的な日常表現と初級単語を習得。',
  [EIKENLevel.GRADE_2]: '高校中級程度。中程度の難易度の単語と表現を習得。',
  [EIKENLevel.PRE_1ST]: '高校上級程度。難度が高く、学術的な単語を習得。',
  [EIKENLevel.GRADE_1]: '大学・大学院程度。最高難度の専門的な単語を習得。',
};

export const EIKENLevelWordCounts: Record<EIKENLevel, { min: number; max: number }> = {
  [EIKENLevel.PRE_2ND]: { min: 800, max: 1000 },
  [EIKENLevel.GRADE_2]: { min: 1500, max: 2000 },
  [EIKENLevel.PRE_1ST]: { min: 2500, max: 3500 },
  [EIKENLevel.GRADE_1]: { min: 3500, max: 5000 },
};

// ==========================================
// Extended Vocabulary Word Interface
// ==========================================
export interface EIKENVocabularyWord {
  // Primary Keys
  id: string;                               // UUID

  // Word Information
  word: string;                             // English word
  reading: string;                          // Pronunciation (IPA)
  partOfSpeech: string;                     // 'noun', 'verb', 'adjective', etc.

  // Meanings
  meaningJP: string;                        // Japanese meaning (primary)
  meaningJPFull?: string;                   // Detailed Japanese explanation
  meaningEN?: string;                       // English definition

  // Example & Context
  exampleSentence: string;                  // Example sentence in English
  exampleTranslation: string;               // Example sentence in Japanese
  exampleContext?: string;                  // Additional context or usage notes

  // EIKEN Classification
  eiken_level: EIKENLevel;                  // Which EIKEN level (準2級 etc)
  difficulty: number;                       // 1-5 difficulty within level
  frequency: number;                        // 1-5 frequency score (how often appears)

  // Multiple Choice Options
  choices?: MultipleChoiceOption[];         // 4 choice options (1 correct + 3 distractors)
  correctChoiceId?: string;                 // Which choice is correct

  // Audio & Media
  audio_url?: string;                       // URL to pronunciation audio
  audioProvider?: 'google-tts' | 'forvo' | 'recorded'; // Audio source

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;                       // User/admin who added this word
  isVerified?: boolean;                     // Has been reviewed/verified

  // Statistics (filled by backend)
  attemptCount?: number;                    // How many times attempted
  correctCount?: number;                    // How many times correct
  accuracy?: number;                        // Accuracy percentage (0-100)
}

// ==========================================
// Multiple Choice Option Interface
// ==========================================
export interface MultipleChoiceOption {
  id: string;                               // UUID for each option
  meaning: string;                          // Japanese meaning
  isCorrect: boolean;                       // Is this the right answer?
  difficulty: number;                       // How plausible is this distractor? (1-5)
}

// ==========================================
// User Progress Interface
// ==========================================
export interface EIKENVocabularyProgress {
  id: string;                               // UUID
  userId: string;                           // Supabase user ID
  wordId: string;                           // Reference to vocabulary word

  // SM2 Spaced Repetition
  sm2State: {
    interval: number;                       // Days until next review
    easeFactor: number;                     // 2.5 default, modified by performance
    repetitions: number;                    // How many times reviewed
  };

  // Review Tracking
  nextReviewAt: Date;                       // When to review next
  lastReviewedAt?: Date;                    // When last reviewed
  attemptCount: number;                     // Total attempts
  correctCount: number;                     // Correct attempts

  // Combo & Streaks
  currentCombo: number;                     // Current correct streak
  longestCombo: number;                     // Best streak for this word

  // Status
  isMastered: boolean;                      // Mastery threshold reached (80%+ correct)
  isLearning: boolean;                      // Currently learning

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Daily Goal Interface (Enhanced for EIKEN)
// ==========================================
export interface EIKENDailyGoal {
  id: string;                               // UUID
  userId: string;
  date: Date;                               // Which date is this goal for

  // Goal Settings
  targetWordsPerDay: number;                // How many words to study
  targetLevel: EIKENLevel;                  // Which level to focus on

  // Progress
  wordsStudied: number;                     // How many studied so far
  wordsCompleted: number;                   // How many completed/mastered
  correctCount: number;                     // Correct answers
  totalAttempts: number;                    // Total attempts

  // XP Rewards
  baseXPReward: number;                     // Base XP for completing goal
  bonusXPReward: number;                    // Bonus if all correct

  // Status
  isCompleted: boolean;
  completedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// Batch Import Interface (for CSV import)
// ==========================================
export interface VocabularyImportBatch {
  id: string;                               // UUID
  batchName: string;                        // e.g., "EIKEN 準2級 Batch 1"
  eiken_level: EIKENLevel;

  // Stats
  totalWords: number;
  importedCount: number;
  failedCount: number;

  // Files
  csvUrl?: string;                          // Where is the source CSV
  importedAt: Date;

  // Status
  status: 'pending' | 'importing' | 'completed' | 'failed';
  errorMessage?: string;
}

// ==========================================
// Supabase Table Definitions (SQL)
// ==========================================

/*
CREATE TABLE IF NOT EXISTS "eiken_vocabulary" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Word Information
  word TEXT NOT NULL,
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

  -- Statistics (denormalized for query speed)
  attempt_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  accuracy_percent NUMERIC(5,2),

  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', word), 'A') ||
    setweight(to_tsvector('simple', meaning_jp), 'B')
  ) STORED
);

-- Indexes
CREATE INDEX idx_eiken_vocabulary_level ON eiken_vocabulary(eiken_level);
CREATE INDEX idx_eiken_vocabulary_difficulty ON eiken_vocabulary(difficulty);
CREATE INDEX idx_eiken_vocabulary_word ON eiken_vocabulary(word);
CREATE INDEX idx_eiken_vocabulary_search ON eiken_vocabulary USING gin(search_vector);

-- Multiple Choice Options Table
CREATE TABLE IF NOT EXISTS "eiken_vocabulary_choices" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID NOT NULL REFERENCES eiken_vocabulary(id) ON DELETE CASCADE,

  meaning TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_eiken_choices_word ON eiken_vocabulary_choices(word_id);

-- User Progress Table
CREATE TABLE IF NOT EXISTS "eiken_vocabulary_progress" (
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

-- Indexes
CREATE INDEX idx_eiken_progress_user ON eiken_vocabulary_progress(user_id);
CREATE INDEX idx_eiken_progress_next_review ON eiken_vocabulary_progress(next_review_at) WHERE NOT is_mastered;

-- Daily Goals Table
CREATE TABLE IF NOT EXISTS "eiken_daily_goals" (
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

-- Index
CREATE INDEX idx_daily_goals_user_date ON eiken_daily_goals(user_id, date);

-- Import Batch Tracking
CREATE TABLE IF NOT EXISTS "eiken_import_batches" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  eiken_level TEXT NOT NULL CHECK (eiken_level IN ('pre_2nd', '2nd', 'pre_1st', '1st')),

  total_words INTEGER NOT NULL,
  imported_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  csv_url TEXT,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  status TEXT NOT NULL CHECK (status IN ('pending', 'importing', 'completed', 'failed')),
  error_message TEXT
);

-- RLS Policies
ALTER TABLE eiken_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_vocabulary_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE eiken_daily_goals ENABLE ROW LEVEL SECURITY;

-- Public can read vocabulary (no login required)
CREATE POLICY "Allow public read on eiken_vocabulary"
  ON eiken_vocabulary FOR SELECT
  USING (true);

-- Users can only read their own progress
CREATE POLICY "Allow users read own progress"
  ON eiken_vocabulary_progress FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own progress
CREATE POLICY "Allow users update own progress"
  ON eiken_vocabulary_progress FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own progress
CREATE POLICY "Allow users insert own progress"
  ON eiken_vocabulary_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Similar policies for daily_goals
CREATE POLICY "Allow users read own goals"
  ON eiken_daily_goals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Allow users update own goals"
  ON eiken_daily_goals FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow users insert own goals"
  ON eiken_daily_goals FOR INSERT
  WITH CHECK (user_id = auth.uid());
*/

// ==========================================
// Exports
// ==========================================
export type {
  EIKENVocabularyWord,
  MultipleChoiceOption,
  EIKENVocabularyProgress,
  EIKENDailyGoal,
  VocabularyImportBatch,
};
