/**
 * 認可ガード
 *
 * 機能:
 * - ユーザーの権限を事前チェック
 * - RLS ポリシー違反を防止
 * - リソースアクセス権限の検証
 */

import { supabase } from './supabase';
import { globalErrorHandler } from './globalErrorHandler';
import { ErrorType } from './errorHandler';
import { debugError } from './debugUtils';

export type ResourceAction = 'read' | 'create' | 'update' | 'delete';

export interface Permission {
  resource: string;
  actions: ResourceAction[];
  conditions?: Record<string, any>;
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  role: string;
}

/**
 * 認可ガード
 */
export class AuthGuard {
  private permissionCache: Map<string, UserPermissions> = new Map();
  private readonly cacheTTL: number = 5 * 60 * 1000; // 5分

  /**
   * ユーザーの権限を事前チェック
   */
  async checkAuthorizationBeforeQuery(
    userId: string,
    resource: string,
    action: ResourceAction
  ): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);

      const hasPermission = permissions.permissions.some((p) =>
        p.resource === resource && p.actions.includes(action)
      );

      if (!hasPermission) {
        debugError('AuthGuard', `Permission denied: ${userId} ${action} ${resource}`);

        globalErrorHandler.registerError({
          type: ErrorType.PERMISSION,
          message: `このアクション（${action}）を実行する権限がありません`,
          userMessage: {
            title: '権限がありません',
            description: `${resource} への ${action} アクションは許可されていません`,
          },
          timestamp: new Date(),
        });

        return false;
      }

      debugError('AuthGuard', `Permission granted: ${userId} ${action} ${resource}`);
      return true;
    } catch (error) {
      debugError('AuthGuard', `Authorization check failed: ${userId}`, error);
      return false;
    }
  }

  /**
   * ユーザーの権限を取得
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // キャッシュから取得
    const cached = this.permissionCache.get(userId);
    if (cached && Date.now() - (cached as any).__timestamp < this.cacheTTL) {
      return cached;
    }

    // Supabase から取得
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      debugError('AuthGuard', `Failed to fetch user profile: ${userId}`, error);
      throw new Error('User profile not found');
    }

    // ロール別のデフォルト権限
    const defaultPermissions = this.getDefaultPermissionsForRole(profile.role);

    const userPermissions: UserPermissions = {
      userId,
      permissions: defaultPermissions,
      role: profile.role,
    };

    // キャッシュに保存
    (userPermissions as any).__timestamp = Date.now();
    this.permissionCache.set(userId, userPermissions);

    return userPermissions;
  }

  /**
   * ロール別のデフォルト権限を取得
   */
  private getDefaultPermissionsForRole(role: string): Permission[] {
    switch (role) {
      case 'admin':
        return [
          { resource: '*', actions: ['read', 'create', 'update', 'delete'] },
        ];
      case 'teacher':
        return [
          { resource: 'classes', actions: ['read', 'create', 'update'] },
          { resource: 'students', actions: ['read', 'update'] },
          { resource: 'assignments', actions: ['read', 'create', 'update'] },
        ];
      case 'student':
        return [
          { resource: 'assignments', actions: ['read'] },
          { resource: 'submissions', actions: ['read', 'create'] },
          { resource: 'profile', actions: ['read', 'update'] },
        ];
      default:
        return [
          { resource: 'profile', actions: ['read'] },
        ];
    }
  }

  /**
   * RLS ポリシー違反かチェック
   */
  async checkRLSPolicy(
    userId: string,
    table: string,
    recordId: string,
    action: ResourceAction
  ): Promise<boolean> {
    try {
      // テストクエリを実行して RLS ポリシーの適用を確認
      const { error } = await supabase
        .from(table)
        .select('id')
        .eq('id', recordId)
        .limit(1);

      if (error) {
        if (error.status === 403) {
          debugError('AuthGuard', `RLS policy violation: ${userId} ${table} ${recordId}`, error);

          globalErrorHandler.registerError({
            type: ErrorType.PERMISSION,
            message: 'RLS ポリシーにより、このデータにアクセスできません',
            userMessage: {
              title: 'アクセス制限',
              description: 'このデータにはアクセスする権限がありません',
            },
            timestamp: new Date(),
          });

          return false;
        }

        throw error;
      }

      return true;
    } catch (error) {
      debugError('AuthGuard', `RLS check failed: ${userId} ${table}`, error);
      return false;
    }
  }

  /**
   * 権限キャッシュをクリア
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.permissionCache.delete(userId);
      debugError('AuthGuard', `Permission cache cleared for user: ${userId}`);
    } else {
      this.permissionCache.clear();
      debugError('AuthGuard', 'Permission cache cleared for all users');
    }
  }

  /**
   * 権限キャッシュをクリア（ユーザー削除時）
   */
  onUserLogout(userId: string): void {
    this.clearCache(userId);
  }
}

// シングルトンインスタンス
let sharedAuthGuard: AuthGuard | null = null;

/**
 * 認可ガードを取得
 */
export function getAuthGuard(): AuthGuard {
  if (!sharedAuthGuard) {
    sharedAuthGuard = new AuthGuard();
  }
  return sharedAuthGuard;
}

/**
 * 権限チェックミドルウェア（React Query/SWR 向け）
 */
export async function withAuthCheck<T>(
  userId: string,
  resource: string,
  action: ResourceAction,
  fn: () => Promise<T>
): Promise<T> {
  const guard = getAuthGuard();

  // 権限をチェック
  const hasPermission = await guard.checkAuthorizationBeforeQuery(userId, resource, action);

  if (!hasPermission) {
    throw new Error(`Permission denied: ${action} ${resource}`);
  }

  // 権限がある場合、関数を実行
  return fn();
}

/**
 * 使用例:
 *
 * import { getAuthGuard, withAuthCheck } from '@/lib/authGuard';
 *
 * const guard = getAuthGuard();
 *
 * // 事前チェック
 * const canUpdate = await guard.checkAuthorizationBeforeQuery(
 *   userId,
 *   'assignments',
 *   'update'
 * );
 *
 * if (canUpdate) {
 *   await updateAssignment(assignmentId, data);
 * }
 *
 * // ミドルウェア形式
 * const result = await withAuthCheck(
 *   userId,
 *   'assignments',
 *   'delete',
 *   () => deleteAssignment(assignmentId)
 * );
 */
