/**
 * Metro Bundler 本番環境設定
 * バンドルサイズ最適化・キャッシング設定
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 本番環境用最適化設定
config.transformer = {
  ...config.transformer,
  // ECMAScript Modules (ESM) の最適化
  experimentalImportSupport: false,
  inlineRequires: true, // 遅延ロード
  minifierPath: 'hermes-compact', // Hermesを使用した最小化
};

// キャッシング設定
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    dir: path.join(__dirname, 'node_modules', '.cache', 'metro-bundler'),
    enableHexStore: true,
  }),
];

// リセットキャッシュキー
config.resetCache = process.env.RESET_CACHE === 'true';

// 本番環境でのログレベル
config.reporter = {
  onBegin: () => {
    if (process.env.VERBOSE === 'true') {
      console.log('[Metro] Build started...');
    }
  },
  onEnd: () => {
    if (process.env.VERBOSE === 'true') {
      console.log('[Metro] Build completed');
    }
  },
};

module.exports = config;
