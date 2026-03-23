/**
 * セキュアな Supabase クライアント
 * 暗号化、RLS 検証、監査ログ機能を拡張
 */

import { supabase } from './supabase';
import { EncryptionManager, AuditLogger } from './securityManager';
import type { Database } from './supabase';

export interface EncryptionConfig {
  enabled: boolean;
  fields?: string[];
}

/**
 * センシティブフィールドの定義
 * これらのフィールドは自動的に暗号化される
 */
const SENSITIVE_FIELDS: Record<string, string[]> = {
  profiles: ['email'],
  classes: [],
};

export class SecureSupabaseClient {
  /**
   * テーブルからデータを取得（暗号化フィールド対応）
   */
  static async from<T extends keyof Database['public']['Tables']>(
    table: T,
    encryptionKey?: string
  ) {
    return {
      select: async (columns: string = '*') => {
        const query = supabase.from(table).select(columns);

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // データを複号化
        if (encryptionKey && data) {
          return this.decryptData(
            data,
            table,
            encryptionKey
          );
        }

        return data;
      },

      filter: (column: string, operator: string, value: any) => {
        const query = supabase.from(table).select('*');

        // フィルター処理（通常の方法で実施）
        if (operator === 'eq') {
          query.eq(column, value);
        } else if (operator === 'neq') {
          query.neq(column, value);
        }

        return query;
      },

      insert: async (records: any[], encryptionKey?: string) => {
        // データを暗号化
        const encrypted = this.encryptData(
          records,
          table,
          encryptionKey
        );

        const { data, error } = await supabase
          .from(table)
          .insert(encrypted)
          .select();

        if (error) {
          throw error;
        }

        return data;
      },

      update: async (
        id: string,
        updates: any,
        encryptionKey?: string
      ) => {
        // データを暗号化
        const encrypted = this.encryptData(
          [updates],
          table,
          encryptionKey
        )[0];

        const { data, error } = await supabase
          .from(table)
          .update(encrypted)
          .eq('id', id)
          .select();

        if (error) {
          throw error;
        }

        // 監査ログを記録
        await AuditLogger.log({
          userId: 'system', // 実装では実際のユーザーID を使用
          action: 'DATA_UPDATE',
          resource: table.toString(),
          resourceId: id,
          status: 'success',
          details: {
            updatedFields: Object.keys(updates),
          },
        });

        return data;
      },

      delete: async (id: string) => {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // 監査ログを記録
        await AuditLogger.log({
          userId: 'system',
          action: 'DATA_DELETE',
          resource: table.toString(),
          resourceId: id,
          status: 'success',
        });
      },
    };
  }

  /**
   * プライベート: データを暗号化
   */
  private static encryptData(
    records: any[],
    table: string,
    encryptionKey?: string
  ): any[] {
    if (!encryptionKey) {
      return records;
    }

    const fieldsToEncrypt = SENSITIVE_FIELDS[table] || [];

    return records.map((record) => {
      const encrypted = { ...record };

      fieldsToEncrypt.forEach((field) => {
        if (encrypted[field]) {
          encrypted[field] = EncryptionManager.encrypt(
            encrypted[field],
            encryptionKey
          );
        }
      });

      return encrypted;
    });
  }

  /**
   * プライベート: データを複号化
   */
  private static decryptData(
    records: any[],
    table: string,
    encryptionKey: string
  ): any[] {
    const fieldsToDecrypt = SENSITIVE_FIELDS[table] || [];

    return records.map((record) => {
      const decrypted = { ...record };

      fieldsToDecrypt.forEach((field) => {
        if (decrypted[field]) {
          try {
            decrypted[field] = EncryptionManager.decrypt(
              decrypted[field],
              encryptionKey
            );
          } catch (error) {
            console.error(`[SecureSupabase] Decryption failed for ${field}:`, error);
            // 複号化失敗時はオリジナル値を保持
          }
        }
      });

      return decrypted;
    });
  }
}

/**
 * RLS ポリシー検証ヘルパー
 */
export class RLSValidator {
  /**
   * SELECT アクセスを検証
   */
  static async canSelect(
    table: string,
    userId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * INSERT アクセスを検証
   */
  static async canInsert(
    table: string,
    userId: string
  ): Promise<boolean> {
    try {
      // テスト用の小さなレコードを挿入してすぐに削除
      const testRecord = { id: `test_${Date.now()}` };

      const { data: inserted, error: insertError } = await supabase
        .from(table)
        .insert([testRecord])
        .select();

      if (insertError) return false;

      // テストレコードを削除
      if (inserted && inserted[0]) {
        await supabase
          .from(table)
          .delete()
          .eq('id', inserted[0].id);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * UPDATE アクセスを検証
   */
  static async canUpdate(
    table: string,
    userId: string,
    recordId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(table)
        .update({ updated_at: new Date().toISOString() })
        .eq('id', recordId);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * DELETE アクセスを検証
   */
  static async canDelete(
    table: string,
    userId: string,
    recordId: string
  ): Promise<boolean> {
    try {
      // テストしない（実際の削除は避ける）
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * データの GDPR コンプライアンスメソッド
 */
export class GDPRCompliance {
  /**
   * ユーザーの全データをエクスポート
   */
  static async exportUserData(userId: string): Promise<Record<string, any>> {
    try {
      const tables = ['profiles', 'classes'];
      const userData: Record<string, any> = {};

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', userId);

        if (!error && data) {
          userData[table] = data;
        }
      }

      // 監査ログを記録
      await AuditLogger.log({
        userId,
        action: 'DATA_EXPORT',
        resource: 'gdpr',
        status: 'success',
        details: { tables },
      });

      return userData;
    } catch (error) {
      console.error('[GDPR] Data export failed:', error);
      throw error;
    }
  }

  /**
   * ユーザーの全データを削除（右削除）
   */
  static async deleteUserData(userId: string): Promise<void> {
    try {
      const tables = ['profiles', 'classes'];

      for (const table of tables) {
        await supabase
          .from(table)
          .delete()
          .eq('id', userId);
      }

      // 監査ログを記録
      await AuditLogger.log({
        userId,
        action: 'DATA_DELETE_GDPR',
        resource: 'gdpr',
        status: 'success',
        details: { tables },
      });
    } catch (error) {
      console.error('[GDPR] Data deletion failed:', error);
      throw error;
    }
  }

  /**
   * ユーザーの個人情報を匿名化
   */
  static async anonymizeUserData(userId: string): Promise<void> {
    try {
      const anonymousData = {
        display_name: `Anonymous_${userId.slice(0, 8)}`,
        email: `anon_${userId.slice(0, 8)}@anonymous.eigomaster.jp`,
      };

      await supabase
        .from('profiles')
        .update(anonymousData)
        .eq('id', userId);

      // 監査ログを記録
      await AuditLogger.log({
        userId,
        action: 'DATA_ANONYMIZE_GDPR',
        resource: 'gdpr',
        status: 'success',
      });
    } catch (error) {
      console.error('[GDPR] Data anonymization failed:', error);
      throw error;
    }
  }
}
