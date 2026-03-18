/**
 * End-to-End Audio Playback Tests
 * EigoMaster音声再生機能の実統合テスト
 *
 * 実際のブラウザ環境でテストを実行します
 * 使用フレームワーク: Playwright (または Cypress)
 *
 * 実行方法:
 * npx playwright test tests/audioPlayback.e2e.test.ts
 * または
 * npx cypress run --spec "tests/audioPlayback.e2e.test.ts"
 */

import { test, expect, Page, Browser } from '@playwright/test';

// ========================================
// テスト設定
// ========================================

const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  testAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  fallbackAudioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
};

// ========================================
// ユーティリティ関数
// ========================================

/**
 * ページがロードされるまで待機
 */
async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * 音声プレイヤーが表示されるまで待機
 */
async function waitForAudioPlayer(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="audio-player"]', { timeout: 10000 });
}

/**
 * 再生ボタンをクリック
 */
async function clickPlayButton(page: Page): Promise<void> {
  await page.click('[data-testid="play-button"]');
}

/**
 * 音声の再生状態を確認
 */
async function isAudioPlaying(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    return audioElement ? !audioElement.paused : false;
  });
}

/**
 * 再生時間を取得
 */
async function getCurrentPlaybackTime(page: Page): Promise<number> {
  return page.evaluate(() => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    return audioElement ? audioElement.currentTime : 0;
  });
}

/**
 * 音声の長さを取得
 */
async function getAudioDuration(page: Page): Promise<number> {
  return page.evaluate(() => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    return audioElement ? audioElement.duration : 0;
  });
}

/**
 * 再生速度を設定
 */
async function setPlaybackRate(page: Page, rate: number): Promise<void> {
  await page.evaluate((r) => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (audioElement) {
      audioElement.playbackRate = r;
    }
  }, rate);
}

/**
 * 再生速度を取得
 */
async function getPlaybackRate(page: Page): Promise<number> {
  return page.evaluate(() => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    return audioElement ? audioElement.playbackRate : 1.0;
  });
}

/**
 * エラーメッセージを取得
 */
async function getErrorMessage(page: Page): Promise<string | null> {
  const errorElement = await page.$('[data-testid="audio-error"]');
  if (!errorElement) return null;
  return await errorElement.textContent();
}

// ========================================
// テストスイート
// ========================================

test.describe('Audio Playback E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`${TEST_CONFIG.baseUrl}/listening`);
    await waitForPageLoad(page);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ========================================
  // Section 1: 基本再生テスト
  // ========================================

  test('1.1 Audio Player が表示される', async () => {
    await waitForAudioPlayer(page);
    const player = await page.$('[data-testid="audio-player"]');
    expect(player).not.toBeNull();
  });

  test('1.2 再生ボタンをクリックすると音声が再生される', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);

    // 再生開始の遅延を考慮
    await page.waitForTimeout(2000);

    const playing = await isAudioPlaying(page);
    expect(playing).toBe(true);
  });

  test('1.3 再生中に再生時間が進む', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);

    const time1 = await getCurrentPlaybackTime(page);
    await page.waitForTimeout(2000);
    const time2 = await getCurrentPlaybackTime(page);

    expect(time2).toBeGreaterThan(time1);
  });

  test('1.4 一時停止ボタンが機能する', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);
    await page.waitForTimeout(1000);

    await page.click('[data-testid="pause-button"]');
    await page.waitForTimeout(500);

    const playing = await isAudioPlaying(page);
    expect(playing).toBe(false);
  });

  test('1.5 停止ボタンが再生位置をリセットする', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);
    await page.waitForTimeout(2000);

    await page.click('[data-testid="stop-button"]');

    const currentTime = await getCurrentPlaybackTime(page);
    expect(currentTime).toBe(0);
  });

  // ========================================
  // Section 2: 再生速度変更テスト
  // ========================================

  test('2.1 再生速度を0.5xに変更できる', async () => {
    await waitForAudioPlayer(page);
    await page.click('[data-testid="speed-button-0.5"]');

    const rate = await getPlaybackRate(page);
    expect(rate).toBe(0.5);
  });

  test('2.2 再生速度を1.0x（標準）に変更できる', async () => {
    await waitForAudioPlayer(page);
    await page.click('[data-testid="speed-button-1.0"]');

    const rate = await getPlaybackRate(page);
    expect(rate).toBe(1.0);
  });

  test('2.3 再生速度を1.5xに変更できる', async () => {
    await waitForAudioPlayer(page);
    await page.click('[data-testid="speed-button-1.5"]');

    const rate = await getPlaybackRate(page);
    expect(rate).toBe(1.5);
  });

  test('2.4 再生中に速度を変更できる', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);
    await page.waitForTimeout(1000);

    await page.click('[data-testid="speed-button-1.5"]');
    const rate = await getPlaybackRate(page);

    expect(rate).toBe(1.5);
    const isPlaying = await isAudioPlaying(page);
    expect(isPlaying).toBe(true);
  });

  // ========================================
  // Section 3: シーク・スクラブテスト
  // ========================================

  test('3.1 プログレスバーをドラッグしてシークできる', async () => {
    await waitForAudioPlayer(page);
    await clickPlayButton(page);
    await page.waitForTimeout(1000);

    const progressBar = await page.$('[data-testid="progress-bar"]');
    if (progressBar) {
      const box = await progressBar.boundingBox();
      if (box) {
        // 75%の位置にドラッグ
        await page.mouse.move(box.x + box.width * 0.75, box.y);
        await page.mouse.down();
        await page.mouse.up();

        await page.waitForTimeout(500);
        const currentTime = await getCurrentPlaybackTime(page);
        const duration = await getAudioDuration(page);

        // 75% 付近であることを確認
        expect(currentTime).toBeGreaterThan(duration * 0.7);
        expect(currentTime).toBeLessThan(duration * 0.8);
      }
    }
  });

  // ========================================
  // Section 4: エラーハンドリングテスト
  // ========================================

  test('4.1 無効なURLでエラーメッセージが表示される', async () => {
    // 無効なURLで再生を試行
    await page.evaluate(() => {
      const audioElement = document.querySelector('audio') as HTMLAudioElement;
      if (audioElement) {
        audioElement.src = 'https://invalid-url-that-does-not-exist.com/audio.mp3';
        audioElement.play().catch(() => {
          // エラーは予期されている
        });
      }
    });

    await page.waitForTimeout(3000);
    const error = await getErrorMessage(page);
    expect(error).not.toBeNull();
  });

  test('4.2 ネットワークエラーをハンドリングできる', async () => {
    // ネットワークを無効化
    await page.context().setOffline(true);

    await clickPlayButton(page);
    await page.waitForTimeout(2000);

    const error = await getErrorMessage(page);
    expect(error).not.toBeNull();

    // ネットワークを復帰
    await page.context().setOffline(false);
  });

  // ========================================
  // Section 5: クロスブラウザテスト
  // ========================================

  test.describe('5. クロスブラウザテスト', () => {
    const browsers = ['chromium', 'firefox', 'webkit'];

    for (const browser of browsers) {
      test(`5.X ${browser}での再生テスト`, async ({ browserName }) => {
        if (browserName !== browser) {
          test.skip();
        }

        await waitForAudioPlayer(page);
        await clickPlayButton(page);

        await page.waitForTimeout(2000);

        const playing = await isAudioPlaying(page);
        expect(playing).toBe(true);
      });
    }
  });

  // ========================================
  // Section 6: パフォーマンステスト
  // ========================================

  test('6.1 初回再生の遅延が許容範囲内である', async () => {
    await waitForAudioPlayer(page);

    const startTime = Date.now();
    await clickPlayButton(page);

    // 再生が開始するまでの時間
    let attempts = 0;
    while (attempts < 50) {
      const isPlaying = await isAudioPlaying(page);
      if (isPlaying) break;
      await page.waitForTimeout(100);
      attempts++;
    }

    const loadTime = Date.now() - startTime;

    // 許容範囲: 5秒以内
    expect(loadTime).toBeLessThan(5000);
  });

  test('6.2 長時間再生でメモリリークがない', async () => {
    await waitForAudioPlayer(page);

    // 複数回の再生・停止を繰り返す
    for (let i = 0; i < 5; i++) {
      await clickPlayButton(page);
      await page.waitForTimeout(1000);
      await page.click('[data-testid="stop-button"]');
      await page.waitForTimeout(500);
    }

    // メモリ使用量を確認（console.memory）
    const metrics = await page.evaluate(() => {
      if ((performance as any).memory) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        };
      }
      return null;
    });

    expect(metrics).not.toBeNull();
    if (metrics) {
      // ヒープサイズが100MB以下であることを確認
      expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  // ========================================
  // Section 7: アクセシビリティテスト
  // ========================================

  test('7.1 キーボード操作で再生・一時停止ができる', async () => {
    await waitForAudioPlayer(page);

    // フォーカスを音声プレイヤーに設定
    await page.click('[data-testid="audio-player"]');

    // スペースキーで再生
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    const playing = await isAudioPlaying(page);
    expect(playing).toBe(true);

    // スペースキーで一時停止
    await page.keyboard.press('Space');
    const paused = await isAudioPlaying(page);
    expect(paused).toBe(false);
  });

  test('7.2 ARIAラベルが正しく設定されている', async () => {
    const playButton = await page.$('[data-testid="play-button"]');
    if (playButton) {
      const ariaLabel = await playButton.getAttribute('aria-label');
      expect(ariaLabel).not.toBeNull();
      expect(ariaLabel).toContain('再生');
    }
  });
});

// ========================================
// ビジュアルレグレッションテスト
// ========================================

test.describe('Visual Regression Tests', () => {
  test('音声プレイヤーのスクリーンショット比較', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/listening`);
    await page.waitForLoadState('networkidle');

    // プレイヤーのスクリーンショット
    const player = await page.$('[data-testid="audio-player"]');
    if (player) {
      await expect(player).toHaveScreenshot('audio-player.png');
    }
  });

  test('再生速度ボタンのスクリーンショット比較', async ({ page }) => {
    await page.goto(`${TEST_CONFIG.baseUrl}/listening`);
    await page.waitForLoadState('networkidle');

    const speedControls = await page.$('[data-testid="speed-controls"]');
    if (speedControls) {
      await expect(speedControls).toHaveScreenshot('speed-controls.png');
    }
  });
});
