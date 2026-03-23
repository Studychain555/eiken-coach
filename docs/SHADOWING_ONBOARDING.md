# Shadowing Onboarding チュートリアル

登録前のシャドーイング学習法説明画面を実装しました。

## 📁 ファイル構成

```
src/components/ShadowingOnboarding.tsx  # オンボーディングコンポーネント
app/onboarding/shadowing.tsx           # テスト・デモページ
```

## 🎯 機能仕様

### 3ページスライド構成

1. **ページ1**: "聞こえない"の正体は英語特有の音の変化
   - 例文: I have to join another meeting.
   - ハイライト: "have to"
   - 覚えている音: ハブトゥ → 実際の音: ハフタ

2. **ページ2**: 音の変化を知ればリスニング力が上がる
   - 例文: What do you want to do?
   - ハイライト: "want to"
   - 覚えている音: ウォントトゥ → 実際の音: ワナ

3. **ページ3**: シャドーイングで自然な発音も身につく
   - 例文: I'm going to get it done.
   - ハイライト: "going to"
   - 覚えている音: ゴーイングトゥ → 実際の音: ガナ

### インタラクション

- **再生ボタン**: ▶（クリックで再生/一時停止に切り替わる UI）
- **ドットインジケーター**: 3ドット・現在位置は横長ティール色
- **スキップボタ**: 最終ページへジャンプ
- **次へ/始めるボタン**: ページ遷移・最終ページで「始める」に変化

## 🔧 統合方法

### 1. 登録フロー内での使用

```typescript
// app/(auth)/register.tsx または auth フロー内
import ShadowingOnboarding from '@/src/components/ShadowingOnboarding';

export default function RegisterScreen() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return (
      <ShadowingOnboarding
        onSkip={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  // 通常の登録フォーム...
  return <RegisterForm />;
}
```

### 2. 全画面表示（スタンドアロン）

```typescript
// app/shadowing-welcome.tsx
import ShadowingOnboarding from '@/src/components/ShadowingOnboarding';
import { useRouter } from 'expo-router';

export default function ShadowingWelcome() {
  const router = useRouter();

  return (
    <ShadowingOnboarding
      onSkip={() => router.push('/(auth)/login')}
      onComplete={() => router.push('/(auth)/register')}
    />
  );
}
```

## 🎨 カスタマイズ

### カラー変更

```typescript
// COLORS オブジェクトを編集
const COLORS = {
  teal: '#2BBCB3',        // メインカラー
  tealLight: '#E6FAF8',   // ライトティール背景
  tealBorder: '#5DCCBF',  // ボーダー色
  // ...
};
```

### スライドデータ追加

```typescript
// SLIDES 配列に新規スライド追加
const SLIDES = [
  // ... existing slides
  {
    id: 4,
    title: 'Your new slide title',
    example: 'Your example sentence',
    highlightWord: 'highlight',
    memorizedSound: 'your sound 1',
    actualSound: 'your sound 2',
    description: 'Description text...',
  },
];
```

### 音声再生機能の実装

```typescript
// handlePlayAudio() の内部を実装
const handlePlayAudio = async () => {
  try {
    // 例文に基づいて audioUrl を取得
    const audioUrl = getAudioUrl(slide.example);

    // Expo Audio で再生
    const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
    setIsPlaying(true);
    await sound.playAsync();

    // 再生完了時の処理
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  } catch (error) {
    console.error('Audio playback error:', error);
  }
};
```

## 📱 テスト方法

### ローカルでのテスト

```bash
# Option 1: 専用ページでテスト
npx expo start --web
# → http://localhost:8081/onboarding/shadowing

# Option 2: 登録フロー内で確認
npx expo start --web
# → http://localhost:8081/(auth)/register (showOnboarding = true時)
```

### 確認項目

- [ ] 3ページのスライド遷移が正常に動作
- [ ] ドットインジケーターが現在ページを反映
- [ ] 再生ボタンのアイコン切り替え（▶ ⇄ ⏸）
- [ ] ハイライト表示が正確（"have to", "want to", "going to"）
- [ ] スキップボタンで最終ページへジャンプ
- [ ] 最終ページで「次へ」が「始める」に変化
- [ ] レイアウトが小型デバイス（SE, 13mini）で崩れていない
- [ ] 背景色・カード・ボタン色が仕様通り

## 🚀 デプロイ

このコンポーネントは Expo / React Native Web と互換性があります。

```bash
# Web エクスポート
npx expo export --platform web

# Native ビルド
eas build --platform ios
eas build --platform android
```

## 📝 props インターフェース

```typescript
interface Props {
  onSkip?: () => void;      // スキップボタンクリック時
  onComplete?: () => void;  // 「始める」ボタンクリック時
}
```

## 🔍 トラブルシューティング

### 音声が再生されない場合

- `handlePlayAudio()` の実装確認
- Expo Audio パーミッション設定確認（app.json）

### ドットインジケーターが表示されない場合

- `indicatorContainer` の flexDirection が 'row' か確認
- gap: 8 の CSS が適用されているか確認

### ハイライト表示が崩れている場合

- `highlightWord` のスペルが `example` 内に完全に含まれているか確認
- 正規表現大文字小文字判定（case-insensitive）は正常に機能

## 📊 パフォーマンス

- コンポーネント: ~3KB (minified)
- レンダリング: useState のみ使用（最小限の再レンダリング）
- メモリ: 音声再生時のみ Audio.Sound をメモリに保持

## 🎬 今後の拡張予定

- [ ] 音声再生機能の完全実装
- [ ] クイズ機能の追加（スライド内で理解度確認）
- [ ] 多言語対応（日本語 / 英語 / 中国語 など）
- [ ] アナリティクス統合（スキップ率・完了率の測定）
- [ ] アニメーション追加（ページ遷移・ドット選択時）
