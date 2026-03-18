/**
 * AI スコアリング・添削サービス
 * Claude API を使用
 */

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

/**
 * Whisper で文字起こしした音読を Claude で評価
 */
export async function scoreShaddowingRecording(
  originalScript: string,
  transcript: string,
  roundNumber: number,
  apiKey?: string
): Promise<ScoringResult> {
  // API キーがない場合はダミースコアを返す
  if (!apiKey) {
    return generateDummyScore(originalScript, transcript, roundNumber);
  }

  try {
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

    // Claude API に送信
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
    });

    if (!response.ok) {
      console.error('Claude API error:', response.statusText);
      return generateDummyScore(originalScript, transcript, roundNumber);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // JSON を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateDummyScore(originalScript, transcript, roundNumber);
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      accuracyScore: Math.min(10, Math.max(0, result.accuracyScore || 5)),
      rhythmScore: Math.min(10, Math.max(0, result.rhythmScore || 5)),
      pronunciationScore: Math.min(10, Math.max(0, result.pronunciationScore || 5)),
      feedback: result.feedback || 'フィードバックが生成されませんでした',
      corrections: result.corrections || [],
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return generateDummyScore(originalScript, transcript, roundNumber);
  }
}

/**
 * ライティング提出を採点・添削
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
    return generateDummyWritingScore(topic, studentEssay);
  }

  try {
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
    });

    if (!response.ok) {
      return generateDummyWritingScore(topic, studentEssay);
    }

    const data = await response.json();
    const content = data.content[0].text;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateDummyWritingScore(topic, studentEssay);
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      contentScore: Math.min(4, Math.max(0, result.contentScore || 2)),
      structureScore: Math.min(4, Math.max(0, result.structureScore || 2)),
      vocabularyScore: Math.min(4, Math.max(0, result.vocabularyScore || 2)),
      grammarScore: Math.min(4, Math.max(0, result.grammarScore || 2)),
      totalScore:
        Math.min(4, Math.max(0, result.contentScore || 2)) +
        Math.min(4, Math.max(0, result.structureScore || 2)) +
        Math.min(4, Math.max(0, result.vocabularyScore || 2)) +
        Math.min(4, Math.max(0, result.grammarScore || 2)),
      feedback: result.feedback || 'フィードバックがありません',
      corrections: result.corrections || [],
      modelAnswer: result.modelAnswer || '',
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return generateDummyWritingScore(topic, studentEssay);
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
