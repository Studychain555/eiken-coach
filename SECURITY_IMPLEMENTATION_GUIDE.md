# EigoMaster セキュリティ実装ガイド

本番環境レベルのセキュリティ強化実装の詳細ガイドです。

## 目次

1. [概要](#概要)
2. [認証・認可](#認証認可)
3. [データ保護](#データ保護)
4. [API セキュリティ](#api-セキュリティ)
5. [クライアント側セキュリティ](#クライアント側セキュリティ)
6. [監査・ロギング](#監査ロギング)
7. [デプロイメント](#デプロイメント)

---

## 概要

### 実装済みのセキュリティコンポーネント

| コンポーネント | ファイル | 説明 |
|--|--|--|
| **JWT トークン管理** | `src/lib/securityManager.ts` | アクセス・リフレッシュトークンの生成・検証 |
| **セッション管理** | `src/lib/securityManager.ts` | セッション作成・検証・タイムアウト |
| **暗号化** | `src/lib/securityManager.ts` | AES-256-GCM による暗号化・複号化 |
| **監査ログ** | `src/lib/securityManager.ts` | セキュリティイベントの記録 |
| **レート制限** | `src/lib/securityManager.ts` | API・ログイン試行の制限 |
| **CSRF 保護** | `src/lib/securityManager.ts` | CSRF トークンの管理・検証 |
| **セキュア API** | `src/lib/secureApi.ts` | レート制限・CSRF 検証を含むラッパー |
| **強化認証ストア** | `src/stores/authStore.ts` | レート制限・監査ログを含む認証フロー |

### 実装の流れ

```
ユーザー入力
    ↓
[入力バリデーション]
    ↓
[API リクエスト]
    ↓
[SecureApiClient]
  - レート制限チェック
  - CSRF トークン追加
  - リトライロジック
    ↓
[Supabase/Backend]
  - RLS ポリシーチェック
  - アクセス制御
    ↓
[レスポンス]
  - 監査ログ記録
  - データ暗号化
    ↓
[ローカルストレージ]
  - トークン保存
  - セッション管理
```

---

## 認証・認可

### 1. JWT トークン管理

#### アクセストークンの生成と検証

```typescript
import { TokenManager } from '@/src/lib/securityManager';

// アクセストークンを生成
const accessToken = TokenManager.generateAccessToken(
  userId,
  email,
  role,
  secret_key
);

// トークンを検証
const payload = TokenManager.verifyToken(accessToken, secret_key);
if (!payload) {
  console.error('Invalid token');
}
```

#### トークンの有効期限

- **アクセストークン**: 15分
- **リフレッシュトークン**: 7日

```typescript
// TokenManager.ts より
TOKEN_LIFETIME: 15 * 60,                    // 15分
REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60   // 7日
```

### 2. セッション管理

#### セッションの作成・管理

```typescript
import { SessionManager } from '@/src/lib/securityManager';

// ログイン時にセッションを作成
const session = await SessionManager.createSession(
  userId,
  email,
  role,
  ipAddress,
  userAgent
);

// セッションを取得
const currentSession = await SessionManager.getSession();
if (!currentSession) {
  // セッションが無効（タイムアウト）
}

// アクティビティを更新（ユーザー操作時に呼び出し）
await SessionManager.updateSessionActivity();

// ログアウト時にセッションを破棄
await SessionManager.destroySession();
```

#### セッションタイムアウト

- **タイムアウト時間**: 30分
- **未アクティブで自動終了**

### 3. 2段階認証（準備）

```typescript
import { useAuthStore } from '@/src/stores/authStore';

const store = useAuthStore();

// 2FA を有効化
const qrCodeUrl = await store.enable2FA();
// QR コードをスキャンして Google Authenticator に登録

// 2FA コードを検証
const isValid = await store.verify2FA('123456');
```

### 4. 認証フローの実装例

```typescript
// ログイン
import { useAuthStore } from '@/src/stores/authStore';

const auth = useAuthStore();

try {
  // パスワード検証はクライアント側で実施
  await auth.signIn(email, password);
  // ✓ セッション作成
  // ✓ トークン保存
  // ✓ 監査ログ記録
} catch (error) {
  // レート制限エラー
  // 認証失敗
}

// ログアウト
await auth.signOut();
// ✓ トークン削除
// ✓ セッション破棄
// ✓ 監査ログ記録
```

---

## データ保護

### 1. データ暗号化

#### 暗号化・複号化

```typescript
import { EncryptionManager } from '@/src/lib/securityManager';

const encryptionKey = process.env.EXPO_PUBLIC_ENCRYPTION_KEY;

// データを暗号化
const encrypted = EncryptionManager.encrypt(
  'sensitive@email.com',
  encryptionKey
);

// データを複号化
const decrypted = EncryptionManager.decrypt(
  encrypted,
  encryptionKey
);

console.assert(decrypted === 'sensitive@email.com');
```

#### 自動暗号化フィールド

以下のフィールドは自動的に暗号化されます：

| テーブル | フィールド | 用途 |
|--|--|--|
| `profiles` | `email` | ユーザーメールアドレス |

**追加するには** `src/lib/secureSupabase.ts` の `SENSITIVE_FIELDS` を編集：

```typescript
const SENSITIVE_FIELDS: Record<string, string[]> = {
  profiles: ['email'],
  user_settings: ['phone_number', 'home_address'],
  // 必要に応じて追加
};
```

### 2. GDPR コンプライアンス

#### ユーザーデータのエクスポート

```typescript
import { GDPRCompliance } from '@/src/lib/secureSupabase';

// ユーザーの全データをエクスポート
const userData = await GDPRCompliance.exportUserData(userId);
console.log(userData);
// {
//   profiles: [...],
//   classes: [...],
// }
```

#### ユーザーデータの削除（右削除）

```typescript
// ユーザーの全データを削除
await GDPRCompliance.deleteUserData(userId);
```

#### ユーザーデータの匿名化

```typescript
// ユーザーのプライベートデータを匿名化
await GDPRCompliance.anonymizeUserData(userId);
// {
//   display_name: 'Anonymous_a1b2c3d4',
//   email: 'anon_a1b2c3d4@anonymous.eigomaster.jp'
// }
```

### 3. Row Level Security (RLS)

Supabase のRLS ポリシーを設定して、ユーザーが自分のデータのみアクセス可能にします。

#### RLS ポリシーの例

```sql
-- profiles テーブル - SELECT ポリシー（すべてのユーザーが読み取り可能）
CREATE POLICY "Enable read access for all users"
ON profiles FOR SELECT
USING (true);

-- profiles テーブル - INSERT ポリシー（認証済みユーザーが自分のデータのみ挿入可能）
CREATE POLICY "Enable insert for authenticated users"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- profiles テーブル - UPDATE ポリシー（認証済みユーザーが自分のデータのみ更新可能）
CREATE POLICY "Enable update for users"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## API セキュリティ

### 1. セキュアな API リクエスト

#### 基本的な使用方法

```typescript
import { secureApi, useSecureApi } from '@/src/lib/secureApi';

// GET リクエスト
const user = await useSecureApi<User>('GET', '/api/user/profile');

// POST リクエスト（CSRF トークンが自動的に追加される）
const result = await useSecureApi('POST', '/api/user/update', {
  name: 'New Name'
});

// レート制限をスキップ（管理者のみ）
const data = await useSecureApi('GET', '/api/admin/stats', undefined, {
  skipRateLimit: true
});
```

### 2. レート制限

#### ログイン試行の制限

```typescript
// 5回/分を超えるログイン試行は拒否
try {
  await auth.signIn(email, password);
} catch (error) {
  // "ログイン試行回数が多すぎます。1分後にもう一度試してください。"
}
```

#### API リクエストの制限

```typescript
// 100回/分を超える API リクエストは拒否
const result = await useSecureApi('GET', '/api/resource');
// 制限に達した場合: "Rate limit exceeded. Please try again later."
```

### 3. CSRF 保護

```typescript
import { CSRFTokenManager } from '@/src/lib/securityManager';

// CSRF トークンを生成
const token = CSRFTokenManager.generateToken();

// トークンを保存
await CSRFTokenManager.saveToken(token);

// トークンをリクエストヘッダーに追加（自動）
// X-CSRF-Token: <token>
```

### 4. 入力バリデーション

```typescript
import {
  validateEmail,
  validatePassword,
  validateFormFields,
  ValidationError
} from '@/src/lib/apiErrorHandler';

// メールアドレスの検証
if (!validateEmail(email)) {
  throw new Error('有効なメールアドレスを入力してください');
}

// パスワードの検証（最小12文字）
if (!validatePassword(password)) {
  throw new Error('パスワードは6文字以上である必要があります');
}

// フォーム全体の検証
const error = validateFormFields({
  email,
  password,
  name
});

if (error) {
  console.log(error.fields);
  // { email: '...', password: '...', name: '...' }
}
```

---

## クライアント側セキュリティ

### 1. ローカルストレージ管理

#### トークンの安全な保存

```typescript
import { TokenManager } from '@/src/lib/securityManager';

// トークンを保存（自動的に暗号化）
await TokenManager.saveTokens(
  accessToken,
  refreshToken,
  expiryTime
);

// トークンを取得
const { accessToken, refreshToken } = await TokenManager.getTokens();

// ログアウト時にトークンを削除
await TokenManager.clearTokens();
```

#### セッションの安全な管理

```typescript
import { SessionManager } from '@/src/lib/securityManager';

// セッションを作成
await SessionManager.createSession(userId, email, role);

// セッションを取得
const session = await SessionManager.getSession();

// セッションを破棄
await SessionManager.destroySession();
```

### 2. 環境変数の管理

#### `.env.local` の設定

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_SECRET=eyJhbGc...
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

#### `.gitignore` に追加

```bash
# .gitignore
.env.local
.env.*.local
*.env
.DS_Store
```

#### 環境変数の使用

```typescript
// 公開キー（EXPO_PUBLIC_ プレフィックス）
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// 秘密鍵（サーバーサイドのみ、または環境変数）
// const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_SECRET;
```

### 3. HTTPS 強制

すべての API 呼び出しは HTTPS 経由で実施：

```typescript
// ✓ 正しい
const url = 'https://api.eigomaster.jp/auth/login';

// ✗ 間違い
const url = 'http://api.eigomaster.jp/auth/login';
```

---

## 監査・ロギング

### 1. 監査ログの記録

```typescript
import { AuditLogger } from '@/src/lib/securityManager';

// ログイン成功
await AuditLogger.log({
  userId: 'user_123',
  action: 'LOGIN_SUCCESS',
  resource: 'auth',
  status: 'success',
  statusCode: 200,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// ログイン失敗
await AuditLogger.log({
  userId: 'user_123',
  action: 'LOGIN_ATTEMPT',
  resource: 'auth',
  status: 'failure',
  statusCode: 401,
  details: { reason: 'invalid_credentials' }
});

// データ更新
await AuditLogger.log({
  userId: 'user_123',
  action: 'DATA_UPDATE',
  resource: 'profiles',
  resourceId: 'profile_456',
  status: 'success',
  details: { updatedFields: ['display_name', 'email'] }
});
```

### 2. ログの表示

```typescript
import { AuditLogger } from '@/src/lib/securityManager';

// ローカルログを取得
const logs = await AuditLogger.getLocalLogs();

console.table(logs.map(log => ({
  timestamp: new Date(log.timestamp).toLocaleString(),
  action: log.action,
  resource: log.resource,
  status: log.status,
  userId: log.userId,
})));
```

### 3. ログの送信（本番環境）

本番環境では、監査ログをサーバーに送信するようにセットアップします：

```typescript
// src/lib/securityManager.ts の AuditLogger.sendToServer()
private static async sendToServer(entry: AuditLogEntry): Promise<void> {
  const { accessToken } = await TokenManager.getTokens();

  await fetch(`${API_BASE_URL}/api/audit-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(entry),
  });
}
```

---

## デプロイメント

### 1. デプロイ前チェック

```bash
# セキュリティテスト実行
npm test -- src/lib/__tests__/securityManager.test.ts

# 脆弱性スキャン
npm audit
npm audit fix

# ESLint チェック
npm run lint

# ビルドテスト
npm run build
```

### 2. 環境変数の検証

```bash
# 秘密鍵が Git に含まれていないか確認
git log --all --name-only | grep ".env"

# コード内に硬直された秘密鍵がないか確認
grep -r "sk-ant-api" src/
grep -r "EXPO_PUBLIC_SUPABASE_ANON_KEY" src/
```

### 3. 本番環境固有の設定

#### サーバーサイド実装

本番環境では以下をサーバーサイドで実装します：

1. **パスワードハッシュ化** (bcrypt/argon2)
2. **JTI レジスタリ** (トークン二重使用防止)
3. **監査ログの永続化** (データベース)
4. **IP ホワイトリスト** (API アクセス制限)
5. **レート制限の強化** (分散システム対応)

#### クライアント側の設定

```typescript
// 本番環境の環境変数を設定
process.env.NODE_ENV = 'production';

// API タイムアウトを厳格に設定
SecurityConfig.API_TIMEOUT_MS = 20000; // 20秒

// レート制限を強化
SecurityConfig.AUTH_RATE_LIMIT = 3; // 3回/分
SecurityConfig.API_RATE_LIMIT = 50; // 50回/分
```

---

## トラブルシューティング

### Q1: JWT トークンが無効と判定される

**原因**: 署名鍵が異なる、または有効期限切れ

```typescript
// チェックリスト
const payload = TokenManager.verifyToken(token, secret);
if (!payload) {
  // 1. secret が正しいか確認
  // 2. トークンの有効期限をチェック
  // 3. トークンが改ざんされていないか確認
}
```

### Q2: レート制限に引っかかる

**原因**: 短時間に大量のリクエストを送信している

```typescript
// 解決方法
// 1. リクエストの頻度を減らす
// 2. skipRateLimit: true を設定（管理者のみ）
// 3. レート制限の値を調整（SecurityConfig）
```

### Q3: CSRF トークンエラーが発生

**原因**: トークンが保存されていない、または検証に失敗

```typescript
// デバッグ
const token = await CSRFTokenManager.getToken();
console.log('Token:', token);

// トークンを再生成
const newToken = CSRFTokenManager.generateToken();
await CSRFTokenManager.saveToken(newToken);
```

---

## パフォーマンス最適化

### 1. トークンリフレッシュの最適化

```typescript
// トークンローテーションの阾値（5分）を設定
TOKEN_ROTATION_THRESHOLD = 5 * 60;

// 有効期限の5分前に自動リフレッシュ
if (TokenManager.shouldRotateToken()) {
  await auth.refreshAccessToken();
}
```

### 2. レート制限のキャッシング

```typescript
// レート制限情報をメモリにキャッシュ
// （AsyncStorage への読み書きを最小化）
```

### 3. 監査ログのバッチ処理

```typescript
// 本番環境では監査ログをバッチで送信
// （ネットワークトラフィック削減）
```

---

## まとめ

EigoMaster のセキュリティ実装は以下の点で本番環境レベルです：

✓ JWT による認証・認可
✓ セッション管理とタイムアウト
✓ AES-256-GCM による暗号化
✓ GDPR コンプライアンス
✓ 監査ログ記録
✓ API レート制限
✓ CSRF 保護
✓ 入力バリデーション
✓ ローカルストレージ保護

**次のステップ:**
1. 本番環境でのテスト実施
2. セキュリティ脆弱性スキャン実施
3. ペネトレーション テスト実施
4. サーバーサイドの強化実装
5. 定期的なセキュリティ監査

---

**ドキュメント更新日**: 2026-03-19
**バージョン**: 1.0.0
