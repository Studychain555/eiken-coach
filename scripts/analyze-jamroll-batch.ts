#!/usr/bin/env node

/**
 * jamroll データの一括分析スクリプト
 * Supabase からデータを取得 → Claude で分析 → キャッシング
 */

import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { analyzeTranscription } from '../src/lib/analyzeTranscription';
import { cacheManager } from '../src/lib/analysisCache';

interface TranscriptionRecord {
  id: string;
  transcription_id: string;
  transcript_text: string;
  session_type: string;
  recorded_at: string;
}

interface BatchAnalysisOptions {
  batchSize?: number;
  limit?: number;
  force?: boolean;
  outputFile?: string;
}

/**
 * ログ出力
 */
function log(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

/**
 * 未分析のトランスクリプションを取得
 */
async function fetchUnanalyzedTranscriptions(
  supabase: SupabaseClient,
  limit: number = 100
): Promise<TranscriptionRecord[]> {
  log('INFO', `Supabase から未分析データを取得中（最大${limit}件）...`);

  const { data, error } = await supabase
    .from('jamroll_transcriptions')
    .select('*')
    .not('id', 'in', `(select transcription_id from user_analysis_cache)`)
    .limit(limit);

  if (error) {
    throw new Error(`Supabase query error: ${error.message}`);
  }

  log('INFO', `未分析データ: ${data?.length || 0}件`);
  return data || [];
}

/**
 * 分析結果を Supabase に保存
 */
async function saveAnalysisToSupabase(
  supabase: SupabaseClient,
  transcriptionId: string,
  analysis: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_analysis_cache')
      .insert({
        transcription_id: transcriptionId,
        extracted_persona: analysis.persona,
        extracted_purpose: analysis.usage_purpose,
        keywords: analysis.key_phrases || [],
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        analysis_model: 'claude-opus-4-6',
        analyzed_at: new Date().toISOString(),
      });

    if (error) {
      log('WARN', `保存エラー (${transcriptionId}): ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    log('ERROR', `予期しないエラー: ${(error as Error).message}`);
    return false;
  }
}

/**
 * バッチ分析を実行
 */
async function runBatchAnalysis(
  options: BatchAnalysisOptions = {}
): Promise<void> {
  const {
    batchSize = 5,
    limit = 100,
    force = false,
    outputFile = '/tmp/analysis_batch_result.json',
  } = options;

  // 環境変数チェック
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    log('ERROR', '必要な環境変数が未設定');
    process.exit(1);
  }

  // Supabase クライアント初期化
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 分析対象を取得
  const transcriptions = await fetchUnanalyzedTranscriptions(supabase, limit);

  if (transcriptions.length === 0) {
    log('INFO', '分析対象のデータがありません');
    return;
  }

  // バッチ処理
  const results = {
    total: transcriptions.length,
    succeeded: 0,
    failed: 0,
    analyses: [] as any[],
    startTime: new Date(),
  };

  for (let i = 0; i < transcriptions.length; i += batchSize) {
    const batch = transcriptions.slice(i, Math.min(i + batchSize, transcriptions.length));
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(transcriptions.length / batchSize);

    log('INFO', `バッチ ${batchNum}/${totalBatches} を処理中...`);

    const batchPromises = batch.map(async (record) => {
      try {
        log('INFO', `分析中: ${record.transcription_id}`);

        // Claude で分析
        const analysis = await analyzeTranscription(record.transcript_text);

        // キャッシュに保存
        cacheManager.set(record.id, analysis);

        // Supabase に保存
        const saved = await saveAnalysisToSupabase(
          supabase,
          record.id,
          analysis
        );

        if (saved) {
          results.succeeded++;
          results.analyses.push({
            transcription_id: record.transcription_id,
            analysis,
          });
        } else {
          results.failed++;
        }

        return true;
      } catch (error) {
        log('ERROR', `分析失敗 (${record.transcription_id}): ${(error as Error).message}`);
        results.failed++;
        return false;
      }
    });

    // バッチの実行
    await Promise.all(batchPromises);

    // バッチ間のディレイ（レート制限対策）
    if (i + batchSize < transcriptions.length) {
      log('INFO', '2秒待機中...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    log('INFO', `進捗: ${i + batch.length}/${transcriptions.length}`);
  }

  results.endTime = new Date();

  // 結果をファイルに保存
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

  // 統計表示
  log('INFO', '=== バッチ分析完了 ===');
  log('INFO', `成功: ${results.succeeded}件`);
  log('INFO', `失敗: ${results.failed}件`);
  log('INFO', `結果ファイル: ${outputFile}`);
  log(
    'INFO',
    `処理時間: ${((results.endTime as any) - (results.startTime as any)) / 1000}秒`
  );
}

// メイン実行
const args = process.argv.slice(2);
const options: BatchAnalysisOptions = {
  batchSize: 5,
  limit: 100,
  force: false,
};

// CLI パラメータをパース
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--batch-size' && args[i + 1]) {
    options.batchSize = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--force') {
    options.force = true;
  } else if (args[i] === '--output' && args[i + 1]) {
    options.outputFile = args[i + 1];
    i++;
  }
}

runBatchAnalysis(options).catch((error) => {
  log('ERROR', `スクリプト実行失敗: ${(error as Error).message}`);
  process.exit(1);
});
