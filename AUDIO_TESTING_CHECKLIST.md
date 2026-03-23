# EigoMaster 音声再生機能 - テストチェックリスト

## 実装確認チェックリスト

### ファイル作成確認
- [ ] `/Users/80dr/eigomaster/src/lib/audioManager.ts` が存在する
- [ ] `/Users/80dr/eigomaster/hooks/useAudioPlayer.ts` が存在する
- [ ] `/Users/80dr/eigomaster/src/components/ListeningQuestionScreen.tsx` が更新されている

### コード確認
- [ ] `audioManager.ts` に WebAudioManager クラスが定義されている
- [ ] `useAudioPlayer.ts` に useAudioPlayer Hook が定義されている
- [ ] ListeningQuestionScreen が useAudioPlayer Hook を使用している
- [ ] エラーハンドリングが実装されている（Alert.alert）

## Web版テスト（Mac/Linux での ブラウザ）

### 初期設定
```bash
cd /Users/80dr/eigomaster

# 依存関係インストール
npm install

# Web版起動
npm run web
```

### テスト項目

#### 1. 音声再生テスト
- [ ] ブラウザで http://localhost:8081 を開く
- [ ] 「リスニング」タブを選択
- [ ] 問題を選択
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: 音声が再生される（SoundHelix サンプル音声）
- [ ] **デバッグ**: ブラウザコンソール（F12）でログを確認

#### 2. 読み込み状態テスト
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: ボタン状態が「読み込み中...」に変わる
- [ ] **期待結果**: 音声読み込み中にボタンが無効化される

#### 3. 再生状態テスト
- [ ] 音声が再生中
- [ ] **期待結果**: ボタン状態が「再生中...」に変わる
- [ ] **期待結果**: 波形アニメーションが動く（青いバーが点滅）
- [ ] **期待結果**: 再生時間が表示される（MM:SS形式）

#### 4. 再生速度制御テスト
- [ ] 「再生する」ボタンをクリック
- [ ] 再生速度ボタン（0.5x, 0.75x, 1.0x, 1.25x, 1.5x）をクリック
- [ ] **期待結果**: ボタンの背景色が変わる（アクティブ表示）
- [ ] **期待結果**: 再生速度が変わる

#### 5. 一時停止・再開テスト
- [ ] 再生中に「次へ進む」ボタンをクリック
- [ ] **期待結果**: 音声が停止する
- [ ] 「戻す」ボタンをクリック
- [ ] **期待結果**: 前の画面に戻る
- [ ] 「もう一度聞く」ボタンをクリック
- [ ] **期待結果**: 再生画面に戻る

#### 6. エラーハンドリングテスト
- [ ] 開発者ツール（F12）のNetworkタブを開く
- [ ] フィルターで「soundhelix」を入力
- [ ] 任意のリクエストを右クリック →「Block URL」を選択
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: エラーボックスが表示される
- [ ] **期待結果**: Alert が表示される（「音声エラー」）
- [ ] ブロック解除：Network タブ → Block requests → リクエストを削除

### デバッグログ確認（Web版）

ブラウザコンソールに以下のようなログが出力されるか確認：

```
✓ [WebAudioManager ...] WebAudioManager initialized
✓ [WebAudioManager ...] Starting audio playback
✓ [WebAudioManager ...] Attempting to load URL
✓ [WebAudioManager ...] Audio playback started successfully
✓ [WebAudioManager ...] Audio play event
✓ [WebAudioPlayer ...] Playback status callback registered
```

## iOS版テスト（iPhone シミュレータ）

### 初期設定
```bash
cd /Users/80dr/eigomaster

# iOS起動
npm run ios
```

### テスト項目
- [ ] シミュレータが起動する
- [ ] 「リスニング」タブを選択
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: 音声が再生される
- [ ] 再生速度ボタンで速度変更できる
- [ ] **期待結果**: 速度が反映される（ただしAVAudioEngineの制限あり）

### トラブルシューティング（iOS）
- [ ] シミュレータが音声出力対応か確認
  - Xcode → シミュレータ → Audio → 確認
- [ ] iOS Audio Permissions が許可されているか確認
  - Settings → Privacy → Microphone → アプリを確認
- [ ] expo-av が正しくインストールされているか確認
  - `npm list expo-av` を実行

## Android版テスト（Android エミュレータ）

### 初期設定
```bash
cd /Users/80dr/eigomaster

# Android起動
npm run android
```

### テスト項目
- [ ] エミュレータが起動する
- [ ] 「リスニング」タブを選択
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: 音声が再生される
- [ ] 再生速度ボタンで速度変更できる
- [ ] **期待結果**: 速度が反映される

### トラブルシューティング（Android）
- [ ] エミュレータに音声出力があるか確認
- [ ] Android パーミッションを確認
  - Settings → Apps → この app → Permissions → Audio
- [ ] expo-av が正しくインストールされているか確認

## ネットワーク条件テスト（Web版）

### 低速回線シミュレーション
- [ ] ブラウザ DevTools → Network タブを開く
- [ ] Throttling を「Slow 3G」に設定
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: 「読み込み中...」が表示される
- [ ] **期待結果**: リトライが自動実行される
- [ ] **期待結果**: 最終的に音声が再生される

### オフライン状態テスト
- [ ] Network タブ → Offline にチェック
- [ ] 「再生する」ボタンをクリック
- [ ] **期待結果**: エラーが表示される
- [ ] **期待結果**: フォールバックURLが試行される

## パフォーマンステスト

### メモリリークテスト
- [ ] 10回連続で「再生する」→ 音声終了を繰り返す
- [ ] **期待結果**: メモリが増加し続けない
- [ ] DevTools → Memory タブ → Heap snapshot で確認

### CPU使用率テスト
- [ ] 音声再生中に DevTools → Performance タブで記録
- [ ] **期待結果**: CPU使用率が異常に高くない（< 50%）

## 最終確認チェックリスト

### コード品質
- [ ] TypeScript エラーがない
  ```bash
  npx tsc --noEmit
  ```
- [ ] ESLint エラーがない
  ```bash
  npm run lint
  ```

### ユーザーエクスペリエンス
- [ ] エラーメッセージが日本語で分かりやすい
- [ ] 「読み込み中」の表示がある
- [ ] ボタンが無効化される（連続クリック防止）
- [ ] 再生時間が表示される

### 本番環境対応
- [ ] debugLog が false に設定できる
- [ ] リトライロジックが正しく動作する
- [ ] タイムアウト設定が調整可能
- [ ] CORS対応が確認されている

## テスト完了時のサイン

すべてのチェックリストが完了したら：

```bash
# Gitにコミット
git add -A
git commit -m "feat: implement complete audio playback system for listening feature

- Web版: HTML5 Audio APIを使用したWebAudioManager実装
- モバイル版: expo-avを使用した自動プラットフォーム判定
- エラーハンドリング: CORS対応、リトライ、タイムアウト処理
- デバッグ: 詳細なコンソールログ出力
- UI: 読み込み状態、エラー表示、再生時間表示
- 機能: 再生速度制御、音量制御、シーク対応"

# プッシュ
git push origin feature/audio-implementation
```

---

**テスト日時**: ________________
**テスター名**: ________________
**結果**: ✓ 全テスト合格 / □ 修正必要
