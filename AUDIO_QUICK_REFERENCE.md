# 音声再生機能 - クイックリファレンス

## 30秒で理解

```typescript
// 1. Hook を使う
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

// 2. 初期化
const audioPlayer = useAudioPlayer();

// 3. 再生
await audioPlayer.play('https://example.com/audio.mp3');

// 4. 完了
// ボタンが「再生中...」に変わり、音声が流れます
```

---

## API リファレンス

### useAudioPlayer Hook

```typescript
// 返り値
{
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  error: string | null;
  playbackRate: number;

  // メソッド
  play(url, fallbackUrls?): Promise<void>;
  pause(): void;
  stop(): void;
  seek(time): void;
  setPlaybackRate(rate): void;
  setVolume(volume): void;
}

// オプション
{
  timeout?: number;           // デフォルト: 10000ms
  retryAttempts?: number;     // デフォルト: 2
  debugLog?: boolean;         // デフォルト: true
  onError?: (error) => void;
  onPlaybackStatusUpdate?: (state) => void;
}
```

---

## よく使うコード

### 基本的な再生

```typescript
const audioPlayer = useAudioPlayer();

const handlePlay = async () => {
  try {
    await audioPlayer.play('https://example.com/audio.mp3');
  } catch (error) {
    Alert.alert('エラー', String(error));
  }
};
```

### フォールバック URL付き

```typescript
await audioPlayer.play(
  'https://main.com/audio.mp3',
  [
    'https://backup1.com/audio.mp3',
    'https://backup2.com/audio.mp3',
  ]
);
```

### 再生状態の表示

```typescript
<Text>
  {audioPlayer.isLoading && '読み込み中...'}
  {audioPlayer.isPlaying && '再生中...'}
  {audioPlayer.error && `エラー: ${audioPlayer.error}`}
</Text>
```

### 再生時間の表示

```typescript
<Text>
  {formatTime(audioPlayer.currentTime)} / {formatTime(audioPlayer.duration)}
</Text>

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### 再生速度制御

```typescript
[0.5, 0.75, 1.0, 1.25, 1.5].map(rate => (
  <Button
    key={rate}
    onPress={() => audioPlayer.setPlaybackRate(rate)}
    title={`${rate}x`}
  />
))
```

### 音量制御

```typescript
<Slider
  style={{ width: 200, height: 40 }}
  minimumValue={0}
  maximumValue={1}
  onValueChange={volume => audioPlayer.setVolume(volume)}
/>
```

---

## エラーハンドリング

### 方法1: Alert で通知

```typescript
const audioPlayer = useAudioPlayer({
  onError: (error) => {
    Alert.alert('音声エラー', error);
  }
});
```

### 方法2: UI に表示

```typescript
{audioPlayer.error && (
  <Text style={{ color: 'red' }}>
    エラー: {audioPlayer.error}
  </Text>
)}
```

### 方法3: 両方

```typescript
const audioPlayer = useAudioPlayer({
  onError: (error) => {
    console.error('Audio error:', error);
    Alert.alert('エラー', error);
  }
});
```

---

## デバッグ方法

### ブラウザコンソール

```bash
# ブラウザ DevTools を開く
F12

# Console タブで以下の検索
[WebAudioManager

# ログが出力される
[WebAudioManager 2026-03-19T...] Starting audio playback
[WebAudioManager 2026-03-19T...] Audio playback started successfully
```

### Network タブ

```
1. DevTools → Network タブ
2. 再生ボタンをクリック
3. mp3/音声ファイルを探す
4. Status: 200 → 成功
```

---

## よくある設定

### 本番環境

```typescript
const audioPlayer = useAudioPlayer({
  debugLog: false,      // ログを表示しない
  timeout: 15000,       // 15秒に増加
  retryAttempts: 3,     // 3回までリトライ
});
```

### 開発環境

```typescript
const audioPlayer = useAudioPlayer({
  debugLog: true,       // ログを表示
  timeout: 5000,        // 短時間でテスト
  retryAttempts: 1,     // 1回のみリトライ
});
```

---

## ファイル一覧

| ファイル | 内容 |
|---------|------|
| `src/lib/audioManager.ts` | WebAudioManager クラス |
| `hooks/useAudioPlayer.ts` | useAudioPlayer Hook |
| `src/components/ListeningQuestionScreen.tsx` | 統合例 |

---

## Platform 対応

| Platform | 使用ライブラリ | 対応状況 |
|----------|-------------|--------|
| **Web** | HTML5 Audio | ✅ 完全対応 |
| **iOS** | expo-av | ✅ 完全対応 |
| **Android** | expo-av | ✅ 完全対応 |

---

## パフォーマンス目安

| 項目 | 値 |
|------|---|
| 初回読込 | 1-2秒 |
| メモリ | 音声ファイルサイズ + 10MB |
| CPU | 3-8% (再生中) |
| リトライ待機時間 | 1, 2, 4秒 |

---

## トラブルシューティング

### 音声が再生されない

1. コンソールでエラーメッセージを確認
2. URL が正しいか確認
3. CORS設定を確認（Web版）
4. 音量がミュートになっていないか確認

### エラーが繰り返し表示される

1. URL を確認
2. リトライ回数を確認
3. タイムアウト時間を増加

### 遅延が大きい

1. ネットワークを確認
2. 音声ファイルサイズを確認
3. CDN キャッシュを確認

---

## さらに詳しく

- **詳細な実装**: `AUDIO_IMPLEMENTATION.md`
- **テスト方法**: `AUDIO_TESTING_CHECKLIST.md`
- **実装概要**: `IMPLEMENTATION_SUMMARY.md`
- **クイックスタート**: `QUICK_START.md`

---

**作成日**: 2026-03-19
