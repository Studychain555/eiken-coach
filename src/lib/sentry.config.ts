/**
 * Sentry エラーログ・分析統合設定
 * 本番環境での例外・パフォーマンス監視
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Sentry初期化設定
 * @param environment 環境（production/staging/development）
 */
export function initSentry(environment: 'production' | 'staging' | 'development') {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('SENTRY_DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 本番環境では10%
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 5000, // セッション追跡間隔
    attachStacktrace: true,
    maxValueLength: 1024,
    maxBreadcrumbs: 100,

    // デバイス情報の自動収集
    initialScope: {
      tags: {
        app_version: Constants.expoConfig?.version || 'unknown',
        build_number: Constants.expoConfig?.ios?.buildNumber || 'unknown',
        environment,
      },
    },

    // パフォーマンスモニタリング
    integrations: [
      new (Sentry as any).ReactNativeTracing({
        enableNativeFramesTracking: true,
        enableStallTracking: true,
        enableAppStartTracking: true,
      }),
    ],

    // デバイス情報の送信
    beforeSend: (event, hint) => {
      // センシティブ情報をフィルタリング
      if (event.request?.url?.includes('supabase')) {
        // Supabase URLからトークン情報を削除
        if (event.request.url) {
          event.request.url = event.request.url.replace(/\?.*auth=.*/, '?auth=***');
        }
      }
      return event;
    },

    // プロファイリング設定
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
  });
}

/**
 * ユーザー情報の設定
 * @param userId ユーザーID
 * @param email メールアドレス
 * @param username ユーザー名
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * パンくずの追加（ユーザー行動追跡）
 * @param category カテゴリ
 * @param message メッセージ
 * @param level ログレベル
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  Sentry.captureMessage(message, {
    level,
    tags: { category },
  });
}

/**
 * 例外の明示的な送信
 * @param error エラーオブジェクト
 * @param context コンテキスト情報
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * メッセージログの送信
 * @param message メッセージ
 * @param level ログレベル
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * パフォーマンスメトリクスの計測開始
 * @param name メトリクス名
 */
export function startPerformanceTrace(name: string) {
  return (Sentry as any).startTransaction({
    name,
    op: 'measure',
  });
}

/**
 * パフォーマンスメトリクスの計測終了
 * @param transaction トランザクション
 */
export function finishPerformanceTrace(transaction: any) {
  transaction.finish();
}

/**
 * APIレスポンスの監視
 * @param endpoint エンドポイント
 * @param duration 実行時間（ms）
 * @param statusCode ステータスコード
 * @param error エラー
 */
export function captureAPIMetrics(
  endpoint: string,
  duration: number,
  statusCode: number,
  error?: Error
) {
  Sentry.captureMessage(`API Call: ${endpoint}`, {
    level: statusCode >= 400 ? 'error' : 'info',
    tags: {
      endpoint,
      duration_ms: String(duration),
      status_code: String(statusCode),
    },
  });

  if (error) {
    captureException(error, {
      api_endpoint: endpoint,
      status_code: statusCode,
      duration_ms: duration,
    });
  }
}

/**
 * ネットワーク エラーの監視
 * @param error ネットワークエラー
 */
export function captureNetworkError(error: Error) {
  captureException(error, {
    error_type: 'network_error',
    timestamp: new Date().toISOString(),
  });
}

/**
 * 認証エラーの監視
 * @param error 認証エラー
 */
export function captureAuthError(error: Error) {
  captureException(error, {
    error_type: 'auth_error',
    timestamp: new Date().toISOString(),
  });
}

export default {
  initSentry,
  setSentryUser,
  addSentryBreadcrumb,
  captureException,
  captureMessage,
  startPerformanceTrace,
  finishPerformanceTrace,
  captureAPIMetrics,
  captureNetworkError,
  captureAuthError,
};
