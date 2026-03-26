/**
 * エラーメッセージ辞書
 * すべてのエラー型に対して、ユーザーフレンドリーなメッセージを統一定義
 */

import { ErrorType } from '@/lib/errorHandler';

export interface UserMessage {
  title: string;
  description: string;
  suggestedAction?: string;
  retryable?: boolean;
}

/**
 * エラーメッセージ定義
 */
export const ERROR_MESSAGES: Record<ErrorType, UserMessage> = {
  // ネットワーク関連
  [ErrorType.NETWORK]: {
    title: 'ネットワーク接続エラー',
    description: 'インターネット接続を確認してください。',
    suggestedAction: 'Wi-Fi またはモバイル接続を確認してください。',
    retryable: true,
  },
  [ErrorType.NETWORK_OFFLINE]: {
    title: 'オフラインです',
    description: 'インターネットに接続されていません。',
    suggestedAction: 'オンラインに戻ったら、自動的に同期されます。',
    retryable: true,
  },
  [ErrorType.NETWORK_TIMEOUT]: {
    title: 'リクエスト タイムアウト',
    description: 'サーバーからの応答がありません。',
    suggestedAction: '接続を確認して、もう一度お試しください。',
    retryable: true,
  },
  [ErrorType.NETWORK_DNS_FAILED]: {
    title: 'DNS解決 失敗',
    description: 'サーバーのドメイン名を解決できません。',
    suggestedAction: 'しばらく待ってからもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.NETWORK_CONNECTION_RESET]: {
    title: '接続切断',
    description: 'サーバーとの接続が切断されました。',
    suggestedAction: 'もう一度お試しください。',
    retryable: true,
  },
  [ErrorType.NETWORK_CORS]: {
    title: 'CORS エラー',
    description: 'リクエストが拒否されました。',
    suggestedAction: '技術サポートにお問い合わせください。',
    retryable: false,
  },

  // リソース関連
  [ErrorType.RESOURCE_NOT_FOUND]: {
    title: 'リソースが見つかりません',
    description: '要求されたリソースが存在しません。',
    suggestedAction: 'URL を確認して、もう一度お試しください。',
    retryable: false,
  },
  [ErrorType.RESOURCE_LOAD_FAILED]: {
    title: 'リソース読み込み失敗',
    description: 'リソースの読み込みに失敗しました。',
    suggestedAction: 'ページをリロードしてもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.AUDIO_PLAY_FAILED]: {
    title: '音声再生失敗',
    description: '音声ファイルを再生できません。',
    suggestedAction: 'デバイスの音量とスピーカー設定を確認してください。',
    retryable: true,
  },
  [ErrorType.IMAGE_LOAD_FAILED]: {
    title: '画像読み込み失敗',
    description: '画像を読み込めませんでした。',
    suggestedAction: 'ページをリロードしてもう一度お試しください。',
    retryable: true,
  },

  // 認証関連
  [ErrorType.AUTH_INVALID]: {
    title: '認証エラー',
    description: '認証情報が無効です。',
    suggestedAction: 'ログアウトして、もう一度ログインしてください。',
    retryable: false,
  },
  [ErrorType.AUTH_UNAUTHORIZED]: {
    title: '認証が必要',
    description: 'このアクションにはログインが必要です。',
    suggestedAction: 'ログインしてからもう一度お試しください。',
    retryable: false,
  },
  [ErrorType.AUTH_SESSION_EXPIRED]: {
    title: 'セッション期限切れ',
    description: 'セッションが期限切れになりました。',
    suggestedAction: 'ログインし直してください。',
    retryable: false,
  },
  [ErrorType.AUTH_2FA_FAILED]: {
    title: '2段階認証失敗',
    description: '2段階認証に失敗しました。',
    suggestedAction: '認証コードを確認して、もう一度お試しください。',
    retryable: true,
  },

  // DB関連
  [ErrorType.DB_QUERY_FAILED]: {
    title: 'データベース クエリ失敗',
    description: 'データベース操作に失敗しました。',
    suggestedAction: '後でもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.DB_CONNECTION_FAILED]: {
    title: 'データベース接続失敗',
    description: 'データベースに接続できません。',
    suggestedAction: 'しばらく待ってからもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.DB_RLS_VIOLATION]: {
    title: 'アクセス権限なし',
    description: 'このデータにはアクセスできません。',
    suggestedAction: 'ログインしているアカウントを確認してください。',
    retryable: false,
  },
  [ErrorType.DB_RATE_LIMIT]: {
    title: 'リクエスト制限',
    description: 'リクエストが多すぎます。',
    suggestedAction: '少し待ってから再度お試しください。',
    retryable: true,
  },

  // UI関連
  [ErrorType.INVALID_ROUTE]: {
    title: 'ページが見つかりません',
    description: '要求されたページは存在しません。',
    suggestedAction: 'ホームページに戻るか、検索してください。',
    retryable: false,
  },
  [ErrorType.FORM_VALIDATION_FAILED]: {
    title: 'フォーム入力エラー',
    description: 'フォーム入力に問題があります。',
    suggestedAction: '入力内容を確認して再度お試しください。',
    retryable: false,
  },
  [ErrorType.STATE_SYNC_FAILED]: {
    title: 'データ同期失敗',
    description: 'データの同期に失敗しました。',
    suggestedAction: 'ページをリロードしてください。',
    retryable: true,
  },

  // 従来のタイプ
  [ErrorType.TIMEOUT]: {
    title: 'タイムアウト',
    description: 'リクエストがタイムアウトしました。',
    suggestedAction: 'もう一度お試しください。',
    retryable: true,
  },
  [ErrorType.JSON_PARSE]: {
    title: 'データ処理エラー',
    description: 'データを解析できませんでした。',
    suggestedAction: 'ページをリロードしてもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.API_ERROR]: {
    title: 'サーバーエラー',
    description: 'サーバーでエラーが発生しました。',
    suggestedAction: '後でもう一度お試しください。',
    retryable: true,
  },
  [ErrorType.VALIDATION]: {
    title: '入力エラー',
    description: '入力データが無効です。',
    suggestedAction: '入力内容を確認して再度お試しください。',
    retryable: false,
  },
  [ErrorType.PERMISSION]: {
    title: 'アクセス権限なし',
    description: 'このアクションを実行する権限がありません。',
    suggestedAction: 'ログインしているアカウントを確認してください。',
    retryable: false,
  },
  [ErrorType.NOT_FOUND]: {
    title: 'リソースが見つかりません',
    description: '要求されたリソースが見つかりません。',
    suggestedAction: 'URL を確認してもう一度お試しください。',
    retryable: false,
  },
  [ErrorType.UNKNOWN]: {
    title: 'エラーが発生しました',
    description: '予期しないエラーが発生しました。',
    suggestedAction: 'ページをリロードしてもう一度お試しください。',
    retryable: true,
  },
};

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(errorType: ErrorType): UserMessage {
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ErrorType.UNKNOWN];
}

/**
 * エラーメッセージをトースト表示用に変換
 */
export function getToastMessage(errorType: ErrorType): string {
  const msg = getErrorMessage(errorType);
  return msg.description || msg.title;
}

/**
 * エラーメッセージをモーダル表示用に変換
 */
export function getModalMessage(errorType: ErrorType): {
  title: string;
  description: string;
  actionText?: string;
} {
  const msg = getErrorMessage(errorType);
  return {
    title: msg.title,
    description: msg.description,
    actionText: msg.suggestedAction,
  };
}

export default {
  ERROR_MESSAGES,
  getErrorMessage,
  getToastMessage,
  getModalMessage,
};
