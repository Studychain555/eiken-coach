# EigoMaster Error Handling & Debug Logging Guide

**Quick Reference for Developers**

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Debug Logging](#debug-logging)
3. [Error Handling](#error-handling)
4. [Best Practices](#best-practices)
5. [Common Patterns](#common-patterns)

---

## Quick Start

### Import Debug Utilities
```typescript
import { debugLog, debugError, debugWarn } from '@/src/lib/debugUtils';

const TAG = 'MyComponent'; // Component name
```

### Import Error Handler
```typescript
import {
  handleError,
  safeJsonParse,
  withRetry,
  ErrorType
} from '@/src/lib/errorHandler';
```

---

## Debug Logging

### Basic Usage

#### Info Logs
```typescript
debugLog(TAG, 'User clicked button');
debugLog(TAG, 'Loading audio', { url: audioUrl, attempts: 2 });
```

#### Error Logs
```typescript
debugError(TAG, 'Failed to load audio', error);
```

#### Warning Logs
```typescript
debugWarn(TAG, 'Retrying connection', { attempt: 2, maxAttempts: 3 });
```

#### Performance Logs
```typescript
const startTime = performance.now();
await processAudio();
const duration = performance.now() - startTime;
debugPerformance(TAG, 'Audio processing', duration, 'ms');
```

### Control Debug Mode

```typescript
// At app startup
import { setDebugMode } from '@/src/lib/debugUtils';

setDebugMode(true);  // Force enable (dev only)
setDebugMode(false); // Force disable (production)
```

### Output Format

**Development Build** (`__DEV__` = true):
```
[MyComponent 2026-03-19T10:30:45.123Z] User clicked button
[MyComponent 2026-03-19T10:30:45.125Z] Loading audio { url: "https://...", attempts: 2 }
[MyComponent 2026-03-19T10:30:45.127Z] Error: Network connection failed
```

**Production Build** (`__DEV__` = false):
```
(no output - completely silent)
```

---

## Error Handling

### Basic Error Handling

```typescript
import { handleError } from '@/src/lib/errorHandler';

try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  const appError = handleError(error, TAG);
  // Result: appError.message = "サーバーエラーが発生しました。しばらく経ってからお試しください。"
  Alert.alert('エラー', appError.message);
}
```

### Safe JSON Parsing

```typescript
import { safeJsonParse } from '@/src/lib/errorHandler';

const response = await fetch(url);
const text = await response.text();

// Returns parsed object or default value
const data = safeJsonParse(text, {}, TAG);
```

### Retry Logic

```typescript
import { withRetry } from '@/src/lib/errorHandler';

const data = await withRetry(
  () => fetchData(url),
  {
    maxAttempts: 3,        // Try 3 times
    delayMs: 1000,         // Wait 1s between attempts
    backoffMultiplier: 2,  // Exponential backoff: 1s, 2s, 4s
    tag: TAG,
  }
);
```

### Promise with Error Handling

```typescript
import { withErrorHandling } from '@/src/lib/errorHandler';

const { success, data, error } = await withErrorHandling(
  fetchAudioData(url),
  TAG,
  { context: 'Audio loading' }
);

if (success) {
  // Use data
  playAudio(data);
} else {
  // Handle error
  debugError(TAG, 'Failed to fetch audio', error);
  Alert.alert('エラー', error?.message);
}
```

### Error Type Detection

```typescript
import {
  ErrorType,
  isNetworkError,
  isTimeoutError,
  isJsonParseError
} from '@/src/lib/errorHandler';

try {
  // API call
} catch (error) {
  if (isNetworkError(error)) {
    // Show "Check internet connection"
  } else if (isTimeoutError(error)) {
    // Show "Request timed out, retry"
  } else if (isJsonParseError(error)) {
    // Show "Data parsing failed"
  }
}
```

---

## Best Practices

### 1. Always Use TAG
```typescript
// ✅ GOOD
const TAG = 'ListeningQuestionScreen';
debugLog(TAG, 'Audio started');

// ❌ BAD
debugLog('debug', 'Audio started');  // Unclear source
```

### 2. Include Context in Data
```typescript
// ✅ GOOD - Provides debugging context
debugLog(TAG, 'Loading audio', {
  url: audioUrl,
  retryCount: 2,
  timeout: 10000,
});

// ❌ BAD - Minimal context
debugLog(TAG, 'Loading audio');
```

### 3. Wrap All API Calls
```typescript
// ✅ GOOD
const { success, data, error } = await withErrorHandling(
  fetch(url).then(r => r.json()),
  TAG
);

// ❌ BAD - Silent failure
const data = await fetch(url).then(r => r.json());
```

### 4. Provide User-Friendly Messages
```typescript
// ✅ GOOD
if (!success) {
  Alert.alert('音声エラー', '音声の再生に失敗しました。もう一度お試しください。');
}

// ❌ BAD - Technical jargon
Alert.alert('Error', `TypeError: Cannot read property 'uri' of undefined`);
```

### 5. Preserve Original Error for Debugging
```typescript
// ✅ GOOD
const appError = handleError(error, TAG);
debugError(TAG, 'API failed', appError.originalError);

// ❌ BAD - Lost original error details
const appError = handleError(error, TAG);
// originalError is available but not logged
```

---

## Common Patterns

### Pattern 1: API Call with Retry

```typescript
async function fetchWithRetry(url: string) {
  const TAG = 'fetchWithRetry';

  try {
    debugLog(TAG, 'Fetching data', { url });

    const data = await withRetry(
      async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      },
      { maxAttempts: 3, tag: TAG }
    );

    debugLog(TAG, 'Fetch succeeded', { dataSize: JSON.stringify(data).length });
    return data;
  } catch (error) {
    const appError = handleError(error, TAG);
    debugError(TAG, 'Fetch failed after retries', appError.originalError);
    throw appError;
  }
}
```

### Pattern 2: Audio Playback with Error Recovery

```typescript
async function playAudio(url: string, fallbackUrls?: string[]) {
  const TAG = 'AudioPlayback';

  const urls = [url, ...(fallbackUrls || [])];

  for (let i = 0; i < urls.length; i++) {
    try {
      const currentUrl = urls[i];
      debugLog(TAG, `Attempting to play URL ${i + 1}/${urls.length}`, { currentUrl });

      await audioManager.play(currentUrl);
      debugLog(TAG, 'Audio playing successfully');
      return;
    } catch (error) {
      debugWarn(TAG, `Failed to play URL ${i + 1}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      if (i < urls.length - 1) {
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    }
  }

  // All URLs failed
  const finalError = handleError(
    'Failed to load audio from all URLs',
    TAG,
    { attemptedUrls: urls.length }
  );
  throw finalError;
}
```

### Pattern 3: Form Submission with Validation

```typescript
async function submitForm(formData: FormData) {
  const TAG = 'FormSubmission';

  try {
    debugLog(TAG, 'Submitting form', { fields: Object.keys(formData) });

    const { success, data, error } = await withErrorHandling(
      fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      }).then(r => r.json()),
      TAG
    );

    if (!success) {
      debugError(TAG, 'Submission failed', error);
      Alert.alert('エラー', error?.message || '送信に失敗しました');
      return false;
    }

    debugLog(TAG, 'Submission succeeded');
    Alert.alert('成功', '送信されました');
    return true;
  } catch (error) {
    const appError = handleError(error, TAG);
    Alert.alert('エラー', appError.message);
    return false;
  }
}
```

### Pattern 4: Async Initialization

```typescript
async function initializeAudioManager() {
  const TAG = 'AudioInitialization';

  try {
    debugLog(TAG, 'Initializing audio manager');

    const audioManager = new WebAudioManager({
      timeout: 10000,
      retryAttempts: 2,
      debugLog: true,
    });

    debugLog(TAG, 'Audio manager initialized successfully');
    return audioManager;
  } catch (error) {
    const appError = handleError(error, TAG, { context: 'initialization' });
    debugError(TAG, 'Initialization failed', appError.originalError);

    // Return null or a fallback instance
    return null;
  }
}
```

---

## Error Types Reference

| Type | Message | When |
|------|---------|------|
| `NETWORK` | ネットワークに接続できません。インターネット接続を確認してください。 | No internet |
| `TIMEOUT` | リクエストがタイムアウトしました。もう一度お試しください。 | Request > 15s |
| `JSON_PARSE` | データの処理に失敗しました。もう一度お試しください。 | Invalid JSON |
| `API_ERROR` | サーバーエラーが発生しました。しばらく経ってからお試しください。 | HTTP 5xx |
| `PERMISSION` | このアクションを実行する権限がありません。ログインしてからお試しください。 | HTTP 401/403 |
| `NOT_FOUND` | リソースが見つかりません。 | HTTP 404 |
| `VALIDATION` | データが無効です。入力内容を確認してください。 | HTTP 4xx (except 401/403/404) |
| `UNKNOWN` | エラーが発生しました。もう一度お試しください。 | Other |

---

## Environment Configuration

### .env.local (Development)
```
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_API_TIMEOUT=15000
EXPO_PUBLIC_MAX_RETRIES=2
```

### .env.production (Production)
```
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_API_TIMEOUT=15000
EXPO_PUBLIC_MAX_RETRIES=3
```

---

## Troubleshooting

### Logs not showing in production
This is **expected behavior**. Debug logs are disabled in production builds.

### Need to enable logs in production for debugging?
```typescript
import { setDebugMode } from '@/src/lib/debugUtils';

// At app startup
if (process.env.EXPO_PUBLIC_FORCE_DEBUG === 'true') {
  setDebugMode(true);
}
```

### Custom error messages not appearing?
Make sure you're using `Alert.alert()` after handling error:
```typescript
const appError = handleError(error, TAG);
Alert.alert('エラー', appError.message); // Show the user-friendly message
```

---

## Related Files

- **Error Handler**: `/src/lib/errorHandler.ts`
- **Debug Utils**: `/src/lib/debugUtils.ts`
- **Production Report**: `/PRODUCTION_READINESS_REPORT.md`
- **AI Scoring Service**: `/src/lib/aiScoringService.ts` (example implementation)

---

**Last Updated**: 2026-03-19
**Version**: 1.0.0
