#!/bin/bash
# GitHub Pages サブパス修正スクリプト
# app.json で定義された baseUrl を dist フォルダのすべての HTML に適用

set -e

DIST_DIR="dist"
BASE_URL="/eiken-coach"

echo "GitHub Pages サブパス修正を実行中..."
echo "Target: $DIST_DIR"
echo "Base URL: $BASE_URL"

# sed コマンドをプラットフォーム別に判定
SED_CMD="sed -i"
if [[ "$OSTYPE" == "darwin"* ]]; then
  SED_CMD="sed -i ''"
fi

# すべての HTML ファイルを処理
find "$DIST_DIR" -name "*.html" -type f | while read -r file; do
  echo "修正中: $file"

  # <base> タグを <head> に追加（既に存在する場合はスキップ）
  if ! grep -q '<base href=' "$file"; then
    $SED_CMD "s|</head>|<base href=\"$BASE_URL/\" /></head>|" "$file"
  fi

  # /_expo で始まるパスを修正
  $SED_CMD "s|src=\"/_expo|src=\"$BASE_URL/_expo|g" "$file"

  # /favicon で始まるパスを修正
  $SED_CMD "s|href=\"/favicon|href=\"$BASE_URL/favicon|g" "$file"

  # /audio で始まるパスを修正
  $SED_CMD "s|href=\"/audio|href=\"$BASE_URL/audio|g" "$file"

  # 二重修正を防ぐ
  $SED_CMD "s|\"$BASE_URL$BASE_URL|\"$BASE_URL|g" "$file"
done

# 404.html を SPA ルーティング用に作成（リダイレクト機能付き）
echo "404.html を作成中..."
cat > "$DIST_DIR/404.html" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <script>
        // GitHub Pages SPA redirect
        const pathname = window.location.pathname;
        const redirect = pathname.replace(/^\/eiken-coach/, '') || '/';
        sessionStorage.redirect = redirect;
        window.location.replace('/eiken-coach/');
    </script>
</head>
<body></body>
</html>
EOF

# index.html にリダイレクト処理を追加
if ! grep -q "sessionStorage.redirect" "$DIST_DIR/index.html"; then
  # リダイレクト処理を<head>内に注入
  $SED_CMD '/<\/head>/i\
    <script>if(sessionStorage.redirect){const redirect=sessionStorage.redirect;delete sessionStorage.redirect;window.history.replaceState(null,null,"/eiken-coach"+redirect);}</script>' "$DIST_DIR/index.html"
fi

echo "✓ 修正完了"
