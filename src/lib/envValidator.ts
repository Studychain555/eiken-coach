/**
 * 環境変数バリデーション
 * ビルド時・実行時に環境変数をチェックし、不足しているものを詳細にレポート
 */

import { debugError } from './debugUtils';

/**
 * 必須環境変数の定義
 */
interface EnvVarDefinition {
  key: string;
  description: string;
  required: boolean;
  environment: 'all' | 'production' | 'development' | 'staging';
  validate?: (value: string) => boolean;
}

/**
 * 環境変数定義リスト
 */
const ENV_VARIABLES: EnvVarDefinition[] = [
  // Supabase
  {
    key: 'EXPO_PUBLIC_SUPABASE_URL',
    description: 'Supabase プロジェクト URL',
    required: true,
    environment: 'all',
    validate: (value) => {
      try {
        new URL(value);
        return value.includes('supabase.co');
      } catch {
        return false;
      }
    },
  },
  {
    key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase 匿名キー',
    required: true,
    environment: 'all',
    validate: (value) => value.length > 50,
  },

  // Sentry
  {
    key: 'EXPO_PUBLIC_SENTRY_DSN',
    description: 'Sentry エラーログ DSN',
    required: false,
    environment: 'production',
    validate: (value) => {
      try {
        new URL(value);
        return value.includes('sentry.io');
      } catch {
        return false;
      }
    },
  },

  // Google Analytics
  {
    key: 'EXPO_PUBLIC_GOOGLE_ANALYTICS_ID',
    description: 'Google Analytics 測定 ID',
    required: false,
    environment: 'production',
    validate: (value) => value.startsWith('G-') && value.length > 10,
  },

  // API Keys (optional)
  {
    key: 'EXPO_PUBLIC_GOOGLE_TTS_API_KEY',
    description: 'Google Text-to-Speech API キー',
    required: false,
    environment: 'all',
  },
];

/**
 * バリデーション結果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  missing: string[];
}

/**
 * バリデーション エラー
 */
export interface ValidationError {
  key: string;
  description: string;
  issue: string;
  severity: 'critical' | 'error';
}

/**
 * バリデーション 警告
 */
export interface ValidationWarning {
  key: string;
  description: string;
  issue: string;
}

/**
 * 環境変数をバリデート
 */
export function validateEnvironmentVariables(env: NodeJS.ProcessEnv = process.env): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    missing: [],
  };

  const currentEnv = (process.env.NODE_ENV || 'development') as 'production' | 'development' | 'staging';

  for (const varDef of ENV_VARIABLES) {
    // 環境に合わせて必須判定
    const isRequired =
      varDef.required && (varDef.environment === 'all' || varDef.environment === currentEnv);

    const value = env[varDef.key];

    // 不足チェック
    if (!value) {
      if (isRequired) {
        result.valid = false;
        result.errors.push({
          key: varDef.key,
          description: varDef.description,
          issue: `必須環境変数が定義されていません`,
          severity: 'critical',
        });
      } else {
        result.warnings.push({
          key: varDef.key,
          description: varDef.description,
          issue: `オプション環境変数が未定義です（機能が制限される可能性があります）`,
        });
      }
      result.missing.push(varDef.key);
      continue;
    }

    // バリデーション実行
    if (varDef.validate) {
      if (!varDef.validate(value)) {
        result.valid = false;
        result.errors.push({
          key: varDef.key,
          description: varDef.description,
          issue: `環境変数の形式が無効です: "${value.substring(0, 20)}..."`,
          severity: 'error',
        });
      }
    }
  }

  return result;
}

/**
 * バリデーション結果をログ出力
 */
export function logValidationResult(result: ValidationResult): void {
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ 環境変数チェック: すべて OK');
    return;
  }

  console.log('\n=== 環境変数 バリデーション結果 ===\n');

  if (result.errors.length > 0) {
    console.error('❌ エラー:');
    result.errors.forEach((err) => {
      console.error(`  - ${err.key}`);
      console.error(`    説明: ${err.description}`);
      console.error(`    問題: ${err.issue}`);
    });
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  警告:');
    result.warnings.forEach((warn) => {
      console.warn(`  - ${warn.key}`);
      console.warn(`    説明: ${warn.description}`);
      console.warn(`    問題: ${warn.issue}`);
    });
  }

  if (result.missing.length > 0) {
    console.log('\n未定義の環境変数:');
    result.missing.forEach((key) => {
      console.log(`  - ${key}`);
    });
  }

  console.log('\n');
}

/**
 * ビルド時チェック（CI/CDパイプライン用）
 */
export function checkEnvironmentVariablesForBuild(): {
  success: boolean;
  message: string;
} {
  const result = validateEnvironmentVariables();
  logValidationResult(result);

  if (!result.valid) {
    const errorCount = result.errors.length;
    const message = `❌ ビルド失敗: ${errorCount}個の環境変数エラーがあります`;
    console.error(`\n${message}\n`);

    // ビルド環境でのみ終了
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }

    return {
      success: false,
      message,
    };
  }

  return {
    success: true,
    message: '✅ 環境変数チェック成功',
  };
}

/**
 * ランタイムチェック（アプリ起動時）
 */
export function checkEnvironmentVariablesAtRuntime(): {
  valid: boolean;
  errors: string[];
} {
  const result = validateEnvironmentVariables();

  if (!result.valid) {
    const errors = result.errors.map(
      (err) => `${err.key}: ${err.issue}`
    );

    debugError('EnvValidator', '実行時環境変数チェック失敗', {
      errors,
      count: errors.length,
    });

    return {
      valid: false,
      errors,
    };
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach((warn) => {
      console.warn(
        `⚠️  ${warn.key}: ${warn.issue}`
      );
    });
  }

  return {
    valid: true,
    errors: [],
  };
}

/**
 * 特定の環境変数を取得（デフォルト値付き）
 */
export function getEnvVar(
  key: string,
  defaultValue?: string,
  options?: {
    validate?: (value: string) => boolean;
    throwOnError?: boolean;
  }
): string | undefined {
  const value = process.env[key] || defaultValue;

  if (!value) {
    if (options?.throwOnError) {
      throw new Error(`環境変数 '${key}' が見つかりません`);
    }
    return undefined;
  }

  if (options?.validate && !options.validate(value)) {
    const error = `環境変数 '${key}' のバリデーション失敗`;
    if (options.throwOnError) {
      throw new Error(error);
    }
    debugError('EnvValidator', error, { key, value: value.substring(0, 20) });
    return undefined;
  }

  return value;
}

/**
 * 開発環境用のデフォルト値を提供
 */
export function provideDefaultsForDevelopment(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // 開発環境では、テスト用のダミー値を提供
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    console.warn(
      '⚠️  EXPO_PUBLIC_SUPABASE_URL がない開発環境なため、テスト用デフォルト値を使用しています'
    );
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-' + 'x'.repeat(50);
    console.warn(
      '⚠️  EXPO_PUBLIC_SUPABASE_ANON_KEY がない開発環境なため、テスト用デフォルト値を使用しています'
    );
  }
}

export default {
  validateEnvironmentVariables,
  logValidationResult,
  checkEnvironmentVariablesForBuild,
  checkEnvironmentVariablesAtRuntime,
  getEnvVar,
  provideDefaultsForDevelopment,
};
