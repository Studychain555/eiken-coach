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

    const typedResult = result as any;
    return {
      accuracyScore: normalizeScore(typedResult.accuracyScore),
      rhythmScore: normalizeScore(typedResult.rhythmScore),
      pronunciationScore: normalizeScore(typedResult.pronunciationScore),
      feedback: typedResult.feedback || 'フィードバックが生成されませんでした',
      corrections: Array.isArray(typedResult.corrections) ? typedResult.corrections : [],
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
    return await generateDummyWritingScore(topic, studentEssay);
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

    const typedResult = result as any;
    const contentScore = normalizeWritingScore(typedResult.contentScore, 4);
    const structureScore = normalizeWritingScore(typedResult.structureScore, 4);
    const vocabularyScore = normalizeWritingScore(typedResult.vocabularyScore, 4);
    const grammarScore = normalizeWritingScore(typedResult.grammarScore, 4);

    return {
      contentScore,
      structureScore,
      vocabularyScore,
      grammarScore,
      totalScore: contentScore + structureScore + vocabularyScore + grammarScore,
      feedback: typedResult.feedback || 'フィードバックがありません',
      corrections: Array.isArray(typedResult.corrections) ? typedResult.corrections : [],
      modelAnswer: typedResult.modelAnswer || '',
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
  // スクリプトと転写内容を比較して具体的なフィードバックを生成
  const scriptWords = script.toLowerCase().split(/\s+/);
  const transcriptWords = transcript.toLowerCase().split(/\s+/);

  // 一致率を計算（簡易版）
  let matchCount = 0;
  for (let i = 0; i < Math.min(scriptWords.length, transcriptWords.length); i++) {
    if (scriptWords[i] === transcriptWords[i]) {
      matchCount++;
    }
  }

  const accuracyRate = scriptWords.length > 0
    ? (matchCount / scriptWords.length) * 100
    : 0;

  // ラウンドが進むにつれてスコアが上がる（精度も反映）
  const baseScore = 3 + roundNumber + (accuracyRate / 20);
  const variance = Math.random() * 1.5 - 0.75;

  const accuracyScore = Math.min(10, Math.max(0, baseScore + variance));
  const rhythmScore = Math.min(10, Math.max(0, baseScore + variance * 0.8));
  const pronunciationScore = Math.min(10, Math.max(0, baseScore + variance * 0.7));

  // スクリプトと異なる単語を見つける
  const corrections = findDifferences(script, transcript);

  // スコアに基づいた具体的なフィードバックを生成
  const feedback = generateSpecificFeedback(
    accuracyScore,
    rhythmScore,
    pronunciationScore,
    roundNumber,
    scriptWords.length,
    transcriptWords.length,
    corrections
  );

  return {
    accuracyScore,
    rhythmScore,
    pronunciationScore,
    feedback,
    corrections,
  };
}

/**
 * スクリプトと転写の違いを見つけて、修正提案を生成
 */
function findDifferences(
  script: string,
  transcript: string
): Array<{ original: string; corrected: string; explanation: string }> {
  const scriptWords = script.split(/\s+/).filter(w => w);
  const transcriptWords = transcript.split(/\s+/).filter(w => w);
  const corrections: Array<{ original: string; corrected: string; explanation: string }> = [];

  // 最初の3つの異なる単語を見つける
  let diffCount = 0;
  for (let i = 0; i < Math.min(scriptWords.length, transcriptWords.length) && diffCount < 3; i++) {
    if (scriptWords[i].toLowerCase() !== transcriptWords[i].toLowerCase()) {
      corrections.push({
        original: scriptWords[i],
        corrected: transcriptWords[i],
        explanation: `"${scriptWords[i]}" の発音をもう一度確認してください。`,
      });
      diffCount++;
    }
  }

  // 長さが大きく異なる場合は注意
  if (Math.abs(scriptWords.length - transcriptWords.length) > 2) {
    const reason = scriptWords.length > transcriptWords.length
      ? 'いくつかの単語を抜かしてしまいました'
      : '追加の単語が含まれています';
    if (corrections.length > 0) {
      corrections[0].explanation += `。また、${reason}。`;
    } else {
      corrections.push({
        original: '全体',
        corrected: '確認要',
        explanation: reason,
      });
    }
  }

  // フォールバック
  if (corrections.length === 0) {
    corrections.push({
      original: scriptWords[0] || 'word',
      corrected: transcriptWords[0] || 'word',
      explanation: 'より自然な流暢さを心がけてください。',
    });
  }

  return corrections;
}

/**
 * スコアに基づいた具体的なフィードバックを生成
 */
function generateSpecificFeedback(
  accuracyScore: number,
  rhythmScore: number,
  pronunciationScore: number,
  roundNumber: number,
  scriptWordCount: number,
  transcriptWordCount: number,
  corrections: Array<{ original: string; corrected: string; explanation: string }>
): string {
  const overallScore = (accuracyScore + rhythmScore + pronunciationScore) / 3;
  const feedbackParts: string[] = [];

  // ラウンド番号による進捗メッセージ
  feedbackParts.push(`【ラウンド${roundNumber}の詳細評価】\n`);

  // 正確性に関するフィードバック
  if (accuracyScore >= 8) {
    feedbackParts.push('✅ 正確性: スクリプトにほぼ完全に一致しています。素晴らしい！');
  } else if (accuracyScore >= 6) {
    feedbackParts.push(`✓ 正確性: ${Math.round(accuracyScore * 10)}% の正確さです。もう少し細部に注意を払いましょう。`);
    if (corrections.length > 0) {
      feedbackParts.push(`特に「${corrections[0].original}」の部分を確認してください。`);
    }
  } else if (accuracyScore >= 4) {
    feedbackParts.push(`△ 正確性: ${Math.round(accuracyScore * 10)}% の正確さです。いくつかの単語の発音に改善の余地があります。`);
  } else {
    feedbackParts.push(`✗ 正確性: スクリプトとの一致度が低いです。もう一度ゆっくり聞いて、丁寧に繰り返してください。`);
  }

  // リズムに関するフィードバック
  if (rhythmScore >= 7) {
    feedbackParts.push('🎵 リズム: 流暢で自然なリズムです。');
  } else if (rhythmScore >= 5) {
    feedbackParts.push('🎵 リズム: リズムはまあまあです。もう少し速度を調整するといいでしょう。');
  } else {
    feedbackParts.push('🎵 リズム: リズムが不安定です。スクリプトの音声を何度も聞いて、パターンを学びましょう。');
  }

  // 発音に関するフィードバック
  if (pronunciationScore >= 7) {
    feedbackParts.push('🗣️ 発音: 個々の単語の発音が正確です。');
  } else if (pronunciationScore >= 5) {
    feedbackParts.push('🗣️ 発音: 大体の発音は正しいですが、いくつかの音が不正確です。');
  } else {
    feedbackParts.push('🗣️ 発音: 発音を改善する余地があります。各単語を個別に練習してみてください。');
  }

  // 単語数の不一致に関するフィードバック
  if (Math.abs(scriptWordCount - transcriptWordCount) > 3) {
    feedbackParts.push(`\n⚠️ 注意: スクリプトは${scriptWordCount}語ですが、発話は${transcriptWordCount}語です。スクリプト全体を発話するように心がけてください。`);
  }

  // 全体的なアドバイス
  feedbackParts.push('\n💡 アドバイス: ');
  if (overallScore >= 7.5) {
    feedbackParts.push('素晴らしい進歩です！このままのペースで続けてください。');
  } else if (overallScore >= 5.5) {
    feedbackParts.push('着実に上達しています。もう少し練習を重ねると、もっと良くなるでしょう。');
  } else {
    feedbackParts.push('基礎の定着に時間をかけることをお勧めします。ゆっくりでいいので、正確な発音を心がけましょう。');
  }

  // ラウンド進行に応じた励まし
  if (roundNumber <= 3) {
    feedbackParts.push('ラウンド3までは基本を固める段階です。焦らず丁寧に。');
  } else if (roundNumber <= 5) {
    feedbackParts.push('後半に向けて速度を上げていく準備ができてきましたね。');
  } else {
    feedbackParts.push('最後のラウンドに向けて、流暢さを意識してみてください。');
  }

  return feedbackParts.join('\n');
}

async function generateDummyWritingScore(
  topic: string,
  essay: string
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
