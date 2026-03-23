/**
 * 分析結果の統計集計・分析エンジン
 * ユーザー像・使用目的の集計と分析
 */

import { AnalysisResult } from './analyzeTranscription';

interface AggregationData {
  [key: string]: {
    count: number;
    percentage: number;
  };
}

interface AggregationResult {
  // ユーザー像集計
  personas: {
    age_groups: AggregationData;
    goals: AggregationData;
    challenges: AggregationData;
    motivations: AggregationData;
  };

  // 使用目的集計
  usage_purposes: {
    primary: AggregationData;
    secondary: AggregationData;
    session_focus: AggregationData;
    frequency: AggregationData;
  };

  // キーワード集計
  top_keywords: Array<{
    keyword: string;
    frequency: number;
    percentage: number;
  }>;

  // メタ情報
  total_transcriptions: number;
  analyzed_count: number;
  analysis_date: Date;
  confidence_avg: number;

  // セグメント分析
  segments: Array<{
    id: string;
    name: string;
    count: number;
    percentage: number;
    characteristics: string[];
  }>;
}

/**
 * 分析結果を集計
 */
function aggregateAnalyses(analyses: AnalysisResult[]): AggregationResult {
  const total = analyses.length;
  const validAnalyses = analyses.filter((a) => a && a.persona);
  const analyzed = validAnalyses.length;

  // 集計ヘルパー関数
  const countOccurrences = (values: (string | undefined)[]): AggregationData => {
    const counts: { [key: string]: number } = {};

    for (const value of values) {
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }

    const result: AggregationData = {};
    for (const [key, count] of Object.entries(counts)) {
      result[key] = {
        count,
        percentage: (count / analyzed) * 100,
      };
    }

    return result;
  };

  const countMultiple = (
    itemsArray: (string[] | undefined)[]
  ): AggregationData => {
    const counts: { [key: string]: number } = {};

    for (const items of itemsArray) {
      if (items && Array.isArray(items)) {
        for (const item of items) {
          counts[item] = (counts[item] || 0) + 1;
        }
      }
    }

    const result: AggregationData = {};
    for (const [key, count] of Object.entries(counts)) {
      result[key] = {
        count,
        percentage: (count / analyzed) * 100,
      };
    }

    return result;
  };

  // ユーザー像の集計
  const ageGroups = countOccurrences(
    validAnalyses.map((a) => a.persona.age_group)
  );
  const goals = countOccurrences(validAnalyses.map((a) => a.persona.goal));
  const challenges = countMultiple(
    validAnalyses.map((a) => a.persona.challenge)
  );
  const motivations = countOccurrences(
    validAnalyses.map((a) => a.persona.motivation)
  );

  // 使用目的の集計
  const primaryPurposes = countOccurrences(
    validAnalyses.map((a) => a.usage_purpose.primary)
  );
  const secondaryPurposes = countMultiple(
    validAnalyses.map((a) => a.usage_purpose.secondary)
  );
  const sessionFocus = countMultiple(
    validAnalyses.map((a) => a.usage_purpose.session_focus)
  );
  const frequencies = countOccurrences(
    validAnalyses.map((a) => a.usage_purpose.frequency)
  );

  // キーワード集計
  const keywordCounts: { [key: string]: number } = {};
  for (const analysis of validAnalyses) {
    if (analysis.key_phrases && Array.isArray(analysis.key_phrases)) {
      for (const phrase of analysis.key_phrases) {
        keywordCounts[phrase] = (keywordCounts[phrase] || 0) + 1;
      }
    }
  }

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([keyword, frequency]) => ({
      keyword,
      frequency,
      percentage: (frequency / analyzed) * 100,
    }));

  // 信頼度の平均
  const confidenceAvg =
    validAnalyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyzed;

  // セグメント分析：主要なペルソナ・目的の組み合わせ
  const segmentMap = new Map<string, Set<number>>();

  for (let i = 0; i < validAnalyses.length; i++) {
    const analysis = validAnalyses[i];
    const ageGroup = analysis.persona.age_group || 'Unknown';
    const goal = analysis.persona.goal || 'Unknown';
    const key = `${ageGroup}|${goal}`;

    if (!segmentMap.has(key)) {
      segmentMap.set(key, new Set());
    }
    segmentMap.get(key)!.add(i);
  }

  const segments = Array.from(segmentMap.entries())
    .map(([key, indices]) => {
      const [ageGroup, goal] = key.split('|');
      const count = indices.size;
      const characteristics: string[] = [];

      // セグメント内の共通の特徴を抽出
      const segmentAnalyses = Array.from(indices).map((i) => validAnalyses[i]);

      // 主要な課題
      const challengeMap: { [key: string]: number } = {};
      for (const analysis of segmentAnalyses) {
        if (analysis.persona.challenge) {
          for (const challenge of analysis.persona.challenge) {
            challengeMap[challenge] = (challengeMap[challenge] || 0) + 1;
          }
        }
      }

      const topChallenges = Object.entries(challengeMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([challenge]) => challenge);

      characteristics.push(...topChallenges);

      // 主要なセッションフォーカス
      const focusMap: { [key: string]: number } = {};
      for (const analysis of segmentAnalyses) {
        if (analysis.usage_purpose.session_focus) {
          for (const focus of analysis.usage_purpose.session_focus) {
            focusMap[focus] = (focusMap[focus] || 0) + 1;
          }
        }
      }

      const topFocus = Object.entries(focusMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([focus]) => focus);

      characteristics.push(...topFocus);

      return {
        id: `segment_${key.replace(/[|:]/g, '_')}`,
        name: `${ageGroup} - ${goal}`,
        count,
        percentage: (count / analyzed) * 100,
        characteristics: Array.from(new Set(characteristics)),
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // 上位5セグメント

  return {
    personas: {
      age_groups: ageGroups,
      goals,
      challenges,
      motivations,
    },
    usage_purposes: {
      primary: primaryPurposes,
      secondary: secondaryPurposes,
      session_focus: sessionFocus,
      frequency: frequencies,
    },
    top_keywords: topKeywords,
    total_transcriptions: total,
    analyzed_count: analyzed,
    analysis_date: new Date(),
    confidence_avg: confidenceAvg,
    segments,
  };
}

/**
 * 集計結果をフォーマットして表示
 */
function formatAggregation(result: AggregationResult): string {
  const lines: string[] = [];

  lines.push('=== Analysis Aggregation Report ===\n');
  lines.push(`Generated: ${result.analysis_date.toISOString()}`);
  lines.push(`Total Transcriptions: ${result.total_transcriptions}`);
  lines.push(`Analyzed: ${result.analyzed_count}`);
  lines.push(`Average Confidence: ${result.confidence_avg.toFixed(2)}\n`);

  // ユーザー像
  lines.push('--- Personas ---');
  lines.push('Age Groups:');
  for (const [group, data] of Object.entries(result.personas.age_groups)) {
    lines.push(`  ${group}: ${data.count} (${data.percentage.toFixed(1)}%)`);
  }

  lines.push('\nGoals:');
  for (const [goal, data] of Object.entries(result.personas.goals)) {
    lines.push(`  ${goal}: ${data.count} (${data.percentage.toFixed(1)}%)`);
  }

  // 使用目的
  lines.push('\n--- Usage Purposes ---');
  lines.push('Session Focus:');
  for (const [focus, data] of Object.entries(result.usage_purposes.session_focus)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)) {
    lines.push(`  ${focus}: ${data.count} (${data.percentage.toFixed(1)}%)`);
  }

  // キーワード
  lines.push('\n--- Top Keywords ---');
  for (const keyword of result.top_keywords.slice(0, 10)) {
    lines.push(
      `  ${keyword.keyword}: ${keyword.frequency} (${keyword.percentage.toFixed(1)}%)`
    );
  }

  // セグメント
  lines.push('\n--- Customer Segments ---');
  for (const segment of result.segments) {
    lines.push(`${segment.name} (${segment.percentage.toFixed(1)}%)`);
    lines.push(`  Characteristics: ${segment.characteristics.join(', ')}`);
  }

  return lines.join('\n');
}

export { aggregateAnalyses, formatAggregation, AggregationResult };
