/**
 * 統一的なエラーハンドリング・ユーティリティ
 * ネットワークエラー、JSONパース失敗、API エラーの詳細判別
 * ユーザーフレンドリーなエラーメッセージ生成
 */

import { debugError } from './debugUtils';

/**
 * エラータイプの定義
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  JSON_PARSE = 'JSON_PARSE',
  API_ERROR = 'API_ERROR',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 標準化されたエラーオブジェクト
 */
export interface AppError {
  type: ErrorType;
  message: string; // ユーザー向けメッセージ
  originalError?: Error | any; // デバッグ用の原始エラー
  statusCode?: number;
  timestamp: Date;
  tag?: string; // エラーの発生元（コンポーネント名など）
}

/**
 * エラーハンドラーの設定
 */
interface ErrorHandlerConfig {
  onError?: (error: AppError) => void;
  enableSentry?: boolean;
  sentryDSN?: string;
}

let config: ErrorHandlerConfig = {
  enableSentry: false,
};

/**
 * エラーハンドラーの初期化
 */
export function initializeErrorHandler(cfg: ErrorHandlerConfig): void {
  config = { ...config, ...cfg };

  if (config.enableSentry && config.sentryDSN) {
    // Sentry初期化（オプション）
    debugError('ErrorHandler', 'Sentry would be initialized here', {
      dsn: config.sentryDSN,
    });
  }
}

/**
 * ネットワークエラーを判別
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed') ||
      message.includes('offline')
    );
  }
  return false;
}

/**
 * タイムアウトエラーを判別
 */
export function isTimeoutError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('abort')
  );
}

/**
 * JSON パースエラーを判別
 */
export function isJsonParseError(error: any): boolean {
  return error instanceof SyntaxError && (error.toString() as string).includes('JSON');
}

/**
 * HTTP エラーレスポンスをチェック
 */
export function getHttpErrorType(
  statusCode: number
): ErrorType {
  if (statusCode === 404) return ErrorType.NOT_FOUND;
  if (statusCode === 403 || statusCode === 401) return ErrorType.PERMISSION;
  if (statusCode >= 500) return ErrorType.API_ERROR;
  if (statusCode >= 400) return ErrorType.VALIDATION;
  return ErrorType.UNKNOWN;
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'ネットワークに接続できません。インターネット接続を確認してください。';
    case ErrorType.TIMEOUT:
      return 'リクエストがタイムアウトしました。もう一度お試しください。';
    case ErrorType.JSON_PARSE:
      return 'データの処理に失敗しました。もう一度お試しください。';
    case ErrorType.API_ERROR:
      return 'サーバーエラーが発生しました。しばらく経ってからお試しください。';
    case ErrorType.PERMISSION:
      return 'このアクションを実行する権限がありません。ログインしてからお試しください。';
    case ErrorType.NOT_FOUND:
      return 'リソースが見つかりません。';
    case ErrorType.VALIDATION:
      return 'データが無効です。入力内容を確認してください。';
    case ErrorType.UNKNOWN:
    default:
      return 'エラーが発生しました。もう一度お試しください。';
  }
}

/**
 * 統一的なエラー解析・変換
 */
export function handleError(
  error: any,
  tag: string = 'UnknownSource',
  context?: any
): AppError {
  let type = ErrorType.UNKNOWN;
  let message = 'エラーが発生しました';
  let statusCode: number | undefined;

  try {
    // ネットワークエラーの判別
    if (isNetworkError(error)) {
      type = ErrorType.NETWORK;
      message = 'ネットワークエラー';
    }
    // タイムアウトエラーの判別
    else if (isTimeoutError(error)) {
      type = ErrorType.TIMEOUT;
      message = 'タイムアウトエラー';
    }
    // JSON パースエラーの判別
    else if (isJsonParseError(error)) {
      type = ErrorType.JSON_PARSE;
      message = 'JSONパースエラー';
    }
    // Fetch APIのレスポンスエラー
    else if (error instanceof Response) {
      statusCode = error.status;
      type = getHttpErrorType(error.status);
      message = `HTTP ${error.status}: ${error.statusText}`;
    }
    // 標準的なエラーオブジェクト
    else if (error instanceof Error) {
      message = error.message;

      // エラーメッセージから型を推測
      const msg = message.toLowerCase();
      if (msg.includes('404')) type = ErrorType.NOT_FOUND;
      else if (msg.includes('403') || msg.includes('401'))
        type = ErrorType.PERMISSION;
      else if (msg.includes('validation')) type = ErrorType.VALIDATION;
    }
    // 文字列エラー
    else if (typeof error === 'string') {
      message = error;
    }
    // その他のオブジェクト
    else {
      message = JSON.stringify(error);
    }
  } catch {
    // 例外が発生した場合のフォールバック
    message = 'エラーの解析に失敗しました';
  }

  const appError: AppError = {
    type,
    message: getUserFriendlyMessage({
      type,
      message,
      statusCode,
      timestamp: new Date(),
      tag,
    }),
    originalError: error,
    statusCode,
    timestamp: new Date(),
    tag,
  };

  // デバッグ用のエラーログ
  debugError(tag, `[${type}] ${message}`, {
    context,
    originalError: error instanceof Error ? error.message : error,
  });

  // カスタムエラーハンドラーを呼び出し
  if (config.onError) {
    try {
      config.onError(appError);
    } catch (err) {
      debugError('ErrorHandler', 'Error in custom error handler', err);
    }
  }

  return appError;
}

/**
 * JSON パースのセーフな実行
 */
export function safeJsonParse<T = any>(
  json: string,
  defaultValue: T,
  tag: string = 'JSONParser'
): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    debugError(tag, 'Failed to parse JSON', {
      error:
        error instanceof Error ? error.message : String(error),
      jsonLength: json.length,
    });
    return defaultValue;
  }
}

/**
 * Promise ベースのエラーハンドリング
 */
export async function withErrorHandling<T>(
  promise: Promise<T>,
  tag: string,
  context?: any
): Promise<{ success: boolean; data?: T; error?: AppError }> {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    const appError = handleError(error, tag, context);
    return { success: false, error: appError };
  }
}

/**
 * リトライロジック付きの非同期実行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    tag?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    tag = 'RetryHandler',
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const waitTime = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        debugWarn(
          tag,
          `Attempt ${attempt} failed, retrying in ${waitTime}ms`,
          { error: lastError.message }
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw handleError(
    lastError,
    tag,
    `Failed after ${maxAttempts} attempts`
  );
}

/**
 * API レスポンスの妥当性チェック
 */
export function validateApiResponse<T = any>(
  response: any,
  tag: string = 'APIValidator'
): { valid: boolean; data?: T; error?: AppError } {
  if (!response) {
    return {
      valid: false,
      error: handleError('レスポンスが空です', tag),
    };
  }

  if (typeof response !== 'object') {
    return {
      valid: false,
      error: handleError(
        'レスポンスが無効な形式です',
        tag,
        { actualType: typeof response }
      ),
    };
  }

  return {
    valid: true,
    data: response as T,
  };
}

// デバッグ用の警告関数
function debugWarn(tag: string, message: string, data?: any): void {
  if (__DEV__) {
    const timestamp = new Date().toISOString();
    const prefix = `[${tag} ${timestamp}]`;
    if (data !== undefined) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }
}

export default {
  handleError,
  safeJsonParse,
  withErrorHandling,
  withRetry,
  validateApiResponse,
  initializeErrorHandler,
  getUserFriendlyMessage,
  isNetworkError,
  isTimeoutError,
  isJsonParseError,
  getHttpErrorType,
};
