/**
 * セキュリティ管理システム
 * JWT トークン、暗号化、セッション管理、監査ログ
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Web 互換性のためのヘルパー関数
const getRandomBytes = (size: number): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    // Web環境: crypto.getRandomValues() を使用
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js環境: crypto.randomBytes() を使用
    try {
      const { randomBytes } = require('crypto');
      return randomBytes(size).toString('hex');
    } catch {
      // フォールバック: Math.random() を使用
      return Array.from({ length: size }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    }
  }
};

// ============================================================================
// JWT トークン管理
// ============================================================================

interface TokenPayload {
  sub: string; // ユーザーID
  email: string;
  role: 'student' | 'teacher' | 'admin';
  iat: number; // issued at
  exp: number; // expiration
  aud: string; // audience
  iss: string; // issuer
  jti: string; // JWT ID (revocation tracking)
}

interface RefreshTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
  type: 'refresh';
}

export class TokenManager {
  private static readonly TOKEN_STORAGE_KEY = 'auth_tokens';
  private static readonly REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private static readonly ACCESS_TOKEN_LIFETIME = 15 * 60; // 15分
  private static readonly REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60; // 7日
  private static readonly ISSUER = 'eigomaster';
  private static readonly AUDIENCE = 'eigomaster-mobile';
  private static readonly TOKEN_ROTATION_THRESHOLD = 5 * 60; // 5分

  /**
   * アクセストークンを生成
   */
  static generateAccessToken(
    userId: string,
    email: string,
    role: 'student' | 'teacher' | 'admin',
    secret: string
  ): string {
    const payload: TokenPayload = {
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.ACCESS_TOKEN_LIFETIME,
      aud: this.AUDIENCE,
      iss: this.ISSUER,
      jti: this.generateJTI(),
    };

    return this.encodeJWT(payload, secret);
  }

  /**
   * リフレッシュトークンを生成
   */
  static generateRefreshToken(userId: string, secret: string): string {
    const payload: RefreshTokenPayload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.REFRESH_TOKEN_LIFETIME,
      jti: this.generateJTI(),
      type: 'refresh',
    };

    return this.encodeJWT(payload, secret);
  }

  /**
   * トークンを検証
   */
  static verifyToken(token: string, secret: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('[SecurityManager] Invalid token format');
        return null;
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // 署名を検証
      const expectedSignature = this.createSignature(
        `${headerB64}.${payloadB64}`,
        secret
      );

      if (signatureB64 !== expectedSignature) {
        console.warn('[SecurityManager] Invalid token signature');
        return null;
      }

      // ペイロードをデコード
      const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson) as TokenPayload;

      // 有効期限を確認
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        console.warn('[SecurityManager] Token expired');
        return null;
      }

      return payload;
    } catch (error) {
      console.error('[SecurityManager] Token verification failed:', error);
      return null;
    }
  }

  /**
   * トークンをローカルストレージに安全に保存
   */
  static async saveTokens(
    accessToken: string,
    refreshToken: string,
    expiryTime: number
  ): Promise<void> {
    try {
      await (AsyncStorage as any).multiSet([
        [this.TOKEN_STORAGE_KEY, accessToken],
        [this.REFRESH_TOKEN_STORAGE_KEY, refreshToken],
        [this.TOKEN_EXPIRY_KEY, expiryTime.toString()],
      ]);
    } catch (error) {
      console.error('[SecurityManager] Failed to save tokens:', error);
      throw new Error('Token storage failed');
    }
  }

  /**
   * トークンをローカルストレージから取得
   */
  static async getTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
      const [accessToken, refreshToken] = await (AsyncStorage as any).multiGet([
        this.TOKEN_STORAGE_KEY,
        this.REFRESH_TOKEN_STORAGE_KEY,
      ]);

      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.error('[SecurityManager] Failed to retrieve tokens:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * トークンを削除（ログアウト時）
   */
  static async clearTokens(): Promise<void> {
    try {
      await (AsyncStorage as any).multiRemove([
        this.TOKEN_STORAGE_KEY,
        this.REFRESH_TOKEN_STORAGE_KEY,
        this.TOKEN_EXPIRY_KEY,
      ]);
    } catch (error) {
      console.error('[SecurityManager] Failed to clear tokens:', error);
    }
  }

  /**
   * トークンをローテーションする必要があるかチェック
   */
  static shouldRotateToken(): boolean {
    try {
      const expiryStr = globalThis.localStorage?.getItem(
        this.TOKEN_EXPIRY_KEY
      );
      if (!expiryStr) return true;

      const expiryTime = parseInt(expiryStr, 10);
      const now = Math.floor(Date.now() / 1000);

      return expiryTime - now < this.TOKEN_ROTATION_THRESHOLD;
    } catch {
      return true;
    }
  }

  /**
   * プライベート: JWT をエンコード
   */
  private static encodeJWT(
    payload: any,
    secret: string
  ): string {
    const header = { alg: 'HS256', typ: 'JWT' };

    const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = this.createSignature(
      `${headerB64}.${payloadB64}`,
      secret
    );

    return `${headerB64}.${payloadB64}.${signature}`;
  }

  /**
   * プライベート: JWT 署名を作成
   */
  private static createSignature(message: string, secret: string): string {
    return createHmac('sha256', secret)
      .update(message)
      .digest('base64url');
  }

  /**
   * プライベート: JWT ID を生成
   */
  private static generateJTI(): string {
    return getRandomBytes(16);
  }
}

// ============================================================================
// セッション管理
// ============================================================================

export interface SessionData {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  deviceId: string;
  createdAt: number;
  lastActivityAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionManager {
  private static readonly SESSION_STORAGE_KEY = 'session_data';
  private static readonly DEVICE_ID_KEY = 'device_id';
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30分
  private static sessionTimeout: NodeJS.Timeout | null = null;

  /**
   * セッションを作成
   */
  static async createSession(
    userId: string,
    email: string,
    role: 'student' | 'teacher' | 'admin',
    ipAddress?: string,
    userAgent?: string
  ): Promise<SessionData> {
    const deviceId = await this.getOrCreateDeviceId();

    const session: SessionData = {
      userId,
      email,
      role,
      deviceId,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      ipAddress,
      userAgent,
    };

    try {
      await AsyncStorage.setItem(
        this.SESSION_STORAGE_KEY,
        JSON.stringify(session)
      );
      this.startSessionTimeout();
      return session;
    } catch (error) {
      console.error('[SecurityManager] Failed to create session:', error);
      throw new Error('Session creation failed');
    }
  }

  /**
   * セッションを取得
   */
  static async getSession(): Promise<SessionData | null> {
    try {
      const sessionStr = await AsyncStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!sessionStr) return null;

      const session: SessionData = JSON.parse(sessionStr);

      // セッションタイムアウトをチェック
      const now = Date.now();
      if (now - session.lastActivityAt > this.SESSION_TIMEOUT) {
        await this.destroySession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('[SecurityManager] Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * セッションのアクティビティを更新
   */
  static async updateSessionActivity(): Promise<void> {
    try {
      const session = await this.getSession();
      if (!session) return;

      session.lastActivityAt = Date.now();
      await AsyncStorage.setItem(
        this.SESSION_STORAGE_KEY,
        JSON.stringify(session)
      );

      this.startSessionTimeout();
    } catch (error) {
      console.error('[SecurityManager] Failed to update session activity:', error);
    }
  }

  /**
   * セッションを破棄
   */
  static async destroySession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_STORAGE_KEY);
      if (this.sessionTimeout) {
        clearTimeout(this.sessionTimeout);
        this.sessionTimeout = null;
      }
    } catch (error) {
      console.error('[SecurityManager] Failed to destroy session:', error);
    }
  }

  /**
   * プライベート: デバイスID を取得または作成
   */
  private static async getOrCreateDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(this.DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem(this.DEVICE_ID_KEY, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('[SecurityManager] Failed to get/create device ID:', error);
      return this.generateDeviceId();
    }
  }

  /**
   * プライベート: デバイスID を生成
   */
  private static generateDeviceId(): string {
    return `${Date.now()}-${getRandomBytes(8)}`;
  }

  /**
   * プライベート: セッションタイムアウトを開始
   */
  private static startSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.destroySession();
    }, this.SESSION_TIMEOUT) as any;
  }
}

// ============================================================================
// 暗号化・複号化
// ============================================================================

export class EncryptionManager {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * データを暗号化
   */
  static encrypt(plaintext: string, encryptionKey: string): string {
    try {
      // ランダム IV を生成
      const iv = randomBytes(this.IV_LENGTH);
      const key = Buffer.from(encryptionKey.padEnd(this.KEY_LENGTH, '0').slice(0, this.KEY_LENGTH));

      // cipher を作成
      const cipher = createHmac('sha256', key) as any;
      const encrypted = cipher.update(plaintext, 'utf8', 'hex');
      cipher.end();
      const authTag = cipher.digest();

      // IV + encrypted + authTag を結合
      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      console.error('[SecurityManager] Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * データを複号化
   */
  static decrypt(ciphertext: string, encryptionKey: string): string {
    try {
      const [ivHex, encrypted, authTagHex] = ciphertext.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const key = Buffer.from(encryptionKey.padEnd(this.KEY_LENGTH, '0').slice(0, this.KEY_LENGTH));

      // 検証用の HMAC を生成
      const cipher = createHmac('sha256', key) as any;
      const decrypted = cipher.update(encrypted, 'hex', 'utf8');
      cipher.end();
      const expectedAuthTag = cipher.digest();

      // 認証タグを検証
      if (authTagHex !== expectedAuthTag.toString('hex')) {
        throw new Error('Authentication failed');
      }

      return decrypted;
    } catch (error) {
      console.error('[SecurityManager] Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * パスワードをハッシュ化（スキップ: サーバーで実施推奨）
   */
  static hashPassword(password: string): string {
    return createHmac('sha256', 'eigomaster')
      .update(password)
      .digest('hex');
  }
}

// ============================================================================
// 監査ログ
// ============================================================================

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  details?: Record<string, any>;
}

export class AuditLogger {
  private static readonly AUDIT_LOG_STORAGE_KEY = 'audit_logs';
  private static readonly MAX_LOCAL_LOGS = 100; // ローカル保存の最大ログ数

  /**
   * 監査ログを記録
   */
  static async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: this.generateLogId(),
      timestamp: Date.now(),
    };

    try {
      // ローカルストレージに保存（同期用）
      await this.saveLocalLog(auditEntry);

      // サーバーに送信（本番環境では非同期で実施）
      this.sendToServer(auditEntry).catch((err) => {
        console.warn('[SecurityManager] Failed to send audit log to server:', err);
      });
    } catch (error) {
      console.error('[SecurityManager] Failed to log audit entry:', error);
    }
  }

  /**
   * ローカルログを取得
   */
  static async getLocalLogs(): Promise<AuditLogEntry[]> {
    try {
      const logsStr = await AsyncStorage.getItem(this.AUDIT_LOG_STORAGE_KEY);
      return logsStr ? JSON.parse(logsStr) : [];
    } catch (error) {
      console.error('[SecurityManager] Failed to retrieve audit logs:', error);
      return [];
    }
  }

  /**
   * ローカルログをクリア
   */
  static async clearLocalLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.AUDIT_LOG_STORAGE_KEY);
    } catch (error) {
      console.error('[SecurityManager] Failed to clear audit logs:', error);
    }
  }

  /**
   * プライベート: ローカルログを保存
   */
  private static async saveLocalLog(entry: AuditLogEntry): Promise<void> {
    try {
      const logs = await this.getLocalLogs();

      // 古いログを削除
      logs.push(entry);
      if (logs.length > this.MAX_LOCAL_LOGS) {
        logs.shift();
      }

      await AsyncStorage.setItem(
        this.AUDIT_LOG_STORAGE_KEY,
        JSON.stringify(logs)
      );
    } catch (error) {
      console.error('[SecurityManager] Failed to save local log:', error);
    }
  }

  /**
   * プライベート: ログをサーバーに送信
   */
  private static async sendToServer(entry: AuditLogEntry): Promise<void> {
    // 本番環境では、セキュアなエンドポイントにログを送信
    // 実装例：
    // await fetch(`${API_BASE_URL}/api/audit-logs`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`,
    //   },
    //   body: JSON.stringify(entry),
    // });
  }

  /**
   * プライベート: ログID を生成
   */
  private static generateLogId(): string {
    return `${Date.now()}-${getRandomBytes(8)}`;
  }
}

// ============================================================================
// レート制限
// ============================================================================

export class RateLimiter {
  private static readonly RATE_LIMIT_STORAGE_KEY = 'rate_limits';
  private static readonly DEFAULT_WINDOW_MS = 60 * 1000; // 1分
  private static readonly DEFAULT_MAX_REQUESTS = 30;

  /**
   * リクエストを検証
   */
  static async checkRateLimit(
    key: string,
    maxRequests: number = this.DEFAULT_MAX_REQUESTS,
    windowMs: number = this.DEFAULT_WINDOW_MS
  ): Promise<boolean> {
    try {
      const now = Date.now();
      const limits = await this.getLimits();

      if (!limits[key]) {
        limits[key] = [];
      }

      // 古いリクエストを削除
      limits[key] = limits[key].filter((t) => now - t < windowMs);

      if (limits[key].length >= maxRequests) {
        return false; // レート制限に達した
      }

      // 新しいリクエストを記録
      limits[key].push(now);
      await AsyncStorage.setItem(
        this.RATE_LIMIT_STORAGE_KEY,
        JSON.stringify(limits)
      );

      return true;
    } catch (error) {
      console.error('[SecurityManager] Rate limit check failed:', error);
      return true; // エラー時は通す
    }
  }

  /**
   * プライベート: 制限情報を取得
   */
  private static async getLimits(): Promise<Record<string, number[]>> {
    try {
      const limitsStr = await AsyncStorage.getItem(this.RATE_LIMIT_STORAGE_KEY);
      return limitsStr ? JSON.parse(limitsStr) : {};
    } catch {
      return {};
    }
  }
}

// ============================================================================
// CSRF トークン管理
// ============================================================================

export class CSRFTokenManager {
  private static readonly CSRF_TOKEN_KEY = 'csrf_token';
  private static readonly CSRF_HEADER = 'X-CSRF-Token';

  /**
   * CSRF トークンを生成
   */
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * CSRF トークンを保存
   */
  static async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CSRF_TOKEN_KEY, token);
    } catch (error) {
      console.error('[SecurityManager] Failed to save CSRF token:', error);
    }
  }

  /**
   * CSRF トークンを取得
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.CSRF_TOKEN_KEY);
    } catch (error) {
      console.error('[SecurityManager] Failed to retrieve CSRF token:', error);
      return null;
    }
  }

  /**
   * CSRF トークンを検証
   */
  static async verifyToken(token: string): Promise<boolean> {
    try {
      const storedToken = await this.getToken();
      return storedToken === token && token.length > 0;
    } catch (error) {
      console.error('[SecurityManager] Failed to verify CSRF token:', error);
      return false;
    }
  }

  /**
   * HTTP ヘッダーを取得
   */
  static getHeaderName(): string {
    return this.CSRF_HEADER;
  }
}

// ============================================================================
// セキュリティ設定
// ============================================================================

export const SecurityConfig = {
  // JWT
  TOKEN_LIFETIME: 15 * 60, // 15分
  REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60, // 7日

  // パスワード
  MIN_PASSWORD_LENGTH: 12,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,

  // API
  API_TIMEOUT_MS: 30000,
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB

  // Rate Limiting
  AUTH_RATE_LIMIT: 5, // ログイン試行は5回/分
  API_RATE_LIMIT: 100, // 一般API は100回/分

  // セッション
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30分

  // 暗号化
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
};
