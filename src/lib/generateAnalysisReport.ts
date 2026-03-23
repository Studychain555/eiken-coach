/**
 * 分析結果レポート生成エンジン
 * Markdown形式のレポートとJSON形式のデータを出力
 */

import { AggregationResult } from './aggregateAnalysis';

interface ReportSection {
  title: string;
  content: string;
}

/**
 * Markdownレポートを生成
 */
function generateMarkdownReport(
  result: AggregationResult,
  periodFrom: Date,
  periodTo: Date,
  projectName: string = 'EigoMaster'
): string {
  const sections: ReportSection[] = [];

  // タイトル・サマリー
  sections.push({
    title: 'Summary',
    content: `
## jamroll 分析レポート - ${projectName} ユーザー分析

**生成日**: ${result.analysis_date.toISOString().split('T')[0]}
**分析期間**: ${periodFrom.toISOString().split('T')[0]} ~ ${periodTo.toISOString().split('T')[0]}

- 文字起こし総数: ${result.total_transcriptions}件
- 分析成功: ${result.analyzed_count}件
- 分析成功率: ${((result.analyzed_count / result.total_transcriptions) * 100).toFixed(1)}%
- 平均信頼度: ${result.confidence_avg.toFixed(2)}
    `,
  });

  // ユーザー像セクション
  let personaContent = '## ユーザー像（Personas）\n\n';

  // 年齢層
  personaContent += '### 年齢層分布\n\n';
  personaContent += '| 年齢層 | 件数 | 比率 |\n';
  personaContent += '|------|------|-----|\n';
  for (const [group, data] of Object.entries(result.personas.age_groups).sort(
    ([, a], [, b]) => b.count - a.count
  )) {
    personaContent += `| ${group} | ${data.count} | ${data.percentage.toFixed(1)}% |\n`;
  }

  // 学習目的
  personaContent += '\n### 学習目的\n\n';
  personaContent += '| 目的 | 件数 | 比率 |\n';
  personaContent += '|-----|------|-----|\n';
  for (const [goal, data] of Object.entries(result.personas.goals).sort(
    ([, a], [, b]) => b.count - a.count
  )) {
    personaContent += `| ${goal} | ${data.count} | ${data.percentage.toFixed(1)}% |\n`;
  }

  // 学習課題
  personaContent += '\n### 学習課題（頻度順）\n\n';
  for (const [challenge, data] of Object.entries(result.personas.challenges)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)) {
    personaContent += `- ${challenge}: ${data.percentage.toFixed(1)}%\n`;
  }

  // モチベーション
  if (Object.keys(result.personas.motivations).length > 0) {
    personaContent += '\n### モチベーション\n\n';
    for (const [motivation, data] of Object.entries(
      result.personas.motivations
    ).sort(([, a], [, b]) => b.count - a.count)) {
      personaContent += `- ${motivation}: ${data.percentage.toFixed(1)}%\n`;
    }
  }

  sections.push({
    title: 'Personas',
    content: personaContent,
  });

  // 使用目的セクション
  let purposeContent = '## 使用目的の内訳\n\n';

  // セッションフォーカス
  purposeContent += '### セッション内容フォーカス（実施頻度順）\n\n';
  purposeContent += '| フォーカス | 件数 | 比率 |\n';
  purposeContent += '|----------|------|-----|\n';
  for (const [focus, data] of Object.entries(result.usage_purposes.session_focus)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)) {
    purposeContent += `| ${focus} | ${data.count} | ${data.percentage.toFixed(1)}% |\n`;
  }

  // 学習頻度
  if (Object.keys(result.usage_purposes.frequency).length > 0) {
    purposeContent += '\n### 学習頻度\n\n';
    purposeContent += '| 頻度 | 件数 | 比率 |\n';
    purposeContent += '|-----|------|-----|\n';
    for (const [frequency, data] of Object.entries(
      result.usage_purposes.frequency
    ).sort(([, a], [, b]) => b.count - a.count)) {
      purposeContent += `| ${frequency} | ${data.count} | ${data.percentage.toFixed(1)}% |\n`;
    }
  }

  sections.push({
    title: 'UsagePurposes',
    content: purposeContent,
  });

  // インサイトセクション
  let insightContent = '## 主要インサイト\n\n';
  const topAge = Object.entries(result.personas.age_groups).sort(
    ([, a], [, b]) => b.count - a.count
  )[0];
  const topGoal = Object.entries(result.personas.goals).sort(
    ([, a], [, b]) => b.count - a.count
  )[0];
  const topFocus = Object.entries(result.usage_purposes.session_focus).sort(
    ([, a], [, b]) => b.count - a.count
  )[0];

  if (topAge) {
    insightContent += `1. **主要年齢層は${topAge[0]}** (${topAge[1].percentage.toFixed(1)}%)\n`;
    insightContent += `   - このセグメントをターゲット化すべき\n\n`;
  }

  if (topGoal) {
    insightContent += `2. **主要学習目的は「${topGoal[0]}」** (${topGoal[1].percentage.toFixed(1)}%)\n`;
    insightContent += `   - ${topGoal[0]}関連の機能・コンテンツを強調すべき\n\n`;
  }

  if (topFocus) {
    insightContent += `3. **${topFocus[0]}需要が高い** (${topFocus[1].percentage.toFixed(1)}%)\n`;
    insightContent += `   - このセッション内容の充実化が継続率向上に効果的\n\n`;
  }

  sections.push({
    title: 'Insights',
    content: insightContent,
  });

  // 顧客セグメントセクション
  let segmentContent = '## 顧客セグメント\n\n';
  for (const segment of result.segments.slice(0, 5)) {
    segmentContent += `### Segment: ${segment.name}\n`;
    segmentContent += `- **シェア**: ${segment.percentage.toFixed(1)}% (${segment.count}件)\n`;
    segmentContent += `- **特徴**: ${segment.characteristics.join(', ')}\n\n`;
  }

  sections.push({
    title: 'Segments',
    content: segmentContent,
  });

  // キーワードセクション
  let keywordContent = '## 主要キーワード（頻出順）\n\n';
  for (const keyword of result.top_keywords.slice(0, 15)) {
    keywordContent += `- ${keyword.keyword}: ${keyword.frequency}件 (${keyword.percentage.toFixed(1)}%)\n`;
  }

  sections.push({
    title: 'Keywords',
    content: keywordContent,
  });

  // 全セクションを結合
  const report = sections.map((s) => `\n${s.content}`).join('\n');

  return report;
}

/**
 * JSON形式で分析結果を出力
 */
function generateJsonReport(
  result: AggregationResult,
  periodFrom: Date,
  periodTo: Date
): string {
  const reportData = {
    metadata: {
      generated_at: new Date().toISOString(),
      period: {
        from: periodFrom.toISOString(),
        to: periodTo.toISOString(),
      },
      statistics: {
        total_transcriptions: result.total_transcriptions,
        analyzed_count: result.analyzed_count,
        analysis_success_rate: (
          (result.analyzed_count / result.total_transcriptions) *
          100
        ).toFixed(2),
        average_confidence: result.confidence_avg.toFixed(2),
      },
    },
    personas: result.personas,
    usage_purposes: result.usage_purposes,
    top_keywords: result.top_keywords,
    segments: result.segments,
  };

  return JSON.stringify(reportData, null, 2);
}

export { generateMarkdownReport, generateJsonReport };
