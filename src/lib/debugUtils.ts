/**
 * Debug Utilities - Console.log制御化
 * 本番環境では自動無効化
 * React Nativeでは __DEV__ が自動設定
 */

import { Platform } from 'react-native';

// 本番環境フラグ（Expoで自動設定される）
const isDevelopment = __DEV__;

// グローバルデバッグフラグ（必要に応じて動的に変更可能）
let globalDebugMode = isDevelopment;

export function setDebugMode(enabled: boolean): void {
  globalDebugMode = enabled;
}

export function isDebugEnabled(): boolean {
  return globalDebugMode;
}

/**
 * 統一されたデバッグログ関数
 * @param tag ログタグ（コンポーネント名など）
 * @param message ログメッセージ
 * @param data 追加データ（オプション）
 */
export function debugLog(tag: string, message: string, data?: any): void {
  if (globalDebugMode) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;

    if (data !== undefined) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

/**
 * デバッグエラーログ
 */
export function debugError(tag: string, message: string, error?: any): void {
  if (globalDebugMode) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;

    if (error !== undefined) {
      const errorData =
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error;
      console.error(prefix, message, errorData);
    } else {
      console.error(prefix, message);
    }
  }
}

/**
 * デバッグ警告ログ
 */
export function debugWarn(tag: string, message: string, data?: any): void {
  if (globalDebugMode) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;

    if (data !== undefined) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }
}

/**
 * パフォーマンス測定用のデバッグログ
 */
export function debugPerformance(
  tag: string,
  label: string,
  duration: number,
  unit: 'ms' | 's' = 'ms'
): void {
  if (globalDebugMode) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;
    console.log(`${prefix} PERF [${label}]: ${duration}${unit}`);
  }
}

/**
 * 警告的なエラーログ（ユーザーに見えないが開発時に重要）
 */
export function debugAssert(
  tag: string,
  condition: boolean,
  message: string
): void {
  if (globalDebugMode && !condition) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;
    console.error(`${prefix} ASSERT FAILED: ${message}`);
  }
}

export default {
  debugLog,
  debugError,
  debugWarn,
  debugPerformance,
  debugAssert,
  setDebugMode,
  isDebugEnabled,
};
