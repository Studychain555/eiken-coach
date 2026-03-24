/**
 * EigoMaster Service Worker
 * Phase 9 - オフラインモード・キャッシング
 *
 * アプリケーションシェルキャッシング戦略
 * - 静的アセット: キャッシュファースト
 * - API呼び出し: ネットワークファースト
 * - 音声ファイル: ネットワークファースト（キャッシュフォールバック）
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `eigo-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `eigo-dynamic-${CACHE_VERSION}`;
const AUDIO_CACHE = `eigo-audio-${CACHE_VERSION}`;

// 静的アセット（インストール時にキャッシング）
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // CSS・JS（dist で生成）
  // 注：ビルド時に自動生成される
];

/**
 * Service Worker インストール
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.warn('[SW] Failed to cache static assets:', error);
      })
  );

  // すぐに有効にする
  self.skipWaiting();
});

/**
 * Service Worker アクティベーション
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いキャッシュバージョンを削除
          if (
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== AUDIO_CACHE
          ) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/**
 * Service Worker フェッチ
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API呼び出し（ネットワークファースト）
  if (url.pathname.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 音声ファイル（ネットワークファースト、キャッシュフォールバック）
  if (request.url.includes('.mp3') || request.url.includes('/audio/')) {
    event.respondWith(handleAudioRequest(request));
    return;
  }

  // その他の静的アセット（キャッシュファースト）
  event.respondWith(handleStaticRequest(request));
});

/**
 * API リクエストハンドラ（ネットワークファースト）
 */
async function handleApiRequest(request) {
  try {
    // ネットワークから取得を試みる
    const response = await fetch(request);

    // 成功時はレスポンスをキャッシュに保存
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // ネットワークエラー時はキャッシュから返す
    console.log('[SW] Network error, using cache for API:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // キャッシュもない場合はオフラインレスポンス
    return new Response(
      JSON.stringify({
        error: 'オフラインです。インターネット接続を確認してください。',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 音声ファイルハンドラ（ネットワークファースト）
 */
async function handleAudioRequest(request) {
  try {
    // ネットワークから取得を試みる
    const response = await fetch(request);

    // 成功時はオーディオキャッシュに保存
    if (response && response.status === 200) {
      const cache = await caches.open(AUDIO_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // ネットワークエラー時はキャッシュから返す
    console.log('[SW] Network error, using cache for audio:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // フォールバック: 音声なしで継続
    console.warn('[SW] Audio not available:', request.url);
    return new Response(null, { status: 404 });
  }
}

/**
 * 静的アセットハンドラ（キャッシュファースト）
 */
async function handleStaticRequest(request) {
  // キャッシュから確認
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // キャッシュにない場合はネットワークから取得
    const response = await fetch(request);

    // 成功時はキャッシュに保存
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // ネットワークエラー時はオフラインページ
    console.log('[SW] Network error for static asset:', request.url);

    // HTML リクエストの場合
    if (request.headers.get('Accept').includes('text/html')) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>オフラインです</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #f5f3ee;
              }
              .offline-container {
                text-align: center;
                padding: 20px;
              }
              .offline-icon {
                font-size: 60px;
                margin-bottom: 20px;
              }
              h1 {
                color: #2d3436;
                margin: 10px 0;
              }
              p {
                color: #5a6b7a;
                margin: 10px 0;
              }
              .offline-info {
                background: white;
                padding: 20px;
                border-radius: 12px;
                margin-top: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <div class="offline-container">
              <div class="offline-icon">📡</div>
              <h1>インターネット接続がありません</h1>
              <p>オフラインのため、このページにアクセスできません</p>
              <div class="offline-info">
                <p>📶 インターネット接続を確認してください</p>
                <p>🔄 接続後、ページを再読み込みしてください</p>
                <p>💾 以前にダウンロードしたコンテンツはご利用いただけます</p>
              </div>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // その他のリクエストの場合
    return new Response(null, { status: 503 });
  }
}

/**
 * バックグラウンド同期（オプション）
 * ネットワーク復帰時に自動的にデータを同期
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.keys().then((requests) => {
          return Promise.all(
            requests.map((request) => {
              return fetch(request).then((response) => {
                cache.put(request, response);
              });
            })
          );
        });
      })
    );
  }
});

/**
 * メッセージハンドリング
 * クライアントからのコマンドに応答
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing caches...');
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    // キャッシュサイズを計算（推定）
    let totalSize = 0;
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.open(cacheName).then((cache) => {
            return cache.keys().then((requests) => {
              return Promise.all(
                requests.map((request) => {
                  return cache.match(request).then((response) => {
                    return response.blob().then((blob) => {
                      totalSize += blob.size;
                    });
                  });
                })
              );
            });
          });
        })
      );
    });
  }
});

console.log('[SW] Service Worker loaded successfully');
