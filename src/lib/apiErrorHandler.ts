/**
 * API エラーハンドリングユーティリティ
 */

export class APIError extends Error {
  public statusCode?: number;
  public originalError?: Error;

  constructor(message: string, statusCode?: number, originalError?: Error) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * API エラーを適切に変換
 */
export function handleAPIError(error: any): APIError {
  // ネットワークエラー
  if (error instanceof TypeError && error.message.includes('Network')) {
    return new APIError(
      'ネットワークエラーが発生しました。インターネット接続を確認してください。',
      0,
      error
    );
  }

  // HTTP ステータスエラー
  if (error.response) {
    const status = error.response.status;
    let message = 'リクエストに失敗しました';

    switch (status) {
      case 400:
        message = '不正なリクエストです';
        break;
      case 401:
        message = '認証が必要です。もう一度ログインしてください。';
        break;
      case 403:
        message = 'このアクションは許可されていません';
        break;
      case 404:
        message = 'リソースが見つかりません';
        break;
      case 429:
        message = 'リクエストが多すぎます。後でもう一度試してください。';
        break;
      case 500:
        message = 'サーバーエラーが発生しました。後でもう一度試してください。';
        break;
      default:
        message = `エラー: ${status}`;
    }

    return new APIError(message, status, error);
  }

  // その他のエラー
  if (error instanceof Error) {
    return new APIError(error.message || '予期しないエラーが発生しました', undefined, error);
  }

  return new APIError('予期しないエラーが発生しました');
}

/**
 * リトライロジック
 */
export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.warn(
          `Attempt ${attempt + 1} failed. Retrying in ${delayMs}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Supabase エラーハンドリング
 */
export function handleSupabaseError(error: any): string {
  if (error.status === 401) {
    return 'セッションの有効期限が切れています。もう一度ログインしてください。';
  }

  if (error.status === 403) {
    return 'このデータにはアクセスできません。';
  }

  if (error.message?.includes('Failed to fetch')) {
    return 'ネットワーク接続を確認してください。';
  }

  return error.message || 'データベースエラーが発生しました';
}

/**
 * バリデーションエラー
 */
export class ValidationError extends Error {
  public fields: Record<string, string> = {};

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    if (fields) {
      this.fields = fields;
    }
  }
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * パスワードのバリデーション
 */
export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * 入力フィールドのバリデーション
 */
export function validateFormFields(data: Record<string, any>): ValidationError | null {
  const errors: Record<string, string> = {};

  if (data.email !== undefined && !validateEmail(data.email)) {
    errors.email = '有効なメールアドレスを入力してください';
  }

  if (data.password !== undefined && !validatePassword(data.password)) {
    errors.password = 'パスワードは6文字以上である必要があります';
  }

  if (data.name !== undefined && !data.name.trim()) {
    errors.name = '名前を入力してください';
  }

  if (Object.keys(errors).length > 0) {
    return new ValidationError('入力エラーがあります', errors);
  }

  return null;
}
