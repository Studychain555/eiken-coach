/**
 * 統一的なエラーハンドリング・ユーティリティ
 * ネットワークエラー、JSONパース失敗、API エラーの詳細判別
 * ユーザーフレンドリーなエラーメッセージ生成
 */

import { debugError } from './debugUtils';

/**
 * エラータイプの定義（拡張版）
 */
export enum ErrorType {
  // ネットワーク
  NETWORK = 'NETWORK',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_DNS_FAILED = 'NETWORK_DNS_FAILED',
  NETWORK_CONNECTION_RESET = 'NETWORK_CONNECTION_RESET',
  NETWORK_CORS = 'NETWORK_CORS',

  // リソース
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_LOAD_FAILED = 'RESOURCE_LOAD_FAILED',
  AUDIO_PLAY_FAILED = 'AUDIO_PLAY_FAILED',
  IMAGE_LOAD_FAILED = 'IMAGE_LOAD_FAILED',

  // 認証
  AUTH_INVALID = 'AUTH_INVALID',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  AUTH_2FA_FAILED = 'AUTH_2FA_FAILED',

  // DB
  DB_QUERY_FAILED = 'DB_QUERY_FAILED',
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED',
  DB_RLS_VIOLATION = 'DB_RLS_VIOLATION',
  DB_RATE_LIMIT = 'DB_RATE_LIMIT',

  // UI
  INVALID_ROUTE = 'INVALID_ROUTE',
  FORM_VALIDATION_FAILED = 'FORM_VALIDATION_FAILED',
  STATE_SYNC_FAILED = 'STATE_SYNC_FAILED',

  // 従来のタイプ（後方互換性）
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
  id?: string; // エラーの一意識別子
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
    // ネットワーク関連
    case ErrorType.NETWORK:
    case ErrorType.NETWORK_OFFLINE:
      return 'インターネット接続を確認してください。';
    case ErrorType.NETWORK_TIMEOUT:
      return 'リクエストがタイムアウトしました。ネットワークの接続を確認して、もう一度お試しください。';
    case ErrorType.NETWORK_DNS_FAILED:
      return 'サーバーに接続できません。後でもう一度お試しください。';
    case ErrorType.NETWORK_CONNECTION_RESET:
      return 'サーバーとの接続が切断されました。もう一度お試しください。';
    case ErrorType.NETWORK_CORS:
      return 'リクエストが拒否されました。技術サポートにお問い合わせください。';

    // リソース関連
    case ErrorType.RESOURCE_NOT_FOUND:
    case ErrorType.NOT_FOUND:
      return 'リソースが見つかりません。';
    case ErrorType.RESOURCE_LOAD_FAILED:
      return 'リソースを読み込めませんでした。もう一度お試しください。';
    case ErrorType.AUDIO_PLAY_FAILED:
      return '音声を再生できません。デバイスの設定を確認してください。';
    case ErrorType.IMAGE_LOAD_FAILED:
      return '画像を読み込めませんでした。';

    // 認証関連
    case ErrorType.AUTH_INVALID:
    case ErrorType.AUTH_UNAUTHORIZED:
      return 'ログインが必要です。ログインしてからもう一度お試しください。';
    case ErrorType.AUTH_SESSION_EXPIRED:
      return 'セッションが期限切れです。ログインし直してください。';
    case ErrorType.AUTH_2FA_FAILED:
      return '2段階認証に失敗しました。もう一度お試しください。';

    // DB関連
    case ErrorType.DB_QUERY_FAILED:
      return 'データベースエラーが発生しました。後でもう一度お試しください。';
    case ErrorType.DB_CONNECTION_FAILED:
      return 'データベースに接続できません。後でもう一度お試しください。';
    case ErrorType.DB_RLS_VIOLATION:
    case ErrorType.PERMISSION:
      return 'このアクションを実行する権限がありません。';
    case ErrorType.DB_RATE_LIMIT:
      return 'リクエストが多すぎます。少し待ってから再度お試しください。';

    // UI関連
    case ErrorType.INVALID_ROUTE:
      return 'ページが見つかりません。';
    case ErrorType.FORM_VALIDATION_FAILED:
    case ErrorType.VALIDATION:
      return 'フォーム入力に問題があります。内容を確認して再度お試しください。';
    case ErrorType.STATE_SYNC_FAILED:
      return 'データの同期に失敗しました。ページをリロードしてください。';

    // その他
    case ErrorType.TIMEOUT:
      return 'リクエストがタイムアウトしました。もう一度お試しください。';
    case ErrorType.JSON_PARSE:
      return 'データの処理に失敗しました。もう一度お試しください。';
    case ErrorType.API_ERROR:
      return 'サーバーエラーが発生しました。しばらく経ってからお試しください。';
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
