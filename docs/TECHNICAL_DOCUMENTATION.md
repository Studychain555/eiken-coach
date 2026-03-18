# EigoMaster - 完全な技術ドキュメント

**最終更新**: 2026-03-19
**バージョン**: 1.0.0
**ステータス**: 本番環境対応完了

---

## 目次

1. [システムアーキテクチャ](#1-システムアーキテクチャ)
2. [データベーススキーマ](#2-データベーススキーマ)
3. [APIエンドポイント](#3-apiエンドポイント)
4. [セキュリティモデル](#4-セキュリティモデル)
5. [セットアップガイド](#5-セットアップガイド)
6. [API仕様書](#6-api仕様書)
7. [運用ガイド](#7-運用ガイド)
8. [ユーザーマニュアル](#8-ユーザーマニュアル)

---

## 1. システムアーキテクチャ

### 1.1 全体システム図

```
┌─────────────────────────────────────────────────────────────────┐
│                         EigoMaster                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                   フロントエンド層                             │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  認証画面              メインタブナビゲーション          │  │  │
│  │  │  ┌──────────┐  ┌─────┬────────┬─────────┬──────┐  │  │  │
│  │  │  │Login     │  │Home │Listening│Vocabulary│Writing│  │  │  │
│  │  │  │Register  │  │     │         │          │      │  │  │  │
│  │  │  └──────────┘  └─────┴────────┴─────────┴──────┘  │  │  │
│  │  │                                                       │  │  │
│  │  │  React 19.1.0 + React Native 0.81.5                │  │  │
│  │  │  (Expo 54)                                          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │             状態管理層 (Zustand)                      │  │  │
│  │  │  ┌────────┬────────┬──────────┬──────────┬───────┐  │  │  │
│  │  │  │authStore│learning│vocabulary│listening │writing│  │  │  │
│  │  │  └────────┴────────┴──────────┴──────────┴───────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │             ユーティリティ層                           │  │  │
│  │  │  ┌────────────┬──────────┬────────┬───────────────┐  │  │  │
│  │  │  │Supabase    │AI Scoring│SM-2    │Audio Manager  │  │  │  │
│  │  │  │Client      │Service   │Algo    │(Web/Mobile)   │  │  │  │
│  │  │  └────────────┴──────────┴────────┴───────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↓↓↓                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  API通信層                                  │  │
│  │  ┌──────────────┬──────────────┬──────────────┐          │  │
│  │  │ Supabase     │ Claude API   │ Whisper API  │          │  │
│  │  │ PostgREST    │ (AI採点)     │ (音声認識)   │          │  │
│  │  │ Auth         │              │              │          │  │
│  │  │ Storage      │              │              │          │  │
│  │  └──────────────┴──────────────┴──────────────┘          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                            ↓↓↓                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 バックエンド層                               │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │           Supabase (PostgreSQL)                       │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐ │  │  │
│  │  │  │  プロフィール、クラス、学習進捗、                  │ │  │  │
│  │  │  │  リスニング問題、単語、ライティング、シャドーイング │ │  │  │
│  │  │  └─────────────────────────────────────────────────┘ │  │  │
│  │  │                                                        │  │  │
│  │  │  ┌─────────────────────────────────────────────────┐ │  │  │
│  │  │  │  Row Level Security (RLS)                        │ │  │  │
│  │  │  │  認証ユーザーのみアクセス可能                      │ │  │  │
│  │  │  └─────────────────────────────────────────────────┘ │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │           Supabase Storage                            │  │  │
│  │  │  音声ファイル、画像ファイル                             │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 主要コンポーネント

| コンポーネント | 説明 | 技術 |
|-----------|------|-----|
| **フロントエンド** | ユーザーインターフェース | React 19, React Native 0.81 |
| **ルーティング** | ページナビゲーション | Expo Router (ファイルベース) |
| **状態管理** | グローバル状態管理 | Zustand 5.0.12 |
| **認証** | ユーザー認証 | Supabase Auth |
| **データベース** | データ永続化 | Supabase PostgreSQL |
| **ストレージ** | ファイル保存 | Supabase Storage |
| **AI処理** | 採点・添削 | Claude API (Anthropic) |
| **音声認識** | 文字起こし | Whisper API (OpenAI) |

### 1.3 開発フロー

```
コンポーネント層
    ↓
State Management (Zustand)
    ↓
ユーティリティレイヤー
 ├─ Supabase クライアント
 ├─ AI Scoring Service
 ├─ SM-2 Algorithm
 └─ Audio Manager
    ↓
外部API
 ├─ Supabase REST API
 ├─ Claude API
 └─ Whisper API
```

---

## 2. データベーススキーマ

### 2.1 テーブル一覧

```
初期スキーマ (001_initial_schema.sql)
├── profiles                    ユーザープロフィール
├── classes                     クラス
├── listening_questions        リスニング問題
├── listening_attempts         リスニング試行履歴
├── shadowing_records          シャドーイング記録
├── vocabulary_words           単語
├── vocabulary_progress        単語学習進捗
├── writing_prompts            ライティング問題
└── writing_submissions        ライティング提出

拡張スキーマ (002_enhanced_schema.sql)
├── teacher_progress           講師進捗
├── class_assignments          クラス割り当て
├── learning_progress          学習進捗
└── question_categories        問題カテゴリ
```

### 2.2 テーブル詳細設計

#### 2.2.1 profiles (プロフィール)

| カラム | 型 | 説明 | 制約 |
|--------|----|----|------|
| id | UUID | ユーザーID | PRIMARY KEY |
| email | TEXT | メールアドレス | UNIQUE, NOT NULL |
| role | TEXT | ロール (student/teacher/admin) | NOT NULL, CHECK |
| display_name | TEXT | 表示名 | NOT NULL |
| class_id | UUID | クラスID | FK to classes |
| created_at | TIMESTAMP | 作成日時 | DEFAULT NOW() |

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  display_name TEXT NOT NULL,
  class_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**インデックス**:
```sql
CREATE INDEX idx_profiles_class_id ON profiles(class_id);
```

**RLS ポリシー**:
```sql
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

#### 2.2.2 listening_questions (リスニング問題)

| カラム | 型 | 説明 | 制約 |
|--------|----|----|------|
| id | UUID | 問題ID | PRIMARY KEY |
| title | TEXT | 問題タイトル | NOT NULL |
| audio_url | TEXT | 音声ファイルURL | NOT NULL |
| script | TEXT | リスニング台本 | NOT NULL |
| choices | JSONB | 選択肢配列 | NOT NULL |
| correct_answer | INT | 正解番号 (0-3) | NOT NULL, CHECK |
| difficulty | INT | 難易度 (1-5) | NOT NULL, CHECK |
| category_id | UUID | カテゴリID | FK to question_categories |
| is_public | BOOLEAN | 公開フラグ | DEFAULT TRUE |
| created_at | TIMESTAMP | 作成日時 | DEFAULT NOW() |

```sql
CREATE TABLE listening_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  script TEXT NOT NULL,
  choices JSONB NOT NULL,
  correct_answer INT NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  category_id UUID REFERENCES question_categories(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**インデックス**:
```sql
CREATE INDEX idx_listening_questions_difficulty_category
  ON listening_questions(difficulty, category_id);
CREATE INDEX idx_listening_questions_is_public ON listening_questions(is_public);
```

#### 2.2.3 shadowing_records (シャドーイング記録)

| カラム | 型 | 説明 | 制約 |
|--------|----|----|------|
| id | UUID | 記録ID | PRIMARY KEY |
| attempt_id | UUID | リスニング試行ID | FK to listening_attempts |
| round_number | INT | ラウンド番号 (1-7) | NOT NULL, CHECK |
| audio_url | TEXT | 録音ファイルURL | NOT NULL |
| transcript | TEXT | 文字起こしテキスト | - |
| accuracy_score | INT | 正確性スコア (0-10) | CHECK |
| rhythm_score | INT | リズムスコア (0-10) | CHECK |
| pronunciation_score | INT | 発音スコア (0-10) | CHECK |
| feedback | TEXT | AI フィードバック | - |
| created_at | TIMESTAMP | 作成日時 | DEFAULT NOW() |

```sql
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
```

#### 2.2.4 vocabulary_words (単語)

| カラム | 型 | 説明 | 制約 |
|--------|----|----|------|
| id | UUID | 単語ID | PRIMARY KEY |
| word | TEXT | 英単語 | UNIQUE, NOT NULL |
| meaning | TEXT | 日本語訳 | NOT NULL |
| reading | TEXT | 読み方 | - |
| part_of_speech | TEXT | 品詞 | - |
| example_sentence | TEXT | 例文 | - |
| example_translation | TEXT | 例文訳 | - |
| stage | INT | ステージ (1-20) | NOT NULL, CHECK |
| difficulty | INT | 難易度 (1-5) | NOT NULL, CHECK |
| frequency_rank | INT | 出現頻度ランク | - |
| created_at | TIMESTAMP | 作成日時 | DEFAULT NOW() |

```sql
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
  frequency_rank INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**インデックス**:
```sql
CREATE INDEX idx_vocabulary_words_stage ON vocabulary_words(stage);
CREATE INDEX idx_vocabulary_words_stage_difficulty
  ON vocabulary_words(stage, difficulty);
```

#### 2.2.5 writing_submissions (ライティング提出)

| カラム | 型 | 説明 | 制約 |
|--------|----|----|------|
| id | UUID | 提出ID | PRIMARY KEY |
| user_id | UUID | ユーザーID | FK to profiles |
| prompt_id | UUID | 問題ID | FK to writing_prompts |
| content | TEXT | テキスト内容 | - |
| image_url | TEXT | 手書き画像URL | - |
| score_content | INT | 内容スコア (0-4) | CHECK |
| score_structure | INT | 構成スコア (0-4) | CHECK |
| score_vocabulary | INT | 語彙スコア (0-4) | CHECK |
| score_grammar | INT | 文法スコア (0-4) | CHECK |
| total_score | INT | 合計スコア (0-16) | CHECK |
| feedback | TEXT | フィードバック | - |
| model_answer | TEXT | 模範解答 | - |
| created_at | TIMESTAMP | 作成日時 | DEFAULT NOW() |

```sql
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
```

### 2.3 ER図

```
┌────────────────────────┐
│      profiles          │
├────────────────────────┤
│ id (PK)               │
│ email (UNIQUE)        │
│ role                  │
│ display_name          │
│ class_id (FK)        │◄────┐
│ created_at           │     │
└────────────────────────┘     │
         ▲                     │
         │                     │
         │                ┌────────────────────┐
         │                │    classes         │
         │                ├────────────────────┤
         │                │ id (PK)           │
         │                │ name              │
         │                │ teacher_id (FK)  │
         │                │ school_name      │
         │                │ invite_code      │
         │                │ created_at       │
         │                └────────────────────┘
         │                     ▲
         │                     │
         │                ┌────┴────────────────────────────┐
         │                │   listening_attempts            │
         │                ├─────────────────────────────────┤
         │                │ id (PK)                        │
         │                │ user_id (FK) ──────────┐      │
         │                │ question_id (FK)       │      │
         │                │ selected_answer        │      │
         │                │ is_correct             │      │
         │                │ created_at             │      │
         │                └─────────────────────────┘      │
         │                        │                        │
         │                        └────────┬───────────────┘
         │                                 │
         │                    ┌────────────▼────────────┐
         │                    │ shadowing_records      │
         │                    ├────────────────────────┤
         │                    │ id (PK)               │
         │                    │ attempt_id (FK)       │
         │                    │ round_number          │
         │                    │ audio_url             │
         │                    │ transcript            │
         │                    │ accuracy_score        │
         │                    │ rhythm_score          │
         │                    │ pronunciation_score   │
         │                    │ feedback              │
         │                    │ created_at            │
         │                    └────────────────────────┘
         │
         │                ┌────────────────────────────┐
         │                │ vocabulary_progress        │
         │                ├────────────────────────────┤
         │                │ id (PK)                   │
         │                │ user_id (FK) ────┐       │
         │                │ word_id (FK)     │       │
         │                │ correct_streak   │       │
         │                │ is_mastered      │       │
         │                │ next_review_at   │       │
         │                │ last_reviewed_at │       │
         │                │ created_at       │       │
         │                └────────────────────────────┘
         │                        │
         │                ┌───────▼──────────────────┐
         │                │ vocabulary_words        │
         │                ├────────────────────────┤
         │                │ id (PK)               │
         │                │ word (UNIQUE)         │
         │                │ meaning               │
         │                │ stage                 │
         │                │ difficulty            │
         │                │ created_at            │
         │                └────────────────────────┘
         │
         │                ┌────────────────────────────┐
         │                │ writing_submissions        │
         │                ├────────────────────────────┤
         │                │ id (PK)                   │
         │                │ user_id (FK) ────┐       │
         │                │ prompt_id (FK)   │       │
         │                │ content           │       │
         │                │ image_url         │       │
         │                │ score_*           │       │
         │                │ total_score       │       │
         │                │ feedback          │       │
         │                │ model_answer      │       │
         │                │ created_at        │       │
         │                └────────────────────────────┘
         │                        │
         │                ┌───────▼──────────────────┐
         │                │ writing_prompts         │
         │                ├────────────────────────┤
         │                │ id (PK)               │
         │                │ topic                 │
         │                │ description           │
         │                │ word_limit            │
         │                │ difficulty            │
         │                │ created_at            │
         │                └────────────────────────┘
         │
         │                ┌────────────────────────────┐
         │                │ learning_progress         │
         │                ├────────────────────────────┤
         │                │ id (PK)                   │
         │                │ user_id (FK) ────┐       │
         │                │ class_id (FK)    │       │
         │                │ progress_date     │       │
         │                │ listening_*       │       │
         │                │ writing_*         │       │
         │                │ vocabulary_*      │       │
         │                │ mood_rating       │       │
         │                │ created_at        │       │
         │                │ updated_at        │       │
         │                └────────────────────────────┘
         │
         └────────────────────┐
                          listening_questions
                          ├─────────────────────┐
                          │ id (PK)            │
                          │ title              │
                          │ audio_url          │
                          │ script             │
                          │ choices            │
                          │ correct_answer     │
                          │ difficulty         │
                          │ created_at         │
                          └─────────────────────┘
```

### 2.4 RLS ポリシー

| テーブル | ポリシー | 条件 | 対象 |
|---------|--------|------|------|
| profiles | Users can read own profile | auth.uid() = id | SELECT |
| listening_questions | All authenticated users can read | authenticated | SELECT |
| listening_attempts | Users can read own attempts | auth.uid() = user_id | SELECT |
| shadowing_records | Users can read own records | user is attempt owner | SELECT |
| vocabulary_words | All authenticated users can read | authenticated | SELECT |
| vocabulary_progress | Users can read own progress | auth.uid() = user_id | SELECT |
| writing_prompts | All authenticated users can read | authenticated | SELECT |
| writing_submissions | Users can read own submissions | auth.uid() = user_id | SELECT |

---

## 3. APIエンドポイント

### 3.1 Supabase PostgREST API

#### 3.1.1 認証関連

```bash
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "expires_in": 3600 }
}
```

```bash
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 3.1.2 プロフィール関連

```bash
# プロフィール取得
GET /rest/v1/profiles?select=*&id=eq.{user_id}
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "email": "...",
    "role": "student",
    "display_name": "...",
    "class_id": "...",
    "created_at": "..."
  }
]

# プロフィール更新
PATCH /rest/v1/profiles?id=eq.{user_id}
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "display_name": "新しい名前"
}

Response: 200 OK
```

#### 3.1.3 リスニング問題関連

```bash
# 問題一覧取得
GET /rest/v1/listening_questions?select=*&order=difficulty.asc
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "title": "...",
    "audio_url": "...",
    "script": "...",
    "choices": ["...", "...", "...", "..."],
    "correct_answer": 0,
    "difficulty": 1,
    "created_at": "..."
  }
]

# 特定の問題取得
GET /rest/v1/listening_questions?select=*&id=eq.{question_id}
Authorization: Bearer {access_token}

Response: 200 OK
```

#### 3.1.4 リスニング試行関連

```bash
# 試行を記録
POST /rest/v1/listening_attempts
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "user_id": "{user_id}",
  "question_id": "{question_id}",
  "selected_answer": 0,
  "is_correct": true
}

Response: 201 Created
{
  "id": "...",
  "user_id": "...",
  "question_id": "...",
  "selected_answer": 0,
  "is_correct": true,
  "created_at": "..."
}
```

#### 3.1.5 単語関連

```bash
# ステージ別単語取得
GET /rest/v1/vocabulary_words?select=*&stage=eq.1&order=id.asc
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "word": "abandon",
    "meaning": "放棄する",
    "stage": 1,
    "difficulty": 2,
    "example_sentence": "...",
    "created_at": "..."
  }
]

# 学習進捗取得
GET /rest/v1/vocabulary_progress?select=*&user_id=eq.{user_id}
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "user_id": "...",
    "word_id": "...",
    "correct_streak": 3,
    "is_mastered": false,
    "next_review_at": "..."
  }
]

# 学習進捗更新
PATCH /rest/v1/vocabulary_progress?id=eq.{progress_id}
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "correct_streak": 3,
  "is_mastered": false,
  "next_review_at": "2026-03-26T12:00:00Z"
}

Response: 200 OK
```

#### 3.1.6 ライティング関連

```bash
# 問題一覧取得
GET /rest/v1/writing_prompts?select=*&order=difficulty.asc
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "topic": "環境問題",
    "description": "環境保全について...",
    "word_limit": 150,
    "difficulty": 3,
    "created_at": "..."
  }
]

# 提出を記録
POST /rest/v1/writing_submissions
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "user_id": "{user_id}",
  "prompt_id": "{prompt_id}",
  "content": "環境問題について...",
  "score_content": 3,
  "score_structure": 3,
  "score_vocabulary": 2,
  "score_grammar": 3,
  "total_score": 11,
  "feedback": "構成が良い...",
  "model_answer": "環境保全は..."
}

Response: 201 Created
```

### 3.2 Claude API

#### 3.2.1 シャドーイング評価

```bash
POST https://api.anthropic.com/v1/messages
Content-Type: application/json
Authorization: Bearer {claude_api_key}

{
  "model": "claude-opus-4-6",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "英文「The cat sat on the mat」を「ザ キャット サット オン ザ マット」と読みました。評価してください。"
    }
  ]
}

Response: 200 OK
{
  "content": [
    {
      "type": "text",
      "text": "発音: 8/10\nリズム: 7/10\n正確性: 9/10\nフィードバック: ..."
    }
  ]
}
```

#### 3.2.2 ライティング採点

```bash
POST https://api.anthropic.com/v1/messages
Content-Type: application/json
Authorization: Bearer {claude_api_key}

{
  "model": "claude-opus-4-6",
  "max_tokens": 2048,
  "messages": [
    {
      "role": "user",
      "content": "次の英語エッセイを採点してください。\n\n[エッセイ内容]\n\n採点基準:\n1. 内容（Content）: 0-4点\n2. 構成（Structure）: 0-4点\n3. 語彙（Vocabulary）: 0-4点\n4. 文法（Grammar）: 0-4点"
    }
  ]
}

Response: 200 OK
{
  "content": [
    {
      "type": "text",
      "text": "内容: 3/4\n構成: 3/4\n語彙: 2/4\n文法: 3/4\nコメント: ..."
    }
  ]
}
```

### 3.3 Whisper API

#### 3.3.1 音声認識

```bash
POST https://api.openai.com/v1/audio/transcriptions
Authorization: Bearer {whisper_api_key}

multipart/form-data:
- file: {audio_file}
- model: whisper-1
- language: en

Response: 200 OK
{
  "text": "The cat sat on the mat"
}
```

---

## 4. セキュリティモデル

### 4.1 認証フロー

```
┌─────────────┐
│   User      │
└─────┬───────┘
      │
      ├──> ログイン画面
      │    メール + パスワード入力
      │
      ├──> Supabase Auth API
      │    POST /auth/v1/token
      │
      ├──> JWT生成
      │    access_token: 有効期限1時間
      │    refresh_token: 有効期限7日
      │
      ├──> localStorage保存
      │    キー: supabase.auth.token
      │
      └──> 認証完了
           クライアント側でJWT検証
           すべてのAPI呼び出しにBearerトークン付与
```

### 4.2 RLS (Row Level Security)

#### パターン1: ユーザー自身のデータのみアクセス

```sql
-- 例: profiles テーブル
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

#### パターン2: 認証ユーザー全体がアクセス可能

```sql
-- 例: listening_questions テーブル
CREATE POLICY "All authenticated users can read questions" ON listening_questions
  FOR SELECT USING (auth.role() = 'authenticated');
```

#### パターン3: 関連レコード経由のアクセス

```sql
-- 例: shadowing_records テーブル
CREATE POLICY "Users can read own shadowing records" ON shadowing_records
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM listening_attempts
                  WHERE id = shadowing_records.attempt_id)
  );
```

### 4.3 トークン管理

| トークンタイプ | 有効期限 | 用途 | 保存場所 |
|--------|--------|------|---------|
| Access Token | 1時間 | API呼び出し | localStorage |
| Refresh Token | 7日 | Access Token更新 | localStorage |
| ID Token | 1時間 | ユーザー識別 | メモリ |

```typescript
// トークン保存例
localStorage.setItem('supabase.auth.token', JSON.stringify({
  access_token: '...',
  refresh_token: '...',
  expires_in: 3600,
  expires_at: Date.now() + 3600000
}));

// トークン更新例
const response = await fetch('https://xxx.supabase.co/auth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'refresh_token',
    refresh_token: storedRefreshToken
  })
});
```

### 4.4 API キー管理

```
.env.local (開発環境)
├── EXPO_PUBLIC_SUPABASE_URL
├── EXPO_PUBLIC_SUPABASE_ANON_KEY (公開可能)
├── EXPO_PUBLIC_CLAUDE_API_KEY (内部通信)
└── EXPO_PUBLIC_WHISPER_API_KEY (内部通信)

.env (本番環境 - GitIgnore)
├── SUPABASE_SERVICE_ROLE_SECRET (サーバーサイドのみ)
└── その他の機密情報
```

### 4.5 CORS設定

Supabase プロジェクト設定 > API > CORS:

```json
{
  "allowed_origins": [
    "http://localhost:*",
    "https://eigomaster.app",
    "https://*.vercel.app"
  ]
}
```

### 4.6 セキュリティベストプラクティス

| 項目 | 実装状況 | 説明 |
|------|--------|------|
| **HTTPS通信** | ✅ | すべての通信をHTTPS化 |
| **JWT暗号化** | ✅ | Supabase Authで暗号化管理 |
| **RLS有効化** | ✅ | すべてのテーブルで有効 |
| **環境変数分離** | ✅ | 開発・本番で分離 |
| **API キーローテーション** | ⚠️ | 90日ごと推奨 |
| **レート制限** | ⚠️ | API呼び出し制限設定推奨 |
| **監査ログ** | ⚠️ | Supabaseログ監視推奨 |

---

## 5. セットアップガイド

### 5.1 開発環境構築

#### 前提条件

```bash
# Node.js 18以上
node --version

# npm 9以上
npm --version

# git
git --version
```

#### ステップ1: リポジトリクローン

```bash
git clone https://github.com/your-repo/eigomaster.git
cd eigomaster
```

#### ステップ2: 依存関係のインストール

```bash
npm install
```

#### ステップ3: Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「新しいプロジェクトを作成」
3. 以下を設定:
   - プロジェクト名: `eigomaster-dev`
   - リージョン: 東京 (ap-northeast-1)
   - データベースパスワード: 強力なパスワード設定

#### ステップ4: 環境変数設定

`.env.local` ファイルを作成:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Claude API (オプション)
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-xxx

# Whisper API (オプション)
EXPO_PUBLIC_WHISPER_API_KEY=sk-xxx
```

#### ステップ5: Supabase DBセットアップ

```bash
# Supabase ダッシュボード → SQL Editor を開く
# 以下のスクリプトを実行:
```

```sql
-- supabase/migrations/001_initial_schema.sql の内容をコピー
-- (詳細はファイルを参照)
```

#### ステップ6: サンプルデータ投入

```sql
-- 単語データ
INSERT INTO vocabulary_words (word, meaning, stage, difficulty, example_sentence)
VALUES
  ('abandon', '放棄する', 1, 2, 'He abandoned his dreams.'),
  ('ability', '能力', 1, 1, 'She has great ability.'),
  ...;

-- 問題データ
INSERT INTO listening_questions (title, audio_url, script, choices, correct_answer, difficulty)
VALUES
  (
    'Question 1',
    'https://example.com/audio1.mp3',
    'The text of the question...',
    '["A", "B", "C", "D"]'::jsonb,
    0,
    1
  ),
  ...;

-- ライティング問題
INSERT INTO writing_prompts (topic, description, word_limit, difficulty)
VALUES
  ('環境問題', '環境保全の重要性について論じてください', 150, 3),
  ...;
```

#### ステップ7: 開発サーバー起動

```bash
# Web版
npm run web

# iOS シミュレータ
npm run ios

# Android エミュレータ
npm run android
```

### 5.2 Supabase詳細設定

#### 5.2.1 認証設定

1. Supabase Dashboard → Authentication → Providers
2. 「Email」が有効になっていることを確認
3. メールテンプレートをカスタマイズ（オプション）

#### 5.2.2 ストレージ設定

```bash
# Supabase Dashboard → Storage

# バケット作成:
- audio-files (公開)
- writing-images (公開)
- user-submissions (非公開)
```

#### 5.2.3 RLS ポリシー有効化

```sql
-- 各テーブルで RLS を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
```

### 5.3 本番環境デプロイ

#### デプロイターゲット

| ターゲット | 対応度 | 手順 |
|----------|------|------|
| **Expo Go** | ✅ 開発用 | `npm start` → QRコードスキャン |
| **EAS Build** | ✅ 推奨 | `eas build --platform ios/android` |
| **App Store** | ✅ | TestFlight → App Store申請 |
| **Google Play** | ✅ | 内部テスト → リリース |
| **Web (Vercel)** | ✅ | `vercel deploy` |

#### EASビルド手順

```bash
# 1. EAS CLIインストール
npm install -g eas-cli

# 2. ログイン
eas login

# 3. ビルド設定初期化
eas build:configure

# 4. iOS ビルド
eas build --platform ios --profile preview

# 5. Android ビルド
eas build --platform android --profile preview

# 6. 本番ビルド
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## 6. API仕様書

### 6.1 Supabase認証API

#### 6.1.1 ユーザー登録

**エンドポイント**:
```
POST /auth/v1/signup
```

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "data": {
    "display_name": "John Doe",
    "role": "student"
  }
}
```

**レスポンス** (201 Created):
```json
{
  "user": {
    "id": "12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "phone": null,
    "last_sign_in_at": "2026-03-19T12:00:00Z",
    "app_metadata": {
      "provider": "email",
      "providers": ["email"]
    },
    "user_metadata": {
      "display_name": "John Doe",
      "role": "student"
    },
    "identities": [
      {
        "id": "12345678-1234-1234-1234-123456789012",
        "user_id": "12345678-1234-1234-1234-123456789012",
        "identity_data": {
          "email": "user@example.com"
        },
        "provider": "email",
        "created_at": "2026-03-19T12:00:00Z",
        "last_sign_in_at": "2026-03-19T12:00:00Z",
        "identity_count": 1
      }
    ],
    "created_at": "2026-03-19T12:00:00Z",
    "updated_at": "2026-03-19T12:00:00Z"
  },
  "session": {
    "provider_token": null,
    "provider_refresh_token": null,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_value",
    "expires_in": 3600,
    "expires_at": 1711000800,
    "token_type": "bearer",
    "user": {
      "id": "12345678-1234-1234-1234-123456789012",
      "email": "user@example.com"
    }
  }
}
```

#### 6.1.2 ログイン

**エンドポイント**:
```
POST /auth/v1/token?grant_type=password
```

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**レスポンス** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_value",
  "user": {
    "id": "12345678-1234-1234-1234-123456789012",
    "email": "user@example.com"
  }
}
```

#### 6.1.3 トークン更新

**エンドポイント**:
```
POST /auth/v1/token?grant_type=refresh_token
```

**リクエスト**:
```json
{
  "refresh_token": "refresh_token_value"
}
```

**レスポンス** (200 OK):
```json
{
  "access_token": "new_access_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "new_refresh_token",
  "user": { ... }
}
```

### 6.2 リスニング機能API

#### 6.2.1 問題一覧取得

**エンドポイント**:
```
GET /rest/v1/listening_questions?select=*&order=difficulty.asc&limit=50
Authorization: Bearer {access_token}
```

**パラメータ**:
| パラメータ | 説明 | 例 |
|----------|------|-----|
| select | 取得カラム | `*` または `id,title,difficulty` |
| order | ソート順 | `difficulty.asc`, `created_at.desc` |
| limit | 取得件数 | `50` |
| offset | スキップ行数 | `0` |

**レスポンス** (200 OK):
```json
[
  {
    "id": "question-id-1",
    "title": "Question 1: Daily Conversation",
    "audio_url": "https://example.com/audio1.mp3",
    "script": "A: How are you? B: I'm fine, thanks.",
    "choices": ["Good", "Fine", "Happy", "Excited"],
    "correct_answer": 1,
    "difficulty": 1,
    "category_id": "cat-1",
    "is_public": true,
    "created_at": "2026-03-19T10:00:00Z"
  },
  ...
]
```

#### 6.2.2 特定問題取得

**エンドポイント**:
```
GET /rest/v1/listening_questions?select=*&id=eq.{question_id}
Authorization: Bearer {access_token}
```

**レスポンス** (200 OK):
```json
[{
  "id": "question-id-1",
  "title": "Question 1: Daily Conversation",
  ...
}]
```

#### 6.2.3 試行記録

**エンドポイント**:
```
POST /rest/v1/listening_attempts
Content-Type: application/json
Authorization: Bearer {access_token}
```

**リクエスト**:
```json
{
  "user_id": "user-id",
  "question_id": "question-id-1",
  "selected_answer": 1,
  "is_correct": true
}
```

**レスポンス** (201 Created):
```json
{
  "id": "attempt-id-1",
  "user_id": "user-id",
  "question_id": "question-id-1",
  "selected_answer": 1,
  "is_correct": true,
  "created_at": "2026-03-19T12:00:00Z"
}
```

### 6.3 単語学習API

#### 6.3.1 ステージ別単語取得

**エンドポイント**:
```
GET /rest/v1/vocabulary_words?select=*&stage=eq.{stage}&order=id.asc
Authorization: Bearer {access_token}
```

**レスポンス** (200 OK):
```json
[
  {
    "id": "word-id-1",
    "word": "abandon",
    "meaning": "放棄する",
    "reading": "əbǽndən",
    "part_of_speech": "verb",
    "example_sentence": "He abandoned his dreams.",
    "example_translation": "彼は夢を放棄した。",
    "stage": 1,
    "difficulty": 2,
    "frequency_rank": 1234,
    "created_at": "2026-03-19T10:00:00Z"
  },
  ...
]
```

#### 6.3.2 学習進捗更新

**エンドポイント**:
```
PATCH /rest/v1/vocabulary_progress?id=eq.{progress_id}
Content-Type: application/json
Authorization: Bearer {access_token}
```

**リクエスト**:
```json
{
  "correct_streak": 3,
  "is_mastered": false,
  "next_review_at": "2026-03-26T12:00:00Z",
  "last_reviewed_at": "2026-03-19T12:00:00Z"
}
```

**レスポンス** (200 OK):
```json
{
  "id": "progress-id-1",
  "user_id": "user-id",
  "word_id": "word-id-1",
  "correct_streak": 3,
  "is_mastered": false,
  "next_review_at": "2026-03-26T12:00:00Z",
  "last_reviewed_at": "2026-03-19T12:00:00Z",
  "created_at": "2026-03-19T10:00:00Z"
}
```

### 6.4 ライティング機能API

#### 6.4.1 問題一覧取得

**エンドポイント**:
```
GET /rest/v1/writing_prompts?select=*&order=difficulty.asc
Authorization: Bearer {access_token}
```

**レスポンス** (200 OK):
```json
[
  {
    "id": "prompt-id-1",
    "topic": "環境問題",
    "description": "環境保全の重要性について論じてください",
    "word_limit": 150,
    "difficulty": 3,
    "category": "社会問題",
    "time_limit_minutes": 30,
    "is_public": true,
    "created_at": "2026-03-19T10:00:00Z"
  },
  ...
]
```

#### 6.4.2 提出を記録

**エンドポイント**:
```
POST /rest/v1/writing_submissions
Content-Type: application/json
Authorization: Bearer {access_token}
```

**リクエスト**:
```json
{
  "user_id": "user-id",
  "prompt_id": "prompt-id-1",
  "content": "環境問題は現代社会の重大な課題です...",
  "score_content": 3,
  "score_structure": 3,
  "score_vocabulary": 2,
  "score_grammar": 3,
  "total_score": 11,
  "feedback": "構成が良く、論理的です...",
  "model_answer": "環境保全は..."
}
```

**レスポンス** (201 Created):
```json
{
  "id": "submission-id-1",
  "user_id": "user-id",
  "prompt_id": "prompt-id-1",
  "content": "環境問題は現代社会の重大な課題です...",
  "score_content": 3,
  "score_structure": 3,
  "score_vocabulary": 2,
  "score_grammar": 3,
  "total_score": 11,
  "feedback": "構成が良く、論理的です...",
  "model_answer": "環境保全は...",
  "created_at": "2026-03-19T12:00:00Z"
}
```

### 6.5 エラーハンドリング

#### エラーレスポンス形式

```json
{
  "code": "PGRST...",
  "message": "Table 'users' does not exist",
  "details": "Hint: Perhaps you meant to reference the table \"public.profiles\".",
  "hint": null
}
```

#### 一般的なエラーコード

| ステータス | エラーコード | 説明 |
|----------|-----------|------|
| 400 | PGRST400 | 不正なリクエスト |
| 401 | PGRST401 | 認証エラー (トークン無効) |
| 403 | PGRST403 | 権限なし (RLS拒否) |
| 404 | PGRST404 | リソース未検出 |
| 409 | PGRST409 | コンフリクト (一意制約違反) |
| 500 | PGRST500 | サーバーエラー |

---

## 7. 運用ガイド

### 7.1 塾管理者向けセットアップ

#### 7.1.1 アカウント作成

1. アプリを開く
2. 「新規登録」をタップ
3. メール・パスワード入力
4. ロール選択: **講師**
5. クラス名・学校名を入力
6. 「クラスを作成」をタップ

#### 7.1.2 学生招待

1. ホーム画面 → 設定タブ
2. 「クラスコードを表示」をタップ
3. コードをコピー
4. 学生に共有（QRコード/メール）

#### 7.1.3 問題・単語の登録

```typescript
// 問題追加例
const addQuestion = async (data: {
  title: string;
  audio_url: string;
  script: string;
  choices: string[];
  correct_answer: number;
  difficulty: number;
}) => {
  const { data: result, error } = await supabase
    .from('listening_questions')
    .insert([data]);

  if (error) console.error('エラー:', error);
  return result;
};
```

### 7.2 トラブルシューティング

#### 問題1: ログインできない

**症状**: メール/パスワード入力後、エラー表示

**解決手順**:
1. メールアドレスが正しいか確認
2. パスワードを3回間違えていないか確認
3. 「パスワードをリセット」をタップ
4. メール受信フォルダを確認
5. それでも駄目な場合: Supabase Dashboard で ユーザー状態確認

#### 問題2: 音声が再生されない

**症状**: 「再生する」ボタンをクリックしても音が出ない

**デバッグ方法**:
1. ブラウザの開発者ツール (F12) を開く
2. Console タブを確認
3. Network タブで音声ファイルのリクエストを確認
4. CORS エラーが表示されていないか確認
5. 音量設定を確認

**一般的な原因と対策**:
| 原因 | 対策 |
|------|------|
| CORS エラー | CDN設定を確認、crossOrigin='anonymous' |
| 音声ファイルが404 | URL が正しいか確認 |
| ネットワーク遅い | 再読み込みを試す、ネットワーク接続確認 |
| ブラウザ音量ミュート | ブラウザ音量を上げる |

#### 問題3: データベース接続エラー

**症状**: 「データベースに接続できません」エラー

**解決手順**:
1. Supabase ダッシュボードにログイン
2. Project Status を確認
3. データベースがアクティブか確認
4. API キー(.env.local)が正しいか再確認
5. CORS 設定を確認

### 7.3 バックアップ・リカバリ

#### 7.3.1 データベースバックアップ

```bash
# Supabase Dashboard → Database → Backups
# 自動バックアップ: 毎日実行（無料プラン）
# 手動バックアップ: いつでも作成可能
```

#### 7.3.2 ユーザーデータエクスポート

```sql
-- すべてのユーザー関連データをCSV出力
COPY (
  SELECT
    p.id, p.email, p.display_name, p.role,
    COUNT(DISTINCT vp.id) as vocabulary_learned,
    COUNT(DISTINCT la.id) as listening_attempts,
    COUNT(DISTINCT ws.id) as writing_submitted
  FROM profiles p
  LEFT JOIN vocabulary_progress vp ON p.id = vp.user_id
  LEFT JOIN listening_attempts la ON p.id = la.user_id
  LEFT JOIN writing_submissions ws ON p.id = ws.user_id
  GROUP BY p.id
) TO STDOUT WITH CSV HEADER;
```

#### 7.3.3 リカバリ手順

```bash
# 1. バックアップから復元（Supabase Dashboard）
# 2. 復元後、アプリはキャッシュをクリア
# 3. ユーザーに再ログインを指示

# キャッシュクリア方法
localStorage.clear(); // ブラウザ
// または アプリ設定 → アプリ情報 → ストレージを消去（モバイル）
```

### 7.4 パフォーマンス監視

#### 7.4.1 メトリクス確認

| メトリクス | 目標値 | 確認方法 |
|----------|-------|---------|
| **API応答時間** | < 3秒 | Supabase Dashboard → Real-time |
| **エラー率** | < 1% | 同上 |
| **ユーザー並行数** | 無制限 | 同上 |
| **データベースサイズ** | < 500MB | Project Settings → Database |
| **ストレージ使用量** | < 100GB | Project Settings → Storage |

#### 7.4.2 ログ監視

```bash
# Supabase ダッシュボード → Logs
# 最近のリクエストを確認
# エラーログを確認
```

### 7.5 セキュリティ管理

#### 7.5.1 API キーローテーション

```bash
# 推奨: 90日ごと

# 1. Supabase Dashboard → Project Settings → API
# 2. "Regenerate" をクリック
# 3. 新しいキーを.env.localに設定
# 4. 古いキーを削除
```

#### 7.5.2 RLS ポリシー確認

```sql
-- すべてのテーブルで RLS が有効化されているか確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

#### 7.5.3 監査ログ確認

```sql
-- Supabase ダッシュボード → Database → Webhooks
-- または PostgreSQL ログで確認
```

---

## 8. ユーザーマニュアル

### 8.1 学生向けガイド

#### 8.1.1 最初のステップ

**ステップ1: アカウント作成**

1. アプリを起動
2. 「新規登録」をタップ
3. メールアドレスとパスワードを入力
4. 「登録」をタップ
5. 確認メールを確認（迷惑フォルダも確認）
6. リンクをクリックして確認完了

**ステップ2: クラスに参加**

1. ホーム画面で「クラスコードを入力」をタップ
2. 講師から受け取ったコードを入力
3. 「参加」をタップ
4. クラス参加完了

#### 8.1.2 機能ガイド

##### 単語学習

```
【ホーム】
  ↓
【単語タブ】
  ↓
【Stage 1～20から選択】
  ↓
【4択問題が表示される】
  ↓
【答えを選択】
  ↓
【正誤判定】
  ↓
【進捗表示】
```

**ポイント**:
- 3回連続正解で「修得」判定
- SM-2アルゴリズムで最適な復習タイミング自動計算
- 結果画面で詳細な統計表示

##### リスニング学習

```
【リスニングタブ】
  ↓
【難易度別問題一覧から選択】
  ↓
【「再生する」ボタンをクリック】
  ↓
【音声が再生（速度調整可能）】
  ↓
【4択で回答】
  ↓
【「シャドーイングを始める」を選択】
```

**再生速度調整**:
| ボタン | 速度 |
|-------|------|
| 0.5x | 超スロー（リスニング練習用） |
| 0.75x | スロー（発音確認用） |
| 1.0x | 標準（英検準1級と同速） |
| 1.25x | 高速 |
| 1.5x | 超高速 |

##### シャドーイング

```
【リスニング回答後】
  ↓
【「シャドーイング開始」をタップ】
  ↓
【Round 1-7を実施】
  各ラウンド:
  1. 音声再生（自動）
  2. 「録音開始」をタップ
  3. 7秒間読み上げ
  4. 「送信」をタップ
  5. AI評価表示
  ↓
【7ラウンド完了】
  ↓
【結果グラフ表示】
  （各ラウンドのスコア推移を可視化）
```

**スコア内訳**:
| スコア | 説明 | 評価基準 |
|-------|------|--------|
| **正確性** | 0-10 | 文字起こしとの一致度 |
| **リズム** | 0-10 | 英語らしいリズム感 |
| **発音** | 0-10 | 各音の発音精度 |

##### ライティング

```
【ライティングタブ】
  ↓
【問題を選択】
  ↓
【2つの入力方法から選択】

  方法1: テキスト入力
  - キーボードで直接入力

  方法2: 手書き
  - カメラで用紙を撮影
  - 手書き→テキスト変換
  ↓
【「提出」をタップ】
  ↓
【AI採点結果表示】
  - 4観点のスコア
  - 詳細フィードバック
  - 修正提案
  - 模範解答
```

#### 8.1.3 よくある質問

**Q: 単語が修得にならない**
A: SM-2アルゴリズムで計算されます
- 3回連続正解: 修得判定
- 1回間違える: カウンターリセット
- 復習タイミングは自動計算されます

**Q: シャドーイングの評価が低い**
A: 以下を試してください
1. 音声をもう一度よく聴く
2. 他のRoundで改善状況を確認
3. 苦手な音を講師に相談

**Q: ライティングの添削内容に納得できない**
A: 講師に相談してください
- 詳細フィードバックを確認
- 修正提案を参考に修正
- 講師から個別指導を受ける

### 8.2 講師向けガイド

#### 8.2.1 クラス管理

##### クラス作成

```
【設定】
  ↓
【「クラスを作成」をタップ】
  ↓
【クラス名・学校名を入力】
  ↓
【「作成」をタップ】
  ↓
【クラスコード自動生成】
  ↓
【学生に共有】
```

##### 学生進捗確認

```
【ホーム】
  ↓
【「学生の進捗」をタップ】
  ↓
【学生一覧が表示】
  - 各学生の学習時間
  - 完了した単語数
  - リスニング試行回数
  - ライティング提出数
  ↓
【学生をタップすると詳細表示】
  - 各機能の詳細統計
  - グラフで可視化
```

#### 8.2.2 コンテンツ管理

##### 問題・単語の追加

**リスニング問題追加**:
```
【設定】
  ↓
【「コンテンツ管理」をタップ】
  ↓
【「リスニング問題を追加」をタップ】
  ↓
【以下を入力】
  - タイトル
  - 音声ファイル（URL）
  - 台本（スクリプト）
  - 選択肢（A,B,C,D）
  - 正解番号
  - 難易度
  ↓
【「保存」をタップ】
```

**単語追加**:
```
【設定】
  ↓
【「単語管理」をタップ】
  ↓
【「単語を追加」をタップ】
  ↓
【以下を入力】
  - 英単語
  - 日本語訳
  - 例文
  - ステージ
  - 難易度
  ↓
【「保存」をタップ】
```

#### 8.2.3 添削管理

```
【ホーム】
  ↓
【「ライティング添削」をタップ】
  ↓
【未添削の提出一覧表示】
  ↓
【提出をタップ】
  ↓
【内容を確認】
  ↓
【AI自動採点結果を確認】
  ↓
【追加フィードバック入力（オプション）】
  ↓
【「確認」をタップ】
  ↓
【学生に通知送信】
```

#### 8.2.4 統計レポート

```
【設定】
  ↓
【「統計レポート」をタップ】
  ↓
【期間を選択】
  - 今週
  - 今月
  - カスタム
  ↓
【各機能別の統計表示】
  - リスニング: 平均正解率、実施回数
  - 単語: 修得数、復習数
  - ライティング: 平均スコア、提出数
  - シャドーイング: 平均スコア推移
```

#### 8.2.5 よくある質問

**Q: 学生が問題を見つけられない**
A:
1. 「公開」フラグが有効か確認
2. クラスが正しく設定されているか確認
3. 学生のクラス参加を確認

**Q: AI採点結果を修正したい**
A:
1. 手動フィードバック追加ボタンをクリック
2. 修正内容を入力
3. 学生に通知

**Q: 大量の問題を一度に追加したい**
A:
1. CSVファイルを準備
2. 「インポート」ボタンをクリック
3. ファイルをアップロード
4. マッピング確認
5. インポート実行

---

## 付録

### A. トラブルシューティングチェックリスト

```
[ ] ネットワーク接続を確認
[ ] ブラウザキャッシュをクリア
[ ] 開発者ツール (F12) でコンソール確認
[ ] .env.local ファイル設定確認
[ ] Supabase プロジェクト状態確認
[ ] API キー有効性確認
[ ] データベーススキーマ確認
[ ] RLS ポリシー確認
[ ] 認証トークン有効性確認
[ ] CORS 設定確認
```

### B. 環境変数リファレンス

```bash
# 開発環境
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
EXPO_PUBLIC_WHISPER_API_KEY=sk-...

# 本番環境 (.env に設定)
SUPABASE_SERVICE_ROLE_SECRET=eyJ...
API_LOG_LEVEL=info
SENTRY_DSN=https://...
```

### C. 有用なリンク

| リソース | URL |
|---------|-----|
| **Expo ドキュメント** | https://docs.expo.dev |
| **Supabase ドキュメント** | https://supabase.com/docs |
| **React Native ドキュメント** | https://reactnative.dev/docs |
| **TypeScript ハンドブック** | https://www.typescriptlang.org/docs |
| **Claude API ドキュメント** | https://docs.anthropic.com |

### D. サポート連絡先

| 問題カテゴリ | 連絡先 |
|----------|-------|
| **Expo 関連** | https://github.com/expo/expo/issues |
| **Supabase 関連** | https://github.com/supabase/supabase/issues |
| **アプリ関連** | your-support@example.com |

---

**ドキュメント作成日**: 2026-03-19
**最終更新**: 2026-03-19
**バージョン**: 1.0.0
