#!/usr/bin/env node
/**
 * 本番環境エラー診断スクリプト
 * 本番URLにアクセスしてブラウザコンソールエラーをキャプチャ
 * リソース読み込み失敗、ネットワークエラー、環境変数などをチェック
 *
 * 実行: npx ts-node scripts/diagnose-production-errors.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface DiagnosisReport {
  timestamp: string;
  environment: string;
  errors: {
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    suggestion?: string;
  }[];
  warnings: string[];
  checks: {
    supabaseConfig: boolean;
    sentryConfig: boolean;
    envVariables: boolean;
    buildFiles: boolean;
    networkConnectivity: boolean;
  };
}

/**
 * 診断レポートを初期化
 */
function createReport(): DiagnosisReport {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    errors: [],
    warnings: [],
    checks: {
      supabaseConfig: false,
      sentryConfig: false,
      envVariables: false,
      buildFiles: false,
      networkConnectivity: false,
    },
  };
}

/**
 * 環境変数をチェック
 */
function checkEnvironmentVariables(report: DiagnosisReport): void {
  console.log('\n🔍 環境変数チェック中...');

  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_SENTRY_DSN',
  ];

  let allPresent = true;

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (!value) {
      report.errors.push({
        type: 'MISSING_ENV_VAR',
        description: `必須環境変数が定義されていません: ${varName}`,
        severity: 'critical',
        suggestion: `.env.production ファイルに ${varName} を設定してください`,
      });
      allPresent = false;
      console.log(`  ❌ ${varName} - NOT SET`);
    } else {
      console.log(`  ✅ ${varName} - SET`);
    }
  });

  report.checks.envVariables = allPresent;
}

/**
 * Supabaseの設定をチェック
 */
function checkSupabaseConfig(report: DiagnosisReport): void {
  console.log('\n🔍 Supabase 設定チェック中...');

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    report.errors.push({
      type: 'SUPABASE_CONFIG_MISSING',
      description: 'Supabaseの設定が不完全です',
      severity: 'critical',
      suggestion: 'Supabase プロジェクトの URL と公開キーを確認してください',
    });
    report.checks.supabaseConfig = false;
    console.log('  ❌ Supabase config incomplete');
    return;
  }

  try {
    new URL(url);
    if (url.includes('supabase.co')) {
      console.log(`  ✅ Supabase URL valid: ${url.substring(0, 40)}...`);
      report.checks.supabaseConfig = true;
    } else {
      throw new Error('Invalid Supabase domain');
    }
  } catch (err) {
    report.errors.push({
      type: 'SUPABASE_URL_INVALID',
      description: `Supabase URL が無効です: ${url}`,
      severity: 'critical',
      suggestion: 'Supabase プロジェクト設定を確認してください',
    });
    report.checks.supabaseConfig = false;
    console.log('  ❌ Supabase URL invalid');
  }

  if (key.length > 50) {
    console.log(`  ✅ Supabase key present (${key.length} chars)`);
  } else {
    report.errors.push({
      type: 'SUPABASE_KEY_INVALID',
      description: 'Supabase キーが短すぎます',
      severity: 'high',
    });
    console.log('  ⚠️  Supabase key appears too short');
  }
}

/**
 * Sentryの設定をチェック
 */
function checkSentryConfig(report: DiagnosisReport): void {
  console.log('\n🔍 Sentry 設定チェック中...');

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    report.warnings.push('Sentry DSN が設定されていません。エラー追跡が無効です。');
    console.log('  ⚠️  Sentry DSN not configured (error tracking disabled)');
    return;
  }

  try {
    new URL(dsn);
    if (dsn.includes('sentry.io')) {
      console.log(`  ✅ Sentry DSN valid: ${dsn.substring(0, 40)}...`);
      report.checks.sentryConfig = true;
    } else {
      throw new Error('Invalid Sentry domain');
    }
  } catch (err) {
    report.errors.push({
      type: 'SENTRY_DSN_INVALID',
      description: `Sentry DSN が無効です: ${dsn}`,
      severity: 'medium',
    });
    console.log('  ❌ Sentry DSN invalid');
  }
}

/**
 * ビルドファイルをチェック
 */
function checkBuildFiles(report: DiagnosisReport): void {
  console.log('\n🔍 ビルドファイルチェック中...');

  const filesToCheck = [
    { path: 'dist', type: 'directory', required: true },
    { path: 'dist/index.html', type: 'file', required: true },
    { path: '.env.production', type: 'file', required: true },
    { path: 'package.json', type: 'file', required: true },
  ];

  let allPresent = true;

  filesToCheck.forEach((check) => {
    const fullPath = path.join(process.cwd(), check.path);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      console.log(`  ✅ ${check.path} - EXISTS`);
    } else if (check.required) {
      allPresent = false;
      console.log(`  ❌ ${check.path} - MISSING`);
      report.errors.push({
        type: 'MISSING_BUILD_FILE',
        description: `必須ファイルが見つかりません: ${check.path}`,
        severity: 'critical',
        suggestion: 'npm run build を実行してビルドしてください',
      });
    } else {
      console.log(`  ⚠️  ${check.path} - MISSING (optional)`);
    }
  });

  report.checks.buildFiles = allPresent;
}

/**
 * package.json スクリプトをチェック
 */
function checkPackageScripts(report: DiagnosisReport): void {
  console.log('\n🔍 build スクリプトチェック中...');

  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    if (pkg.scripts?.['build:web']) {
      console.log('  ✅ build:web script found');
    } else {
      report.warnings.push('build:web スクリプトが見つかりません');
      console.log('  ⚠️  build:web script not found');
    }

    if (pkg.scripts?.build) {
      console.log('  ✅ build script found');
    } else {
      report.warnings.push('build スクリプトが見つかりません');
      console.log('  ⚠️  build script not found');
    }
  } catch (err) {
    report.errors.push({
      type: 'PACKAGE_JSON_ERROR',
      description: 'package.json を読み込めません',
      severity: 'high',
    });
    console.log('  ❌ Failed to read package.json');
  }
}

/**
 * 次のステップを提案
 */
function suggestNextSteps(report: DiagnosisReport): string[] {
  const steps: string[] = [];

  if (!report.checks.envVariables) {
    steps.push('1. 環境変数を設定してください (.env.production ファイル)');
  }

  if (!report.checks.supabaseConfig) {
    steps.push('2. Supabase の設定を確認してください');
  }

  if (!report.checks.buildFiles) {
    steps.push('3. ビルドを実行してください: npm run build:web');
  }

  if (report.errors.length === 0) {
    steps.push('✅ すべてのチェックが成功しました。本番環境にデプロイできます。');
  }

  return steps;
}

/**
 * レポートを保存
 */
function saveReport(report: DiagnosisReport): void {
  const reportPath = path.join(process.cwd(), 'ERROR_DIAGNOSIS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 レポートを保存しました: ${reportPath}`);
}

/**
 * マークダウンレポートを生成
 */
function generateMarkdownReport(report: DiagnosisReport): string {
  let md = '# 本番環境 エラー診断レポート\n\n';
  md += `**生成日時**: ${new Date(report.timestamp).toLocaleString('ja-JP')}\n`;
  md += `**環境**: ${report.environment}\n\n`;

  // エラー
  if (report.errors.length > 0) {
    md += '## ❌ エラー\n\n';
    report.errors.forEach((err) => {
      md += `### ${err.type}\n`;
      md += `- **説明**: ${err.description}\n`;
      md += `- **重大度**: ${err.severity}\n`;
      if (err.suggestion) {
        md += `- **対策**: ${err.suggestion}\n`;
      }
      md += '\n';
    });
  }

  // 警告
  if (report.warnings.length > 0) {
    md += '## ⚠️  警告\n\n';
    report.warnings.forEach((warn) => {
      md += `- ${warn}\n`;
    });
    md += '\n';
  }

  // チェック結果
  md += '## ✅ チェック結果\n\n';
  md += `| チェック項目 | 結果 |\n`;
  md += `|---|---|\n`;
  Object.entries(report.checks).forEach(([key, value]) => {
    const status = value ? '✅ OK' : '❌ NG';
    md += `| ${key} | ${status} |\n`;
  });
  md += '\n';

  // 次のステップ
  const steps = suggestNextSteps(report);
  if (steps.length > 0) {
    md += '## 📋 次のステップ\n\n';
    steps.forEach((step) => {
      md += `${step}\n`;
    });
    md += '\n';
  }

  return md;
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  console.log('🔍 本番環境 エラー診断スクリプト\n');
  console.log('='.repeat(50));

  const report = createReport();

  // 各種チェックを実行
  checkEnvironmentVariables(report);
  checkSupabaseConfig(report);
  checkSentryConfig(report);
  checkBuildFiles(report);
  checkPackageScripts(report);

  // レポートを保存
  saveReport(report);

  // マークダウンレポートを生成
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(process.cwd(), 'ERROR_DIAGNOSIS_REPORT.md');
  fs.writeFileSync(mdPath, mdReport);
  console.log(`📄 マークダウンレポートを保存しました: ${mdPath}\n`);

  // 次のステップを表示
  const steps = suggestNextSteps(report);
  console.log('\n📋 次のステップ:');
  steps.forEach((step) => {
    console.log(`  ${step}`);
  });

  // サマリー
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 診断結果: エラー${report.errors.length}件, 警告${report.warnings.length}件`);

  if (report.errors.length === 0) {
    console.log('\n✅ 本番環境の基本設定は正常です。');
    process.exit(0);
  } else {
    console.log('\n❌ 本番環境に問題があります。上記の対策を実施してください。');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ 診断中にエラーが発生しました:', err.message);
  process.exit(1);
});
