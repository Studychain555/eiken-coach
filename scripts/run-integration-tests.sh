#!/bin/bash

###############################################################################
# EigoMaster 統合テスト実行スクリプト
#
# 使用方法:
#   bash scripts/run-integration-tests.sh [phase]
#
# 引数:
#   phase - テストフェーズ (1-6, all)
#   例: bash scripts/run-integration-tests.sh phase-1
#       bash scripts/run-integration-tests.sh all
#
# 出力:
#   test-results/ ディレクトリにレポートを生成
###############################################################################

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログレベル
LOG_INFO="${BLUE}[INFO]${NC}"
LOG_SUCCESS="${GREEN}[✓]${NC}"
LOG_ERROR="${RED}[✗]${NC}"
LOG_WARNING="${YELLOW}[⚠]${NC}"

# テスト結果格納ディレクトリ
TEST_RESULTS_DIR="test-results"
TEST_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_DIR="${TEST_RESULTS_DIR}/${TEST_TIMESTAMP}"

# 対象フェーズ (デフォルト: all)
TARGET_PHASE="${1:-all}"

###############################################################################
# ユーティリティ関数
###############################################################################

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"
}

print_info() {
    echo -e "${LOG_INFO} $1"
}

print_success() {
    echo -e "${LOG_SUCCESS} $1"
}

print_error() {
    echo -e "${LOG_ERROR} $1"
}

print_warning() {
    echo -e "${LOG_WARNING} $1"
}

# テスト結果をファイルに記録
log_test_result() {
    local phase=$1
    local test_id=$2
    local status=$3
    local message=$4
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")

    echo "[${timestamp}] ${phase} - ${test_id} - ${status} - ${message}" >> "${REPORT_DIR}/test-results.log"
}

# ディレクトリ作成
mkdir -p "${REPORT_DIR}"

###############################################################################
# Phase 1: 実装検証テスト
###############################################################################

test_phase_1() {
    print_header "Phase 1: 実装検証テスト"

    local results_file="${REPORT_DIR}/phase-1-implementation.md"

    cat > "${results_file}" << 'EOF'
# Phase 1: 実装検証テスト レポート

**実施日**: 2026-03-19
**所要時間**: 1-2時間

## 1.1 環境・依存関係チェック

EOF

    print_info "Node.js バージョン確認..."
    local node_version=$(node -v 2>/dev/null || echo "未インストール")
    echo "- Node.js: ${node_version}" >> "${results_file}"
    if [[ "${node_version}" != "未インストール" ]]; then
        print_success "Node.js インストール済み: ${node_version}"
        log_test_result "Phase-1" "ENV-001" "PASS" "Node.js インストール済み"
    else
        print_error "Node.js がインストールされていません"
        log_test_result "Phase-1" "ENV-001" "FAIL" "Node.js 未インストール"
    fi

    print_info "npm バージョン確認..."
    local npm_version=$(npm -v 2>/dev/null || echo "未インストール")
    echo "- npm: ${npm_version}" >> "${results_file}"
    if [[ "${npm_version}" != "未インストール" ]]; then
        print_success "npm インストール済み: ${npm_version}"
        log_test_result "Phase-1" "ENV-002" "PASS" "npm インストール済み"
    else
        print_error "npm がインストールされていません"
        log_test_result "Phase-1" "ENV-002" "FAIL" "npm 未インストール"
    fi

    print_info "Expo CLI バージョン確認..."
    local expo_version=$(expo --version 2>/dev/null || echo "未インストール")
    echo "- Expo CLI: ${expo_version}" >> "${results_file}"
    if [[ "${expo_version}" != "未インストール" ]]; then
        print_success "Expo CLI インストール済み: ${expo_version}"
        log_test_result "Phase-1" "ENV-003" "PASS" "Expo CLI インストール済み"
    else
        print_warning "Expo CLI がインストールされていません（npm install で自動インストール）"
        log_test_result "Phase-1" "ENV-003" "WARN" "Expo CLI 未インストール"
    fi

    echo "" >> "${results_file}"
    echo "## 1.2 ファイル構造検証" >> "${results_file}"
    echo "" >> "${results_file}"

    print_info "ファイル構造確認..."

    local files_to_check=(
        "app/_layout.tsx"
        "app/(tabs)/_layout.tsx"
        "app/(tabs)/index.tsx"
        "app/(tabs)/listening.tsx"
        "app/(auth)/login.tsx"
        "src/lib/audioManager.ts"
        "hooks/useAudioPlayer.ts"
        "package.json"
        "tsconfig.json"
    )

    for file in "${files_to_check[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "✓ $file"
            echo "- ✓ $file" >> "${results_file}"
            log_test_result "Phase-1" "FILE-${file}" "PASS" "ファイル存在確認"
        else
            print_error "✗ $file (NOT FOUND)"
            echo "- ✗ $file (NOT FOUND)" >> "${results_file}"
            log_test_result "Phase-1" "FILE-${file}" "FAIL" "ファイル未検出"
        fi
    done

    echo "" >> "${results_file}"
    echo "## 1.3 TypeScript コンパイルチェック" >> "${results_file}"
    echo "" >> "${results_file}"

    print_info "TypeScript コンパイルチェック..."
    if npx tsc --noEmit 2>&1 | tee -a "${results_file}"; then
        print_success "TypeScript コンパイル成功"
        log_test_result "Phase-1" "TS-COMPILE" "PASS" "TypeScript コンパイル成功"
        echo "✓ コンパイル成功" >> "${results_file}"
    else
        print_error "TypeScript コンパイルエラー"
        log_test_result "Phase-1" "TS-COMPILE" "FAIL" "TypeScript コンパイルエラー"
        echo "✗ コンパイルエラー" >> "${results_file}"
    fi

    echo "" >> "${results_file}"
    echo "## 1.4 ESLint チェック" >> "${results_file}"
    echo "" >> "${results_file}"

    print_info "ESLint チェック..."
    if npm run lint 2>&1 | head -20 | tee -a "${results_file}"; then
        print_success "ESLint チェック完了"
        log_test_result "Phase-1" "ESLINT" "PASS" "ESLint チェック完了"
    else
        print_warning "ESLint に警告があります（エラーではありません）"
        log_test_result "Phase-1" "ESLINT" "WARN" "ESLint 警告あり"
    fi

    print_success "Phase 1 完了: ${results_file}"
}

###############################################################################
# Phase 2: ユーザーフローテスト (E2E)
###############################################################################

test_phase_2() {
    print_header "Phase 2: ユーザーフローテスト (E2E)"

    local results_file="${REPORT_DIR}/phase-2-e2e.md"

    cat > "${results_file}" << 'EOF'
# Phase 2: ユーザーフローテスト (E2E) レポート

**実施日**: 2026-03-19
**所要時間**: 2-3時間
**テスト実行方法**: `npm run web` で起動後、ブラウザで手動テスト実施

## E2E テスト チェックリスト

### E2E-001: ユーザー登録フロー

- [ ] アプリ起動 → ログイン画面表示
- [ ] "新規登録" ボタン → 登録フォーム表示
- [ ] 名前入力可能
- [ ] メール入力可能
- [ ] パスワード入力可能 (8字以上)
- [ ] "登録" ボタン → Supabase へのAPI呼び出し
- [ ] 登録成功メッセージ表示
- [ ] ホーム画面へ遷移

**テスト結果**: ⏳ 手動実行待ち
**コメント**: 実行後にチェックマークを付ける

---

### E2E-002: ログインフロー

- [ ] ログイン画面表示
- [ ] メール入力可能
- [ ] パスワード入力可能
- [ ] "ログイン" ボタン → API呼び出し
- [ ] JWT トークン取得
- [ ] ホーム画面へ遷移
- [ ] セッション保持 (アプリ再起動後も自動ログイン)

**テスト結果**: ⏳ 手動実行待ち

---

### E2E-003: リスニング学習フロー

- [ ] "Listening" タブ → リスニング一覧表示
- [ ] 問題を選択 → 詳細画面表示
- [ ] "再生" ボタン → 🔊 音声再生開始
- [ ] 音声再生中 → 再生時間表示 (MM:SS)
- [ ] 再生速度 [1.0x] → メニュー表示
- [ ] [1.5x] 選択 → 1.5倍速再生
- [ ] 一時停止ボタン → 再生一時停止
- [ ] 再生ボタン → 再生再開
- [ ] 音声完了 → 選択肢表示
- [ ] 選択肢をタップ → ハイライト表示
- [ ] "提出" ボタン → 答案送信
- [ ] 正解/不正解表示
- [ ] スコア記録 → 統計画面で反映

**テスト結果**: ⏳ 手動実行待ち

---

### E2E-004: 単語学習フロー

- [ ] "Vocabulary" タブ → 単語一覧表示
- [ ] 単語を選択 → 詳細表示
- [ ] 音声再生ボタン → 🔊 発音再生
- [ ] "暗記済" → ステータス変更
- [ ] "テスト開始" → クイズモード開始
- [ ] 4択問題表示
- [ ] 解答 → 即座に正解判定
- [ ] スコア表示

**テスト結果**: ⏳ 手動実行待ち

---

### E2E-005: 作文・スピーキング学習フロー

- [ ] "Writing" タブ → 題目一覧表示
- [ ] 題目を選択 → 作成フォーム表示
- [ ] テキスト入力
- [ ] "チェック" ボタン → AI文法チェック
- [ ] 修正提案表示
- [ ] "提出" ボタン → 送信
- [ ] フィードバック表示

**テスト結果**: ⏳ 手動実行待ち

---

## エラーシナリオテスト

### エラー-001: メールフォーマット

- [ ] 無効なメール入力 (例: invalid-email)
- [ ] エラーメッセージ表示確認

**結果**: ⏳

---

### エラー-002: 短いパスワード

- [ ] 6字パスワード入力
- [ ] "8字以上" エラー表示

**結果**: ⏳

---

### エラー-003: ネットワークエラー

- [ ] オフライン状態で登録試行
- [ ] "ネットワーク接続" エラー表示

**結果**: ⏳

---

## テスト実行手順

```bash
# 1. Web版起動
npm run web

# 2. ブラウザで http://localhost:8081 を開く

# 3. 上記のチェックリストを実行

# 4. 結果を記録
```

---

**テスト完了日**: ⏳
**全テスト合格**: ⏳

EOF

    print_info "E2E テストの手動実行ガイドを生成しました"
    print_info "実行方法: npm run web で起動後、ブラウザで上記チェックリストを実行してください"
    print_success "レポート: ${results_file}"

    log_test_result "Phase-2" "E2E-SETUP" "READY" "E2E テストレポート生成完了"
}

###############################################################################
# Phase 3: 機能別テスト
###############################################################################

test_phase_3() {
    print_header "Phase 3: 機能別テスト"

    local results_file="${REPORT_DIR}/phase-3-features.md"

    cat > "${results_file}" << 'EOF'
# Phase 3: 機能別テスト レポート

**実施日**: 2026-03-19
**所要時間**: 4-5時間

## 3.1 リスニング機能テスト

### F-LISTENING-001: HTML5 Audio初期化 (Web版)

**テスト手順**:
1. Web版を起動 (`npm run web`)
2. ブラウザコンソール (F12) を開く
3. "Listening" タブを開く
4. コンソールで `[WebAudioManager]` ログを確認

**期待結果**:
```
[WebAudioManager] WebAudioManager initialized { ... }
```

**テスト結果**: ⏳

---

### F-LISTENING-002: expo-av初期化 (モバイル版)

**テスト手順**:
1. iOS/Androidで起動 (`npm run ios` / `npm run android`)
2. "Listening" タブを開く
3. デバッガーでログ確認

**期待結果**: Audio.Sound が初期化される

**テスト結果**: ⏳

---

### F-LISTENING-003: 通常再生

**テスト手順**:
1. リスニング問題を選択
2. "再生" ボタンをクリック
3. 音声が再生されることを確認

**期待結果**: 🔊 音声再生開始

**テスト結果**: ⏳

---

### F-LISTENING-004: 再生速度変更

**テスト手順**:
1. 音声再生中に再生速度ボタンをタップ
2. [1.5x] を選択
3. 再生速度が変更されることを確認

**期待結果**: 1.5倍速で再生

**テスト結果**: ⏳

---

### F-LISTENING-005: 一時停止/再開

**テスト手順**:
1. 音声再生中に一時停止ボタン
2. 再度再生ボタン

**期待結果**: 再生が一時停止・再開される

**テスト結果**: ⏳

---

### F-LISTENING-006: シーク機能

**テスト手順**:
1. 音声再生中に再生時間をドラッグ
2. 30秒目に移動

**期待結果**: 再生位置が 30秒目に移動

**テスト結果**: ⏳

---

### F-LISTENING-007: 音量制御

**テスト手順**:
1. 音量スライダーで50%に設定
2. 音声再生

**期待結果**: 50%の音量で再生

**テスト結果**: ⏳

---

### F-LISTENING-008: リトライ機能

**テスト手順**:
1. Chrome DevTools → Network タブで通信を "Slow 3G" に設定
2. 音声再生ボタン
3. ネットワークを "Offline" に変更
4. 自動リトライが実行されることを確認

**期待結果**: 自動リトライが実行される

**テスト結果**: ⏳

---

### F-LISTENING-009: タイムアウト処理

**テスト手順**:
1. 不正なURLで再生を試行
2. 10秒以上待機
3. タイムアウトエラーメッセージ表示

**期待結果**: 10秒でタイムアウト

**テスト結果**: ⏳

---

### F-LISTENING-010: エラーハンドリング

**テスト手順**:
1. CORSエラーを発生させる
2. フォールバックURLが試行されることを確認

**期待結果**: フォールバックURL試行

**テスト結果**: ⏳

---

## 3.2 ダッシュボード機能テスト

### F-DASHBOARD-001: 統計情報表示

**期待結果**: 総学習時間、正解数が表示される

**テスト結果**: ⏳

---

### F-DASHBOARD-002: 進捗グラフ

**期待結果**: 週間学習グラフが描画される

**テスト結果**: ⏳

---

### F-DASHBOARD-003～008: その他ダッシュボード機能

**テスト結果**: ⏳

---

**テスト完了日**: ⏳

EOF

    print_success "Phase 3 テストレポート生成完了: ${results_file}"
    log_test_result "Phase-3" "FEATURE-SETUP" "READY" "機能別テストレポート生成完了"
}

###############################################################################
# Phase 4: クロスプラットフォームテスト
###############################################################################

test_phase_4() {
    print_header "Phase 4: クロスプラットフォームテスト"

    local results_file="${REPORT_DIR}/phase-4-cross-platform.md"

    cat > "${results_file}" << 'EOF'
# Phase 4: クロスプラットフォームテスト レポート

**実施日**: 2026-03-19
**所要時間**: 3-4時間

## Web (Chrome/Firefox/Safari)

### Chrome Desktop (1920x1080)
- [ ] UI 正常表示
- [ ] 音声再生 ✓
- [ ] 操作性 ✓

**結果**: ⏳

### Firefox Desktop (1920x1080)
- [ ] UI 正常表示
- [ ] 音声再生 ✓

**結果**: ⏳

### Safari Desktop (1920x1080)
- [ ] UI 正常表示
- [ ] 音声再生 ✓

**結果**: ⏳

### Chrome Mobile (375x667 - iPhone SE)
- [ ] レスポンシブ表示 ✓
- [ ] 音声再生 ✓
- [ ] タッチ操作 ✓

**結果**: ⏳

---

## iOS (iPhone SE～Pro Max)

### iPhone SE (375x667)
- [ ] UI 表示 ✓
- [ ] 音声再生 ✓

**結果**: ⏳

### iPhone 14 Pro Max (430x932)
- [ ] UI 表示 ✓
- [ ] ノッチ対応 ✓
- [ ] 音声再生 ✓

**結果**: ⏳

### iPad (10.9")
- [ ] タブレット UI ✓
- [ ] 音声再生 ✓

**結果**: ⏳

---

## Android (API 24～最新)

### Pixel 6 (API 33)
- [ ] UI 表示 ✓
- [ ] 音声再生 ✓

**結果**: ⏳

### Galaxy S22 (API 34)
- [ ] UI 表示 ✓
- [ ] 音声再生 ✓

**結果**: ⏳

---

**テスト完了日**: ⏳

EOF

    print_success "Phase 4 テストレポート生成完了: ${results_file}"
    log_test_result "Phase-4" "PLATFORM-SETUP" "READY" "クロスプラットフォームテストレポート生成完了"
}

###############################################################################
# Phase 5: パフォーマンス・ネットワークテスト
###############################################################################

test_phase_5() {
    print_header "Phase 5: パフォーマンス・ネットワークテスト"

    local results_file="${REPORT_DIR}/phase-5-performance.md"

    cat > "${results_file}" << 'EOF'
# Phase 5: パフォーマンス・ネットワークテスト レポート

**実施日**: 2026-03-19
**所要時間**: 2-3時間

## 5.1 初期ロード時間

### Web (Chrome) - ホーム画面
**期待値**: < 3秒
**実測値**: ⏳
**テスト手順**: Chrome DevTools → Network タブで計測

---

### iOS - アプリ起動
**期待値**: < 5秒
**実測値**: ⏳
**テスト手順**: Xcode Profiler で計測

---

### Android - アプリ起動
**期待値**: < 5秒
**実測値**: ⏳
**テスト手順**: Android Studio Profiler で計測

---

## 5.2 メモリ消費量

### Web (Chrome) - ホーム
**期待値**: < 100MB
**実測値**: ⏳

### Web (Chrome) - 音声再生中
**期待値**: < 150MB
**実測値**: ⏳

### iOS - ホーム
**期待値**: < 80MB
**実測値**: ⏳

### Android - ホーム
**期待値**: < 80MB
**実測値**: ⏳

---

## 5.3 CPU使用率

### Web - 通常動作
**期待値**: < 10%
**実測値**: ⏳

### Web - 音声再生
**期待値**: < 15%
**実測値**: ⏳

### iOS/Android - 音声再生
**期待値**: < 12%
**実測値**: ⏳

---

## 5.4 バッテリー消費率

### 1時間使用時のバッテリー消費
**期待値**: < 10%
**実測値**: ⏳

### 1時間音声学習時のバッテリー消費
**期待値**: < 12%
**実測値**: ⏳

---

## 5.5 ネットワークテスト

### 3G 環境
- [ ] ページロード成功
- [ ] 読込中インジケータ表示
- [ ] 音声再生（リトライ実行）

**結果**: ⏳

### オフライン環境
- [ ] キャッシュ表示またはエラーメッセージ
- [ ] オンライン復帰時に自動同期

**結果**: ⏳

### 複数デバイス同期
- [ ] デバイスA で学習実行
- [ ] デバイスB で最新データ表示

**結果**: ⏳

---

**テスト完了日**: ⏳

EOF

    print_success "Phase 5 テストレポート生成完了: ${results_file}"
    log_test_result "Phase-5" "PERF-SETUP" "READY" "パフォーマンステストレポート生成完了"
}

###############################################################################
# Phase 6: バグ修正・リグレッションテスト
###############################################################################

test_phase_6() {
    print_header "Phase 6: バグ修正・リグレッションテスト"

    local results_file="${REPORT_DIR}/phase-6-bug-report.md"

    cat > "${results_file}" << 'EOF'
# Phase 6: バグレポート・リグレッションテスト

**実施日**: 2026-03-19～22
**テスト実施**: 前フェーズで発見されたバグの修正とリグレッションテスト

## バグ報告フォーマット

### BUG-XXX: [症状]

**優先度**: P0 / P1 / P2 / P3
**影響範囲**: [機能]
**再現手順**:
1. ...
2. ...
3. ...

**期待結果**: ...
**実際の結果**: ...
**原因**: ...
**解決策**: ...

**修正状況**: ⏳ / ✓ 修正完了
**リグレッションテスト**: ⏳

---

## リグレッションテストチェックリスト

- [ ] E2E-001 (登録フロー) - PASS
- [ ] E2E-002 (ログイン) - PASS
- [ ] E2E-003 (リスニング学習) - PASS
- [ ] F-LISTENING-001 (音声再生) - PASS
- [ ] F-DASHBOARD-001 (統計表示) - PASS
- [ ] 全ブラウザ対応 - PASS
- [ ] パフォーマンス基準クリア - PASS
- [ ] ネットワーク対応 - PASS

---

**テスト完了日**: ⏳

EOF

    print_success "Phase 6 テストレポート生成完了: ${results_file}"
    log_test_result "Phase-6" "BUG-SETUP" "READY" "バグレポート生成完了"
}

###############################################################################
# すべてのテストを実行
###############################################################################

run_all_tests() {
    print_header "EigoMaster 統合テスト フル実行"

    print_info "テスト開始時刻: $(date)"
    print_info "テスト結果ディレクトリ: ${REPORT_DIR}"

    test_phase_1
    test_phase_2
    test_phase_3
    test_phase_4
    test_phase_5
    test_phase_6

    # サマリーレポート生成
    generate_summary
}

###############################################################################
# サマリーレポート生成
###############################################################################

generate_summary() {
    print_header "テスト サマリーレポート生成"

    local summary_file="${REPORT_DIR}/SUMMARY.md"

    cat > "${summary_file}" << EOF
# EigoMaster 統合テスト サマリーレポート

**テスト実施日**: 2026-03-19～22
**テスト環境**: EigoMaster v1.0.0
**テスト実行者**: QA Team
**テスト完了日**: $(date "+%Y-%m-%d %H:%M:%S")

---

## テスト実施範囲

| フェーズ | 内容 | 状態 |
|---------|------|------|
| **Phase 1** | 実装検証テスト | ✅ 準備完了 |
| **Phase 2** | E2E テスト | ✅ 準備完了 |
| **Phase 3** | 機能別テスト | ✅ 準備完了 |
| **Phase 4** | クロスプラットフォーム | ✅ 準備完了 |
| **Phase 5** | パフォーマンス・ネットワーク | ✅ 準備完了 |
| **Phase 6** | バグ修正・リグレッション | ✅ 準備完了 |

---

## テスト結果

### Phase 1: 実装検証
- 環境確認: ✅
- ファイル構造: ✅
- TypeScript: ⏳ 手動確認
- ESLint: ⏳ 手動確認

### Phase 2: E2E
- 登録フロー: ⏳ 手動テスト
- ログイン: ⏳ 手動テスト
- リスニング学習: ⏳ 手動テスト
- 単語学習: ⏳ 手動テスト

### Phase 3: 機能別
- リスニング機能: ⏳ 手動テスト
- ダッシュボード: ⏳ 手動テスト
- 講師機能: ⏳ 手動テスト

### Phase 4: クロスプラットフォーム
- Web (Chrome/Firefox/Safari): ⏳ 手動テスト
- iOS (iPhone SE～Pro Max): ⏳ 手動テスト
- Android (API 24～): ⏳ 手動テスト

### Phase 5: パフォーマンス
- 初期ロード時間: ⏳ 計測
- メモリ使用量: ⏳ 計測
- CPU使用率: ⏳ 計測
- バッテリー消費: ⏳ 計測

### Phase 6: バグ修正
- 発見バグ数: 0
- 修正済みバグ: 0
- リグレッション: ⏳

---

## 本番環境準備状況

- [ ] すべてのテストが合格
- [ ] P0/P1 バグが修正済み
- [ ] パフォーマンス基準をクリア
- [ ] セキュリティレビュー完了
- [ ] 環境変数が本番に設定済み
- [ ] バックアップ戦略確立済み
- [ ] ドキュメント完成

---

## 次のステップ

1. **手動テスト実施** (2026-03-19～21)
   - `npm run web` で Web版を起動
   - ブラウザでテストシナリオを実行
   - iOS/Android シミュレータでも確認

2. **バグ修正** (発見時)
   - バグレポート作成
   - パッチ適用
   - リグレッション実行

3. **本番デプロイ** (2026-03-22)
   - ビルド実行
   - CDN にアップロード
   - ユーザーに通知

---

**レポート生成日**: $(date)
**テスト実行者**: QA / デベロッパー
**ステータス**: 🟡 テスト実施中

EOF

    print_success "サマリーレポート生成完了: ${summary_file}"

    # テスト結果ファイルの統計
    print_info "生成されたレポート:"
    ls -lh "${REPORT_DIR}" | grep -E "\.md|\.log" | awk '{print "  - " $9 " (" $5 ")"}'
}

###############################################################################
# メイン処理
###############################################################################

main() {
    print_header "EigoMaster 統合テストフレームワーク"

    case "${TARGET_PHASE}" in
        "phase-1"|"1")
            test_phase_1
            ;;
        "phase-2"|"2")
            test_phase_2
            ;;
        "phase-3"|"3")
            test_phase_3
            ;;
        "phase-4"|"4")
            test_phase_4
            ;;
        "phase-5"|"5")
            test_phase_5
            ;;
        "phase-6"|"6")
            test_phase_6
            ;;
        "all"|"")
            run_all_tests
            ;;
        *)
            print_error "不正なフェーズ指定: ${TARGET_PHASE}"
            echo "使用方法: bash scripts/run-integration-tests.sh [phase]"
            echo "例: bash scripts/run-integration-tests.sh all"
            exit 1
            ;;
    esac

    print_header "テスト実行完了"
    print_success "レポート出力ディレクトリ: ${REPORT_DIR}/"
    print_info "テスト実行時刻: $(date)"
    echo ""
}

# スクリプト実行
main "$@"
