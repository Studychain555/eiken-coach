#!/bin/bash
# GitHub Pages サブパス修正スクリプト
# app.json で定義された baseUrl を dist フォルダのすべての HTML に適用

set -e

DIST_DIR="dist"
BASE_URL="/eiken-coach"

echo "GitHub Pages サブパス修正を実行中..."
echo "Target: $DIST_DIR"
echo "Base URL: $BASE_URL"

# Node.js を使ってファイル処理（クロスプラットフォーム対応）
node --eval '
const fs = require("fs");
const path = require("path");
const distDir = "dist";
const baseUrl = "/eiken-coach";
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
    content = content.replace("</head>", `<base href="${baseUrl}/" /></head>`);
  }

  content = content.replace(/src="\/\_expo/g, `src="${baseUrl}/_expo`);
  content = content.replace(/href="\/favicon/g, `href="${baseUrl}/favicon`);

  fs.writeFileSync(file, content, "utf8");
});

console.log("✓ HTML 修正完了");
'

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

echo "✓ 修正完了"
