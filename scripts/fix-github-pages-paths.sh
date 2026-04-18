#!/bin/bash
# GitHub Pages 配信用のパス修正スクリプト
# カスタムドメインがある場合はルート配信、それ以外は project pages のサブパスを適用する。

set -e

DIST_DIR="dist"
DEFAULT_PROJECT_BASE_URL="/eiken-coach"

if [ -n "${GITHUB_PAGES_BASE_URL:-}" ]; then
  BASE_URL="$GITHUB_PAGES_BASE_URL"
else
  BASE_URL="$DEFAULT_PROJECT_BASE_URL"
fi

echo "GitHub Pages サブパス修正を実行中..."
echo "Target: $DIST_DIR"
echo "Base URL: ${BASE_URL:-/}"

# Node.js を使ってファイル処理（クロスプラットフォーム対応）
BASE_URL="$BASE_URL" node --eval '
const fs = require("fs");
const path = require("path");
const distDir = "dist";
const baseUrl = process.env.BASE_URL || "";
const normalizedBaseHref = baseUrl ? `${baseUrl}/` : "/";
const files = [];

function walkDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith(".html")) {
        files.push(fullPath);
      }
    } catch (e) {}
  });
}

walkDir(distDir);

files.forEach(file => {
  console.log("修正中: " + file);
  let content = fs.readFileSync(file, "utf8");

  if (!content.includes("<base href=")) {
    content = content.replace("</head>", `<base href="${normalizedBaseHref}" /></head>`);
  }

  content = content.replace(/src="\/\_expo/g, `src="${baseUrl}/_expo`);
  content = content.replace(/href="\/favicon/g, `href="${baseUrl}/favicon`);

  fs.writeFileSync(file, content, "utf8");
});

console.log("✓ HTML 修正完了");
'

# 404.html を SPA ルーティング用に作成（リダイレクト機能付き）
echo "404.html を作成中..."
BASE_URL="$BASE_URL" cat > "$DIST_DIR/404.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting...</title>
    <script>
        // GitHub Pages SPA redirect
        const baseUrl = "${BASE_URL}";
        const pathname = window.location.pathname;
        const redirect = baseUrl ? pathname.replace(new RegExp("^" + baseUrl), "") || "/" : pathname || "/";
        sessionStorage.redirect = redirect;
        window.location.replace(baseUrl ? baseUrl + "/" : "/");
    </script>
</head>
<body></body>
</html>
EOF

echo "✓ 修正完了"
