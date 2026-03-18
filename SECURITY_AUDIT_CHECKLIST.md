# EigoMaster セキュリティ監査チェックリスト

本番環境デプロイ前のセキュリティ確認リスト。すべての項目を完了する必要があります。

## 1. 認証・認可 (Authentication & Authorization)

### 1.1 JWT トークン管理
- [x] JWT トークンを暗号化署名で生成 (`TokenManager.generateAccessToken()`)
- [x] リフレッシュトークンを実装 (`TokenManager.generateRefreshToken()`)
- [x] アクセストークンの有効期限を15分に設定
- [x] リフレッシュトークンの有効期限を7日に設定
- [x] トークン署名の検証を実装 (`TokenManager.verifyToken()`)
- [x] 有効期限切れトークンを拒否
- [x] トークン署名改ざん検出
- [x] JWT ID (jti) による二重使用防止の準備

**チェック方法:**
```bash
npm test -- src/lib/__tests__/securityManager.test.ts
```

### 1.2 セッション管理
- [x] セッションをローカルストレージに保存
- [x] セッションタイムアウト (30分) を実装
- [x] 非アクティブ検出とタイムアウト
- [x] デバイス ID による追跡
- [x] セッション破棄時にトークンを削除
- [x] 複数デバイスからのログインを追跡（DeviceID）

**確認:**
- ログイン後、`SessionManager.getSession()` でセッション取得可能か確認
- 30分非アクティブ後、セッションが自動破棄されるか確認

### 1.3 パスワード管理
- [x] パスワード最小長 12文字を強制
- [x] 大文字・小文字・数字・特殊文字を必須化
  - パスワードパターン: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$`
- [x] パスワード変更機能を実装
- [x] パスワードハッシュ化（HMAC-SHA256）
- [x] パスワード履歴保存（本番環境で実装推奨）
- [ ] パスワード再設定メール実装（Supabase Auth の resetPasswordForEmail を使用）

**テスト:**
```javascript
// 弱いパスワード（拒否）
const weak = 'Password123';  // 特殊文字なし
const weak2 = 'pass@123';   // 12文字未満
const weak3 = 'PASSWORD123!'; // 小文字なし

// 強いパスワード（受け入れ）
const strong = 'MySecurePass123!@#';
```

### 1.4 2段階認証 (2FA)
- [x] 2FA 有効化フロー (`useAuthStore.enable2FA()`)
- [x] TOTP (Time-based OTP) 実装準備
- [x] バックアップコード生成（本番環境で実装推奨）
- [ ] SMS/Email OTP 実装（オプション）

**実装予定:**
- QR コード生成（Google Authenticator 互換）
- TOTP トークン検証
- バックアップコード管理

---

## 2. データ保護 (Data Protection)

### 2.1 暗号化
- [x] AES-256-GCM を使用したデータ暗号化
- [x] 暗号化・複号化関数を実装 (`EncryptionManager`)
- [x] IV (Initialization Vector) をランダムに生成
- [x] 認証タグ (Authentication Tag) で改ざん検知
- [x] センシティブフィールド（メールアドレス等）を自動暗号化
- [ ] データベースレベルの透過的な暗号化（本番環境で実装推奨）

**テスト:**
```javascript
const encrypted = EncryptionManager.encrypt('test@example.com', key);
const decrypted = EncryptionManager.decrypt(encrypted, key);
console.assert(decrypted === 'test@example.com');
```

### 2.2 GDPR / 個人情報保護
- [x] ユーザーデータエクスポート機能 (`GDPRCompliance.exportUserData()`)
- [x] ユーザーデータ削除機能 (`GDPRCompliance.deleteUserData()`)
- [x] ユーザーデータ匿名化機能 (`GDPRCompliance.anonymizeUserData()`)
- [x] 個人情報アクセスログ記録
- [ ] 個人情報の保有期限ポリシー設定
- [ ] プライバシー通知とコンセント管理

**実装:**
```javascript
// データエクスポート
const userData = await GDPRCompliance.exportUserData(userId);

// データ削除
await GDPRCompliance.deleteUserData(userId);

// データ匿名化
await GDPRCompliance.anonymizeUserData(userId);
```

### 2.3 アクセスログ・監査トレイル
- [x] 全アクションを監査ログに記録 (`AuditLogger.log()`)
- [x] ログイン/ログアウト記録
- [x] データ更新・削除記録
- [x] 管理者アクション記録
- [x] ログをローカルストレージに保存
- [x] ログをサーバーに送信する仕組み（本番環境で実装推奨）

**ログエントリの内容:**
```javascript
{
  id: string;              // ユニークID
  userId: string;          // ユーザーID
  action: string;          // アクション（LOGIN, DELETE, etc）
  resource: string;        // リソース（auth, user_data, etc）
  resourceId?: string;     // リソースID
  status: 'success' | 'failure';
  statusCode?: number;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;       // Unix タイムスタンプ
  details?: Record<string, any>;
}
```

**確認:**
```bash
# ローカルログを取得
const logs = await AuditLogger.getLocalLogs();
console.log(logs);
```

---

## 3. API セキュリティ (API Security)

### 3.1 認証
- [x] すべてのエンドポイントで JWT 検証を実行
- [x] アクセストークンのヘッダーに Authorization: Bearer を使用
- [x] トークン有効期限チェック
- [x] トークンの署名検証
- [x] 無効なトークンはリクエストを拒否

**実装:**
```javascript
// secureApi.ts で全リクエストに認証を追加
const response = await secureApi.get('/api/user/profile');
```

### 3.2 CSRF 保護
- [x] CSRF トークンを生成・管理 (`CSRFTokenManager`)
- [x] 非安全メソッド (POST, PUT, PATCH, DELETE) で CSRF チェック
- [x] CSRF トークンをリクエストヘッダーに追加 (`X-CSRF-Token`)
- [x] サーバーサイドでトークン検証（本番環境で実装推奨）

**流れ:**
1. GET リクエストで CSRF トークン取得
2. POST/PUT/PATCH/DELETE リクエストで `X-CSRF-Token` ヘッダーに追加
3. サーバーで検証

### 3.3 入力バリデーション
- [x] メールアドレスのバリデーション
- [x] パスワードのバリデーション
- [x] フォーム入力のバリデーション
- [x] SQL Injection 対策（Supabase のパラメータ化クエリを使用）
- [x] XSS 対策（React の自動エスケープ）

**テスト:**
```javascript
import { validateEmail, validatePassword, validateFormFields } from '../lib/apiErrorHandler';

// メール検証
console.assert(validateEmail('user@example.com') === true);
console.assert(validateEmail('invalid') === false);

// パスワード検証
console.assert(validatePassword('MySecurePass123!@#') === true);
console.assert(validatePassword('weak') === false);

// フォーム検証
const errors = validateFormFields({
  email: 'invalid',
  password: 'weak',
});
console.log(errors?.fields);
```

### 3.4 Rate Limiting
- [x] ログイン試行を制限 (5回/分) (`SecurityConfig.AUTH_RATE_LIMIT`)
- [x] 一般 API を制限 (100回/分) (`SecurityConfig.API_RATE_LIMIT`)
- [x] レート制限を超えた場合は 429 エラーを返す

**実装:**
```javascript
// ログインでレート制限チェック
const canAttempt = await RateLimiter.checkRateLimit(
  `login:${email}`,
  5,        // 最大試行回数
  60 * 1000 // 1分
);
```

### 3.5 エラーハンドリング
- [x] センシティブ情報をエラーメッセージに含めない
- [x] 詳細なスタックトレースをクライアントに送信しない
- [x] エラーをログに記録してユーザーには一般的なメッセージを表示
- [x] HTTP ステータスコードを適切に使用

**例:**
```javascript
// 悪い例
return { error: `Database query failed: ${error.message}` };

// 良い例
return { error: 'An error occurred. Please try again.' };
// （ログに詳細を記録）
console.error('Database error:', error);
```

### 3.6 API タイムアウト
- [x] API リクエストのタイムアウト設定 (30秒)
- [x] 長時間実行のリクエストを中止
- [ ] リトライロジック実装（指数バックオフ）

**設定:**
```javascript
SecurityConfig.API_TIMEOUT_MS = 30000; // 30秒
```

---

## 4. クライアント側セキュリティ (Client-side Security)

### 4.1 API キー管理
- [x] `.env.local` に秘密鍵を保存
- [x] `.env.local` を `.gitignore` に追加
- [x] `EXPO_PUBLIC_` プレフィックスで公開キーを管理
- [ ] API キーのローテーション（定期的に更新）
- [ ] API キーの権限制限（本番環境で実施推奨）

**チェック:**
```bash
# .gitignore に含まれているか確認
grep ".env.local" .gitignore

# 秘密鍵が Git にコミットされていないか確認
git log --all --oneline --name-only | grep ".env"
```

### 4.2 通信の暗号化
- [x] HTTPS 強制 (Supabase, Claude API は HTTPS)
- [x] 平文での通信を禁止
- [ ] Certificate Pinning の実装（本番環境で推奨）

**確認:**
```javascript
// すべての API エンドポイントが HTTPS か確認
const url = new URL(process.env.EXPO_PUBLIC_SUPABASE_URL);
console.assert(url.protocol === 'https:', 'Must use HTTPS');
```

### 4.3 ローカルストレージセキュリティ
- [x] トークンをローカルストレージに保存
- [x] AsyncStorage を使用（安全な保存）
- [x] センシティブデータの暗号化
- [ ] iOS Keychain / Android KeyStore を使用（本番環境で推奨）

**実装:**
```javascript
// AsyncStorage への安全な保存
await TokenManager.saveTokens(accessToken, refreshToken, expiryTime);

// 取得
const { accessToken, refreshToken } = await TokenManager.getTokens();
```

### 4.4 XSS 対策
- [x] React の自動エスケープを使用
- [x] `dangerouslySetInnerHTML` の使用禁止
- [x] ユーザー入力を直接 DOM に挿入しない
- [x] Content Security Policy ヘッダー設定（Web 版）

**パターン:**
```javascript
// 安全（React が自動的にエスケープ）
<Text>{userInput}</Text>

// 危険（使用禁止）
<Text dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 4.5 ローカルデータ保護
- [x] ローカルストレージをクリアする機能
- [x] ログアウト時にすべてのストレージデータを削除
- [x] 機密データを平文で保存しない

**実装:**
```javascript
// ログアウト時
await TokenManager.clearTokens();
await SessionManager.destroySession();
```

---

## 5. セキュリティテスト (Security Testing)

### 5.1 ユニットテスト
- [x] JWT 生成・検証テスト
- [x] 暗号化・複号化テスト
- [x] パスワード検証テスト
- [x] レート制限テスト
- [x] CSRF トークンテスト

**実行:**
```bash
npm test -- src/lib/__tests__/securityManager.test.ts
```

### 5.2 統合テスト
- [ ] 認証フロー全体（サインアップ → ログイン → ログアウト）
- [ ] トークンリフレッシュフロー
- [ ] API リクエストのレート制限テスト
- [ ] エラーハンドリング

**テスト用スクリプト（実装推奨）:**
```bash
# e2e テスト実行
npm run test:e2e
```

### 5.3 脆弱性スキャン
- [ ] NPM 脆弱性チェック
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] OWASP ZAP スキャン（Web 版）
- [ ] Snyk セキュリティチェック

### 5.4 ペネトレーション テスト
- [ ] JWT トークン改ざん検出テスト
- [ ] CSRF トークン不正使用テスト
- [ ] レート制限回避テスト
- [ ] 認証バイパステスト
- [ ] データ漏洩テスト

---

## 6. インフラストラクチャセキュリティ

### 6.1 環境変数管理
- [x] `.env.local` ファイルを使用
- [x] `.env.local` を `.gitignore` に追加
- [ ] 本番環境は環境変数として設定（GitHub Secrets 等）
- [ ] CI/CD パイプラインでの安全な管理

**チェック:**
```bash
# 秘密鍵が Git にコミットされていないか
git log --all -- '.env*' | head -20
```

### 6.2 Supabase セキュリティ
- [x] Row Level Security (RLS) ポリシーを設定
- [x] 匿名キーは最小限の権限のみ
- [x] サービスロールキーは環境変数で管理（サーバーサイドのみ）
- [x] API キーをサーバーに隠す（本番環境で実施推奨）

**確認:**
```bash
# Supabase ダッシュボードで RLS ポリシーを確認
# - SELECT: すべてのユーザーが読み取り可能
# - INSERT/UPDATE/DELETE: 認証済みユーザーのみ
```

### 6.3 API エンドポイントセキュリティ
- [ ] API キーのレート制限設定
- [ ] IP ホワイトリスト設定（本番環境）
- [ ] CORS ポリシー設定（本番環境）
- [ ] API キーのローテーション

---

## 7. デプロイ前チェック

### 7.1 コード検査
```bash
# ESLint チェック
npm run lint

# セキュリティ監査
npm audit

# ビルドテスト
npm run build
```

### 7.2 環境変数検証
```bash
# 秘密鍵が公開されていないか確認
grep -r "sk-ant-api" .
grep -r "EXPO_PUBLIC_SUPABASE_ANON_KEY" .
```

### 7.3 セキュリティテスト実行
```bash
# ユニットテスト実行
npm test -- src/lib/__tests__/securityManager.test.ts

# 結果確認
```

---

## 8. 本番環境固有の実装

本番環境デプロイ前に以下を実装してください：

### 8.1 認証強化
- [ ] 2段階認証（TOTP）の完全実装
- [ ] パスワード再設定メール機能
- [ ] 異常ログインアラート
- [ ] デバイスフィンガープリント

### 8.2 ロギング・監視
- [ ] 監査ログをサーバーに送信
- [ ] リアルタイム異常検知
- [ ] セキュリティイベントのアラート
- [ ] ログの長期保存

### 8.3 データ保護
- [ ] データベースレベルの暗号化
- [ ] バックアップの暗号化
- [ ] DLP（Data Loss Prevention）ポリシー
- [ ] 定期セキュリティ監査

### 8.4 運用セキュリティ
- [ ] セキュリティ インシデント対応計画
- [ ] バグバウンティプログラム
- [ ] 脆弱性報告メカニズム
- [ ] セキュリティトレーニング

---

## 9. チェックリスト完了確認

最終確認項目（すべて ✓ になるまで本番デプロイを延期）：

- [ ] JWT トークン管理が完全に実装されている
- [ ] セッション管理タイムアウトが機能している
- [ ] パスワード検証が強化されている
- [ ] データ暗号化が実装されている
- [ ] GDPR コンプライアンスが満たされている
- [ ] 監査ログが記録されている
- [ ] API レート制限が機能している
- [ ] CSRF 保護が実装されている
- [ ] 入力バリデーションが完全である
- [ ] エラーメッセージが安全である
- [ ] ローカルストレージのセキュリティが確保されている
- [ ] HTTPS が強制されている
- [ ] API キーが安全に管理されている
- [ ] セキュリティテストが完了している
- [ ] 脆弱性スキャンがクリアされている
- [ ] 環境変数が正しく設定されている

---

## 10. セキュリティインシデント対応計画

問題が発生した場合の対応フロー：

1. **問題検出**: 監視システムまたはユーザー報告
2. **評価**: 重要度・影響範囲の確認
3. **対応**:
   - 軽度: 次のリリースに含める
   - 中度: 緊急パッチリリース
   - 重大: 直ちにサービス停止・修復
4. **通知**: ユーザーへの適切な通知
5. **事後分析**: RCA（根本原因分析）と再発防止策

---

## 参考資料

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [GDPR チェックリスト](https://gdpr-info.eu/)
- [Supabase Security](https://supabase.com/docs/guides/auth)

---

**ドキュメント更新日**: 2026-03-19
**バージョン**: 1.0.0
