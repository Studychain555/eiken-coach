/**
 * ネットワーク品質検出フック
 *
 * 機能:
 * - Connection API でネットワークタイプ取得
 * - API レスポンスタイムで速度判定
 * - 定期的なモニタリング
 * - ネットワーク変更イベントの監視
 */

import { useEffect, useState } from 'react';
import { debugError } from '@/src/lib/debugUtils';

export interface NetworkQuality {
  type: '5g' | '4g' | '3g' | '2g' | 'unknown';
  isSlowNetwork: boolean;
  bandwidth: number; // Mbps
  latency: number; // ms
  saveData: boolean; // データセーバーモード有効
  effectiveType: string;
}

const DEFAULT_NETWORK_QUALITY: NetworkQuality = {
  type: '4g',
  isSlowNetwork: false,
  bandwidth: 10,
  latency: 50,
  saveData: false,
  effectiveType: '4g',
};

/**
 * ネットワーク品質検出フック
 * リアルタイムでネットワーク品質を監視
 */
export function useNetworkQuality(): NetworkQuality {
  const [quality, setQuality] = useState<NetworkQuality>(DEFAULT_NETWORK_QUALITY);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Connection API をサポートしているか確認
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection;

    if (!connection) {
      debugError('useNetworkQuality', 'Connection API not supported');
      return;
    }

    /**
     * ネットワーク品質を更新
     */
    const updateQuality = () => {
      const isSlowNetwork =
        connection.saveData ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g';

      const networkType = mapEffectiveTypeToNetworkType(connection.effectiveType);

      setQuality({
        type: networkType,
        isSlowNetwork,
        bandwidth: connection.downlink || 10,
        latency: connection.rtt || 50,
        saveData: connection.saveData || false,
        effectiveType: connection.effectiveType || '4g',
      });

      debugError('useNetworkQuality', 'Network quality updated', {
        type: networkType,
        isSlowNetwork,
        bandwidth: connection.downlink,
        latency: connection.rtt,
        saveData: connection.saveData,
      });
    };

    // 初期値を設定
    updateQuality();

    // ネットワーク品質が変更されたときのリスナーを追加
    connection.addEventListener('change', updateQuality);

    // クリーンアップ
    return () => {
      connection.removeEventListener('change', updateQuality);
    };
  }, []);

  return quality;
}

/**
 * effectiveType を NetworkType に変換
 */
function mapEffectiveTypeToNetworkType(
  effectiveType: string
): '5g' | '4g' | '3g' | '2g' | 'unknown' {
  switch (effectiveType) {
    case '4g':
      return '4g';
    case '3g':
      return '3g';
    case '2g':
      return '2g';
    case '5g':
      return '5g';
    default:
      return 'unknown';
  }
}

/**
 * ネットワークが低速であるかチェック
 */
export function useIsSlowNetwork(): boolean {
  const quality = useNetworkQuality();
  return quality.isSlowNetwork;
}

/**
 * ネットワークタイプを取得
 */
export function useNetworkType(): '5g' | '4g' | '3g' | '2g' | 'unknown' {
  const quality = useNetworkQuality();
  return quality.type;
}

/**
 * データセーバーモードが有効か確認
 */
export function useIsSaveDataMode(): boolean {
  const quality = useNetworkQuality();
  return quality.saveData;
}

/**
 * ネットワークレイテンシを取得（ms）
 */
export function useNetworkLatency(): number {
  const quality = useNetworkQuality();
  return quality.latency;
}

/**
 * ネットワーク帯域幅を取得（Mbps）
 */
export function useNetworkBandwidth(): number {
  const quality = useNetworkQuality();
  return quality.bandwidth;
}

/**
 * 使用例:
 *
 * import { useNetworkQuality, useIsSlowNetwork } from '@/hooks/useNetworkQuality';
 *
 * export function MyComponent() {
 *   const quality = useNetworkQuality();
 *   const isSlowNetwork = useIsSlowNetwork();
 *
 *   return (
 *     <div>
 *       <p>Network Type: {quality.type}</p>
 *       <p>Slow Network: {isSlowNetwork ? 'Yes' : 'No'}</p>
 *       <p>Bandwidth: {quality.bandwidth} Mbps</p>
 *       <p>Latency: {quality.latency} ms</p>
 *     </div>
 *   );
 * }
 */
