-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  display_name TEXT NOT NULL,
  class_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening questions table
CREATE TABLE listening_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  script TEXT NOT NULL,
  choices JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INT NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listening attempts table
CREATE TABLE listening_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES listening_questions(id) ON DELETE CASCADE,
  selected_answer INT NOT NULL CHECK (selected_answer >= 0 AND selected_answer <= 3),
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shadowing records table
CREATE TABLE shadowing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES listening_attempts(id) ON DELETE CASCADE,
  round_number INT NOT NULL CHECK (round_number >= 1 AND round_number <= 7),
  audio_url TEXT NOT NULL,
  transcript TEXT,
  accuracy_score INT CHECK (accuracy_score >= 0 AND accuracy_score <= 10),
  rhythm_score INT CHECK (rhythm_score >= 0 AND rhythm_score <= 10),
  pronunciation_score INT CHECK (pronunciation_score >= 0 AND pronunciation_score <= 10),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary words table
CREATE TABLE vocabulary_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL UNIQUE,
  reading TEXT,
  meaning TEXT NOT NULL,
  part_of_speech TEXT,
  example_sentence TEXT,
  example_translation TEXT,
  stage INT NOT NULL CHECK (stage >= 1 AND stage <= 20),
  difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vocabulary progress table
CREATE TABLE vocabulary_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  correct_streak INT DEFAULT 0,
  is_mastered BOOLEAN DEFAULT FALSE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- Writing prompts table
CREATE TABLE writing_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  word_limit INT DEFAULT 150,
  difficulty INT NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing submissions table
CREATE TABLE writing_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES writing_prompts(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  score_content INT CHECK (score_content >= 0 AND score_content <= 4),
  score_structure INT CHECK (score_structure >= 0 AND score_structure <= 4),
  score_vocabulary INT CHECK (score_vocabulary >= 0 AND score_vocabulary <= 4),
  score_grammar INT CHECK (score_grammar >= 0 AND score_grammar <= 4),
  total_score INT CHECK (total_score >= 0 AND total_score <= 16),
  feedback TEXT,
  model_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_class_id ON profiles(class_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_listening_attempts_user_id ON listening_attempts(user_id);
CREATE INDEX idx_listening_attempts_question_id ON listening_attempts(question_id);
CREATE INDEX idx_shadowing_records_attempt_id ON shadowing_records(attempt_id);
CREATE INDEX idx_vocabulary_progress_user_id ON vocabulary_progress(user_id);
CREATE INDEX idx_vocabulary_words_stage ON vocabulary_words(stage);
CREATE INDEX idx_writing_submissions_user_id ON writing_submissions(user_id);
CREATE INDEX idx_writing_submissions_prompt_id ON writing_submissions(prompt_id);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- profiles: Users can read own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- listening_questions: All authenticated users can read
CREATE POLICY "All authenticated users can read questions" ON listening_questions
  FOR SELECT USING (auth.role() = 'authenticated');

-- listening_attempts: Users can read own attempts
CREATE POLICY "Users can read own attempts" ON listening_attempts
  FOR SELECT USING (auth.uid() = user_id);

-- shadowing_records: Users can read own records
CREATE POLICY "Users can read own shadowing records" ON shadowing_records
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM listening_attempts WHERE id = shadowing_records.attempt_id)
  );

-- vocabulary_words: All authenticated users can read
CREATE POLICY "All authenticated users can read words" ON vocabulary_words
  FOR SELECT USING (auth.role() = 'authenticated');

-- vocabulary_progress: Users can read own progress
CREATE POLICY "Users can read own vocabulary progress" ON vocabulary_progress
  FOR SELECT USING (auth.uid() = user_id);

-- writing_prompts: All authenticated users can read
CREATE POLICY "All authenticated users can read prompts" ON writing_prompts
  FOR SELECT USING (auth.role() = 'authenticated');

-- writing_submissions: Users can read own submissions
CREATE POLICY "Users can read own submissions" ON writing_submissions
  FOR SELECT USING (auth.uid() = user_id);
