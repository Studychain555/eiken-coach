/**
 * AI スコアリング・添削サービス
 * Claude API を使用
 * エラーハンドリング・リトライ機能付き
 */

import { debugError, debugLog } from './debugUtils';
import {
  handleError,
  safeJsonParse,
  withRetry,
  ErrorType,
} from './errorHandler';

export interface ScoringResult {
  accuracyScore: number; // 0-10
  rhythmScore: number; // 0-10
  pronunciationScore: number; // 0-10
  feedback: string;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
}

const TAG = 'AIScoringService';
const API_TIMEOUT = 15000; // 15秒

/**
 * Whisper で文字起こしした音読を Claude で評価
 * リトライとフォールバック付き
 */
export async function scoreShaddowingRecording(
  originalScript: string,
  transcript: string,
  roundNumber: number,
  apiKey?: string
): Promise<ScoringResult> {
  // API キーがない場合はダミースコアを返す
  if (!apiKey) {
    debugLog(TAG, 'No API key provided, returning dummy score');
    return generateDummyScore(originalScript, transcript, roundNumber);
  }

  try {
    return await withRetry(
      () =>
        callClaudeAPI(
          originalScript,
          transcript,
          roundNumber,
          apiKey
        ),
      {
        maxAttempts: 2,
        delayMs: 1000,
        tag: TAG,
      }
    );
  } catch (error) {
    debugError(TAG, 'Failed to score shadowing recording', {
      error: error instanceof Error ? error.message : error,
      roundNumber,
    });
    return generateDummyScore(originalScript, transcript, roundNumber);
  }
}

/**
 * Claude API への実際の呼び出し
 */
async function callClaudeAPI(
  originalScript: string,
  transcript: string,
  roundNumber: number,
  apiKey: string
): Promise<ScoringResult> {
  const prompt = `
You are an English pronunciation and listening expert. Evaluate the following shadowing (repetition) exercise.

Original Script:
${originalScript}

Student's Transcription:
${transcript}

Round: ${roundNumber}/7

Please evaluate the student's shadowing attempt on these criteria (scale 0-10):
1. **Accuracy** (正確性): How closely does the transcription match the original script?
2. **Rhythm** (リズム): Is the rhythm and pacing appropriate?
3. **Pronunciation** (発音): Are the individual words pronounced correctly?

Provide your response in JSON format:
{
  "accuracyScore": <number 0-10>,
  "rhythmScore": <number 0-10>,
  "pronunciationScore": <number 0-10>,
  "feedback": "<overall feedback in Japanese>",
  "corrections": [
    {
      "original": "<correct phrase>",
      "corrected": "<student's version>",
      "explanation": "<why it was wrong>"
    }
  ]
}
`;

  debugLog(TAG, 'Calling Claude API', {
    roundNumber,
    scriptLength: originalScript.length,
  });

  // API 呼び出しをタイムアウト付きで実行
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = handleError(
        `Claude API error: ${response.status} ${response.statusText}`,
        TAG,
        { errorText, roundNumber }
      );
      throw new Error(error.message);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      handleError(
        `Failed to parse Claude API response`,
        TAG,
        { parseError }
      );
      throw parseError;
    }

    // レスポンスの検証
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid Claude API response format');
    }

    const content = data.content[0].text;
    if (!content || typeof content !== 'string') {
      throw new Error('Claude API returned empty content');
    }

    // JSON を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      debugError(TAG, 'Failed to extract JSON from Claude response', {
        content: content.substring(0, 200),
      });
      throw new Error('Could not extract JSON from response');
    }

    // JSON をパース
    const result = safeJsonParse(jsonMatch[0], null, TAG);
    if (!result) {
      throw new Error('Invalid JSON in Claude response');
    }

    // スコアの検証と正規化
    const normalizeScore = (score: any, max: number = 10): number => {
      const num = typeof score === 'number' ? score : 5;
      return Math.min(max, Math.max(0, num));
    };

    return {
      accuracyScore: normalizeScore(result.accuracyScore),
      rhythmScore: normalizeScore(result.rhythmScore),
      pronunciationScore: normalizeScore(result.pronunciationScore),
      feedback: result.feedback || 'フィードバックが生成されませんでした',
      corrections: Array.isArray(result.corrections) ? result.corrections : [],
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * ライティング提出を採点・添削
 * エラーハンドリング・リトライ機能付き
 */
export async function scoreWritingSubmission(
  topic: string,
  studentEssay: string,
  apiKey?: string
): Promise<{
  contentScore: number;
  structureScore: number;
  vocabularyScore: number;
  grammarScore: number;
  totalScore: number;
  feedback: string;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  modelAnswer: string;
}> {
  if (!apiKey) {
    debugLog(TAG, 'No API key provided, returning dummy writing score');
    return generateDummyWritingScore(topic, studentEssay);
  }

  try {
    return await withRetry(
      () => callWritingEvaluationAPI(topic, studentEssay, apiKey),
      {
        maxAttempts: 2,
        delayMs: 1000,
        tag: TAG,
      }
    );
  } catch (error) {
    debugError(TAG, 'Failed to score writing submission', {
      error: error instanceof Error ? error.message : error,
      essayLength: studentEssay.length,
    });
    return generateDummyWritingScore(topic, studentEssay);
  }
}

/**
 * ライティング評価 API の実際の呼び出し
 */
async function callWritingEvaluationAPI(
  topic: string,
  studentEssay: string,
  apiKey: string
): Promise<{
  contentScore: number;
  structureScore: number;
  vocabularyScore: number;
  grammarScore: number;
  totalScore: number;
  feedback: string;
  corrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  modelAnswer: string;
}> {
  const prompt = `
You are an English writing teacher specialized in EIKEN Pre-1 (英検準1級) level essays.

Essay Topic:
${topic}

Student's Essay:
${studentEssay}

Please evaluate the essay on these criteria (scale 0-4):
1. **Content** (内容): Does it address the topic effectively?
2. **Organization** (構成): Is it well-structured?
3. **Vocabulary** (語彙): Is appropriate vocabulary used?
4. **Grammar** (文法): Is the grammar correct?

Provide response in JSON:
{
  "contentScore": <0-4>,
  "structureScore": <0-4>,
  "vocabularyScore": <0-4>,
  "grammarScore": <0-4>,
  "totalScore": <0-16>,
  "feedback": "<overall feedback in Japanese>",
  "corrections": [
    {
      "original": "<incorrect phrase>",
      "corrected": "<correct version>",
      "explanation": "<why>"
    }
  ],
  "modelAnswer": "<sample answer showing good structure and content>"
}
`;

  debugLog(TAG, 'Calling writing evaluation API', {
    topicLength: topic.length,
    essayLength: studentEssay.length,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = handleError(
        `Writing evaluation API error: ${response.status}`,
        TAG,
        { errorText }
      );
      throw new Error(error.message);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      handleError('Failed to parse writing evaluation response', TAG, {
        parseError,
      });
      throw parseError;
    }

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Invalid response format from writing evaluation API');
    }

    const content = data.content[0].text;
    if (!content || typeof content !== 'string') {
      throw new Error('Writing evaluation API returned empty content');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      debugError(TAG, 'Failed to extract JSON from writing evaluation', {
        content: content.substring(0, 200),
      });
      throw new Error('Could not extract JSON from writing evaluation');
    }

    const result = safeJsonParse(jsonMatch[0], null, TAG);
    if (!result) {
      throw new Error('Invalid JSON in writing evaluation response');
    }

    // スコアの検証と正規化
    const normalizeWritingScore = (score: any, max: number): number => {
      const num = typeof score === 'number' ? score : 2;
      return Math.min(max, Math.max(0, num));
    };

    const contentScore = normalizeWritingScore(result.contentScore, 4);
    const structureScore = normalizeWritingScore(result.structureScore, 4);
    const vocabularyScore = normalizeWritingScore(result.vocabularyScore, 4);
    const grammarScore = normalizeWritingScore(result.grammarScore, 4);

    return {
      contentScore,
      structureScore,
      vocabularyScore,
      grammarScore,
      totalScore: contentScore + structureScore + vocabularyScore + grammarScore,
      feedback: result.feedback || 'フィードバックがありません',
      corrections: Array.isArray(result.corrections) ? result.corrections : [],
      modelAnswer: result.modelAnswer || '',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ダミースコア生成関数（デモ用）
function generateDummyScore(
  script: string,
  transcript: string,
  roundNumber: number
): ScoringResult {
  // ラウンドが進むにつれてスコアが上がる
  const baseScore = 4 + roundNumber;
  const variance = Math.random() * 2 - 1;

  return {
    accuracyScore: Math.min(10, Math.max(0, baseScore + variance)),
    rhythmScore: Math.min(10, Math.max(0, baseScore + variance)),
    pronunciationScore: Math.min(10, Math.max(0, baseScore + variance)),
    feedback: `ラウンド${roundNumber}の音読評価です。${
      roundNumber < 4
        ? 'もっと正確に話しましょう。'
        : roundNumber < 7
        ? 'だいぶ良くなってきました！'
        : '素晴らしい進歩です！'
    }`,
    corrections: [
      {
        original: script.split(' ')[0] || 'word',
        corrected: transcript.split(' ')[0] || 'word',
        explanation: '発音に注意しましょう',
      },
    ],
  };
}

function generateDummyWritingScore(
  topic: string,
  essay: string
): ReturnType<typeof scoreWritingSubmission> {
  const score = Math.floor(Math.random() * 4) + 1;

  return {
    contentScore: score,
    structureScore: score,
    vocabularyScore: score,
    grammarScore: score,
    totalScore: score * 4,
    feedback: 'これはダミーの評価です。実際の評価にはAPI キーが必要です。',
    corrections: [],
    modelAnswer: `Sample answer about ${topic}. This is a model response.`,
  };
}
