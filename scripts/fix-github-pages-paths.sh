#!/bin/bash
# GitHub Pages サブパス修正スクリプト
# app.json で定義された baseUrl を dist フォルダのすべての HTML に適用

set -e

DIST_DIR="dist"
BASE_URL="/eiken-coach"

echo "GitHub Pages サブパス修正を実行中..."
echo "Target: $DIST_DIR"
echo "Base URL: $BASE_URL"

# すべての HTML ファイルを処理
find "$DIST_DIR" -name "*.html" -type f | while read -r file; do
  echo "修正中: $file"

  # /_expo で始まるパスを修正
  sed -i '' "s|src=\"/_expo|src=\"$BASE_URL/_expo|g" "$file"

  # /favicon で始まるパスを修正
  sed -i '' "s|href=\"/favicon|href=\"$BASE_URL/favicon|g" "$file"

  # /audio で始まるパスを修正
  sed -i '' "s|href=\"/audio|href=\"$BASE_URL/audio|g" "$file"

  # 二重修正を防ぐ
  sed -i '' "s|\"$BASE_URL$BASE_URL|\"$BASE_URL|g" "$file"
done

# 404.html を SPA ルーティング用に作成
echo "404.html を作成中..."
cp "$DIST_DIR/index.html" "$DIST_DIR/404.html"

echo "✓ 修正完了"
