#!/bin/bash

# ========================================
# EigoMaster ロールバックスクリプト
# 用途: 本番環境でのロールバック
# 対応: iOS (TestFlight), Android (Google Play)
# 更新日: 2026-03-19
# ========================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# デフォルト値
PLATFORM="all"
VERSION=""
ROLLBACK_TIME=3600  # デフォルト: 1時間以内の最新版

# 使用方法
usage() {
    cat << EOF
EigoMaster ロールバックスクリプト

使用方法:
    $0 [OPTIONS]

オプション:
    -p, --platform PLATFORM  プラットフォーム (ios|android|all) デフォルト: all
    -v, --version VERSION    ロールバック対象バージョン (省略時: 最新の前のバージョン)
    -t, --time SECONDS       時間制限 (秒) デフォルト: 3600 (1時間以内)
    -h, --help              このメッセージを表示

例:
    # 最新版の前のバージョンにロールバック
    $0

    # iOS のみをロールバック
    $0 -p ios

    # 特定バージョンにロールバック
    $0 -v 1.0.5

    # 2時間以内のビルドを検索
    $0 -t 7200

EOF
    exit 0
}

# コマンドラインパース
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -t|--time)
            ROLLBACK_TIME="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "不明なオプション: $1"
            usage
            ;;
    esac
done

# 環境確認
if [ -z "$EAS_TOKEN" ]; then
    log_error "EAS_TOKEN が設定されていません"
    exit 1
fi

log_info "EigoMaster ロールバックを開始します"
log_info "プラットフォーム: $PLATFORM"

# EAS 認証
log_info "EAS に認証中..."
eas login --non-interactive
log_success "EAS 認証成功"

# iOS ロールバック
rollback_ios() {
    log_info "iOS ロールバック対象を検索中..."

    # 最新ビルドの取得
    BUILDS=$(eas build list --platform ios --limit 5 --json)

    if [ -z "$VERSION" ]; then
        # バージョンが指定されていない場合は、最新の前のバージョンを使用
        BUILD_ID=$(echo "$BUILDS" | jq -r '.[1].id')
        BUILD_VERSION=$(echo "$BUILDS" | jq -r '.[1].appVersion')
    else
        # 指定されたバージョンを検索
        BUILD_ID=$(echo "$BUILDS" | jq -r ".[] | select(.appVersion==\"$VERSION\") | .id" | head -1)
        BUILD_VERSION="$VERSION"
    fi

    if [ -z "$BUILD_ID" ]; then
        log_error "ロールバック対象のビルドが見つかりません"
        return 1
    fi

    log_warning "iOS をロールバック中"
    log_warning "ビルドID: $BUILD_ID"
    log_warning "バージョン: $BUILD_VERSION"

    # TestFlight への提出
    eas submit \
        --platform ios \
        --profile production \
        --non-interactive \
        --build-id "$BUILD_ID"

    log_success "iOS ロールバック完了"
}

# Android ロールバック
rollback_android() {
    log_info "Android ロールバック対象を検索中..."

    # 最新ビルドの取得
    BUILDS=$(eas build list --platform android --limit 5 --json)

    if [ -z "$VERSION" ]; then
        # バージョンが指定されていない場合は、最新の前のバージョンを使用
        BUILD_ID=$(echo "$BUILDS" | jq -r '.[1].id')
        BUILD_VERSION=$(echo "$BUILDS" | jq -r '.[1].appVersion')
    else
        # 指定されたバージョンを検索
        BUILD_ID=$(echo "$BUILDS" | jq -r ".[] | select(.appVersion==\"$VERSION\") | .id" | head -1)
        BUILD_VERSION="$VERSION"
    fi

    if [ -z "$BUILD_ID" ]; then
        log_error "ロールバック対象のビルドが見つかりません"
        return 1
    fi

    log_warning "Android をロールバック中"
    log_warning "ビルドID: $BUILD_ID"
    log_warning "バージョン: $BUILD_VERSION"

    # Google Play への提出
    eas submit \
        --platform android \
        --profile production \
        --non-interactive \
        --build-id "$BUILD_ID"

    log_success "Android ロールバック完了"
}

# メインロジック
main() {
    log_warning "警告: このスクリプトはロールバック操作を実行します"
    read -p "本当に続行しますか? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "ロールバックをキャンセルしました"
        exit 0
    fi

    case $PLATFORM in
        ios)
            rollback_ios
            ;;
        android)
            rollback_android
            ;;
        all)
            rollback_ios
            rollback_android
            ;;
        *)
            log_error "不明なプラットフォーム: $PLATFORM"
            exit 1
            ;;
    esac

    log_success "ロールバック完了！"
}

main
