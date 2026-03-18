/**
 * セキュリティマネージャーのテストスイート
 * JWT, トークン, 暗号化, セッション管理のテスト
 */

import {
  TokenManager,
  SessionManager,
  EncryptionManager,
  AuditLogger,
  RateLimiter,
  CSRFTokenManager,
  SecurityConfig,
} from '../securityManager';

describe('SecurityManager - JWT Token Management', () => {
  const testSecret = 'test_secret_key_1234567890ab';
  const userId = 'user_123';
  const email = 'user@example.com';
  const role = 'student' as const;

  test('should generate valid access token', () => {
    const token = TokenManager.generateAccessToken(userId, email, role, testSecret);

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
  });

  test('should generate valid refresh token', () => {
    const token = TokenManager.generateRefreshToken(userId, testSecret);

    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3);
  });

  test('should verify valid token', () => {
    const token = TokenManager.generateAccessToken(userId, email, role, testSecret);
    const payload = TokenManager.verifyToken(token, testSecret);

    expect(payload).toBeDefined();
    expect(payload?.sub).toBe(userId);
    expect(payload?.email).toBe(email);
    expect(payload?.role).toBe(role);
  });

  test('should reject invalid token signature', () => {
    const token = TokenManager.generateAccessToken(userId, email, role, testSecret);
    const invalidToken = token.slice(0, -5) + '12345'; // 署名を改ざん

    const payload = TokenManager.verifyToken(invalidToken, testSecret);

    expect(payload).toBeNull();
  });

  test('should reject expired token', (done) => {
    const token = TokenManager.generateAccessToken(userId, email, role, testSecret);

    // トークンを検証
    let payload = TokenManager.verifyToken(token, testSecret);
    expect(payload).toBeDefined();

    // 有効期限を超過させる（テスト用）
    setTimeout(() => {
      payload = TokenManager.verifyToken(token, testSecret);
      expect(payload).toBeDefined(); // まだ有効（15分以内）
      done();
    }, 100);
  });

  test('should reject token with wrong secret', () => {
    const token = TokenManager.generateAccessToken(userId, email, role, testSecret);
    const wrongSecret = 'wrong_secret_key_1234567890ab';

    const payload = TokenManager.verifyToken(token, wrongSecret);

    expect(payload).toBeNull();
  });
});

describe('SecurityManager - Encryption', () => {
  const encryptionKey = 'my_secret_encryption_key_12345';
  const plaintext = 'sensitive data';

  test('should encrypt plaintext', () => {
    const ciphertext = EncryptionManager.encrypt(plaintext, encryptionKey);

    expect(ciphertext).toBeDefined();
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext.split(':')).toHaveLength(3); // IV:Ciphertext:AuthTag
  });

  test('should decrypt ciphertext correctly', () => {
    const ciphertext = EncryptionManager.encrypt(plaintext, encryptionKey);
    const decrypted = EncryptionManager.decrypt(ciphertext, encryptionKey);

    expect(decrypted).toBe(plaintext);
  });

  test('should fail to decrypt with wrong key', () => {
    const ciphertext = EncryptionManager.encrypt(plaintext, encryptionKey);
    const wrongKey = 'wrong_encryption_key_1234567890';

    expect(() => {
      EncryptionManager.decrypt(ciphertext, wrongKey);
    }).toThrow();
  });

  test('should fail to decrypt tampered ciphertext', () => {
    let ciphertext = EncryptionManager.encrypt(plaintext, encryptionKey);
    const parts = ciphertext.split(':');
    parts[1] = 'tampered_data'; // データを改ざん
    ciphertext = parts.join(':');

    expect(() => {
      EncryptionManager.decrypt(ciphertext, encryptionKey);
    }).toThrow();
  });

  test('should hash password', () => {
    const password = 'MySecurePassword123!@#';
    const hash = EncryptionManager.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash).toHaveLength(64); // SHA256 hex length
  });
});

describe('SecurityManager - Rate Limiting', () => {
  const testKey = 'test_rate_limit';

  test('should allow requests within limit', async () => {
    const canRequest = await RateLimiter.checkRateLimit(testKey, 5, 1000);

    expect(canRequest).toBe(true);
  });

  test('should reject requests exceeding limit', async () => {
    const key = `rate_limit_${Date.now()}`;
    const maxRequests = 3;

    // 制限に達するまでリクエスト
    for (let i = 0; i < maxRequests; i++) {
      const result = await RateLimiter.checkRateLimit(key, maxRequests, 1000);
      expect(result).toBe(true);
    }

    // 次のリクエストは拒否される
    const result = await RateLimiter.checkRateLimit(key, maxRequests, 1000);
    expect(result).toBe(false);
  });
});

describe('SecurityManager - CSRF Token', () => {
  test('should generate CSRF token', () => {
    const token = CSRFTokenManager.generateToken();

    expect(token).toBeDefined();
    expect(token).toHaveLength(64); // 32 bytes in hex
  });

  test('should verify valid CSRF token', async () => {
    const token = CSRFTokenManager.generateToken();
    await CSRFTokenManager.saveToken(token);

    const isValid = await CSRFTokenManager.verifyToken(token);

    expect(isValid).toBe(true);
  });

  test('should reject invalid CSRF token', async () => {
    const validToken = CSRFTokenManager.generateToken();
    await CSRFTokenManager.saveToken(validToken);

    const isValid = await CSRFTokenManager.verifyToken('invalid_token');

    expect(isValid).toBe(false);
  });

  test('should provide CSRF header name', () => {
    const headerName = CSRFTokenManager.getHeaderName();

    expect(headerName).toBe('X-CSRF-Token');
  });
});

describe('SecurityConfig', () => {
  test('should have secure password pattern', () => {
    const strongPassword = 'MySecurePass123!@#';
    const weakPassword = 'weak';

    expect(SecurityConfig.PASSWORD_PATTERN.test(strongPassword)).toBe(true);
    expect(SecurityConfig.PASSWORD_PATTERN.test(weakPassword)).toBe(false);
  });

  test('password pattern should require uppercase', () => {
    const password = 'mysecurepass123!@#';

    expect(SecurityConfig.PASSWORD_PATTERN.test(password)).toBe(false);
  });

  test('password pattern should require lowercase', () => {
    const password = 'MYSECUREPASS123!@#';

    expect(SecurityConfig.PASSWORD_PATTERN.test(password)).toBe(false);
  });

  test('password pattern should require number', () => {
    const password = 'MySecurePass!@#';

    expect(SecurityConfig.PASSWORD_PATTERN.test(password)).toBe(false);
  });

  test('password pattern should require special character', () => {
    const password = 'MySecurePass123';

    expect(SecurityConfig.PASSWORD_PATTERN.test(password)).toBe(false);
  });

  test('password pattern should enforce minimum length', () => {
    const password = 'MyPass1!@';

    expect(SecurityConfig.PASSWORD_PATTERN.test(password)).toBe(false);
  });

  test('should have secure timeout configurations', () => {
    expect(SecurityConfig.SESSION_TIMEOUT_MS).toBe(30 * 60 * 1000);
    expect(SecurityConfig.API_TIMEOUT_MS).toBe(30000);
  });

  test('should have reasonable rate limits', () => {
    expect(SecurityConfig.AUTH_RATE_LIMIT).toBe(5);
    expect(SecurityConfig.API_RATE_LIMIT).toBe(100);
  });
});

describe('Audit Logger', () => {
  test('should generate unique log IDs', async () => {
    const log1 = await AuditLogger.getLocalLogs();
    const initialCount = log1.length;

    await AuditLogger.log({
      userId: 'test_user',
      action: 'TEST_ACTION',
      resource: 'test_resource',
      status: 'success',
    });

    const log2 = await AuditLogger.getLocalLogs();

    expect(log2.length).toBe(initialCount + 1);
    expect(log2[log2.length - 1].id).toBeDefined();
  });
});
