-- jamroll 文字起こしデータ & 分析テーブル設計
-- EigoMaster Supabase プロジェクト用

-- ============================================================================
-- TABLE 1: jamroll_transcriptions
-- 目的: jamroll から取得した文字起こしテキストを保存
-- ============================================================================

CREATE TABLE IF NOT EXISTS jamroll_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id TEXT UNIQUE NOT NULL,  -- jamroll API の transcription ID
  session_type VARCHAR(50) NOT NULL,       -- "sales_call", "lesson", "consultation", "unknown"
  transcript_text TEXT NOT NULL,           -- 文字起こしテキスト本文
  duration_minutes INT DEFAULT 0,          -- セッション時間（分）
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- 記録日時

  -- メタデータ（拡張対応）
  metadata JSONB DEFAULT '{}',             -- 追加情報（speaker_count, language など）

  -- 標準カラム
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- インデックス用
  _hash TEXT GENERATED ALWAYS AS (md5(transcript_text)) STORED  -- 重複検出用
);

-- インデックス
CREATE INDEX idx_jamroll_transcriptions_recorded_at
  ON jamroll_transcriptions(recorded_at DESC);
CREATE INDEX idx_jamroll_transcriptions_session_type
  ON jamroll_transcriptions(session_type);
CREATE INDEX idx_jamroll_transcriptions_transcription_id
  ON jamroll_transcriptions(transcription_id);
CREATE INDEX idx_jamroll_transcriptions_hash
  ON jamroll_transcriptions(_hash);

-- RLS: SELECT は全員、INSERT/UPDATE は認証済みのみ
ALTER TABLE jamroll_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jamroll_transcriptions_select_all"
  ON jamroll_transcriptions FOR SELECT
  USING (true);

CREATE POLICY "jamroll_transcriptions_insert_auth"
  ON jamroll_transcriptions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "jamroll_transcriptions_update_auth"
  ON jamroll_transcriptions FOR UPDATE
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE 2: user_analysis_cache
-- 目的: Claude API による文字起こし分析結果をキャッシング
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id UUID NOT NULL REFERENCES jamroll_transcriptions(id) ON DELETE CASCADE,

  -- 抽出されたユーザー像（構造化データ）
  extracted_persona JSONB NOT NULL,        -- { age_group, goal, challenge[], motivation }

  -- 抽出された使用目的（構造化データ）
  extracted_purpose JSONB NOT NULL,        -- { primary, secondary[], frequency, session_focus[] }

  -- キーワード抽出
  keywords TEXT[] NOT NULL DEFAULT '{}',   -- ["キーワード1", "キーワード2", ...]

  -- センチメント分析
  sentiment VARCHAR(20) DEFAULT 'neutral', -- "positive", "neutral", "negative"
  sentiment_score FLOAT DEFAULT 0.0,       -- -1.0 ~ 1.0

  -- 分析信頼度
  confidence FLOAT DEFAULT 0.0,            -- 0.0 ~ 1.0

  -- 分析プロンプト・モデル情報
  analysis_prompt_version INT DEFAULT 1,   -- プロンプトバージョン管理
  analysis_model VARCHAR(50) DEFAULT 'claude-opus-4-6',  -- 使用したモデル

  -- タイムスタンプ
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day',  -- キャッシュ有効期限

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_analysis_cache_transcription_id
  ON user_analysis_cache(transcription_id);
CREATE INDEX idx_user_analysis_cache_analyzed_at
  ON user_analysis_cache(analyzed_at DESC);
CREATE INDEX idx_user_analysis_cache_expires_at
  ON user_analysis_cache(expires_at);

-- RLS
ALTER TABLE user_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_analysis_cache_select_all"
  ON user_analysis_cache FOR SELECT
  USING (true);

CREATE POLICY "user_analysis_cache_insert_auth"
  ON user_analysis_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE 3: analysis_aggregations
-- 目的: ユーザー像・使用目的の集計結果をキャッシング
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 集計期間
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,

  -- 集計結果（JSON）
  personas_summary JSONB NOT NULL,          -- { age_groups: {...}, goals: {...}, ... }
  usage_purposes_summary JSONB NOT NULL,    -- { primary: {...}, session_focus: {...}, ... }
  top_keywords JSONB NOT NULL,              -- [{ keyword, frequency }, ...]

  -- 集計統計
  total_transcriptions INT DEFAULT 0,
  analyzed_count INT DEFAULT 0,
  confidence_avg FLOAT DEFAULT 0.0,

  -- キャッシュ有効期限
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_analysis_aggregations_period
  ON analysis_aggregations(period_from, period_to);
CREATE INDEX idx_analysis_aggregations_expires_at
  ON analysis_aggregations(expires_at);

-- RLS
ALTER TABLE analysis_aggregations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_aggregations_select_all"
  ON analysis_aggregations FOR SELECT
  USING (true);

CREATE POLICY "analysis_aggregations_insert_auth"
  ON analysis_aggregations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE 4: analysis_reports
-- 目的: 生成されたレポートの記録・管理
-- ============================================================================

CREATE TABLE IF NOT EXISTS analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- レポート情報
  report_type VARCHAR(50) NOT NULL,        -- "markdown", "json", "dashboard"
  report_title TEXT NOT NULL,
  report_summary TEXT,

  -- 対象期間
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,

  -- レポート内容
  report_content TEXT NOT NULL,            -- Markdown / JSON

  -- メタデータ
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_analysis_reports_created_at
  ON analysis_reports(created_at DESC);
CREATE INDEX idx_analysis_reports_period
  ON analysis_reports(period_from, period_to);

-- RLS
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_reports_select_all"
  ON analysis_reports FOR SELECT
  USING (true);

CREATE POLICY "analysis_reports_insert_auth"
  ON analysis_reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- 関数: 有効期限切れキャッシュを削除
CREATE OR REPLACE FUNCTION cleanup_expired_caches()
RETURNS void AS $$
BEGIN
  DELETE FROM user_analysis_cache
  WHERE expires_at < NOW();

  DELETE FROM analysis_aggregations
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 関数: 集計統計を計算
CREATE OR REPLACE FUNCTION calculate_analysis_stats(
  p_period_from DATE,
  p_period_to DATE
)
RETURNS TABLE (
  total_transcriptions INT,
  analyzed_count INT,
  confidence_avg FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT jt.id)::INT as total_transcriptions,
    COUNT(DISTINCT uac.id)::INT as analyzed_count,
    COALESCE(AVG(uac.confidence), 0.0)::FLOAT as confidence_avg
  FROM jamroll_transcriptions jt
  LEFT JOIN user_analysis_cache uac ON jt.id = uac.transcription_id
  WHERE jt.recorded_at >= p_period_from
    AND jt.recorded_at < p_period_to + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED / SAMPLE DATA (オプション)
-- ============================================================================

-- 初期テストデータ（コメントアウト）
-- INSERT INTO jamroll_transcriptions
--   (transcription_id, session_type, transcript_text, duration_minutes, recorded_at)
-- VALUES
--   (
--     'test_001',
--     'sales_call',
--     '英検準1級の対策をしたいです。シャドーイング機能があるか教えてください。',
--     15,
--     NOW() - INTERVAL '1 day'
--   );
