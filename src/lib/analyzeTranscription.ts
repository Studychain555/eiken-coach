/**
 * Claude API を使用した文字起こし分析エンジン
 * ユーザー像・使用目的・センチメント を抽出
 */

import Anthropic from '@anthropic-ai/sdk';

interface PersonaAnalysis {
  age_group?: string;
  goal?: string;
  challenge?: string[];
  motivation?: string;
}

interface UsagePurposeAnalysis {
  primary?: string;
  secondary?: string[];
  frequency?: string;
  session_focus?: string[];
}

interface AnalysisResult {
  persona: PersonaAnalysis;
  usage_purpose: UsagePurposeAnalysis;
  sentiment?: 'positive' | 'neutral' | 'negative';
  key_phrases?: string[];
  confidence?: number;
}

/**
 * Claude API を使用して文字起こしを分析
 */
async function analyzeTranscription(
  transcriptText: string,
  modelId: string = 'claude-opus-4-6'
): Promise<AnalysisResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // 分析プロンプト
  const systemPrompt = `You are an expert in language analysis and user intent extraction.
Analyze the following transcription from an English language tutoring/coaching session and extract:
1. User persona: age group, learning goal, challenges, motivation
2. Usage purpose: primary purpose, secondary purposes, learning frequency, session focus areas
3. Sentiment: overall emotional tone (positive, neutral, negative)
4. Key phrases: important keywords related to English learning

Return a valid JSON object with the following structure (no markdown formatting):
{
  "persona": {
    "age_group": "string (e.g., 'middle school', 'high school', 'university', 'adult')",
    "goal": "string (e.g., 'English proficiency', 'exam preparation', 'business English')",
    "challenge": ["array of challenges"],
    "motivation": "string (e.g., 'exam', 'career', 'travel')"
  },
  "usage_purpose": {
    "primary": "string",
    "secondary": ["array"],
    "frequency": "string (e.g., 'weekly', 'daily', 'twice weekly')",
    "session_focus": ["array of focus areas"]
  },
  "sentiment": "positive|neutral|negative",
  "key_phrases": ["array of key phrases"],
  "confidence": 0.0-1.0
}

Be precise and extract only information that is explicitly mentioned or strongly implied in the transcript.
If information is missing, use null values.`;

  const userPrompt = `Analyze this transcription from an English tutoring session:

"""
${transcriptText}
"""

Extract user persona, usage purpose, sentiment, and key phrases. Return only valid JSON.`;

  try {
    const response = await client.messages.create({
      model: modelId,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // テキストレスポンスを抽出
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // JSON を解析
    // Claude は ```json ... ``` でラップすることがあるため、それに対応
    let jsonText = textContent.text;
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const result = JSON.parse(jsonText) as AnalysisResult;

    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse Claude response as JSON:', error);
      throw new Error(`JSON parse error in Claude response: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 複数の文字起こしを並列分析
 */
async function analyzeTranscriptionsParallel(
  transcripts: string[],
  batchSize: number = 5,
  modelId: string = 'claude-opus-4-6'
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  // バッチ処理（レート制限対応）
  for (let i = 0; i < transcripts.length; i += batchSize) {
    const batch = transcripts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((transcript) => analyzeTranscription(transcript, modelId))
    );
    results.push(...batchResults);

    // バッチ間に遅延（レート制限対策）
    if (i + batchSize < transcripts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export { analyzeTranscription, analyzeTranscriptionsParallel, AnalysisResult };
