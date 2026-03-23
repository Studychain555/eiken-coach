#!/bin/bash

# ========================================
# EigoMaster デプロイスクリプト
# 用途: 本番環境へのワンコマンドデプロイ
# 対応: iOS, Android, Web
# 更新日: 2026-03-19
# ========================================

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
ENVIRONMENT="staging"
PLATFORMS="web"
SUBMIT=false
DRY_RUN=false

# 使用方法の表示
usage() {
    cat << EOF
EigoMaster デプロイスクリプト

使用方法:
    $0 [OPTIONS]

オプション:
    -e, --environment ENV       環境 (development|staging|production) デフォルト: staging
    -p, --platforms PLATFORMS  プラットフォーム (web|ios|android|all) デフォルト: web
    -s, --submit                ストアへ提出する
    -d, --dry-run              ドライラン (実際のデプロイなし)
    -h, --help                 このメッセージを表示

例:
    # ステージングへWeb版のみをデプロイ
    $0 -e staging -p web

    # 本番環境に全プラットフォームをデプロイしてストアに提出
    $0 -e production -p all -s

    # 開発環境にドライランでデプロイ
    $0 -e development -p all -d

EOF
    exit 0
}

# コマンドラインパース
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--platforms)
            PLATFORMS="$2"
            shift 2
            ;;
        -s|--submit)
            SUBMIT=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
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

# 環境検証
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_error "無効な環境: $ENVIRONMENT"
    exit 1
fi

# プラットフォーム検証
if [[ ! "$PLATFORMS" =~ ^(web|ios|android|all)$ ]]; then
    log_error "無効なプラットフォーム: $PLATFORMS"
    exit 1
fi

log_info "EigoMaster デプロイを開始します"
log_info "環境: $ENVIRONMENT"
log_info "プラットフォーム: $PLATFORMS"
log_info "ストア提出: $SUBMIT"
if [ "$DRY_RUN" = true ]; then
    log_warning "ドライランモードで実行します"
fi

# 環境ファイルのセットアップ
setup_env() {
    local env_file=".env.${ENVIRONMENT}"

    if [ ! -f "$env_file" ]; then
        log_error "環境ファイルが見つかりません: $env_file"
        exit 1
    fi

    cp "$env_file" .env.local
    log_success "環境ファイルをロード: $env_file"
}

# 依存関係のインストール
install_dependencies() {
    log_info "依存関係をインストール中..."
    npm ci
    npm install -g eas-cli expo-cli
    log_success "依存関係のインストール完了"
}

# EAS 認証
authenticate_eas() {
    if [ "$DRY_RUN" = true ]; then
        log_warning "ドライラン: EAS 認証をスキップ"
        return
    fi

    if [ -z "$EAS_TOKEN" ]; then
        log_error "EAS_TOKEN が設定されていません"
        exit 1
    fi

    log_info "EAS に認証中..."
    eas login --non-interactive
    log_success "EAS 認証成功"
}

# Web ビルド
deploy_web() {
    log_info "Web版ビルド中..."

    if [ "$DRY_RUN" = false ]; then
        npm run web -- --mode=production
        log_success "Web版ビルド完了"
    else
        log_warning "ドライラン: Web ビルドをスキップ"
    fi
}

# iOS ビルド
deploy_ios() {
    log_info "iOS版ビルド中..."

    if [ "$DRY_RUN" = false ]; then
        eas build \
            --platform ios \
            --profile "$ENVIRONMENT" \
            --non-interactive \
            --wait
        log_success "iOS版ビルド完了"

        if [ "$SUBMIT" = true ]; then
            log_info "iOS版をテストフライトに提出中..."
            eas submit --platform ios --profile production --non-interactive
            log_success "iOS版をテストフライトに提出しました"
        fi
    else
        log_warning "ドライラン: iOS ビルドをスキップ"
    fi
}

# Android ビルド
deploy_android() {
    log_info "Android版ビルド中..."

    if [ "$DRY_RUN" = false ]; then
        eas build \
            --platform android \
            --profile "$ENVIRONMENT" \
            --non-interactive \
            --wait
        log_success "Android版ビルド完了"

        if [ "$SUBMIT" = true ]; then
            log_info "Android版を Google Play に提出中..."
            eas submit --platform android --profile production --non-interactive
            log_success "Android版を Google Play に提出しました"
        fi
    else
        log_warning "ドライラン: Android ビルドをスキップ"
    fi
}

# メインデプロイロジック
main() {
    setup_env
    install_dependencies
    authenticate_eas

    case $PLATFORMS in
        web)
            deploy_web
            ;;
        ios)
            deploy_ios
            ;;
        android)
            deploy_android
            ;;
        all)
            deploy_web
            deploy_ios
            deploy_android
            ;;
    esac

    log_success "デプロイ完了！"
}

main
