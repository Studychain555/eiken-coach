import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import {
  TokenManager,
  SessionManager,
  AuditLogger,
  RateLimiter,
  SecurityConfig,
} from '../lib/securityManager';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'student' | 'teacher' | 'admin' | null;
  loading: boolean;
  error: string | null;
  lastLoginAt?: number;
  loginAttempts: number;
  twoFactorEnabled?: boolean;
  twoFactorVerified?: boolean;

  // メソッド
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  enable2FA: () => Promise<string>; // QR コード URL を返す
  verify2FA: (code: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  role: null,
  loading: true,
  error: null,
  loginAttempts: 0,
  twoFactorEnabled: false,
  twoFactorVerified: false,

  initializeAuth: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // user_metadata から role を取得（デフォルト: student）
        const userRole = (session.user.user_metadata?.role as 'student' | 'teacher' | 'admin') || 'student';

        // セッションを復元
        await SessionManager.createSession(
          session.user.id,
          session.user.email || '',
          userRole
        );

        set({
          session,
          user: session.user,
          role: userRole,
          loading: false,
        });

        // Initialize all store syncs with user ID
        await initializeAllStores(session.user.id);
      } else {
        set({
          session: null,
          user: null,
          role: null,
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Auth initialization failed',
        loading: false,
      });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });

      // レート制限チェック
      const canAttempt = await RateLimiter.checkRateLimit(
        `login:${email}`,
        SecurityConfig.AUTH_RATE_LIMIT,
        60 * 1000 // 1分
      );

      if (!canAttempt) {
        const error = 'ログイン試行回数が多すぎます。1分後にもう一度試してください。';
        set({ error, loading: false });

        await AuditLogger.log({
          userId: email,
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          status: 'failure',
          statusCode: 429,
          details: { reason: 'rate_limit_exceeded' },
        });

        throw new Error(error);
      }

      // パスワード検証
      if (!password || password.length < SecurityConfig.MIN_PASSWORD_LENGTH) {
        const error = `パスワードは${SecurityConfig.MIN_PASSWORD_LENGTH}文字以上である必要があります`;
        set({ error, loading: false });
        throw new Error(error);
      }

      // Supabase でログイン
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({
          error: error.message,
          loading: false,
          loginAttempts: get().loginAttempts + 1,
        });

        await AuditLogger.log({
          userId: email,
          action: 'LOGIN_ATTEMPT',
          resource: 'auth',
          status: 'failure',
          statusCode: 401,
          details: { reason: 'invalid_credentials' },
        });

        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Authentication failed');
      }

      // user_metadata から role を取得
      const userRole = (data.user.user_metadata?.role as 'student' | 'teacher' | 'admin') || 'student';

      // セッションを作成
      await SessionManager.createSession(
        data.user.id,
        data.user.email || '',
        userRole
      );

      // 監査ログを記録
      await AuditLogger.log({
        userId: data.user.id,
        action: 'LOGIN_SUCCESS',
        resource: 'auth',
        status: 'success',
        statusCode: 200,
      });

      set({
        user: data.user,
        session: data.session,
        role: userRole,
        loading: false,
        loginAttempts: 0,
        lastLoginAt: Date.now(),
      });

      // Initialize store syncs with new user ID
      await initializeAllStores(data.user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({
        error: message,
        loading: false,
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string, role: 'student' | 'teacher') => {
    try {
      set({ loading: true, error: null });

      // パスワード検証
      if (!SecurityConfig.PASSWORD_PATTERN.test(password)) {
        const error =
          'パスワードは以下を含む必要があります：大文字、小文字、数字、特殊文字（@$!%*?&）';
        set({ error, loading: false });
        throw new Error(error);
      }

      // メールアドレス検証
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        const error = '有効なメールアドレスを入力してください';
        set({ error, loading: false });
        throw new Error(error);
      }

      // Supabase でサインアップ（role を user_metadata に含める）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // プロフィールを作成
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          display_name: name,
          role,
        });

      if (profileError) {
        throw profileError;
      }

      // 監査ログを記録
      await AuditLogger.log({
        userId: data.user.id,
        action: 'SIGNUP_SUCCESS',
        resource: 'auth',
        status: 'success',
        statusCode: 201,
      });

      set({
        user: data.user,
        session: data.session,
        role: role,
        loading: false,
      });

      // Initialize store syncs with new user ID
      if (data.user) {
        await initializeAllStores(data.user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { user } = get();

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      // セッションを破棄
      await SessionManager.destroySession();

      // トークンをクリア
      await TokenManager.clearTokens();

      // 監査ログを記録
      if (user?.id) {
        await AuditLogger.log({
          userId: user.id,
          action: 'LOGOUT',
          resource: 'auth',
          status: 'success',
        });
      }

      set({
        user: null,
        session: null,
        role: null,
        loading: false,
        loginAttempts: 0,
        twoFactorVerified: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  refreshAccessToken: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.refreshSession();

      if (error || !data.session) {
        throw new Error('Token refresh failed');
      }

      set({
        session: data.session,
        user: data.session.user,
        loading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  enable2FA: async () => {
    try {
      // 本番環境では TOTP（時間ベースワンタイムパスワード）を実装
      // ここではプレースホルダー
      const qrCodeUrl = 'https://example.com/qr-code';
      set({ twoFactorEnabled: true });
      return qrCodeUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to enable 2FA';
      set({ error: message });
      throw error;
    }
  },

  verify2FA: async (code: string) => {
    try {
      // 本番環境では TOTP コードを検証
      // ここはスキップ
      set({ twoFactorVerified: true });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify 2FA';
      set({ error: message });
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });

      // 新しいパスワードを検証
      if (!SecurityConfig.PASSWORD_PATTERN.test(newPassword)) {
        const error =
          'パスワードは以下を含む必要があります：大文字、小文字、数字、特殊文字（@$!%*?&）';
        set({ error, loading: false });
        throw new Error(error);
      }

      // Supabase でパスワードを更新
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      const { user } = get();
      if (user?.id) {
        await AuditLogger.log({
          userId: user.id,
          action: 'PASSWORD_CHANGE',
          resource: 'auth',
          status: 'success',
        });
      }

      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      set({ error: message, loading: false });
      throw error;
    }
  },
}));

/**
 * Initialize all data stores with user ID for syncing
 * Called after successful authentication
 */
export async function initializeAllStores(userId: string) {
  try {
    // Dynamically import stores to avoid circular dependencies
    const { useLearningStore } = await import('./learningStore');
    const { useVocabularyStore } = await import('./vocabularyStore');
    const { useListeningStore } = await import('./listeningStore');
    const { useWritingStore } = await import('./writingStore');
    const { useShadowingStore } = await import('./shadowingStore');

    // Initialize all stores
    await Promise.all([
      useLearningStore.getState().initializeSync(userId),
      useVocabularyStore.getState().initializeSync(userId),
      useListeningStore.getState().initializeSync(userId),
      useWritingStore.getState().initializeSync(userId),
      useShadowingStore.getState().initializeSync(userId),
    ]);
  } catch (error) {
    console.error('[Auth] Failed to initialize stores:', error);
    // Non-fatal error - app should still work
  }
}
